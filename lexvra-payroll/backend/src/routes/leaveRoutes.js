const express = require('express');
const router = express.Router();
const { 
  applyLeave, getLeaves, approveOrRejectLeave, getLeaveTypes,
  createLeaveType, assignLeave, updateLeaveBalance, getLeaveBalances, getMyLeaveBalances
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.post('/', applyLeave);
router.get('/', getLeaves);
router.get('/types', getLeaveTypes);
router.post('/types', authorize('leaves', 'manage'), createLeaveType);
router.put('/:id/status', authorize('leaves', 'approve'), approveOrRejectLeave);

router.get('/balances', authorize('leaves', 'read'), getLeaveBalances);
router.get('/my-balances', getMyLeaveBalances);
router.post('/assign', authorize('leaves', 'manage'), assignLeave);
router.put('/balance', authorize('leaves', 'manage'), updateLeaveBalance);

module.exports = router;
