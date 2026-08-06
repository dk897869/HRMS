const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  day: { type: String },
  category: {
    type: String,
    enum: ['Leave', 'Attendance', 'Holiday', 'Recruitment', 'Training', 'Other'],
    default: 'Holiday'
  },
  flag: { type: String, default: '🎉' },
  description: { type: String },
  isMandatory: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
