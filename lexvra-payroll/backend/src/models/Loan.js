const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanId: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  employeeCode: { type: String },
  designation: { type: String },
  department: { type: String },
  joiningDate: { type: Date },
  avatar: { type: String },
  type: {
    type: String,
    enum: ['Personal Loan', 'Festival Advance', 'Home Loan', 'Emergency Advance', 'Education Advance'],
    default: 'Personal Loan'
  },
  amount: { type: Number, required: true },
  outstanding: { type: Number, required: true },
  emi: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  tenureMonths: { type: Number, required: true },
  paidMonths: { type: Number, default: 0 },
  nextDeductionDate: { type: String },
  bankAccount: { type: String },
  ifscCode: { type: String },
  reason: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Closed', 'Rejected'],
    default: 'Pending'
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
