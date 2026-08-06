const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isSystemDefault: {
    type: Boolean,
    default: false
  },
  permissions: {
    dashboard: { read: { type: Boolean, default: true } },
    organization: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    employees: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean, export: Boolean },
    attendance: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean, approve: Boolean, export: Boolean },
    leaves: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean, approve: Boolean },
    payroll: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean, approve: Boolean, export: Boolean },
    recruitment: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    performance: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    claims: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean, approve: Boolean },
    assets: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    documents: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    projects: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    helpdesk: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    announcements: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean },
    reports: { read: Boolean, export: Boolean },
    audit_logs: { read: Boolean },
    settings: { read: Boolean, update: Boolean },
    roles: { read: Boolean, create: Boolean, update: Boolean, delete: Boolean }
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
