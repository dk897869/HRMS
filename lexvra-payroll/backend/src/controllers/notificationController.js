const Notification = require('../models/Notification');
const { getIO } = require('../sockets/socketHandler');

// Send a notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, recipient, sender, employeeName } = req.body;
    const notification = new Notification({
      title,
      message,
      type,
      recipient,
      sender,
      employeeName,
    });
    await notification.save();

    // Emit real-time notification
    try {
      const io = getIO();
      if (io) {
        io.to(`user_${recipient}`).emit('new_notification', notification);
      }
    } catch (socketErr) {
      console.error('Socket emission failed:', socketErr.message);
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my notifications (Filtered for last 24 hours by default to auto-expire old ones)
exports.getMyNotifications = async (req, res) => {
  try {
    const { employeeId, all } = req.query;
    let query = {};
    if (employeeId) {
      query.recipient = employeeId;
    }

    // Auto-expire: Only fetch notifications from the last 24 hours (unless 'all=true' requested)
    if (all !== 'true') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: twentyFourHoursAgo };
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear all notifications for user
exports.clearAllNotifications = async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (employeeId) {
      await Notification.deleteMany({ recipient: employeeId });
    }
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
