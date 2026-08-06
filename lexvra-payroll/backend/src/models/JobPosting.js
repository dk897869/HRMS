const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  location: { type: String, default: 'Head Office' },
  type: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT'], default: 'FULL_TIME' },
  experienceMin: { type: Number, default: 0 },
  experienceMax: { type: Number, default: 5 },
  salaryRangeMin: { type: Number },
  salaryRangeMax: { type: Number },
  openings: { type: Number, default: 1 },
  description: { type: String, required: true },
  requirements: [String],
  status: { type: String, enum: ['OPEN', 'CLOSED', 'PAUSED'], default: 'OPEN' }
}, { timestamps: true });

module.exports = mongoose.model('JobPosting', jobPostingSchema);
