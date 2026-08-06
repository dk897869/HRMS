const Leave = require('../models/Leave');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Apply for Leave
// @route   POST /api/leaves
const applyLeave = asyncWrapper(async (req, res) => {
  const { leaveTypeId, fromDate, toDate, totalDays, reason } = req.body;
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;

  if (!employeeId) {
    return ApiResponse.error(res, 'Employee profile missing', 400);
  }

  const leave = await Leave.create({
    employee: employeeId,
    leaveType: leaveTypeId,
    fromDate,
    toDate,
    totalDays: totalDays || 1,
    reason,
    status: 'PENDING'
  });

  return ApiResponse.success(res, 'Leave request submitted successfully', leave, 201);
});

// @desc    Get Leaves List
// @route   GET /api/leaves
const getLeaves = asyncWrapper(async (req, res) => {
  const { status, employee } = req.query;
  const query = {};

  if (status) query.status = status;
  
  if (req.user.role?.toUpperCase() === 'EMPLOYEE') {
    query.employee = req.user.employeeRef?._id || req.user.employeeRef;
  } else if (employee) {
    query.employee = employee;
  }

  const leaves = await Leave.find(query)
    .populate({
      path: 'employee',
      populate: ['department', 'designation']
    })
    .populate('leaveType')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, 'Leaves retrieved successfully', leaves);
});

// @desc    Approve or Reject Leave
// @route   PUT /api/leaves/:id/status
const approveOrRejectLeave = asyncWrapper(async (req, res) => {
  const { status, rejectionReason } = req.body;

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return ApiResponse.error(res, 'Leave request not found', 404);
  }

  // If status is transitioning to APPROVED, deduct balance
  if (status === 'APPROVED' && leave.status !== 'APPROVED') {
    const lb = await LeaveBalance.findOne({ employee: leave.employee, leaveType: leave.leaveType });
    if (lb) {
      lb.balance -= leave.totalDays;
      await lb.save();
    }
  }

  // If status is transitioning from APPROVED to REJECTED, refund balance
  if (status === 'REJECTED' && leave.status === 'APPROVED') {
    const lb = await LeaveBalance.findOne({ employee: leave.employee, leaveType: leave.leaveType });
    if (lb) {
      lb.balance += leave.totalDays;
      await lb.save();
    }
  }

  leave.status = status;
  if (status === 'REJECTED') leave.rejectionReason = rejectionReason;
  leave.approvedBy = req.user.employeeRef;

  await leave.save();

  try {
    const Notification = require('../models/Notification');
    const { getIO } = require('../sockets/socketHandler');
    const notification = await Notification.create({
      title: `Leave ${status}`,
      message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} has been ${status.toLowerCase()}. ${status === 'REJECTED' ? 'Reason: ' + rejectionReason : ''}`,
      type: 'LEAVE_UPDATE',
      recipient: leave.employee,
      sender: req.user._id
    });
    
    const io = getIO();
    if (io) {
      io.to(`user_${leave.employee}`).emit('new_notification', notification);
    }
  } catch (err) {
    console.error('Failed to send leave notification:', err);
  }

  return ApiResponse.success(res, `Leave request ${status.toLowerCase()} successfully`, leave);
});

// @desc    Get Leave Types
// @route   GET /api/leaves/types
const getLeaveTypes = asyncWrapper(async (req, res) => {
  const types = await LeaveType.find();
  return ApiResponse.success(res, 'Leave types fetched', types);
});

// @desc    Create Leave Type
// @route   POST /api/leaves/types
const createLeaveType = asyncWrapper(async (req, res) => {
  try {
    const type = await LeaveType.create(req.body);
    return ApiResponse.success(res, 'Leave type created', type, 201);
  } catch (err) {
    if (err.code === 11000) {
      return ApiResponse.error(res, 'A leave policy with this name or code already exists.', 400);
    }
    throw err;
  }
});

// @desc    Assign Leave to Employee
// @route   POST /api/leaves/assign
const assignLeave = asyncWrapper(async (req, res) => {
  const { employeeId, leaveTypeId, balance } = req.body;
  const existing = await LeaveBalance.findOne({ employee: employeeId, leaveType: leaveTypeId });
  if (existing) {
    return ApiResponse.error(res, 'Leave type already assigned to this employee', 400);
  }
  const lb = await LeaveBalance.create({ employee: employeeId, leaveType: leaveTypeId, balance: balance || 0 });
  return ApiResponse.success(res, 'Leave assigned successfully', lb, 201);
});

// @desc    Update Leave Balance
// @route   PUT /api/leaves/balance
const updateLeaveBalance = asyncWrapper(async (req, res) => {
  const { employeeId, leaveTypeId, balance } = req.body;
  const lb = await LeaveBalance.findOneAndUpdate(
    { employee: employeeId, leaveType: leaveTypeId },
    { balance },
    { new: true, runValidators: true }
  );
  if (!lb) {
    return ApiResponse.error(res, 'Leave balance record not found', 404);
  }
  return ApiResponse.success(res, 'Leave balance updated', lb);
});

// @desc    Get Leave Balances
// @route   GET /api/leaves/balances
const getLeaveBalances = asyncWrapper(async (req, res) => {
  const balances = await LeaveBalance.find()
    .populate('employee', 'firstName lastName employeeId department designation')
    .populate('leaveType', 'name code carryForward frequency isPaid daysPerYear');
  return ApiResponse.success(res, 'Leave balances fetched', balances);
});

// @desc    Get Logged-in Employee's Leave Balances
// @route   GET /api/leaves/my-balances
const getMyLeaveBalances = asyncWrapper(async (req, res) => {
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
  const balances = await LeaveBalance.find({ employee: employeeId })
    .populate('leaveType', 'name code carryForward frequency isPaid daysPerYear');
  return ApiResponse.success(res, 'My leave balances fetched', balances);
});

module.exports = {
  applyLeave,
  getLeaves,
  approveOrRejectLeave,
  getLeaveTypes,
  createLeaveType,
  assignLeave,
  updateLeaveBalance,
  getLeaveBalances,
  getMyLeaveBalances
};
