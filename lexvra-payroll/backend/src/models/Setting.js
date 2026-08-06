const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  companyName: { type: String, default: 'LEXVRA INFINOLOGY PRIVATE LIMITED' },
  tagline: { type: String, default: 'Innovate. Integrate. Elevate.' },
  companyEmail: { type: String, default: 'contact@lexvra.com' },
  companyPhone: { type: String, default: '+91 98765 43210' },
  address: { type: String, default: 'E-229, Industrial Area, Phase 8-B, Mohali, Punjab 160055, India' },
  currency: { type: String, default: 'INR (₹)' },
  timeZone: { type: String, default: '(GMT+05:30) Asia/Kolkata' },
  workHoursPerDay: { type: Number, default: 8 },
  autoClockOut: { type: Boolean, default: false },
  googleOAuthEnabled: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  // Attendance Permissions & Geofencing
  attendanceWebEnabled: { type: Boolean, default: true },
  attendanceMobileEnabled: { type: Boolean, default: true },
  geofencingEnabled: { type: Boolean, default: false },
  geofencingRadius: { type: Number, default: 200 }, // in meters
  geofencingLat: { type: Number, default: 30.7046 }, // Default Mohali Office Latitude
  geofencingLng: { type: Number, default: 76.7179 }  // Default Mohali Office Longitude
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
