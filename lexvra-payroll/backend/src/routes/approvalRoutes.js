const express = require('express');
const router = express.Router();
const Approval = require('../models/Approval');

// GET /api/approvals
router.get('/', async (req, res) => {
  try {
    const approvals = await Approval.find()
      .populate({
        path: 'employee',
        populate: ['department', 'designation']
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: approvals.length, data: approvals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/approvals
router.post('/', async (req, res) => {
  try {
    const count = await Approval.countDocuments();
    const requestId = `REQ-2026-${1254 + count}`;

    const newApproval = new Approval({
      requestId,
      ...req.body
    });

    await newApproval.save();
    res.status(201).json({ success: true, message: 'Approval Request Submitted', data: newApproval });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/approvals/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, managerRemarks } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval request not found' });

    approval.status = status;
    if (managerRemarks) approval.managerRemarks = managerRemarks;
    await approval.save();

    // If Approved and type is Attendance Correction, apply to Attendance collection!
    if (status === 'Approved' && approval.requestType === 'Attendance Correction' && approval.employee) {
      try {
        const Attendance = require('../models/Attendance');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let att = await Attendance.findOne({ employee: approval.employee, date: today });
        if (!att) {
          att = new Attendance({ employee: approval.employee, date: today });
        }

        const match = approval.purpose?.match(/Requested Check In:\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (match && match[1]) {
          const timeStr = match[1];
          const tMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (tMatch) {
            let hrs = parseInt(tMatch[1], 10);
            if (tMatch[3].toUpperCase() === 'PM' && hrs < 12) hrs += 12;
            if (tMatch[3].toUpperCase() === 'AM' && hrs === 12) hrs = 0;
            const ci = new Date(today);
            ci.setUTCHours(hrs - 5, parseInt(tMatch[2], 10) - 30, 0, 0);
            att.punchIn = ci;
            // update sessions array if applicable
            if (!att.sessions || att.sessions.length === 0) {
              att.sessions = [{ punchIn: ci }];
            } else {
              att.sessions[0].punchIn = ci;
            }
          }
        }
        att.status = 'PRESENT';
        await att.save();

        const { getIO } = require('../sockets/socketHandler');
        const io = getIO();
        if (io) {
          io.to(approval.employee.toString()).emit('attendance_updated', { attendance: att });
        }
      } catch (e) {
        console.error('Error applying attendance correction:', e);
      }
    }

    // Send Notification to Employee for status decision (Approved or Rejected)
    try {
      const Notification = require('../models/Notification');
      const { getIO } = require('../sockets/socketHandler');
      const io = getIO();

      if (approval.employee) {
        const notif = await Notification.create({
          recipient: approval.employee,
          title: `Request ${status}`,
          message: `Your ${approval.requestType} request has been ${status.toLowerCase()} by Admin.`,
          type: 'APPROVAL',
          read: false
        });

        if (io) {
          io.to(approval.employee.toString()).emit('new_notification', notif);
        }
      }
    } catch (e) {
      console.error('Error sending approval notification:', e);
    }

    res.json({ success: true, message: `Request ${status} Successfully`, data: approval });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
