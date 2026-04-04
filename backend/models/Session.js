const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'payment', 'closed'], default: 'active' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', null], default: null },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
