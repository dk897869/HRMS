const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  
  status: { type: String, enum: ['active', 'past_due', 'canceled', 'unpaid', 'trialing'], default: 'trialing' },
  
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  
  razorpaySubscriptionId: { type: String }, // If using razorpay subscriptions api
  
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
