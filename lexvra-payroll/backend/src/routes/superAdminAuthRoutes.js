const express = require('express');
const router = express.Router();
const { loginSuperAdmin } = require('../controllers/superAdminAuthController');

router.post('/login', loginSuperAdmin);

module.exports = router;
