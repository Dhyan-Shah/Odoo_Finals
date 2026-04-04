const router = require('express').Router();
const Table = require('../models/Table');
const Session = require('../models/Session');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');

// Validate table token
router.get('/table/:token', async (req, res) => {
  try {
    const table = await Table.findOne({ token: req.params.token, active: true })
      .populate('currentSession').populate('currentWaiter', 'name');
    if (!table) return res.status(404).json({ message: 'Table not found' });
    const hasActiveSession = table.status === 'occupied' || table.status === 'payment';
    res.json({
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
      hasActiveSession,
      sessionId: table.currentSession?._id || null,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get menu
router.get('/menu', async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort('sortOrder name');
    const products = await Product.find({ active: true }).populate('category', 'name').sort('name');
    const menu = categories.map(cat => ({
      category: cat,
      products: products.filter(p => p.category._id.toString() === cat._id.toString()),
    })).filter(c => c.products.length > 0);
    res.json(menu);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Validate coupon
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    const { valid, reason } = coupon.isValid(orderAmount || 0);
    if (!valid) return res.status(400).json({ message: reason });
    const discountAmount = coupon.calcDiscount(orderAmount || 0);
    res.json({
      valid: true,
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: +discountAmount.toFixed(2),
      description: coupon.description,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Place order
router.post('/orders', async (req, res) => {
  try {
    const { sessionId, tableId, items } = req.body;
    const session = await Session.findById(sessionId).populate('waiter');
    if (!session || session.status !== 'active')
      return res.status(400).json({ message: 'No active session for this table' });

    let subtotal = 0, taxAmount = 0;
    const orderItems = items.map(item => {
      const itemSubtotal = item.price * item.quantity;
      const itemTax = itemSubtotal * (item.taxPercent / 100);
      subtotal += itemSubtotal; taxAmount += itemTax;
      return { product: item.productId, name: item.name, price: item.price, taxPercent: item.taxPercent, quantity: item.quantity };
    });
    const total = +(subtotal + taxAmount).toFixed(2);
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;

    const order = await Order.create({
      session: sessionId, table: tableId, waiter: session.waiter._id,
      orderNumber, items: orderItems,
      subtotal: +subtotal.toFixed(2), taxAmount: +taxAmount.toFixed(2), total,
    });

    req.io.emit('customer:order_placed', {
      order: { _id: order._id, orderNumber: order.orderNumber, tableId, items: order.items, status: order.status, createdAt: order.createdAt }
    });
    res.status(201).json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get session orders
router.get('/sessions/:sessionId/orders', async (req, res) => {
  try {
    res.json(await Order.find({ session: req.params.sessionId }).sort('createdAt'));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get session bill
router.get('/sessions/:sessionId/bill', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const orders = await Order.find({ session: req.params.sessionId });
    const subtotal = +orders.reduce((s, o) => s + o.total, 0).toFixed(2);
    const settings = await Settings.getSettings();
    res.json({
      orders,
      subtotal,
      discountAmount: session.discountAmount || 0,
      total: session.totalAmount || subtotal,
      couponCode: session.couponCode || null,
      session,
      settings,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Request payment (with optional coupon)
router.post('/sessions/:sessionId/pay', async (req, res) => {
  try {
    const { paymentMethod, couponCode } = req.body;
    const session = await Session.findById(req.params.sessionId).populate('waiter');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const orders = await Order.find({ session: session._id });
    const subtotal = +orders.reduce((s, o) => s + o.total, 0).toFixed(2);

    let discountAmount = 0;
    let couponId = null;
    let appliedCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon) {
        const { valid } = coupon.isValid(subtotal);
        if (valid) {
          discountAmount = +coupon.calcDiscount(subtotal).toFixed(2);
          couponId = coupon._id;
          appliedCode = coupon.code;
          // increment usage
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    const finalTotal = +(subtotal - discountAmount).toFixed(2);

    session.status = 'payment';
    session.paymentMethod = paymentMethod;
    session.subtotalAmount = subtotal;
    session.discountAmount = discountAmount;
    session.totalAmount = finalTotal;
    if (couponId) { session.couponId = couponId; session.couponCode = appliedCode; }
    await session.save();

    await Table.findByIdAndUpdate(session.table, { status: 'payment' });

    if (paymentMethod === 'cash') {
      req.io.to(`waiter_${session.waiter._id}`).emit('customer:pay_now', {
        sessionId: session._id, tableId: session.table,
        total: finalTotal, paymentMethod,
      });
    }
    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'payment' });
    res.json({ success: true, subtotal, discountAmount, total: finalTotal, couponCode: appliedCode });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Confirm UPI payment — also auto-closes session and frees table
router.post('/sessions/:sessionId/upi-paid', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate('waiter');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.paymentStatus = 'paid';
    session.status = 'closed';
    session.endTime = new Date();
    await session.save();

    // Free the table immediately
    await Table.findByIdAndUpdate(session.table, {
      status: 'free', currentSession: null, currentWaiter: null,
    });

    req.io.to(`waiter_${session.waiter._id}`).emit('customer:upi_paid', { sessionId: session._id });
    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Card payment confirmed (customer side)
router.post('/sessions/:sessionId/card-paid', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate('waiter');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.paymentStatus = 'paid';
    session.status = 'closed';
    session.endTime = new Date();
    await session.save();

    await Table.findByIdAndUpdate(session.table, {
      status: 'free', currentSession: null, currentWaiter: null,
    });

    req.io.to(`waiter_${session.waiter._id}`).emit('customer:card_paid', { sessionId: session._id });
    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get settings
router.get('/settings', async (req, res) => {
  const s = await Settings.getSettings();
  res.json({ paymentMethods: s.paymentMethods, upiId: s.upiId, restaurantName: s.restaurantName });
});

module.exports = router;
