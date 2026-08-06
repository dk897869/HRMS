const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, access token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lexvra_secret_jwt_key_2026');
    const user = await User.findById(decoded.id).populate('employeeRef').populate('roleRef');

    if (!user || !user.isActive) {
      return ApiResponse.error(res, 'User account not found or deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Token expired or invalid', 401);
  }
};

module.exports = { protect };
