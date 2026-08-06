const express = require('express');
const router = express.Router();
const { exportEmployeesExcel, exportAttendanceExcel } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/employees/excel', exportEmployeesExcel);
router.get('/attendance/excel', exportAttendanceExcel);

module.exports = router;
