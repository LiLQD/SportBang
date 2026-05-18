const Field = require('../models/Field');
const Booking = require('../models/Booking');

const getDashboard = async (user) => {
  const ownerFields = await Field.find({ owner_id: user._id, isDeleted: false }).select('_id');
  const fieldIds = ownerFields.map(f => f._id);

  const total_fields = fieldIds.length;

  const bookingStats = await Booking.aggregate([
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

  const stats = bookingStats[0] || { total_bookings: 0, total_revenue: 0 };
  const top_field = topFieldAgg[0]
    ? { field_name: topFieldAgg[0].field.field_name, total_bookings: topFieldAgg[0].count }
    : null;

  // Monthly Revenue for Charts
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
    total_fields,
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
