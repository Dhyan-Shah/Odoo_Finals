const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

const PI_URL = 'http://172.20.10.2:4000'; // Your Raspberry Pi's IP

const kitchenAuth = [auth, requireRole('kitchen', 'admin')];

// GET all active orders
router.get('/orders', ...kitchenAuth, async (req, res) => {
  const orders = await Order.find({ status: { $in: ['confirmed', 'in_progress', 'ready'] } })
    .populate('table', 'tableNumber').sort('-createdAt');
  res.json(orders);
});

// Update order status
router.patch('/orders/:id/status', ...kitchenAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('table', 'tableNumber');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();

    if (status === 'in_progress') {
      req.io.to(`table_${order.table._id}`).emit('kitchen:order_in_progress', {
        orderId: order._id, tableId: order.table._id
      });

    } else if (status === 'ready') {
      req.io.to(`table_${order.table._id}`).emit('kitchen:order_ready', {
        orderId: order._id, tableId: order.table._id
      });
      req.io.to(`waiter_${order.waiter}`).emit('notification:order_ready', {
        orderId: order._id,
        tableNumber: order.table.tableNumber,
        tableId: order.table._id,
      });

      // ── Buzz + blink LED on Raspberry Pi ──────────────────────────────
      fetch(`${PI_URL}/order-ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          tableNumber: order.table.tableNumber,
        }),
      }).catch(err => console.error('Pi not reachable:', err.message));
      // ──────────────────────────────────────────────────────────────────
    }

    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Toggle individual item prepared
router.patch('/orders/:orderId/items/:itemIndex/prepared', ...kitchenAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const idx = parseInt(req.params.itemIndex);
    order.items[idx].prepared = !order.items[idx].prepared;
    await order.save();
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get products for availability
router.get('/products', ...kitchenAuth, async (req, res) => {
  res.json(await Product.find({ active: true }).populate('category', 'name').sort('name'));
});

// Toggle product availability
router.patch('/products/:id/availability', ...kitchenAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { available: req.body.available }, { new: true }
    );
    req.io.emit('product:availability_changed', {
      productId: product._id, available: product.available && product.active
    });
    res.json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;