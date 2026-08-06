const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true }, // 2026
  basicSalary: { type: Number, required: true },
  
  allowances: {
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 }
  },
  
  grossSalary: { type: Number, required: true },

  statutoryDeductions: {
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    tds: { type: Number, default: 0 }
  },

  otherDeductions: {
    loanRecovery: { type: Number, default: 0 },
    advanceRecovery: { type: Number, default: 0 },
    lopDeduction: { type: Number, default: 0 }
  },

  totalDeductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  
  daysWorked: { type: Number, default: 30 },
  totalDaysInMonth: { type: Number, default: 30 },
  
  status: {
    type: String,
    enum: ['DRAFT', 'PROCESSING', 'APPROVED', 'PAID', 'CANCELLED'],
    default: 'DRAFT'
  },
  paymentDate: { type: Date },
  paymentMode: { type: String, enum: ['BANK_TRANSFER', 'CHEQUE', 'CASH'], default: 'BANK_TRANSFER' },
  transactionRef: { type: String },
  payslipUrl: { type: String }
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
