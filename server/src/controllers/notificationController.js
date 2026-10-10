const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const devStore = require('../services/devStore');

/**
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const notifs = devStore.getNotifications(req.user.userId);
      const unreadCount = notifs.filter((n) => !n.isRead).length;
      return res.status(200).json({ success: true, data: notifs, unreadCount });
    }

    const notifications = await Notification.find({ recipientId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const notif = devStore.markNotificationRead(req.params.id, req.user.userId);
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
      return res.status(200).json({ success: true, data: notif });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      devStore.markAllNotificationsRead(req.user.userId);
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    await Notification.updateMany(
      { recipientId: req.user.userId, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
