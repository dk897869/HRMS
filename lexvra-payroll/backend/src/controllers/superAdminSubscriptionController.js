const Company = require('../models/Company');
const Invoice = require('../models/Invoice');

// @desc    Get all subscriptions and invoices
// @route   GET /api/superadmin/subscriptions
// @access  Private (Super Admin)
exports.getSubscriptionsData = async (req, res) => {
  try {
    const companies = await Company.find()
      .select('companyName email subscriptionStatus employeeLimit employeesUsed createdAt')
      .sort({ createdAt: -1 });

    const invoices = await Invoice.find()
      .populate('companyId', 'companyName')
      .sort({ paidDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      companies,
      invoices
    });
  } catch (error) {
    console.error('Subscriptions Data Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
