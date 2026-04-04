const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Table = require('../models/Table');
const Session = require('../models/Session');
const Order = require('../models/Order');
const Floor = require('../models/Floor');

const waiterAuth = [auth, requireRole('waiter', 'admin')];

<<<<<<< HEAD
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
=======
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
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
router.post('/sessions/start', ...waiterAuth, async (req, res) => {
  try {
    const { tableId } = req.body;
    const table = await Table.findById(tableId);
    if (!table || !table.active) return res.status(404).json({ message: 'Table not found' });
    if (table.status !== 'free') return res.status(400).json({ message: 'Table is not free' });

    const session = await Session.create({ table: tableId, waiter: req.user._id });
    await Table.findByIdAndUpdate(tableId, {
<<<<<<< HEAD
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
=======
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
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
router.get('/sessions/:id', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id })
      .populate('table', 'tableNumber floor');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const orders = await Order.find({ session: session._id }).sort('createdAt');
    res.json({ session, orders });
<<<<<<< HEAD
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark order as served — also removes from kitchen queue
=======
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH mark order as served
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
router.patch('/orders/:id/serve', ...waiterAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'served';
    await order.save();
<<<<<<< HEAD
    // Notify customer and kitchen to remove from queue
    req.io.to(`table_${order.table}`).emit('waiter:order_served', { orderId: order._id, tableId: order.table });
    req.io.emit('kitchen:order_removed', { orderId: order._id });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear', { orderId: order._id });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Confirm cash payment — close session AND free table immediately
=======

    req.io.to(`table_${order.table}`).emit('waiter:order_served', { orderId: order._id, tableId: order.table });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear', { orderId: order._id });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH confirm cash payment
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
router.patch('/sessions/:id/confirm-cash', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

<<<<<<< HEAD
    // Mark paid and close session
    session.paymentStatus = 'paid';
    session.paymentMethod = 'cash';
    session.collectedBy = req.user._id;
    session.status = 'closed';
    session.endTime = new Date();

    // Calculate total if not already set
    if (!session.totalAmount) {
      const orders = await Order.find({ session: session._id });
      session.subtotalAmount = +orders.reduce((s, o) => s + o.total, 0).toFixed(2);
      session.totalAmount = +(session.subtotalAmount - (session.discountAmount || 0)).toFixed(2);
    }
    await session.save();

    // Free the table immediately
    await Table.findByIdAndUpdate(session.table, {
      status: 'free', currentSession: null, currentWaiter: null,
    });

    req.io.to(`table_${session.table}`).emit('waiter:cash_confirmed', { sessionId: session._id });
    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null, waiterName: null });
    req.io.to(`waiter_${req.user._id}`).emit('notification:clear_payment', { sessionId: session._id });
    res.json(session);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// End session (manual close after payment already done)
=======
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
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
router.post('/sessions/:id/end', ...waiterAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, waiter: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

<<<<<<< HEAD
    if (session.status !== 'closed') {
      const orders = await Order.find({ session: session._id });
      const subtotal = +orders.reduce((s, o) => s + o.total, 0).toFixed(2);
      session.subtotalAmount = subtotal;
      session.totalAmount = +(subtotal - (session.discountAmount || 0)).toFixed(2);
      session.status = 'closed';
      session.endTime = new Date();
      await session.save();
    }

    await Table.findByIdAndUpdate(session.table, {
      status: 'free', currentSession: null, currentWaiter: null,
=======
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
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    });

    req.io.emit('table:status_changed', { tableId: session.table.toString(), status: 'free', waiterId: null, waiterName: null });
    res.json(session);
<<<<<<< HEAD
  } catch (e) { res.status(500).json({ message: e.message }); }
=======
  } catch (err) { res.status(500).json({ message: err.message }); }
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
});

module.exports = router;
