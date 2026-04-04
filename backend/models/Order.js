const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  taxPercent: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  prepared: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['confirmed', 'in_progress', 'ready', 'served'],
    default: 'confirmed',
  },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
