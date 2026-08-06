const xlsx = require('xlsx');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc Export Employees to Excel
// @route GET /api/reports/employees/excel
const exportEmployeesExcel = asyncWrapper(async (req, res) => {
  const employees = await Employee.find().populate('department designation branch');

  const data = employees.map(e => ({
    'Employee ID': e.employeeId,
    'Full Name': `${e.firstName} ${e.lastName}`,
    'Email': e.email,
    'Phone': e.phone,
    'Department': e.department?.name || 'N/A',
    'Designation': e.designation?.title || 'N/A',
    'Branch': e.branch?.name || 'N/A',
    'Status': e.employmentStatus,
    'Joining Date': new Date(e.joiningDate).toLocaleDateString(),
    'CTC (INR)': e.ctc
  }));

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Employees');

  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=LEXVRA_Employees_Report.xlsx');
  return res.send(buffer);
});

// @desc Export Attendance to Excel
// @route GET /api/reports/attendance/excel
const exportAttendanceExcel = asyncWrapper(async (req, res) => {
  const attendanceLogs = await Attendance.find().populate('employee', 'firstName lastName employeeId');

  const data = attendanceLogs.map(a => ({
    'Employee ID': a.employee?.employeeId || 'N/A',
    'Name': `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`,
    'Date': new Date(a.date).toLocaleDateString(),
    'Punch In': a.punchIn ? new Date(a.punchIn).toLocaleTimeString() : 'N/A',
    'Punch Out': a.punchOut ? new Date(a.punchOut).toLocaleTimeString() : 'N/A',
    'Total Hours': a.totalHours,
    'Status': a.status
  }));

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=LEXVRA_Attendance_Report.xlsx');
  return res.send(buffer);
});

module.exports = { exportEmployeesExcel, exportAttendanceExcel };
