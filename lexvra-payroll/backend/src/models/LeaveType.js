const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Wellness Leave"
  code: { type: String, required: true, uppercase: true }, // e.g. "CL", "PL", "SL"
  daysPerYear: { type: Number, required: true, default: 12 },
  isPaid: { type: Boolean, default: true },
  carryForward: { type: Boolean, default: false }, // true for Carry Forward, false for Lapsed
  frequency: { type: String, enum: ['Monthly', 'Yearly'], default: 'Yearly' },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
