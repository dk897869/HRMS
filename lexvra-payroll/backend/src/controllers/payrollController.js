const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { calculatePayroll } = require('../utils/payrollCalc');
const { generatePayslipPDF } = require('../services/pdfService');
const ApiResponse = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Generate monthly bulk payroll for all active employees
// @route   POST /api/payroll/generate
const generateMonthlyPayroll = asyncWrapper(async (req, res) => {
  const { month, year } = req.body;
  const targetMonth = parseInt(month) || (new Date().getMonth() + 1);
  const targetYear = parseInt(year) || new Date().getFullYear();

  const employees = await Employee.find({ employmentStatus: 'ACTIVE' });
  const results = [];

  for (const emp of employees) {
    const baseSalary = emp.baseSalary || (emp.ctc ? Math.round(emp.ctc / 24) : 30000);
    const calculated = calculatePayroll(baseSalary, {}, {}, 30, 30);

    const payrollObj = await Payroll.findOneAndUpdate(
      { employee: emp._id, month: targetMonth, year: targetYear },
      {
        employee: emp._id,
        month: targetMonth,
        year: targetYear,
        basicSalary: calculated.earnedBasic,
        allowances: calculated.allowances,
        grossSalary: calculated.grossSalary,
        statutoryDeductions: calculated.statutoryDeductions,
        otherDeductions: calculated.otherDeductions,
        totalDeductions: calculated.totalDeductions,
        netSalary: calculated.netSalary,
        status: 'PROCESSING'
      },
      { upsert: true, new: true }
    );
    results.push(payrollObj);
  }

  return ApiResponse.success(res, `Payroll generated successfully for ${results.length} employees`, results);
});

// @desc    Get Payroll List
// @route   GET /api/payroll
const getPayrolls = asyncWrapper(async (req, res) => {
  const { month, year, status, employee } = req.query;
  const query = {};

  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (status) query.status = status;
  if (employee) query.employee = employee;

  // Security: If logged in as Employee, force query to their own employee ID
  if (req.user.role === 'EMPLOYEE' && req.user.employeeRef) {
    query.employee = req.user.employeeRef;
  }

  const payrolls = await Payroll.find(query)
    .populate({
      path: 'employee',
      populate: ['department', 'designation']
    })
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, 'Payrolls retrieved successfully', payrolls);
});

// @desc    Download / Stream Payslip PDF
// @route   GET /api/payroll/:id/payslip
const downloadPayslip = asyncWrapper(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate({
    path: 'employee',
    populate: ['department', 'designation']
  });

  if (!payroll) {
    return ApiResponse.error(res, 'Payroll record not found', 404);
  }

  const pdfBuffer = await generatePayslipPDF(payroll, payroll.employee);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Payslip_${payroll.employee.employeeId}_${payroll.month}_${payroll.year}.pdf`);
  return res.send(pdfBuffer);
});

// @desc    Update Payroll Status (e.g. Mark PAID)
// @route   PUT /api/payroll/:id/status
const updatePayrollStatus = asyncWrapper(async (req, res) => {
  const { status, paymentMode, transactionRef } = req.body;
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    { status, paymentMode, transactionRef, paymentDate: status === 'PAID' ? new Date() : undefined },
    { new: true }
  );

  return ApiResponse.success(res, 'Payroll status updated', payroll);
});

module.exports = {
  generateMonthlyPayroll,
  getPayrolls,
  downloadPayslip,
  updatePayrollStatus
};
