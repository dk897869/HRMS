const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Company Policy', 'Offer Letter', 'Contract', 'Tax Document', 'Identity', 'Certificate', 'Other'], default: 'Company Policy' },
  fileUrl: { type: String, required: true },
  fileSize: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  targetDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' } // specific to an employee
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
