const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Table = require('../models/Table');
const Session = require('../models/Session');
const Order = require('../models/Order');
const Floor = require('../models/Floor');

const waiterAuth = [auth, requireRole('waiter', 'admin')];

// GET floors + tables
router.get('/floors', ...waiterAuth, async (req, res) => {
  const floors = await Floor.find({ active: true }).sort('name');
  res.json(floors);
});

router.get('/tables', ...waiterAuth, async (req, res) => {
  const tables = await Table.find({ active: true })
    .populate('floor', 'name')
    .populate('currentWaiter', 'name _id')
    .sort('tableNumber');
  res.json(tables);
});

// POST start session
router.post('/sessions/start', ...waiterAuth, async (req, res) => {
  try {
    const { tableId } = req.body;
    const table = await Table.findById(tableId);
    if (!table || !table.active) return res.status(404).json({ message: 'Table not found' });
    if (table.status !== 'free') return res.status(400).json({ message: 'Table is not free' });

    const session = await Session.create({ table: tableId, waiter: req.user._id });
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      currentSession: session._id,
      currentWaiter: req.user._id,
    });

    req.io.emit('table:status_changed', { tableId, status: 'occupied', waiterId: req.user._id, waiterName: req.user.name });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my active sessions
router.get('/sessions/active', ...waiterAuth, async (req, res) => {
  const sessions = await Session.find({ waiter: req.user._id, status: { $in: ['active','payment'] } })
    .populate('table', 'tableNumber floor');
  res.json(sessions);
});

// GET session details
router.get('/sessions/:id', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id })
      .populate('table', 'tableNumber floor');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const orders = await Order.find({ session: session._id }).sort('createdAt');
    res.json({ session, orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH mark order as served
router.patch('/orders/:id/serve', ...waiterAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'served';
    await order.save();

    req.io.to(`table_${order.table}`).emit('waiter:order_served', { orderId: order._id, tableId: order.table });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear', { orderId: order._id });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH confirm cash payment
router.patch('/sessions/:id/confirm-cash', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.paymentStatus = 'paid';
    session.paymentMethod = 'cash';
    session.collectedBy = req.user._id;
    await session.save();

    await Table.findByIdAndUpdate(session.table, { status: 'payment' });
    req.io.to(`table_${session.table}`).emit('waiter:cash_confirmed', { sessionId: session._id });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear_payment', { sessionId: session._id });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST end session
router.post('/sessions/:id/end', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Calculate total
    const orders = await Order.find({ session: session._id });
    const totalAmount = orders.reduce((s, o) => s + o.total, 0);

    session.status = 'closed';
    session.endTime = new Date();
    session.totalAmount = totalAmount;
    await session.save();

    await Table.findByIdAndUpdate(session.table, {
      status: 'free',
      currentSession: null,
      currentWaiter: null,
    });

    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null, waiterName: null });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
