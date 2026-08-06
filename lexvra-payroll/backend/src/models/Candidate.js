const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String },
  stage: {
    type: String,
    enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'],
    default: 'APPLIED'
  },
  rating: { type: Number, default: 0 },
  notes: { type: String },
  interviewDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
