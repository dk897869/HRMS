const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HR_HEAD: 'HR_HEAD',
  HR: 'HR',
  PAYROLL_HEAD: 'PAYROLL_HEAD',
  FINANCE: 'FINANCE',
  ACCOUNTS: 'ACCOUNTS',
  RECRUITER: 'RECRUITER',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  EMPLOYEE: 'EMPLOYEE',
  INTERN: 'INTERN',
  GUEST: 'GUEST'
};

const MODULES = [
  'dashboard',
  'organization',
  'employees',
  'attendance',
  'leaves',
  'payroll',
  'recruitment',
  'performance',
  'claims',
  'assets',
  'documents',
  'projects',
  'helpdesk',
  'announcements',
  'reports',
  'audit_logs',
  'settings',
  'roles'
];

const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export'
};

module.exports = {
  ROLES,
  MODULES,
  ACTIONS
};
