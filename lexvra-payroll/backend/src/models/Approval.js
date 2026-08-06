const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employeeName: { type: String, required: true },
  employeeTitle: { type: String },
  avatar: { type: String },
  requestType: {
    type: String,
    enum: ['Loan Request', 'Advance Request', 'Leave Request', 'Attendance Correction', 'Payroll Change', 'Expense Claim'],
    required: true
  },
  amount: { type: Number, default: 0 },
  purpose: { type: String, required: true },
  submittedOn: { type: String, required: true },
  requestedBy: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  managerRemarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Approval', approvalSchema);
