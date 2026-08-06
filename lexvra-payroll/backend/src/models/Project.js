const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, uppercase: true },
  clientName: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: { type: String, enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'], default: 'IN_PROGRESS' },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
