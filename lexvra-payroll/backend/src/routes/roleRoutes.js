const express = require('express');
const router = express.Router();
const { getRoles, updateRolePermissions } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/', getRoles);
router.put('/:roleId/permissions', checkRole('ADMIN', 'SUPER_ADMIN'), updateRolePermissions);

module.exports = router;
