const express = require('express');
const router = express.Router();
const { generateMonthlyPayroll, getPayrolls, downloadPayslip, updatePayrollStatus } = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.post('/generate', authorize('payroll', 'create'), generateMonthlyPayroll);
router.get('/', authorize('payroll', 'read'), getPayrolls);
router.get('/:id/payslip', downloadPayslip);
router.put('/:id/status', authorize('payroll', 'update'), updatePayrollStatus);

module.exports = router;
