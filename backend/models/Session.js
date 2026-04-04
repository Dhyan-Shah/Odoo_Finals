const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'payment', 'closed'], default: 'active' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
<<<<<<< HEAD
  subtotalAmount: { type: Number, default: 0 },   // before discount
  discountAmount: { type: Number, default: 0 },   // coupon discount
  totalAmount: { type: Number, default: 0 },       // final after discount
  couponCode: { type: String, default: null },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
=======
  totalAmount: { type: Number, default: 0 },
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', null], default: null },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
