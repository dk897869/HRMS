const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const Setting = require('../models/Setting');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'rzp_test_TEwpOxhGVvjjNK',
  key_secret: '1aHivOfexSnTVIUHSkQENFSC',
});

// @desc    Create a razorpay order
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', plan } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // Razorpay amount is in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan || 'Unknown Plan',
        userId: req.user._id.toString(),
      }
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Server Error in payment processing' });
  }
});

// @desc    Verify razorpay payment
// @route   POST /api/payment/verify-payment
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', '1aHivOfexSnTVIUHSkQENFSC')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      
      // Update Subscription in Settings (Globally for demo, usually per tenant/org)
      let settings = await Setting.findOne();
      if (!settings) settings = new Setting();
      
      settings.subscriptionPlan = plan;
      
      // Calculate expiry date based on plan (approx)
      const expiry = new Date();
      if (plan.toLowerCase().includes('monthly') || plan.toLowerCase().includes('399')) {
        expiry.setMonth(expiry.getMonth() + 1);
      } else {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }
      settings.subscriptionExpiry = expiry;
      
      await settings.save();

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ success: false, message: 'Server Error verifying payment' });
  }
});

module.exports = router;
