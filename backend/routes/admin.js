const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Floor = require('../models/Floor');
const Table = require('../models/Table');
const Session = require('../models/Session');
const Order = require('../models/Order');
const Settings = require('../models/Settings');

const adminOnly = [auth, requireRole('admin')];

// ── DASHBOARD ─────────────────────────────────────────────────────────────
router.get('/dashboard', ...adminOnly, async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

    const [
      totalOrdersToday,
      activeSessions,
      todaySessions,
      weekSessions,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Session.find({ status: 'active' }).populate('table', 'tableNumber').populate('waiter', 'name'),
      Session.find({ createdAt: { $gte: todayStart }, status: 'closed' }),
      Session.find({ createdAt: { $gte: weekStart }, status: 'closed' }),
    ]);

    const totalSalesToday = todaySessions.reduce((s, sess) => s + sess.totalAmount, 0);
    const revenueThisWeek = weekSessions.reduce((s, sess) => s + sess.totalAmount, 0);

    const activeTables = activeSessions.length;
    const activeSessionDetails = activeSessions.map(s => ({
      _id: s._id,
      table: s.table,
      waiter: s.waiter,
      startTime: s.startTime,
      status: s.status,
    }));

    res.json({
      totalSalesToday,
      totalOrdersToday,
      activeTables,
      totalActiveSessions: activeSessions.length,
      revenueThisWeek,
      activeSessionDetails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CATEGORIES ────────────────────────────────────────────────────────────
router.get('/categories', ...adminOnly, async (req, res) => {
  const cats = await Category.find().sort('sortOrder name');
  res.json(cats);
});

router.post('/categories', ...adminOnly, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/categories/:id', ...adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/categories/:id', ...adminOnly, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: 'Category deactivated' });
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────
router.get('/products', ...adminOnly, async (req, res) => {
  const products = await Product.find().populate('category', 'name').sort('name');
  res.json(products);
});

router.post('/products', ...adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/products/:id', ...adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category','name');
    // Emit socket event for availability change
    if (req.body.available !== undefined || req.body.active !== undefined) {
      req.io.emit('product:availability_changed', { productId: product._id, available: product.available && product.active });
    }
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/products/:id', ...adminOnly, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { active: false });
  req.io.emit('product:availability_changed', { productId: req.params.id, available: false });
  res.json({ message: 'Product deactivated' });
});

// ── FLOORS ────────────────────────────────────────────────────────────────
router.get('/floors', ...adminOnly, async (req, res) => {
  const floors = await Floor.find({ active: true }).sort('name');
  res.json(floors);
});

router.post('/floors', ...adminOnly, async (req, res) => {
  try {
    const floor = await Floor.create(req.body);
    res.status(201).json(floor);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/floors/:id', ...adminOnly, async (req, res) => {
  const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(floor);
});

router.delete('/floors/:id', ...adminOnly, async (req, res) => {
  await Floor.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: 'Floor deactivated' });
});

// ── TABLES ────────────────────────────────────────────────────────────────
router.get('/tables', ...adminOnly, async (req, res) => {
  const tables = await Table.find()
    .populate('floor', 'name')
    .populate('currentWaiter', 'name')
    .sort('tableNumber');
  res.json(tables);
});

router.get('/tables/by-floor/:floorId', ...adminOnly, async (req, res) => {
  const tables = await Table.find({ floor: req.params.floorId })
    .populate('currentWaiter', 'name')
    .sort('tableNumber');
  res.json(tables);
});

router.post('/tables', ...adminOnly, async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/tables/:id', ...adminOnly, async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(table);
});

router.delete('/tables/:id', ...adminOnly, async (req, res) => {
  await Table.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: 'Table deactivated' });
});

// ── STAFF ─────────────────────────────────────────────────────────────────
router.get('/staff', ...adminOnly, async (req, res) => {
  const staff = await User.find({ role: { $ne: 'admin' } }).select('-password').sort('name');
  res.json(staff);
});

router.post('/staff', ...adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['waiter', 'kitchen'].includes(role))
      return res.status(400).json({ message: 'Role must be waiter or kitchen' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/staff/:id', ...adminOnly, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── SETTINGS ──────────────────────────────────────────────────────────────
router.get('/settings', ...adminOnly, async (req, res) => {
  const settings = await Settings.getSettings();
  res.json(settings);
});

router.put('/settings', ...adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── ANALYTICS ─────────────────────────────────────────────────────────────
router.get('/analytics/waiters', ...adminOnly, async (req, res) => {
  try {
    const waiters = await User.find({ role: 'waiter', active: true }).select('-password');
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    const analytics = await Promise.all(waiters.map(async (w) => {
      const [allSessions, todaySessions] = await Promise.all([
        Session.find({ waiter: w._id, status: 'closed' }),
        Session.find({ waiter: w._id, status: 'closed', createdAt: { $gte: todayStart } }),
      ]);
      const totalRevenue = allSessions.reduce((s, sess) => s + sess.totalAmount, 0);
      const cashPayments = allSessions.filter(s => s.paymentMethod === 'cash').length;
      const avgDuration = allSessions.length
        ? allSessions.reduce((s, sess) => {
            const dur = sess.endTime ? sess.endTime - sess.startTime : 0;
            return s + dur;
          }, 0) / allSessions.length
        : 0;

      return {
        waiter: { id: w._id, name: w.name, email: w.email },
        totalSessions: allSessions.length,
        todaySessions: todaySessions.length,
        totalRevenue,
        cashPayments,
        avgDurationMs: avgDuration,
      };
    }));

    res.json(analytics);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/analytics/waiter/:id/sessions', ...adminOnly, async (req, res) => {
  try {
    const sessions = await Session.find({ waiter: req.params.id, status: 'closed' })
      .populate('table', 'tableNumber')
      .sort('-createdAt')
      .limit(50);
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── REPORTS ───────────────────────────────────────────────────────────────
router.get('/reports', ...adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, waiterId, paymentMethod, tableId } = req.query;

    let sessionQuery = { status: 'closed' };
    if (startDate || endDate) {
      sessionQuery.createdAt = {};
      if (startDate) sessionQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        sessionQuery.createdAt.$lte = end;
      }
    }
    if (waiterId) sessionQuery.waiter = waiterId;
    if (tableId) sessionQuery.table = tableId;
    if (paymentMethod) sessionQuery.paymentMethod = paymentMethod;

    const sessions = await Session.find(sessionQuery)
      .populate('table', 'tableNumber')
      .populate('waiter', 'name')
      .sort('-createdAt');

    const sessionIds = sessions.map(s => s._id);
    const orders = await Order.find({ session: { $in: sessionIds } })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name')
      .sort('-createdAt');

    const totalRevenue = sessions.reduce((s, sess) => s + sess.totalAmount, 0);

    res.json({
      summary: {
        totalSessions: sessions.length,
        totalOrders: orders.length,
        totalRevenue,
      },
      sessions,
      orders,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
