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
const Coupon = require('../models/Coupon');

const adminOnly = [auth, requireRole('admin')];

// ── DASHBOARD ─────────────────────────────────────────────────────────────
router.get('/dashboard', ...adminOnly, async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);

    const [activeSessions, todaySessions, weekSessions, totalOrdersToday] = await Promise.all([
      Session.find({ status: { $in: ['active', 'payment'] } })
        .populate('table', 'tableNumber')
        .populate('waiter', 'name'),
      Session.find({ status: 'closed', paymentStatus: 'paid', endTime: { $gte: todayStart } }),
      Session.find({ status: 'closed', paymentStatus: 'paid', endTime: { $gte: weekStart } }),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    const totalSalesToday = todaySessions.reduce((s, sess) => s + (sess.totalAmount || 0), 0);
    const revenueThisWeek = weekSessions.reduce((s, sess) => s + (sess.totalAmount || 0), 0);

    res.json({
      totalSalesToday,
      totalOrdersToday,
      activeTables: activeSessions.length,
      totalActiveSessions: activeSessions.length,
      revenueThisWeek,
      activeSessionDetails: activeSessions.map(s => ({
        _id: s._id, table: s.table, waiter: s.waiter, startTime: s.startTime, status: s.status,
      })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── CATEGORIES ────────────────────────────────────────────────────────────
router.get('/categories', ...adminOnly, async (req, res) => {
  res.json(await Category.find().sort('sortOrder name'));
});
router.post('/categories', ...adminOnly, async (req, res) => {
  try { res.status(201).json(await Category.create(req.body)); } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/categories/:id', ...adminOnly, async (req, res) => {
  try { res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); }
});
router.delete('/categories/:id', ...adminOnly, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { active: false }); res.json({ message: 'Deactivated' });
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────
router.get('/products', ...adminOnly, async (req, res) => {
  res.json(await Product.find().populate('category', 'name').sort('name'));
});
router.post('/products', ...adminOnly, async (req, res) => {
  try { res.status(201).json(await Product.create(req.body)); } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/products/:id', ...adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category', 'name');
    if (req.body.available !== undefined || req.body.active !== undefined) {
      req.io.emit('product:availability_changed', { productId: product._id, available: product.available && product.active });
    }
    res.json(product);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ── PRODUCT AVAILABILITY TOGGLE ───────────────────────────────────────────
router.patch('/products/:id/availability', ...adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.available = req.body.available !== undefined ? req.body.available : !product.available;
    await product.save();

    req.io.emit('product:availability_changed', {
      productId: product._id,
      available: product.available && product.active,
    });

    res.json({ success: true, available: product.available });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/products/:id', ...adminOnly, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { active: false });
  req.io.emit('product:availability_changed', { productId: req.params.id, available: false });
  res.json({ message: 'Deactivated' });
});

// ── FLOORS ────────────────────────────────────────────────────────────────
router.get('/floors', ...adminOnly, async (req, res) => {
  res.json(await Floor.find({ active: true }).sort('name'));
});
router.post('/floors', ...adminOnly, async (req, res) => {
  try { res.status(201).json(await Floor.create(req.body)); } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/floors/:id', ...adminOnly, async (req, res) => {
  res.json(await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/floors/:id', ...adminOnly, async (req, res) => {
  await Floor.findByIdAndUpdate(req.params.id, { active: false }); res.json({ message: 'Deactivated' });
});

// ── TABLES ────────────────────────────────────────────────────────────────
router.get('/tables', ...adminOnly, async (req, res) => {
  res.json(await Table.find().populate('floor', 'name').populate('currentWaiter', 'name').sort('tableNumber'));
});
router.get('/tables/by-floor/:floorId', ...adminOnly, async (req, res) => {
  res.json(await Table.find({ floor: req.params.floorId }).populate('currentWaiter', 'name').sort('tableNumber'));
});
router.post('/tables', ...adminOnly, async (req, res) => {
  try { res.status(201).json(await Table.create(req.body)); } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/tables/:id', ...adminOnly, async (req, res) => {
  res.json(await Table.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/tables/:id', ...adminOnly, async (req, res) => {
  await Table.findByIdAndUpdate(req.params.id, { active: false }); res.json({ message: 'Deactivated' });
});

// ── STAFF ─────────────────────────────────────────────────────────────────
router.get('/staff', ...adminOnly, async (req, res) => {
  res.json(await User.find({ role: { $ne: 'admin' } }).select('-password').sort('name'));
});
router.post('/staff', ...adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['waiter', 'kitchen'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/staff/:id', ...adminOnly, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    res.json(await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password'));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ── COUPONS ───────────────────────────────────────────────────────────────
router.get('/coupons', ...adminOnly, async (req, res) => {
  res.json(await Coupon.find().sort('-createdAt'));
});
router.post('/coupons', ...adminOnly, async (req, res) => {
  try {
    const data = { ...req.body, code: req.body.code?.toUpperCase().trim() };
    res.status(201).json(await Coupon.create(data));
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/coupons/:id', ...adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase().trim();
    res.json(await Coupon.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.delete('/coupons/:id', ...adminOnly, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});

// ── SETTINGS ──────────────────────────────────────────────────────────────
router.get('/settings', ...adminOnly, async (req, res) => {
  res.json(await Settings.getSettings());
});
router.put('/settings', ...adminOnly, async (req, res) => {
  try {
    let s = await Settings.findOne();
    if (!s) s = new Settings();
    Object.assign(s, req.body);
    await s.save(); res.json(s);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ── ANALYTICS ─────────────────────────────────────────────────────────────
router.get('/analytics/waiters', ...adminOnly, async (req, res) => {
  try {
    const waiters = await User.find({ role: 'waiter', active: true }).select('-password');
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const analytics = await Promise.all(waiters.map(async (w) => {
      const [allSessions, todaySessions] = await Promise.all([
        Session.find({ waiter: w._id, status: 'closed', paymentStatus: 'paid' }),
        Session.find({ waiter: w._id, status: 'closed', paymentStatus: 'paid', endTime: { $gte: todayStart } }),
      ]);
      const totalRevenue = allSessions.reduce((s, sess) => s + (sess.totalAmount || 0), 0);
      const cashPayments = allSessions.filter(s => s.paymentMethod === 'cash').length;
      const avgDuration = allSessions.length
        ? allSessions.reduce((s, sess) => s + (sess.endTime ? sess.endTime - sess.startTime : 0), 0) / allSessions.length : 0;
      return {
        waiter: { id: w._id, name: w.name, email: w.email },
        totalSessions: allSessions.length,
        todaySessions: todaySessions.length,
        totalRevenue, cashPayments, avgDurationMs: avgDuration,
      };
    }));
    res.json(analytics);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/analytics/waiter/:id/sessions', ...adminOnly, async (req, res) => {
  try {
    res.json(await Session.find({ waiter: req.params.id, status: 'closed' })
      .populate('table', 'tableNumber').sort('-createdAt').limit(50));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── REPORTS ───────────────────────────────────────────────────────────────
router.get('/reports', ...adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, waiterId, paymentMethod, tableId } = req.query;
    let sessionQuery = { status: 'closed' };
    if (startDate || endDate) {
      sessionQuery.endTime = {};
      if (startDate) sessionQuery.endTime.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); sessionQuery.endTime.$lte = e; }
    }
    if (waiterId) sessionQuery.waiter = waiterId;
    if (tableId) sessionQuery.table = tableId;
    if (paymentMethod) sessionQuery.paymentMethod = paymentMethod;

    const sessions = await Session.find(sessionQuery)
      .populate('table', 'tableNumber').populate('waiter', 'name').sort('-endTime');
    const sessionIds = sessions.map(s => s._id);
    const orders = await Order.find({ session: { $in: sessionIds } })
      .populate('table', 'tableNumber').populate('waiter', 'name').sort('-createdAt');
    const totalRevenue = sessions.reduce((s, sess) => s + (sess.totalAmount || 0), 0);

    res.json({
      summary: { totalSessions: sessions.length, totalOrders: orders.length, totalRevenue },
      sessions, orders,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;