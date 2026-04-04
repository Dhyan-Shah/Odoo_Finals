const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Odoo POS Cafe' },
  paymentMethods: {
    cash: { type: Boolean, default: true },
    card: { type: Boolean, default: true },
    upi: { type: Boolean, default: true },
  },
  upiId: { type: String, default: '' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

Settings.getSettings = async function () {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

module.exports = Settings;
