const Claim = require('../models/Claim');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const getClaims = asyncWrapper(async (req, res) => {
  let query = {};
  if (req.user.role === 'EMPLOYEE') {
    query.employee = req.user.employeeRef?._id || req.user.employeeRef;
  }
  const claims = await Claim.find(query).populate('employee', 'firstName lastName employeeId');
  return ApiResponse.success(res, 'Expense claims fetched', claims);
});

const createClaim = asyncWrapper(async (req, res) => {
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
  const Employee = require('../models/Employee');
  const Approval = require('../models/Approval');
  const Notification = require('../models/Notification');
  const User = require('../models/User');
  const { getIO } = require('../sockets/socketHandler');

  const employee = await Employee.findById(employeeId);
  const claim = await Claim.create({
    ...req.body,
    employee: employeeId,
    title: req.body.title || `${req.body.category || 'Expense'} Reimbursement`
  });

  // Create Notification for Admin
  try {
    const io = getIO();
    const adminUsers = await User.find({ role: { $in: ['ADMIN', 'HR'] } });
    for (let admin of adminUsers) {
      const recipientIds = [admin._id.toString()];
      if (admin.employeeRef) recipientIds.push(admin.employeeRef.toString());

      for (let rId of recipientIds) {
        const notif = await Notification.create({
          recipient: rId,
          sender: employeeId,
          title: 'New Expense Claim',
          message: `${employee?.firstName} ${employee?.lastName} submitted ₹${req.body.amount} for ${req.body.category}.`,
          type: 'APPROVAL',
          read: false
        });

        if (io) io.to(rId).emit('new_notification', notif);
      }
    }
  } catch (e) {}

  return ApiResponse.success(res, 'Expense claim submitted successfully', claim, 201);
});

const updateClaimStatus = asyncWrapper(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const Claim = require('../models/Claim');
  const Notification = require('../models/Notification');
  const { getIO } = require('../sockets/socketHandler');

  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    { status, rejectionReason, approvedBy: req.user.employeeRef },
    { new: true }
  ).populate('employee');

  if (claim && claim.employee) {
    try {
      const io = getIO();
      const notif = await Notification.create({
        recipient: claim.employee._id || claim.employee,
        title: `Expense Claim ${status}`,
        message: `Your ${claim.category} reimbursement (₹${claim.amount}) has been ${status.toLowerCase()} by Admin.`,
        type: 'APPROVAL',
        read: false
      });

      if (io) io.to((claim.employee._id || claim.employee).toString()).emit('new_notification', notif);
    } catch (e) {}
  }

  return ApiResponse.success(res, 'Claim status updated', claim);
});

module.exports = { getClaims, createClaim, updateClaimStatus };
