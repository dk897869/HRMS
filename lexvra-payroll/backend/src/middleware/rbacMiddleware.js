const ApiResponse = require('../utils/apiResponse');

/**
 * RBAC Permission Middleware
 * @param {string} module - Name of module (e.g., 'employees', 'payroll', 'leaves')
 * @param {string} action - Action requested (e.g., 'read', 'create', 'update', 'delete', 'approve', 'export')
 */
const authorize = (moduleName, action = 'read') => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthorized request', 401);
    }

    // SUPER_ADMIN and ADMIN bypass all granular checks
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      return next();
    }

    const userRole = req.user.roleRef;
    if (userRole && userRole.permissions && userRole.permissions[moduleName]) {
      const hasPermission = userRole.permissions[moduleName][action];
      if (hasPermission) {
        return next();
      }
    }

    // Fallback role default access checks
    return ApiResponse.error(res, `Access denied for module '${moduleName}' (${action})`, 403);
  };
};

/**
 * Role Check Middleware
 * @param  {...string} roles - Permitted role strings (e.g. 'ADMIN', 'HR_HEAD')
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN')) {
      return ApiResponse.error(res, 'Access denied for this action', 403);
    }
    next();
  };
};

module.exports = { authorize, checkRole };
