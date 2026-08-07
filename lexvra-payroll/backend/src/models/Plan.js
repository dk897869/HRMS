const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 'Monthly', 'Yearly', 'Enterprise'
  slug: { type: String, required: true, unique: true }, // 'monthly_249', 'yearly_3999'
  price: { type: Number, required: true },
  interval: { type: String, enum: ['month', 'year', 'lifetime'], required: true },
  employeeLimit: { type: Number, required: true },
  storageLimitMb: { type: Number, default: 1024 },
  features: {
    payroll: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    leave: { type: Boolean, default: true },
    ai: { type: Boolean, default: false },
    documents: { type: Boolean, default: true },
    chat: { type: Boolean, default: false },
    reports: { type: Boolean, default: true },
    support: { type: String, default: 'Standard' } // 'Standard', 'Priority', 'Dedicated'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
