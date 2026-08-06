const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Setting = require('../models/Setting');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// Helper for Haversine distance in meters
const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radius of the earth in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
};

// @desc    Check-in / Punch In
// @route   POST /api/attendance/punch-in
const punchIn = asyncWrapper(async (req, res) => {
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
  if (!employeeId) {
    return ApiResponse.error(res, 'User profile is not linked to an Employee record', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({ employee: employeeId, date: today });
  if (attendance && attendance.punchIn && !attendance.punchOut) {
    return ApiResponse.error(res, 'Currently punched in. Please punch out first before punching in again.', 400);
  }

  // Fetch Settings for Geofencing and Platform Permissions
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }

  const { platform, location } = req.body;
  const punchPlatform = platform || 'web'; // default to web if not provided

  // Check Platform Permissions
  if (punchPlatform === 'web' && !setting.attendanceWebEnabled) {
    return ApiResponse.error(res, 'Web attendance punching is currently disabled by Admin.', 403);
  }
  if (punchPlatform === 'mobile' && !setting.attendanceMobileEnabled) {
    return ApiResponse.error(res, 'Mobile app attendance punching is currently disabled by Admin.', 403);
  }

  // Check Geofencing
  if (setting.geofencingEnabled) {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return ApiResponse.error(res, 'Location is required when Geofencing is enabled. Please allow location access.', 400);
    }
    const distance = getDistanceFromLatLonInM(location.lat, location.lng, setting.geofencingLat, setting.geofencingLng);
    if (distance > setting.geofencingRadius) {
      return ApiResponse.error(res, `You are outside the permitted office radius (${setting.geofencingRadius}m). You are ${Math.round(distance)}m away.`, 403);
    }
  }

  const punchInTime = new Date();
  const currentHour = punchInTime.getHours();
  // Late if punch in after 9:30 AM
  const status = (currentHour > 9 || (currentHour === 9 && punchInTime.getMinutes() > 30)) ? 'LATE' : 'PRESENT';

  if (!attendance) {
    attendance = new Attendance({
      employee: employeeId,
      date: today,
      punchIn: punchInTime,
      punchInIp: req.ip || '127.0.0.1',
      status,
      location: req.body.location || { lat: 30.7046, lng: 76.7179, address: 'Mohali Head Office' },
      sessions: [{ punchIn: punchInTime, punchInIp: req.ip || '127.0.0.1' }]
    });
  } else {
    // Re-punch in after a previous checkout
    attendance.punchIn = punchInTime;
    attendance.punchOut = null;
    attendance.status = status;
    if (!attendance.sessions) attendance.sessions = [];
    attendance.sessions.push({ punchIn: punchInTime, punchInIp: req.ip || '127.0.0.1' });
  }

  await attendance.save();
  return ApiResponse.success(res, `Punch In successful at ${punchInTime.toLocaleTimeString()}`, attendance);
});

// @desc    Check-out / Punch Out
// @route   POST /api/attendance/punch-out
const punchOut = asyncWrapper(async (req, res) => {
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
  if (!employeeId) {
    return ApiResponse.error(res, 'Employee record not found', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ employee: employeeId, date: today });
  if (!attendance || !attendance.punchIn) {
    return ApiResponse.error(res, 'No punch in record found for today', 400);
  }

  if (attendance.punchOut) {
    return ApiResponse.error(res, 'Already punched out for today', 400);
  }

  // Fetch Settings for Geofencing and Platform Permissions
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({});

  const { platform, location } = req.body;
  const punchPlatform = platform || 'web';

  // Check Platform Permissions
  if (punchPlatform === 'web' && !setting.attendanceWebEnabled) {
    return ApiResponse.error(res, 'Web attendance punching is currently disabled by Admin.', 403);
  }
  if (punchPlatform === 'mobile' && !setting.attendanceMobileEnabled) {
    return ApiResponse.error(res, 'Mobile app attendance punching is currently disabled by Admin.', 403);
  }

  // Check Geofencing
  if (setting.geofencingEnabled) {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return ApiResponse.error(res, 'Location is required when Geofencing is enabled. Please allow location access.', 400);
    }
    const distance = getDistanceFromLatLonInM(location.lat, location.lng, setting.geofencingLat, setting.geofencingLng);
    if (distance > setting.geofencingRadius) {
      return ApiResponse.error(res, `You are outside the permitted office radius (${setting.geofencingRadius}m). You are ${Math.round(distance)}m away.`, 403);
    }
  }

  const punchOutTime = new Date();
  attendance.punchOut = punchOutTime;
  attendance.punchOutIp = req.ip || '127.0.0.1';

  // Update the last session
  if (attendance.sessions && attendance.sessions.length > 0) {
    const lastSession = attendance.sessions[attendance.sessions.length - 1];
    if (!lastSession.punchOut) {
      lastSession.punchOut = punchOutTime;
      lastSession.punchOutIp = req.ip || '127.0.0.1';
    }
  }

  // Calculate total hours from all sessions
  let totalMs = 0;
  if (attendance.sessions && attendance.sessions.length > 0) {
    attendance.sessions.forEach(s => {
      if (s.punchIn && s.punchOut) {
        totalMs += new Date(s.punchOut) - new Date(s.punchIn);
      }
    });
  } else {
    totalMs = punchOutTime - new Date(attendance.punchIn);
  }
  
  const diffHours = parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2));
  attendance.totalHours = diffHours;

  if (diffHours > 8) {
    attendance.overtimeHours = parseFloat((diffHours - 8).toFixed(2));
  }

  await attendance.save();
  return ApiResponse.success(res, `Punch Out successful. Total Hours: ${diffHours} hrs`, attendance);
});

// Helper: Auto Punch-Out at 8:00 PM (20:00) for any unclosed punch-ins
const autoPunchOutOverduePunches = async () => {
  try {
    const now = new Date();
    const openPunches = await Attendance.find({ punchIn: { $ne: null }, punchOut: null });

    for (let record of openPunches) {
      const punchInDate = new Date(record.punchIn);
      const eightPmCutoff = new Date(punchInDate.getFullYear(), punchInDate.getMonth(), punchInDate.getDate(), 20, 0, 0, 0);

      // If current time is past 8:00 PM on punchIn day, or date is past today
      if (now >= eightPmCutoff) {
        record.punchOut = eightPmCutoff;
        record.punchOutIp = '127.0.0.1';
        const diffMs = record.punchOut - record.punchIn;
        const diffHours = parseFloat(Math.max(0, diffMs / (1000 * 60 * 60)).toFixed(2));
        record.totalHours = diffHours;
        if (diffHours > 8) {
          record.overtimeHours = parseFloat((diffHours - 8).toFixed(2));
        }
        await record.save();
      }
    }
  } catch (err) {
    console.error('Auto punch out error:', err);
  }
};

// @desc    Get Attendance Overview Stats for Dashboard
// @route   GET /api/attendance/overview
const getAttendanceOverview = asyncWrapper(async (req, res) => {
  await autoPunchOutOverduePunches();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalEmployees = await Employee.countDocuments({ employmentStatus: 'ACTIVE' });
  const todayPunches = await Attendance.find({ date: today }).populate('employee', 'firstName lastName employeeId department designation');

  const checkedInCount = todayPunches.filter(p => p.punchIn && !p.punchOut).length;
  const completedCount = todayPunches.filter(p => p.punchIn && p.punchOut).length;
  const onLeaveCount = todayPunches.filter(p => p.status === 'ON_LEAVE').length;
  const onBreakCount = todayPunches.filter(p => p.status === 'ON_BREAK').length;
  const totalWorking = checkedInCount + completedCount;
  const notInYet = Math.max(0, totalEmployees - totalWorking - onLeaveCount);

  const hourlyCurve = [
    { time: '12 AM', count: 0 }, { time: '4 AM', count: 0 }, { time: '8 AM', count: 12 },
    { time: '9 AM', count: 45 }, { time: '10 AM', count: 78 }, { time: '12 PM', count: 88 },
    { time: '4 PM', count: 92 }, { time: '8 PM', count: 95 }, { time: '12 AM', count: 97 }
  ];

  return ApiResponse.success(res, 'Attendance overview stats fetched', {
    totalEmployees,
    currentlyWorking: checkedInCount,
    onBreak: onBreakCount,
    onLeave: onLeaveCount,
    notInYet,
    checkedInTotal: totalWorking,
    hourlyCurve,
    todayPunches
  });
});

// @desc    Get Attendance logs list (Filtered for Present Day by default)
// @route   GET /api/attendance/logs
const getAttendanceLogs = asyncWrapper(async (req, res) => {
  await autoPunchOutOverduePunches();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // If reports parameter is requested, return all historical logs
  if (req.query.historical === 'true' || req.query.type === 'reports') {
    const logs = await Attendance.find()
      .populate({
        path: 'employee',
        populate: ['department', 'designation']
      })
      .sort({ date: -1 })
      .limit(200);
    return ApiResponse.success(res, 'Historical attendance logs fetched', logs);
  }

  // DEFAULT: Present Day Only logs for Today's Attendance Table
  const todayPunches = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate({
    path: 'employee',
    populate: ['department', 'designation']
  }).lean();

  return ApiResponse.success(res, "Today's attendance logs fetched", todayPunches);
});

// @desc    Correct attendance punch manually by Admin
// @route   PUT /api/attendance/:empId/correct
const correctPunch = asyncWrapper(async (req, res) => {
  const { empId } = req.params;
  const { checkIn, checkOut, workHours, status } = req.body;
  
  // Find employee by empId
  const employee = await Employee.findOne({ employeeId: empId });
  if (!employee) return ApiResponse.error(res, 'Employee not found', 404);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({ employee: employee._id, date: today });
  
  if (!attendance) {
    attendance = new Attendance({
      employee: employee._id,
      date: today,
    });
  }
  
  if (checkIn && checkIn !== '—') {
    // Parse time like '09:40 AM'
    const timeMatch = checkIn.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      if (timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      const ciDate = new Date(today);
      ciDate.setUTCHours(hours - 5, parseInt(timeMatch[2], 10) - 30, 0, 0);
      attendance.punchIn = ciDate;
      // also update first session if it exists, otherwise create it
      if (!attendance.sessions || attendance.sessions.length === 0) {
        attendance.sessions = [{ punchIn: ciDate }];
      } else {
        attendance.sessions[0].punchIn = ciDate;
      }
    }
  }

  if (checkOut && checkOut !== '—') {
    const timeMatch = checkOut.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      if (timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      const coDate = new Date(today);
      coDate.setUTCHours(hours - 5, parseInt(timeMatch[2], 10) - 30, 0, 0);
      attendance.punchOut = coDate;
      // update first session
      if (!attendance.sessions || attendance.sessions.length === 0) {
        attendance.sessions = [{ punchOut: coDate }];
      } else {
        attendance.sessions[0].punchOut = coDate;
      }
    }
  }

  if (workHours && workHours !== '—') {
    const wh = parseFloat(workHours.replace('h', ''));
    if (!isNaN(wh)) attendance.totalHours = wh;
  } else if (attendance.punchIn && attendance.punchOut) {
    const diffMs = new Date(attendance.punchOut) - new Date(attendance.punchIn);
    attendance.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }

  if (status) attendance.status = status;

  await attendance.save();

  // Real-time socket emit to notify employee dashboard instantly!
  try {
    const { getIO } = require('../sockets/socketHandler');
    const io = getIO();
    if (io) {
      io.to(employee._id.toString()).emit('attendance_updated', {
        attendance,
        employeeId: employee._id
      });
    }
  } catch (e) {}

  return ApiResponse.success(res, 'Attendance corrected successfully', attendance);
});

// @desc    Request Attendance Punch Correction by Employee (with MANDATORY reason)
// @route   POST /api/attendance/request-correction
const requestCorrection = asyncWrapper(async (req, res) => {
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
  if (!employeeId) {
    return ApiResponse.error(res, 'Employee profile not found', 400);
  }

  const { requestedCheckIn, requestedCheckOut, reason, date } = req.body;

  // MANDATORY REASON CHECK (User Requirement!)
  if (!reason || !reason.trim()) {
    return ApiResponse.error(res, 'Reason is mandatory for attendance correction request.', 400);
  }

  if (!requestedCheckIn) {
    return ApiResponse.error(res, 'Requested Check-In time is required.', 400);
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) return ApiResponse.error(res, 'Employee not found', 404);

  const Approval = require('../models/Approval');
  const reqId = `ATT-${Math.floor(10000 + Math.random() * 90000)}`;

  const approvalReq = await Approval.create({
    requestId: reqId,
    employee: employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    employeeTitle: employee.designation?.title || 'Employee',
    avatar: employee.avatar || '',
    requestType: 'Attendance Correction',
    purpose: `Requested Check In: ${requestedCheckIn}${requestedCheckOut ? ' | Check Out: ' + requestedCheckOut : ''} | Reason: ${reason.trim()}`,
    submittedOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    requestedBy: `${employee.firstName} ${employee.lastName}`,
    status: 'Pending'
  });

  // Create Notification for Admin Users & emit real-time socket
  try {
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    const { getIO } = require('../sockets/socketHandler');
    const io = getIO();

    const adminUsers = await User.find({ role: { $in: ['ADMIN', 'HR'] } });
    for (let admin of adminUsers) {
      const recipientIds = [admin._id.toString()];
      if (admin.employeeRef) recipientIds.push(admin.employeeRef.toString());

      for (let rId of recipientIds) {
        const notif = await Notification.create({
          recipient: rId,
          sender: employee._id,
          title: '⏰ Attendance Correction Request',
          message: `${employee.firstName} ${employee.lastName} requested check-in correction (${requestedCheckIn}). Reason: ${reason.trim()}`,
          type: 'APPROVAL',
          read: false
        });

        if (io) {
          io.to(rId).emit('new_notification', notif);
        }
      }
    }

    if (io) {
      io.emit('new_approval_request', approvalReq);
    }
  } catch (e) {
    console.error('Notification creation error:', e);
  }

  return ApiResponse.success(res, 'Attendance correction request submitted to Admin successfully!', approvalReq);
});

// @desc    Update attendance status by Admin
// @route   PUT /api/attendance/:empId/status
const updateStatus = asyncWrapper(async (req, res) => {
  const { empId } = req.params;
  const { status } = req.body;
  
  const employee = await Employee.findOne({ employeeId: empId });
  if (!employee) return ApiResponse.error(res, 'Employee not found', 404);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({ employee: employee._id, date: today });
  
  if (!attendance) {
    attendance = new Attendance({
      employee: employee._id,
      date: today,
    });
  }
  
  attendance.status = status;
  await attendance.save();
  
  return ApiResponse.success(res, `Status updated to ${status}`, attendance);
});

// @desc    Toggle break status by Employee
// @route   PUT /api/attendance/toggle-break
const toggleBreak = asyncWrapper(async (req, res) => {
  const employeeId = req.user.employeeRef?._id || req.user.employeeRef;
  if (!employeeId) return ApiResponse.error(res, 'Employee record not found', 400);

  const { isOnBreak } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({ employee: employeeId, date: today });
  if (!attendance || !attendance.punchIn) {
    return ApiResponse.error(res, 'No punch in record found for today', 400);
  }

  attendance.status = isOnBreak ? 'ON_BREAK' : 'PRESENT';
  await attendance.save();

  return ApiResponse.success(res, `Break status updated to ${attendance.status}`, attendance);
});

module.exports = {
  punchIn,
  punchOut,
  getAttendanceOverview,
  getAttendanceLogs,
  correctPunch,
  updateStatus,
  toggleBreak,
  requestCorrection
};
