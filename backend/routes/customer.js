const router = require('express').Router();
const Table = require('../models/Table');
const Session = require('../models/Session');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Settings = require('../models/Settings');

// Validate table token and get table info
router.get('/table/:token', async (req, res) => {
  try {
    const table = await Table.findOne({ token: req.params.token, active: true })
      .populate('currentSession')
      .populate('currentWaiter', 'name');
    if (!table) return res.status(404).json({ message: 'Table not found' });

    const hasActiveSession = table.status === 'occupied' || table.status === 'payment';
    res.json({
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
      hasActiveSession,
      sessionId: table.currentSession?._id || null,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get menu
router.get('/menu', async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort('sortOrder name');
    const products = await Product.find({ active: true })
      .populate('category', 'name')
      .sort('name');

    const menu = categories.map(cat => ({
      category: cat,
      products: products.filter(p => p.category._id.toString() === cat._id.toString()),
    })).filter(c => c.products.length > 0);

    res.json(menu);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Place order
router.post('/orders', async (req, res) => {
  try {
    const { sessionId, tableId, items } = req.body;

    const session = await Session.findById(sessionId).populate('waiter');
    if (!session || session.status !== 'active')
      return res.status(400).json({ message: 'No active session for this table' });

    // Calc totals
    let subtotal = 0, taxAmount = 0;
    const orderItems = items.map(item => {
      const itemSubtotal = item.price * item.quantity;
      const itemTax = itemSubtotal * (item.taxPercent / 100);
      subtotal += itemSubtotal;
      taxAmount += itemTax;
      return {
        product: item.productId,
        name: item.name,
        price: item.price,
        taxPercent: item.taxPercent,
        quantity: item.quantity,
      };
    });
    const total = +(subtotal + taxAmount).toFixed(2);

    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;

    const order = await Order.create({
      session: sessionId,
      table: tableId,
      waiter: session.waiter._id,
      orderNumber,
      items: orderItems,
      subtotal: +subtotal.toFixed(2),
      taxAmount: +taxAmount.toFixed(2),
      total,
    });

    // Notify kitchen
    req.io.emit('customer:order_placed', {
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        tableId,
        items: order.items,
        status: order.status,
        createdAt: order.createdAt,
      }
    });

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get orders for session
router.get('/sessions/:sessionId/orders', async (req, res) => {
  try {
    const orders = await Order.find({ session: req.params.sessionId }).sort('createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get session bill
router.get('/sessions/:sessionId/bill', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const orders = await Order.find({ session: req.params.sessionId });
    const total = orders.reduce((s, o) => s + o.total, 0);
    const settings = await Settings.getSettings();
    res.json({ orders, total: +total.toFixed(2), session, settings });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Request payment
router.post('/sessions/:sessionId/pay', async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const session = await Session.findById(req.params.sessionId).populate('waiter');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'payment';
    session.paymentMethod = paymentMethod;
    await session.save();

    await require('../models/Table').findByIdAndUpdate(session.table, { status: 'payment' });

    const orders = await Order.find({ session: session._id });
    const total = orders.reduce((s, o) => s + o.total, 0);

    if (paymentMethod === 'cash') {
      req.io.to(`waiter_${session.waiter._id}`).emit('customer:pay_now', {
        sessionId: session._id,
        tableId: session.table,
        total: +total.toFixed(2),
        paymentMethod,
      });
    }

    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'payment' });
    res.json({ success: true, total: +total.toFixed(2) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Confirm UPI payment
router.post('/sessions/:sessionId/upi-paid', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate('waiter');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const orders = await Order.find({ session: session._id });
    const total = orders.reduce((s, o) => s + o.total, 0);

    session.paymentStatus = 'paid';
    session.paymentMethod = 'upi';
    session.totalAmount = +total.toFixed(2);
    await session.save();

    req.io.to(`waiter_${session.waiter._id}`).emit('customer:upi_paid', { sessionId: session._id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get settings (for payment methods)
router.get('/settings', async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({
    paymentMethods: settings.paymentMethods,
    upiId: settings.upiId,
    restaurantName: settings.restaurantName,
  });
});

module.exports = router;
