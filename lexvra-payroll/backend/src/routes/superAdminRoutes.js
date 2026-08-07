const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/superAdminDashboardController');
const { getCompanies, getCompanyDetails } = require('../controllers/superAdminCompanyController');
const { updateProfile, changePassword } = require('../controllers/superAdminSettingsController');
const { getSubscriptionsData } = require('../controllers/superAdminSubscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Super Admin Middleware Check
const protectSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as super admin' });
  }
};

router.use(protect, protectSuperAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Companies
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyDetails);

// Settings
router.put('/settings/profile', updateProfile);
router.put('/settings/password', changePassword);

// Subscriptions
router.get('/subscriptions', getSubscriptionsData);

module.exports = router;
