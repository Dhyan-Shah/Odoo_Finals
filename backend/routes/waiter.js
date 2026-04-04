const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Table = require('../models/Table');
const Session = require('../models/Session');
const Order = require('../models/Order');
const Floor = require('../models/Floor');

const waiterAuth = [auth, requireRole('waiter', 'admin')];

router.get('/floors', ...waiterAuth, async (req, res) => {
  res.json(await Floor.find({ active: true }).sort('name'));
});

router.get('/tables', ...waiterAuth, async (req, res) => {
  res.json(await Table.find({ active: true })
    .populate('floor', 'name')
    .populate('currentWaiter', 'name _id')
    .sort('tableNumber'));
});

// Start session
router.post('/sessions/start', ...waiterAuth, async (req, res) => {
  try {
    const { tableId } = req.body;
    const table = await Table.findById(tableId);
    if (!table || !table.active) return res.status(404).json({ message: 'Table not found' });
    if (table.status !== 'free') return res.status(400).json({ message: 'Table is not free' });

    const session = await Session.create({ table: tableId, waiter: req.user._id });
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied', currentSession: session._id, currentWaiter: req.user._id,
    });
    req.io.emit('table:status_changed', { tableId, status: 'occupied', waiterId: req.user._id, waiterName: req.user.name });
    res.status(201).json(session);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get my active sessions
router.get('/sessions/active', ...waiterAuth, async (req, res) => {
  res.json(await Session.find({ waiter: req.user._id, status: { $in: ['active', 'payment'] } })
    .populate('table', 'tableNumber floor'));
});

// Get session detail
router.get('/sessions/:id', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id })
      .populate('table', 'tableNumber floor');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const orders = await Order.find({ session: session._id }).sort('createdAt');
    res.json({ session, orders });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Accept order (waiter picks up ready order from kitchen)
router.patch('/orders/:id/accept', ...waiterAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'ready') return res.status(400).json({ message: 'Order is not ready yet' });

    order.status = 'accepted';
    await order.save();

    req.io.emit('kitchen:order_removed', { orderId: order._id });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear', { orderId: order._id });
    req.io.to(`table_${order.table}`).emit('kitchen:order_ready', { orderId: order._id, tableId: order.table });

    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark order as served
router.patch('/orders/:id/serve', ...waiterAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['ready', 'accepted'].includes(order.status))
      return res.status(400).json({ message: 'Order cannot be served yet' });

    order.status = 'served';
    await order.save();
    req.io.to(`table_${order.table}`).emit('waiter:order_served', { orderId: order._id, tableId: order.table });
    req.io.emit('kitchen:order_removed', { orderId: order._id });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear', { orderId: order._id });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Confirm cash payment
router.patch('/sessions/:id/confirm-cash', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.paymentStatus = 'paid';
    session.paymentMethod = 'cash';
    session.collectedBy = req.user._id;
    session.status = 'closed';
    session.endTime = new Date();

    if (!session.totalAmount) {
      const orders = await Order.find({ session: session._id });
      session.subtotalAmount = +orders.reduce((s, o) => s + o.total, 0).toFixed(2);
      session.totalAmount = +(session.subtotalAmount - (session.discountAmount || 0)).toFixed(2);
    }
    await session.save();

    // Clear any pending orders from kitchen
    const pendingOrders = await Order.find({
      session: session._id,
      status: { $in: ['confirmed', 'in_progress', 'ready', 'accepted'] },
    });
    for (const order of pendingOrders) {
      order.status = 'served';
      await order.save();
      req.io.emit('kitchen:order_removed', { orderId: order._id });
    }

    await Table.findByIdAndUpdate(session.table, {
      status: 'free', currentSession: null, currentWaiter: null,
    });

    req.io.to(`table_${session.table}`).emit('waiter:cash_confirmed', { sessionId: session._id });
    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null, waiterName: null });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear_payment', { sessionId: session._id });
    res.json(session);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// End session (manual close)
router.post('/sessions/:id/end', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.status !== 'closed') {
      const orders = await Order.find({ session: session._id });
      const subtotal = +orders.reduce((s, o) => s + o.total, 0).toFixed(2);
      session.subtotalAmount = subtotal;
      session.totalAmount = +(subtotal - (session.discountAmount || 0)).toFixed(2);
      session.status = 'closed';
      session.endTime = new Date();
      await session.save();
    }

    // Clear any pending orders from kitchen
    const pendingOrders = await Order.find({
      session: session._id,
      status: { $in: ['confirmed', 'in_progress', 'ready', 'accepted'] },
    });
    for (const order of pendingOrders) {
      order.status = 'served';
      await order.save();
      req.io.emit('kitchen:order_removed', { orderId: order._id });
    }

    await Table.findByIdAndUpdate(session.table, {
      status: 'free', currentSession: null, currentWaiter: null,
    });

    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null, waiterName: null });
    res.json(session);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;