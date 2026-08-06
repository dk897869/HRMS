const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Bus Ticket', 'Food Bill', 'Local Conveyance', 'Hotel', 'Travel', 'Medical', 'Internet', 'Conveyance', 'Food', 'Fuel', 'Other'], default: 'Bus Ticket' },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  receiptUrl: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'], default: 'PENDING' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
