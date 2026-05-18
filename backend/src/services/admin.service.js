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
    // Chỉ lấy những người dùng chưa bị xóa
    const users = await User.find({ isDeleted: { $ne: true } }).select('-password').sort({ createdAt: -1 });
    console.log(`[ADMIN SERVICE] Found ${users.length} active users`);
    return users;
  } catch (error) {
    console.error("[ADMIN SERVICE] Error fetching users:", error);
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
  if (!user) throw new Error('Không tìm thấy người dùng');
  if (user.role === 'admin') throw new Error('Không thể xóa tài khoản Quản trị viên');

  // Nếu là Owner, cần xử lý các sân bóng trước khi xóa người dùng
  if (user.role === 'owner') {
    // Cách 1: Xóa hẳn các sân bóng của owner này
    await Field.deleteMany({ owner_id: userId });
    // Cách 2: (An toàn hơn) Đánh dấu sân là đã xóa thay vì xóa cứng sân
    // await Field.updateMany({ owner_id: userId }, { $set: { isDeleted: true } });
  }

  // Xóa hẳn người dùng khỏi MongoDB
  return await User.findByIdAndDelete(userId);
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
  getAllFields,
  updateFieldStatus,
  getAllBookings
};
