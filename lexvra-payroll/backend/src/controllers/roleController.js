const Role = require('../models/Role');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const getRoles = asyncWrapper(async (req, res) => {
  const roles = await Role.find();
  return ApiResponse.success(res, 'Roles fetched', roles);
});

const updateRolePermissions = asyncWrapper(async (req, res) => {
  const { roleId } = req.params;
  const { permissions } = req.body;

  const role = await Role.findByIdAndUpdate(roleId, { permissions }, { new: true });
  if (!role) {
    return ApiResponse.error(res, 'Role not found', 404);
  }

  return ApiResponse.success(res, `Permissions updated for ${role.displayName}`, role);
});

module.exports = { getRoles, updateRolePermissions };
