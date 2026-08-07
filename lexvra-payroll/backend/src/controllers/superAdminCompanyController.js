const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/superadmin/companies
// @access  Private (Super Admin)
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.error('Super Admin Companies Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get company details
// @route   GET /api/superadmin/companies/:id
// @access  Private (Super Admin)
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
