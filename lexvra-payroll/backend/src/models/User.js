const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  },
  role: {
    type: String,
    required: true,
    default: 'EMPLOYEE'
  },
  roleRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  employeeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  googleId: {
    type: String
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now }
  }],
  otp: {
    code: String,
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
