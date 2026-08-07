const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Branch = require('../models/Branch');
const Attendance = require('../models/Attendance');
const LeaveType = require('../models/LeaveType');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Claim = require('../models/Claim');
const Setting = require('../models/Setting');
const Company = require('../models/Company');
const Invoice = require('../models/Invoice');
const { calculatePayroll } = require('../utils/payrollCalc');

const seedData = async () => {
  try {
    console.log('[Seeding]: Checking database initial data...');

    // 1. Roles & Dynamic Permissions
    const rolesDef = [
      { name: 'SUPER_ADMIN', displayName: 'Super Administrator', description: 'Full Unrestricted System Access' },
      { name: 'ADMIN', displayName: 'Administrator', description: 'Complete HRMS Admin Access' },
      { name: 'HR_HEAD', displayName: 'HR Head', description: 'Head of Human Resources' },
      { name: 'HR', displayName: 'HR Executive', description: 'HR Operations & Recruitment' },
      { name: 'PAYROLL_HEAD', displayName: 'Payroll Head', description: 'Payroll & Salary Management' },
      { name: 'FINANCE', displayName: 'Finance Manager', description: 'Finance & Claims Approval' },
      { name: 'RECRUITER', displayName: 'Talent Acquisition', description: 'Candidate Sourcing & Interviews' },
      { name: 'MANAGER', displayName: 'Line Manager', description: 'Team Management & Approvals' },
      { name: 'EMPLOYEE', displayName: 'Employee', description: 'Employee Self-Service' }
    ];

    const rolesMap = {};
    for (const r of rolesDef) {
      let roleDoc = await Role.findOne({ name: r.name });
      if (!roleDoc) {
        roleDoc = await Role.create({
          ...r,
          isSystemDefault: true,
          permissions: {
            dashboard: { read: true },
            organization: { read: true, create: true, update: true, delete: true },
            employees: { read: true, create: true, update: true, delete: true, export: true },
            attendance: { read: true, create: true, update: true, delete: true, approve: true, export: true },
            leaves: { read: true, create: true, update: true, delete: true, approve: true },
            payroll: { read: true, create: true, update: true, delete: true, approve: true, export: true },
            recruitment: { read: true, create: true, update: true, delete: true },
            performance: { read: true, create: true, update: true, delete: true },
            claims: { read: true, create: true, update: true, delete: true, approve: true },
            assets: { read: true, create: true, update: true, delete: true },
            documents: { read: true, create: true, update: true, delete: true },
            settings: { read: true, update: true },
            roles: { read: true, create: true, update: true, delete: true }
          }
        });
      }
      rolesMap[r.name] = roleDoc;
    }

    // 2. Head Office Branch
    let branch = await Branch.findOne({ code: 'HO-MHL' });
    if (!branch) {
      branch = await Branch.create({
        name: 'LEXVRA Mohali Head Office',
        code: 'HO-MHL',
        address: 'E-229, Industrial Area, Phase 8-B',
        city: 'Mohali',
        state: 'Punjab',
        pincode: '160055',
        isHeadOffice: true
      });
    }

    // 3. Departments
    const deptsList = [
      { name: 'Payroll', code: 'PAY' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'Engineering', code: 'ENG' },
      { name: 'Finance', code: 'FIN' },
      { name: 'Business Development', code: 'BD' }
    ];
    const deptMap = {};
    for (const d of deptsList) {
      let dept = await Department.findOne({ code: d.code });
      if (!dept) {
        dept = await Department.create(d);
      }
      deptMap[d.code] = dept;
    }

    // 4. Designations
    const desgsList = [
      { title: 'BDE', deptCode: 'BD' },
      { title: 'HR Executive', deptCode: 'HR' },
      { title: 'Software Engineer', deptCode: 'ENG' },
      { title: 'Finance Executive', deptCode: 'FIN' },
      { title: 'Payroll Specialist', deptCode: 'PAY' }
    ];
    const desgMap = {};
    for (const desg of desgsList) {
      let desgDoc = await Designation.findOne({ title: desg.title });
      if (!desgDoc) {
        desgDoc = await Designation.create({
          title: desg.title,
          department: deptMap[desg.deptCode]._id
        });
      }
      desgMap[desg.title] = desgDoc;
    }

    // 5. Leave Types
    const leaveTypesData = [
      { name: 'Casual Leave', code: 'CL', daysPerYear: 12 },
      { name: 'Sick Leave', code: 'SL', daysPerYear: 10 },
      { name: 'Earned Leave', code: 'EL', daysPerYear: 15 }
    ];
    const leaveTypeDocs = {};
    for (const lt of leaveTypesData) {
      let typeDoc = await LeaveType.findOne({ code: lt.code });
      if (!typeDoc) {
        typeDoc = await LeaveType.create(lt);
      }
      leaveTypeDocs[lt.code] = typeDoc;
    }

    // 6. Admin User & Admin Employee
    let adminUser = await User.findOne({ email: 'admin@lexvra.com' });
    let adminEmp = await Employee.findOne({ $or: [{ employeeId: 'EMP001' }, { email: 'admin@lexvra.com' }] });

    if (!adminEmp) {
      adminEmp = await Employee.create({
        employeeId: 'EMP001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@lexvra.com',
        phone: '+91 9876543210',
        joiningDate: new Date('2024-01-01'),
        department: deptMap['HR']?._id,
        designation: desgMap['HR Executive']?._id,
        branch: branch._id,
        ctc: 1200000,
        baseSalary: 60000
      });
    }

    if (!adminUser) {
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@lexvra.com',
        password: 'Admin@123',
        role: 'ADMIN',
        roleRef: rolesMap['ADMIN']?._id,
        employeeRef: adminEmp._id,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
      });
      await adminUser.save();
    } else {
      adminUser.password = 'Admin@123';
      adminUser.role = 'ADMIN';
      await adminUser.save();
    }

    adminEmp.user = adminUser._id;
    await adminEmp.save();

    // 6.5 Super Admin User
    let superAdmin = await User.findOne({ email: 'superadmin@payflexpayroll.com' });
    if (!superAdmin) {
      superAdmin = new User({
        name: 'Super Admin',
        email: 'superadmin@payflexpayroll.com',
        password: 'SuperAdmin@123',
        role: 'SUPER_ADMIN',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256'
      });
      await superAdmin.save();
    } else {
      superAdmin.password = 'SuperAdmin@123';
      await superAdmin.save();
    }

    // 6.6 Default Company (for existing data migration compatibility)
    let defaultCompany = await Company.findOne({ email: 'admin@lexvra.com' });
    if (!defaultCompany) {
      defaultCompany = await Company.create({
        companyName: 'LEXVRA INFINOLOGY PRIVATE LIMITED',
        email: 'admin@lexvra.com',
        ownerId: adminUser._id,
        subscriptionStatus: 'Trial',
        employeeLimit: 20,
        employeesUsed: 10
      });
    }
    
    // Assign companyId to admin
    if (!adminUser.companyId) {
      adminUser.companyId = defaultCompany._id;
      await adminUser.save();
    }

    // 6.7 Seed Mock SaaS Companies for Super Admin Dashboard
    const mockCompanies = [
      { name: 'TechNova Solutions', email: 'hello@technova.com', status: 'Active', empUsed: 42, limit: 50, revenue: 4999 },
      { name: 'Global Logistics Corp', email: 'admin@globallog.com', status: 'Expired', empUsed: 20, limit: 20, revenue: 399 },
      { name: 'FinTrust Bank', email: 'hr@fintrust.com', status: 'Active', empUsed: 110, limit: 120, revenue: 7999 },
      { name: 'Creative Minds Agency', email: 'jobs@creativeminds.com', status: 'Trial', empUsed: 5, limit: 20, revenue: 0 },
      { name: 'Nexus Health', email: 'info@nexushealth.com', status: 'Active', empUsed: 48, limit: 50, revenue: 4999 }
    ];

    for (const mc of mockCompanies) {
      let comp = await Company.findOne({ email: mc.email });
      if (!comp) {
        comp = await Company.create({
          companyName: mc.name,
          email: mc.email,
          subscriptionStatus: mc.status,
          employeeLimit: mc.limit,
          employeesUsed: mc.empUsed,
          currentVersion: '1.2.0',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // Random join date in last 90 days
        });

        // Add dummy invoice for revenue
        if (mc.revenue > 0) {
          await Invoice.create({
            companyId: comp._id,
            invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
            amount: mc.revenue,
            totalAmount: mc.revenue,
            status: 'Paid',
            paidDate: new Date()
          });
        }
      }
    }

    // 7. Seed Sample Employees (matching exact screenshot entries)
    const sampleEmployees = [
      { id: 'EMP003', fn: 'Narayan Singh', ln: 'Rajput', email: 'narayan.rajput@lexvra.com', dept: 'PAY', desg: 'BDE', phone: '9876500003' },
      { id: 'EMP004', fn: 'Nidhi', ln: 'Verma', email: 'nidhi@lexvra.com', dept: 'PAY', desg: 'BDE', phone: '9876500004' },
      { id: 'EMP005', fn: 'Kuldeep K.', ln: 'Jha', email: 'kuldeep.jha@lexvra.com', dept: 'PAY', desg: 'BDE', phone: '9876500005' },
      { id: 'EMP006', fn: 'Manav', ln: 'Soni', email: 'manav.soni@lexvra.com', dept: 'PAY', desg: 'BDE', phone: '9876500006' },
      { id: 'EMP007', fn: 'Rohit', ln: 'Sharma', email: 'rohit.sharma@lexvra.com', dept: 'PAY', desg: 'BDE', phone: '9876500007' },
      { id: 'EMP008', fn: 'Priya', ln: 'Kapoor', email: 'priya.kapoor@lexvra.com', dept: 'HR', desg: 'HR Executive', phone: '9876500008' },
      { id: 'EMP009', fn: 'Amit', ln: 'Singh', email: 'amit.singh@lexvra.com', dept: 'FIN', desg: 'Finance Executive', phone: '9876500009' }
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const se of sampleEmployees) {
      let emp = await Employee.findOne({ employeeId: se.id });
      if (!emp) {
        emp = await Employee.create({
          employeeId: se.id,
          firstName: se.fn,
          lastName: se.ln,
          email: se.email,
          phone: se.phone,
          joiningDate: new Date('2024-06-01'),
          department: deptMap[se.dept]._id,
          designation: desgMap[se.desg]._id,
          branch: branch._id,
          ctc: 480000,
          baseSalary: 25000,
          bankName: 'HDFC Bank',
          accountNumber: '50100492819234',
          panNumber: 'ABCDE1234F'
        });

        const userObj = await User.create({
          name: `${se.fn} ${se.ln}`,
          email: se.email,
          password: 'Password@123',
          role: 'EMPLOYEE',
          roleRef: rolesMap['EMPLOYEE']._id,
          employeeRef: emp._id,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=256`
        });

        emp.user = userObj._id;
        await emp.save();
      }

      // Assign companyId to existing employees
      if (!emp.companyId) {
        emp.companyId = defaultCompany._id;
        await emp.save();
      }

      // Seed attendance punches for today
      let att = await Attendance.findOne({ employee: emp._id, date: today });
      if (!att) {
        const isPresent = se.id === 'EMP008' || se.id === 'EMP009';
        await Attendance.create({
          employee: emp._id,
          date: today,
          punchIn: isPresent ? new Date(Date.now() - 4 * 60 * 60 * 1000) : null,
          punchOut: isPresent ? new Date(Date.now() - 1 * 60 * 60 * 1000) : null,
          status: isPresent ? 'PRESENT' : 'ABSENT',
          totalHours: isPresent ? 3 : 0
        });
      }

      // Seed payroll sample
      let pr = await Payroll.findOne({ employee: emp._id, month: today.getMonth() + 1, year: today.getFullYear() });
      if (!pr) {
        const calc = calculatePayroll(25000, {}, {}, 30, 30);
        await Payroll.create({
          employee: emp._id,
          month: today.getMonth() + 1,
          year: today.getFullYear(),
          basicSalary: calc.earnedBasic,
          allowances: calc.allowances,
          grossSalary: calc.grossSalary,
          statutoryDeductions: calc.statutoryDeductions,
          otherDeductions: calc.otherDeductions,
          totalDeductions: calc.totalDeductions,
          netSalary: calc.netSalary,
          status: 'PROCESSING'
        });
      }
    }

    // 8. Default System Settings
    let settings = await Setting.findOne();
    if (!settings) {
      await Setting.create({
        companyName: 'LEXVRA INFINOLOGY PRIVATE LIMITED',
        tagline: 'Innovate. Integrate. Elevate.',
        companyEmail: 'contact@lexvra.com',
        address: 'E-229, Industrial Area, Phase 8-B, Mohali, Punjab 160055, India'
      });
    }

    console.log('[Seeding]: Complete!');
    console.log('-> Super Admin Login: superadmin@payflexpayroll.com | Pass: SuperAdmin@123');
    console.log('-> Company Admin Login: admin@lexvra.com | Pass: Admin@123');
  } catch (err) {
    console.error('[Seeding Error]:', err);
  }
};

module.exports = seedData;
