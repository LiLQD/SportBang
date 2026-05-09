const User = require('../models/User');
const Field = require('../models/Field');
const Booking = require('../models/Booking');

const getDashboard = async () => {
  const total_users = await User.countDocuments({ status: 'active' });
  const total_fields = await Field.countDocuments({ isDeleted: false });

  const bookingStats = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        total_bookings: { $sum: 1 },
        total_revenue: { $sum: '$total_price' }
      }
    }
  ]);

  const stats = bookingStats[0] || { total_bookings: 0, total_revenue: 0 };

  return {
    total_users,
    total_fields,
    total_bookings: stats.total_bookings,
    total_revenue: stats.total_revenue
  };
};

const getAllUsers = async () => {
  return await User.find().select('-password').sort({ createdAt: -1 });
};

const blockUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    throw new Error('Cannot block an admin');
  }

  user.status = user.status === 'blocked' ? 'active' : 'blocked';
  return await user.save();
};

const getAllFields = async () => {
  return await Field.find({ isDeleted: false })
    .populate('owner_id', 'full_name email phone')
    .sort({ createdAt: -1 });
};

const getAllBookings = async () => {
  return await Booking.find()
    .populate('field_id', 'field_name address')
    .populate('user_id', 'full_name phone email')
    .sort({ booking_date: -1 });
};

module.exports = {
  getDashboard,
  getAllUsers,
  blockUser,
  getAllFields,
  getAllBookings
};
