const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Branch = require('../models/Branch');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// Departments
const getDepartments = asyncWrapper(async (req, res) => {
  const depts = await Department.find().populate('head', 'firstName lastName');
  return ApiResponse.success(res, 'Departments retrieved', depts);
});

const createDepartment = asyncWrapper(async (req, res) => {
  let { name, code, description, head, isActive } = req.body;
  if (!code && name) {
    code = name.substring(0, 4).toUpperCase();
  }
  
  const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    return ApiResponse.success(res, 'Department already exists', existing, 200);
  }

  const dept = await Department.create({ name, code, description, head, isActive });
  return ApiResponse.success(res, 'Department created', dept, 201);
});

const updateDepartment = asyncWrapper(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!dept) return ApiResponse.error(res, 'Department not found', 404);
  return ApiResponse.success(res, 'Department updated', dept);
});

const deleteDepartment = asyncWrapper(async (req, res) => {
  const dept = await Department.findByIdAndDelete(req.params.id);
  if (!dept) return ApiResponse.error(res, 'Department not found', 404);
  return ApiResponse.success(res, 'Department deleted');
});

// Designations
const getDesignations = asyncWrapper(async (req, res) => {
  const desgs = await Designation.find().populate('department');
  return ApiResponse.success(res, 'Designations retrieved', desgs);
});

const createDesignation = asyncWrapper(async (req, res) => {
  const existing = await Designation.findOne({ title: { $regex: new RegExp(`^${req.body.title}$`, 'i') } });
  if (existing) {
    return ApiResponse.success(res, 'Designation already exists', existing, 200);
  }

  const desg = await Designation.create(req.body);
  return ApiResponse.success(res, 'Designation created', desg, 201);
});

const updateDesignation = asyncWrapper(async (req, res) => {
  const desg = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!desg) return ApiResponse.error(res, 'Designation not found', 404);
  return ApiResponse.success(res, 'Designation updated', desg);
});

const deleteDesignation = asyncWrapper(async (req, res) => {
  const desg = await Designation.findByIdAndDelete(req.params.id);
  if (!desg) return ApiResponse.error(res, 'Designation not found', 404);
  return ApiResponse.success(res, 'Designation deleted');
});

// Branches
const getBranches = asyncWrapper(async (req, res) => {
  const branches = await Branch.find();
  return ApiResponse.success(res, 'Branches retrieved', branches);
});

const createBranch = asyncWrapper(async (req, res) => {
  const branch = await Branch.create(req.body);
  return ApiResponse.success(res, 'Branch created', branch, 201);
});

module.exports = {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
  getBranches, createBranch
};
