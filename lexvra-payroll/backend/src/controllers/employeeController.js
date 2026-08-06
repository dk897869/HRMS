const Employee = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Get all employees with pagination, search & filters
// @route   GET /api/employees
const getEmployees = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { employeeId: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.department) query.department = req.query.department;
  if (req.query.status) query.employmentStatus = req.query.status;

  const total = await Employee.countDocuments(query);
  const employees = await Employee.find(query)
    .populate('department')
    .populate('designation')
    .populate('branch')
    .populate('manager', 'firstName lastName employeeId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return ApiResponse.success(res, 'Employees fetched successfully', employees, 200, {
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

// @desc    Get single employee detail
// @route   GET /api/employees/:id
const getEmployeeById = asyncWrapper(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('department')
    .populate('designation')
    .populate('branch')
    .populate('manager')
    .populate('user');

  if (!employee) {
    return ApiResponse.error(res, 'Employee not found', 404);
  }

  return ApiResponse.success(res, 'Employee detail retrieved', employee);
});

// @desc    Upload / replace an employee profile photo
// @route   POST /api/employees/upload-avatar
// If `employeeId` is provided in the body, the photo is persisted immediately
// on that employee record. Otherwise the URL is simply returned so it can be
// attached to a not-yet-created employee (e.g. the "Add Employee" wizard).
const uploadEmployeeAvatar = asyncWrapper(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No image file was uploaded', 400);
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

  if (req.body.employeeId) {
    const employee = await Employee.findByIdAndUpdate(
      req.body.employeeId,
      { avatar: fileUrl },
      { new: true }
    );
    if (!employee) {
      return ApiResponse.error(res, 'Employee not found', 404);
    }
    return ApiResponse.success(res, 'Employee photo updated successfully', { url: fileUrl, employee });
  }

  return ApiResponse.success(res, 'Photo uploaded successfully', { url: fileUrl });
});

// @desc    Create new employee & associated User account
// @route   POST /api/employees
const createEmployee = asyncWrapper(async (req, res) => {
  const {
    firstName, middleName, lastName, email, phone, gender, dob, maritalStatus,
    joiningDate, employmentType, probationPeriod, confirmationDate,
    department, designation, branch, manager, reportingManager,
    workLocation, workShift, businessUnit, workAddress,
    bloodGroup, nationality, languages,
    bankName, accountNumber, ifscCode, accountType,
    ctc, baseSalary, isPfEligible, uanNumber, isEsiEligible, esiNumber,
    panNumber, aadhaarNumber, avatar,
    employeeId: customEmpId
  } = req.body;

  const existingEmail = await Employee.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return ApiResponse.error(res, 'Employee with this email already exists', 400);
  }

  const count = await Employee.countDocuments();
  const employeeId = customEmpId || `EMP${String(count + 101).padStart(4, '0')}`;

  // Resolve Department ObjectId safely
  let deptId = null;
  if (department) {
    if (mongoose.Types.ObjectId.isValid(department)) {
      deptId = department;
    } else {
      let deptObj = await Department.findOne({ name: department });
      if (!deptObj) {
        deptObj = await Department.create({ name: department, code: department.substring(0, 4).toUpperCase() });
      }
      deptId = deptObj._id;
    }
  }

  // Resolve Designation ObjectId safely
  let desgId = null;
  if (designation) {
    if (mongoose.Types.ObjectId.isValid(designation)) {
      desgId = designation;
    } else {
      let desgObj = await Designation.findOne({ title: designation });
      if (!desgObj) {
        desgObj = await Designation.create({ title: designation, department: deptId });
      }
      desgId = desgObj._id;
    }
  }

  const employee = await Employee.create({
    employeeId,
    firstName,
    middleName,
    lastName,
    email: email.toLowerCase(),
    phone,
    gender,
    dob: dob || undefined,
    maritalStatus,
    joiningDate: joiningDate || new Date(),
    employmentType,
    probationPeriod,
    confirmationDate: confirmationDate || undefined,
    department: deptId,
    designation: desgId,
    branch: branch && mongoose.Types.ObjectId.isValid(branch) ? branch : undefined,
    manager: manager && mongoose.Types.ObjectId.isValid(manager) ? manager : undefined,
    reportingManagerName: reportingManager,
    workLocation,
    workShift,
    businessUnit,
    workAddress,
    bloodGroup,
    nationality,
    languages,
    bankName,
    accountNumber,
    ifscCode,
    accountType,
    ctc: ctc || 600000,
    baseSalary: baseSalary || 30000,
    isPfEligible: Boolean(isPfEligible),
    uanNumber,
    isEsiEligible: Boolean(isEsiEligible),
    esiNumber,
    panNumber,
    aadhaarNumber,
    avatar
  });

  // Create User Login Credentials
  const assignedRoleName = 'EMPLOYEE';
  const roleObj = await Role.findOne({ name: assignedRoleName });

  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    password: 'LX12345', // Default initial password
    role: assignedRoleName,
    roleRef: roleObj ? roleObj._id : null,
    employeeRef: employee._id
  });

  employee.user = user._id;
  await employee.save();

  return ApiResponse.success(res, 'Employee created successfully', employee, 201);
});

// @desc    Update employee details
// @route   PUT /api/employees/:id
const updateEmployee = asyncWrapper(async (req, res) => {
  let employee = await Employee.findById(req.params.id);
  if (!employee) {
    return ApiResponse.error(res, 'Employee not found', 404);
  }

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('department')
    .populate('designation')
    .populate('branch');

  return ApiResponse.success(res, 'Employee updated successfully', employee);
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = asyncWrapper(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return ApiResponse.error(res, 'Employee not found', 404);
  }

  if (employee.user) {
    await User.findByIdAndDelete(employee.user);
  }
  await Employee.findByIdAndDelete(req.params.id);

  return ApiResponse.success(res, 'Employee deleted successfully');
});

// @desc    Resign employee
// @route   PUT /api/employees/:id/resign
const resignEmployee = asyncWrapper(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return ApiResponse.error(res, 'Employee not found', 404);
  }

  employee.employmentStatus = 'RESIGNED';
  employee.exitDate = req.body.exitDate || new Date();
  employee.resignationReason = req.body.reason || 'Personal Reasons';
  await employee.save();

  return ApiResponse.success(res, `Employee ${employee.firstName} ${employee.lastName} Resignation processed`, employee);
});

// @desc    Get upcoming birthdays (only today and future within 30 days)
// @route   GET /api/employees/birthdays
const getUpcomingBirthdays = asyncWrapper(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allEmployees = await Employee.find({ 
    dob: { $exists: true, $ne: null },
    employmentStatus: { $ne: 'RESIGNED' }
  })
  .select('firstName lastName email avatar dob department designation employeeId')
  .populate('department', 'name')
  .populate('designation', 'name')
  .lean();

  const upcomingBirthdays = allEmployees
    .map(emp => {
      const dob = new Date(emp.dob);
      const dobMonth = dob.getMonth(); // 0-11
      const dobDay = dob.getDate();

      let nextBirthday = new Date(today.getFullYear(), dobMonth, dobDay);
      nextBirthday.setHours(0, 0, 0, 0);

      // If birthday already passed earlier this year, move to next year
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      const diffMs = nextBirthday.getTime() - today.getTime();
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

      return {
        ...emp,
        isToday: daysUntil === 0,
        daysUntil,
        formattedDate: `${nextBirthday.getDate()} ${nextBirthday.toLocaleString('en-US', { month: 'short' })}`
      };
    })
    // STRICT RULE: Only keep Today (0) and Upcoming in next 30 days. Past birthdays (already passed) are filtered out!
    .filter(emp => emp.daysUntil >= 0 && emp.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return ApiResponse.success(res, 'Upcoming birthdays fetched', upcomingBirthdays);
});

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resignEmployee,
  uploadEmployeeAvatar,
  getUpcomingBirthdays
};
