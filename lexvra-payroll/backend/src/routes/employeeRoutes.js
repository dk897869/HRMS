const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, resignEmployee, uploadEmployeeAvatar, getUpcomingBirthdays } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload-avatar', authorize('employees', 'create'), uploadAvatar.single('avatar'), uploadEmployeeAvatar);

router.get('/birthdays', getUpcomingBirthdays); // No strict authorization required if they are logged in, or can add authorize()
router.get('/', authorize('employees', 'read'), getEmployees);
router.get('/:id', authorize('employees', 'read'), getEmployeeById);
router.post('/', authorize('employees', 'create'), createEmployee);
router.put('/:id/resign', authorize('employees', 'update'), resignEmployee);
router.put('/:id', authorize('employees', 'update'), updateEmployee);
router.delete('/:id', authorize('employees', 'delete'), deleteEmployee);

module.exports = router;
