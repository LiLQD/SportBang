const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'system', data = {}) => {
  try {
    return await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      data
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error to avoid breaking the main process
    return null;
  }
};

const getMyNotifications = async (userId) => {
  return await Notification.find({ user_id: userId }).sort({ createdAt: -1 });
};

module.exports = {
  createNotification,
  getMyNotifications
};
