const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null }, // cap for percent discounts
  validFrom: { type: Date, default: null },
  validUntil: { type: Date, default: null },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  description: { type: String, default: '' },
}, { timestamps: true });

// Check if coupon is currently valid
couponSchema.methods.isValid = function (orderAmount = 0) {
  if (!this.active) return { valid: false, reason: 'Coupon is inactive' };
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return { valid: false, reason: 'Coupon is not yet active' };
  if (this.validUntil && now > this.validUntil) return { valid: false, reason: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return { valid: false, reason: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, reason: `Minimum order amount is ₹${this.minOrderAmount}` };
  return { valid: true };
};

couponSchema.methods.calcDiscount = function (orderAmount) {
  if (this.discountType === 'flat') {
    return Math.min(this.discountValue, orderAmount);
  }
  const discount = (orderAmount * this.discountValue) / 100;
  return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
};

module.exports = mongoose.model('Coupon', couponSchema);
