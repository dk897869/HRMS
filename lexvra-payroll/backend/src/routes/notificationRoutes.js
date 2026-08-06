const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const Notification = require('../models/Notification');

// Backward compatible generic GET
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query;
    let query = {};
    if (employeeId) query.recipient = employeeId;
    
    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });
    res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// New targeted endpoints
router.post('/send', notificationController.sendNotification);
router.get('/my', notificationController.getMyNotifications);

// Backward compatible POST
router.post('/', async (req, res) => {
  try {
    const newNotif = new Notification(req.body);
    await newNotif.save();
    res.status(201).json({ success: true, data: newNotif });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Mark one as read
router.put('/:id/read', notificationController.markAsRead);

// Clear all notifications
router.delete('/clear-all', notificationController.clearAllNotifications);

// Delete single notification
router.delete('/:id', notificationController.deleteNotification);

// Backward compatible mark-all-read
router.put('/mark-read', async (req, res) => {
  try {
    const { employeeId } = req.query;
    let query = { read: false };
    if (employeeId) query.recipient = employeeId;
    
    await Notification.updateMany(query, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
