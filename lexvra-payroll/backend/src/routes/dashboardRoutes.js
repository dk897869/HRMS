const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    let totalEmployeesCount = 128;
    try {
      const dbCount = await Employee.countDocuments();
      if (dbCount > 0) totalEmployeesCount = dbCount;
    } catch (e) {}

    res.json({
      success: true,
      stats: {
        totalEmployees: totalEmployeesCount,
        currentlyWorking: 98,
        onBreak: 12,
        timeOffToday: 8,
        pendingApprovals: 56,
        attendanceOverview: {
          present: 76,
          absent: 12,
          late: 7,
          halfDay: 2,
          total: 97,
          presentPct: '78.4%',
          absentPct: '12.4%',
          latePct: '7.2%',
          halfDayPct: '2.0%'
        },
        trendData: [
          { day: '1 Jul', val: 40 },
          { day: '3 Jul', val: 50 },
          { day: '5 Jul', val: 60 },
          { day: '7 Jul', val: 46 },
          { day: '10 Jul', val: 72 },
          { day: '14 Jul', val: 38 },
          { day: '17 Jul', val: 66 },
          { day: '21 Jul', val: 88 },
          { day: '24 Jul', val: 60 },
          { day: '26 Jul', val: 74 },
          { day: '28 Jul', val: 76 },
        ],
        pendingApprovalsList: [
          { label: 'Leave Requests', count: 18, color: '#EC4899', bg: '#FCE7F3' },
          { label: 'Timesheet Approvals', count: 12, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Expense Claims', count: 8, color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Payroll Changes', count: 6, color: '#10B981', bg: '#DCFCE7' },
        ],
        recentActivities: [
          { name: 'John Doe checked in', sub: 'Office • 09:15 AM', tag: 'Attendance', bg: '#DCFCE7', color: '#15803D', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          { name: 'Jane Smith applied for leave', sub: 'Casual Leave • 10:30 AM', tag: 'Leave', bg: '#EFF6FF', color: '#2563EB', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { name: 'Payroll for June 2026 generated', sub: '12:45 PM', tag: 'Payroll', bg: '#F3E8FF', color: '#7E22CE', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
          { name: 'New employee Ravi Kumar joined', sub: '02:30 PM', tag: 'Employee', bg: '#E0F2FE', color: '#0369A1', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        ],
        deptHeadcount: [
          { name: 'Engineering', value: 42, color: '#8B5CF6', pct: '32.8%' },
          { name: 'HR', value: 18, color: '#2563EB', pct: '14.1%' },
          { name: 'Finance', value: 16, color: '#06B6D4', pct: '12.5%' },
          { name: 'Sales', value: 22, color: '#F59E0B', pct: '17.2%' },
          { name: 'Marketing', value: 14, color: '#EC4899', pct: '10.9%' },
          { name: 'Others', value: 16, color: '#94A3B8', pct: '12.5%' },
        ],
        birthdays: [
          { name: 'Rahul Sharma', title: 'UI/UX Designer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          { name: 'Anjali Verma', title: 'HR Executive', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { name: 'Vikram Singh', title: 'Backend Developer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        ],
        upcomingHolidays: [
          { name: 'Independence Day', date: 'Friday, 15 Aug 2026', flag: '🇮🇳', bg: '#FEF3C7', border: '#FCD34D', text: '#78350F' },
          { name: 'Janmashtami', date: 'Friday, 25 Aug 2026', flag: '🪶', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
