const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  gst: { type: String, default: '' },
  pan: { type: String, default: '' },
  address: { type: String, default: '' },
  industry: { type: String, default: '' },
  
  // Contact Info
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  
  // Relations
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Subscription / Limits
  currentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  employeeLimit: { type: Number, default: 20 },
  employeesUsed: { type: Number, default: 0 },
  storageLimitMb: { type: Number, default: 1024 }, // 1 GB default
  storageUsedMb: { type: Number, default: 0 },
  
  // Status
  subscriptionStatus: { 
    type: String, 
    enum: ['Trial', 'Active', 'Expired', 'Suspended', 'Cancelled'], 
    default: 'Trial' 
  },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  subscriptionExpiry: { type: Date },
  
  // Audit
  lastLogin: { type: Date },
  currentVersion: { type: String, default: '1.0.0' },
  
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
