const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

const kitchenAuth = [auth, requireRole('kitchen', 'admin')];

// GET all active orders (confirmed + in_progress + ready)
router.get('/orders', ...kitchenAuth, async (req, res) => {
  const orders = await Order.find({
    status: { $in: ['confirmed', 'in_progress', 'ready'] },
  })
    .populate('table', 'tableNumber')
    .sort('-createdAt');
  res.json(orders);
});

// PATCH update order status
router.patch('/orders/:id/status', ...kitchenAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('table', 'tableNumber');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // Emit socket events
    if (status === 'in_progress') {
      req.io.to(`table_${order.table._id}`).emit('kitchen:order_in_progress', { orderId: order._id, tableId: order.table._id });
    } else if (status === 'ready') {
      req.io.to(`table_${order.table._id}`).emit('kitchen:order_ready', { orderId: order._id, tableId: order.table._id });
      req.io.to(`waiter_${order.waiter}`).emit('notification:order_ready', {
        orderId: order._id,
        tableNumber: order.table.tableNumber,
        tableId: order.table._id,
      });
    }

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH toggle item prepared within order
router.patch('/orders/:orderId/items/:itemIndex/prepared', ...kitchenAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const idx = parseInt(req.params.itemIndex);
    order.items[idx].prepared = !order.items[idx].prepared;
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET products for availability panel
router.get('/products', ...kitchenAuth, async (req, res) => {
  const products = await Product.find({ active: true }).populate('category', 'name').sort('name');
  res.json(products);
});

// PATCH toggle product availability
router.patch('/products/:id/availability', ...kitchenAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true }
    );
    req.io.emit('product:availability_changed', { productId: product._id, available: product.available && product.active });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
