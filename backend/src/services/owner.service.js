const Field = require('../models/Field');
const Booking = require('../models/Booking');

const getDashboard = async (user) => {
  const ownerFields = await Field.find({ owner_id: user._id, isDeleted: false });
  const fieldIds = ownerFields.map(f => f._id);
  const active_fields = ownerFields.filter(f => f.status === 'active').length;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  // Today stats
  const todayStats = await Booking.aggregate([
    {
      $match: {
        field_id: { $in: fieldIds },
        booking_date: { $gte: todayDate, $lt: tomorrowDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        revenue: { $sum: '$total_price' }
      }
    }
  ]);

  const pending_bookings = await Booking.countDocuments({
    field_id: { $in: fieldIds },
    status: 'pending'
  });

  const totalStats = await Booking.aggregate([
    { $match: { field_id: { $in: fieldIds }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        total_bookings: { $sum: 1 },
        total_revenue: { $sum: '$total_price' }
      }
    }
  ]);

  const topFieldAgg = await Booking.aggregate([
    { $match: { field_id: { $in: fieldIds }, status: { $ne: 'cancelled' } } },
    { $group: { _id: '$field_id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'fields',
        localField: '_id',
        foreignField: '_id',
        as: 'field'
      }
    },
    { $unwind: { path: '$field', preserveNullAndEmptyArrays: true } }
  ]);

  const stats = totalStats[0] || { total_bookings: 0, total_revenue: 0 };
  const todayRes = todayStats[0] || { count: 0, revenue: 0 };

  const top_field = topFieldAgg[0]
    ? { field_name: topFieldAgg[0].field.field_name, total_bookings: topFieldAgg[0].count }
    : null;

  // Monthly Revenue
  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        field_id: { $in: fieldIds },
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
    active_fields,
    today_bookings: todayRes.count,
    today_revenue: todayRes.revenue,
    pending_bookings,
    total_fields: fieldIds.length,
    total_bookings: stats.total_bookings,
    total_revenue: stats.total_revenue,
    top_field,
    monthly_revenue: monthlyRevenue.map(item => ({
      month: item._id,
      revenue: item.revenue
    }))
  };
};

module.exports = {
  getDashboard
};
