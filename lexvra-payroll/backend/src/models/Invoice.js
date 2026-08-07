const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  status: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
  
  billingDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  paidDate: { type: Date },
  
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
