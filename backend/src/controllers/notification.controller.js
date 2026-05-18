const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_read: true },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    return sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { is_read: true }
    );

    return sendResponse(res, 200, true, 'All notifications marked as read');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    return sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
