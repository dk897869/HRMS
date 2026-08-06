const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { type: String, enum: ['NORMAL', 'IMPORTANT', 'URGENT'], default: 'NORMAL' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
