const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  taxPercent: { type: Number, default: 0, min: 0, max: 100 },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },       // Admin only
  available: { type: Boolean, default: true },     // Admin or Kitchen
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

productSchema.virtual('priceWithTax').get(function () {
  return +(this.price * (1 + this.taxPercent / 100)).toFixed(2);
});

module.exports = mongoose.model('Product', productSchema);
