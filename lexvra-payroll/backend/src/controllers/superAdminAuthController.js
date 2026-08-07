const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Super Admin Login
// @route   POST /api/superadmin/auth/login
// @access  Public
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied. Super Admin only.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Super Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
