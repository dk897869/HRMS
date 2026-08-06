const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'lexvra_secret_jwt_key_2026',
    { expiresIn: '1d' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || 'lexvra_refresh_secret_2026',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, 'Please provide email/phone and password', 400);
  }

  const cleanIdentifier = email.trim().toLowerCase();

  // 1. Search User directly by email (fastest)
  let user = await User.findOne({ email: cleanIdentifier }).select('+password');

  if (!user) {
    // 2. Fallback: Search Employee by email, phone, or employeeId
    const emp = await Employee.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: cleanIdentifier },
        { employeeId: cleanIdentifier.toUpperCase() }
      ]
    }).lean();

    if (emp && emp.user) {
      user = await User.findById(emp.user).select('+password');
    } else if (emp) {
      user = await User.findOne({ employeeRef: emp._id }).select('+password');
    }
  }

  if (!user) {
    return ApiResponse.error(res, 'User not registered. Please contact HR / Admin.', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Account deactivated. Contact Admin.', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update token and last login asynchronously in background to speed up response
  User.updateOne(
    { _id: user._id },
    { 
      $push: { refreshTokens: { token: refreshToken } },
      $set: { lastLogin: new Date() }
    }
  ).exec();

  // Now properly populate for the frontend response
  await user.populate('roleRef');
  await user.populate({
    path: 'employeeRef',
    populate: ['department', 'designation', 'branch', 'manager']
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  });

  return ApiResponse.success(res, 'Login successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'EMPLOYEE',
      roleRef: user.roleRef,
      employeeRef: user.employeeRef,
      avatar: user.avatar
    },
    accessToken,
    refreshToken
  });
});

const googleLogin = asyncWrapper(async (req, res) => {
  const { credential, email: reqEmail, name: reqName, googleId: reqGoogleId, avatar: reqAvatar } = req.body;

  let email = reqEmail;
  let name = reqName;
  let googleId = reqGoogleId;
  let avatar = reqAvatar;

  // 1. If credential (ID Token) is provided, verify with Google TokenInfo API
  if (credential) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (response.ok) {
        const payload = await response.json();
        email = payload.email;
        name = payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || email.split('@')[0];
        googleId = payload.sub;
        avatar = payload.picture;
      }
    } catch (err) {
      console.error('Google token verification error:', err);
    }
  }

  if (!email) {
    return ApiResponse.error(res, 'Google authentication failed. Valid email required.', 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  // 2. CHECK IF USER EXISTS IN DATABASE (by User email OR Employee email registered by Admin)
  let user = await User.findOne({ email: cleanEmail }).populate('roleRef').populate('employeeRef');

  // If not in User collection, check if an Employee record was added by Admin with this email!
  if (!user) {
    const Employee = require('../models/Employee');
    const emp = await Employee.findOne({ email: cleanEmail });

    if (emp) {
      let defaultRole = await Role.findOne({ name: 'EMPLOYEE' });
      user = await User.create({
        email: cleanEmail,
        name: name || `${emp.firstName} ${emp.lastName}`,
        googleId,
        avatar: avatar || emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        role: 'EMPLOYEE',
        roleRef: defaultRole ? defaultRole._id : null,
        employeeRef: emp._id,
        isActive: true
      });
      emp.user = user._id;
      if (avatar && (!emp.avatar || emp.avatar.includes('unsplash'))) emp.avatar = avatar;
      await emp.save();
    }
  }

  // 3. STRICT SECURITY RULE: IF NOT REGISTERED BY ADMIN, REJECT LOGIN!
  if (!user) {
    return ApiResponse.error(
      res, 
      `Access Denied. Your email (${cleanEmail}) is not registered. Only Admin-registered employees can log in. Contact HR/Admin.`, 
      403
    );
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Account deactivated. Contact Admin.', 403);
  }

  // 4. Update Google metadata
  if (googleId && !user.googleId) user.googleId = googleId;
  if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) user.avatar = avatar;

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshTokens.push({ token: refreshToken });
  user.lastLogin = new Date();
  await user.save();

  await user.populate('roleRef');
  await user.populate({
    path: 'employeeRef',
    populate: ['department', 'designation', 'branch', 'manager']
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  });

  return ApiResponse.success(res, 'Google authentication successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'EMPLOYEE',
      roleRef: user.roleRef,
      employeeRef: user.employeeRef,
      avatar: user.avatar
    },
    accessToken,
    refreshToken
  });
});

const sendOTP = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return ApiResponse.error(res, 'User with this email does not exist', 44);
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = {
    code: otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  await user.save();

  return ApiResponse.success(res, `OTP sent successfully to ${email}. (Demo OTP: ${otpCode})`, { otpDemo: otpCode });
});

const verifyOTP = asyncWrapper(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).populate('roleRef').populate('employeeRef');

  if (!user || !user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
    return ApiResponse.error(res, 'Invalid or expired OTP', 400);
  }

  user.otp = undefined;
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshTokens.push({ token: refreshToken });
  user.lastLogin = new Date();
  await user.save();

  return ApiResponse.success(res, 'OTP verification successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleRef: user.roleRef,
      employeeRef: user.employeeRef,
      avatar: user.avatar
    },
    accessToken,
    refreshToken
  });
});

const getMe = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).populate('roleRef').populate({
    path: 'employeeRef',
    populate: ['department', 'designation', 'branch', 'manager']
  });

  return ApiResponse.success(res, 'Current user profile retrieved', { user });
});

const logout = asyncWrapper(async (req, res) => {
  res.clearCookie('accessToken');
  return ApiResponse.success(res, 'Logged out successfully');
});

const checkFirstTimeLogin = asyncWrapper(async (req, res) => {
  const { identifier } = req.body; // email or phone
  if (!identifier) return ApiResponse.error(res, 'Provide email or phone number', 400);

  const query = { $or: [{ email: identifier.toLowerCase() }, { phone: identifier }] };
  const user = await User.findOne(query);

  if (!user) {
    // Check if employee exists by email
    const emp = await Employee.findOne({ $or: [{ email: identifier.toLowerCase() }, { phone: identifier }] });
    if (emp) {
      return ApiResponse.success(res, 'Employee found. Setup first time password.', { isFirstTime: true, name: `${emp.firstName} ${emp.lastName}`, email: emp.email });
    }
    return ApiResponse.error(res, 'Employee not found with provided email or phone', 404);
  }

  return ApiResponse.success(res, 'User exists', { isFirstTime: false });
});

const setupFirstTimePassword = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return ApiResponse.error(res, 'Email and password required', 400);

  let user = await User.findOne({ email: email.toLowerCase() });
  const emp = await Employee.findOne({ email: email.toLowerCase() });

  if (!user) {
    let defaultRole = await Role.findOne({ name: 'EMPLOYEE' });
    user = new User({
      name: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
      email: email.toLowerCase(),
      password,
      role: 'EMPLOYEE',
      roleRef: defaultRole ? defaultRole._id : null,
      employeeRef: emp ? emp._id : null,
    });
  } else {
    user.password = password;
  }

  await user.save();
  const { accessToken, refreshToken } = generateTokens(user._id);

  return ApiResponse.success(res, 'Password generated successfully. Logged in!', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeRef: user.employeeRef,
      avatar: user.avatar
    },
    accessToken,
    refreshToken
  });
});

const updateAvatar = asyncWrapper(async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) return ApiResponse.error(res, 'Avatar image payload required', 400);

  const user = await User.findById(req.user._id);
  if (!user) return ApiResponse.error(res, 'User not found', 404);

  user.avatar = avatar;
  await user.save();

  return ApiResponse.success(res, 'Profile photo updated & saved to database successfully!', { avatar: user.avatar });
});

module.exports = {
  login,
  googleLogin,
  sendOTP,
  verifyOTP,
  checkFirstTimeLogin,
  setupFirstTimePassword,
  getMe,
  logout,
  updateAvatar
};
