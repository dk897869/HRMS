const express = require('express');
const router = express.Router();
const { login, googleLogin, sendOTP, verifyOTP, checkFirstTimeLogin, setupFirstTimePassword, getMe, logout, updateAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/check-first-time', checkFirstTimeLogin);
router.post('/setup-password', setupFirstTimePassword);
router.post('/google', googleLogin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.put('/update-avatar', protect, updateAvatar);
router.post('/logout', protect, logout);

module.exports = router;
