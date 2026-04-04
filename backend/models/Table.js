const mongoose = require('mongoose');
const crypto = require('crypto');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, trim: true },
  floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  capacity: { type: Number, required: true, min: 1 },
  token: { type: String, unique: true, default: () => crypto.randomBytes(16).toString('hex') },
  active: { type: Boolean, default: true },
  status: { type: String, enum: ['free', 'occupied', 'payment'], default: 'free' },
  currentSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
  currentWaiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
