const Company = require('../models/Company');
const Invoice = require('../models/Invoice');

// @desc    Get Super Admin Dashboard Stats
// @route   GET /api/superadmin/dashboard/stats
// @access  Private (Super Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ subscriptionStatus: 'Active' });
    const freeTrials = await Company.countDocuments({ subscriptionStatus: 'Trial' });
    const expiredPlans = await Company.countDocuments({ subscriptionStatus: 'Expired' });
    
    // Total Employees across all companies
    const companies = await Company.find({}, 'employeesUsed');
    const totalEmployees = companies.reduce((acc, curr) => acc + (curr.employeesUsed || 0), 0);

    // Revenue calculations
    const invoices = await Invoice.find({ status: 'Paid' });
    const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Recent Signups
    const recentSignups = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName email subscriptionStatus employeesUsed createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        activeCompanies,
        freeTrials,
        expiredPlans,
        totalEmployees,
        monthlyRevenue: Math.floor(totalRevenue * 0.2), // Mock logic for now
        yearlyRevenue: Math.floor(totalRevenue * 0.8),
        totalRevenue,
      },
      recentSignups
    });
  } catch (error) {
    console.error('Super Admin Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
