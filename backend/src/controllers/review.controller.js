const Review = require('../models/Review');
const Field = require('../models/Field');
const Booking = require('../models/Booking');
const { sendResponse } = require('../utils/response');

const createReview = async (req, res) => {
  try {
    const { field_id, booking_id, rating, comment } = req.body;

    // Kiểm tra booking có tồn tại và thuộc về user không
    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user._id });
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found or not authorized');
    }

    // Kiểm tra booking đã hoàn thành chưa (chỉ cho phép review khi đã đá xong)
    if (booking.status !== 'completed') {
      return sendResponse(res, 400, false, 'You can only review completed bookings');
    }

    // Kiểm tra xem đã review chưa
    const existingReview = await Review.findOne({ booking_id });
    if (existingReview) {
      return sendResponse(res, 400, false, 'You have already reviewed this booking');
    }

    const review = await Review.create({
      user_id: req.user._id,
      field_id,
      booking_id,
      rating,
      comment
    });

    // Cập nhật users_rate cho Field
    const reviews = await Review.find({ field_id });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Field.findByIdAndUpdate(field_id, { users_rate: avgRating });

    return sendResponse(res, 201, true, 'Review created successfully', review);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

const getFieldReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ field_id: req.params.fieldId })
      .populate('user_id', 'full_name')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Reviews retrieved successfully', reviews);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user_id: req.user._id });

    if (!review) {
      return sendResponse(res, 404, false, 'Review not found');
    }

    await review.deleteOne();

    // Cập nhật lại rating trung bình cho sân
    const reviews = await Review.find({ field_id: review.field_id });
    let avgRating = 0;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    }

    await Field.findByIdAndUpdate(review.field_id, { users_rate: avgRating });

    return sendResponse(res, 200, true, 'Review deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = {
  createReview,
  getFieldReviews,
  deleteReview
};
