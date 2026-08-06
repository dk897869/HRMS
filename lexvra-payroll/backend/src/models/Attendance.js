const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  punchIn: { type: Date },
  punchOut: { type: Date },
  punchInIp: { type: String },
  punchOutIp: { type: String },
  sessions: [{ punchIn: Date, punchOut: Date, punchInIp: String, punchOutIp: String }],
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE', 'WFH', 'WEEKOFF', 'HOLIDAY', 'ON_BREAK'],
    default: 'ABSENT'
  },
  totalHours: { type: Number, default: 0 },
  breakHours: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  remarks: { type: String },
  isManualOverride: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
