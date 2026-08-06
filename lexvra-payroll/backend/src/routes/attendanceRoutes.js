const express = require('express');
const router = express.Router();
const { punchIn, punchOut, getAttendanceOverview, getAttendanceLogs, correctPunch, updateStatus, toggleBreak, requestCorrection } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.put('/toggle-break', toggleBreak);
router.post('/request-correction', requestCorrection);
router.get('/overview', getAttendanceOverview);
router.get('/logs', authorize('attendance', 'read'), getAttendanceLogs);
router.put('/:empId/correct', authorize('attendance', 'update'), correctPunch);
router.put('/:empId/status', authorize('attendance', 'update'), updateStatus);

module.exports = router;
