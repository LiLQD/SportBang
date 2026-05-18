const User = require('../models/User');
const Field = require('../models/Field');
const Booking = require('../models/Booking');

const getDashboard = async () => {
  const total_users = await User.countDocuments({ isDeleted: { $ne: true } });
  const total_fields = await Field.countDocuments({ isDeleted: { $ne: true } });

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

  const topFields = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: '$field_id', count: { $sum: 1 }, revenue: { $sum: '$total_price' } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'fields',
        localField: '_id',
        foreignField: '_id',
        as: 'field'
      }
    },
    { $unwind: '$field' },
    {
        $project: {
            field_name: '$field.field_name',
            count: 1,
            revenue: 1
        }
    }
  ]);

  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: { $month: "$booking_date" },
        revenue: { $sum: "$total_price" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  return {
    total_users,
    total_fields,
    total_bookings: stats.total_bookings,
    total_revenue: stats.total_revenue,
    top_fields: topFields,
    monthly_revenue: monthlyRevenue.map(item => ({
      month: item._id,
      revenue: item.revenue
    }))
  };
};

const getAllUsers = async () => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } }).select('-password').sort({ createdAt: -1 });
    return users;
  } catch (error) {
    throw error;
  }
};

const blockUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Cannot block an admin');

  user.status = user.status === 'blocked' ? 'active' : 'blocked';
  return await user.save();
};

const softDeleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Cannot delete an admin');

  if (user.role === 'owner') {
    await Field.deleteMany({ owner_id: userId });
  }

  return await User.findByIdAndDelete(userId);
};

const createUser = async (userData) => {
  const { full_name, email, phone, password, role } = userData;

  // Kiểm tra nếu email đã tồn tại
  const userExists = await User.findOne({ email });
  if (userExists) {
    // Nếu user đã bị xóa mềm trước đây, xóa hẳn để tạo mới
    if (userExists.isDeleted) {
      await User.findByIdAndDelete(userExists._id);
    } else {
      throw new Error('Email này đã được sử dụng bởi một tài khoản đang hoạt động');
    }
  }

  const user = await User.create({
    full_name,
    email,
    phone,
    password,
    role: role || 'customer'
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const getAllFields = async () => {
  return await Field.find({ isDeleted: { $ne: true } })
    .populate('owner_id', 'full_name email phone')
    .sort({ createdAt: -1 });
};

const updateFieldStatus = async (fieldId, status) => {
  const field = await Field.findById(fieldId);
  if (!field) throw new Error('Field not found');

  field.status = status;
  return await field.save();
};

const getAllBookings = async () => {
  return await Booking.find()
    .populate('field_id', 'field_name address')
    .populate('user_id', 'full_name phone email')
    .sort({ createdAt: -1 });
};

module.exports = {
  getDashboard,
  getAllUsers,
  blockUser,
  softDeleteUser,
  createUser,
  getAllFields,
  updateFieldStatus,
  getAllBookings
};
