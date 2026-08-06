const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewPeriod: { type: String, required: true }, // e.g. 'Q1-2026', 'Annual 2026'
  selfRating: { type: Number, min: 1, max: 5 },
  selfComments: { type: String },
  managerRating: { type: Number, min: 1, max: 5 },
  managerComments: { type: String },
  finalRating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'COMPLETED'], default: 'DRAFT' },
  rewards: { type: String }, // e.g. 'Bonus ₹5000', 'Promotion to Sr. Dev'
  isPerformerOfTheMonth: { type: Boolean, default: false },
  goals: [{
    title: String,
    weightage: Number,
    score: Number,
    comments: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
