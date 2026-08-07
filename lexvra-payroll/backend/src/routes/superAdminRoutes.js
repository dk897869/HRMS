const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/superAdminDashboardController');
const { getCompanies, getCompanyDetails } = require('../controllers/superAdminCompanyController');
const { protect } = require('../middleware/authMiddleware'); // Reusing protect for now, we will add role check

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

module.exports = router;
