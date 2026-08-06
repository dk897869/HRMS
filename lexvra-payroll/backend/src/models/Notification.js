const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END', 'LEAVE_REQUEST', 'APPROVAL', 'BIRTHDAY_WISH', 'CERTIFICATE', 'REPLY', 'GENERAL'],
    default: 'GENERAL'
  },
  employeeName: { type: String }, // Can still be used for generic sender names
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // If null, it's a broadcast
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
