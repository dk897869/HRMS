const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  gradeLevel: { type: String, default: 'L1' },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Designation', designationSchema);
