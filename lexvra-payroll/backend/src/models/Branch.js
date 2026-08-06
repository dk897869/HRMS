const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  pincode: { type: String },
  isHeadOffice: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
