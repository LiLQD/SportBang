const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Field = require('../models/Field');

const createPayment = async (user, payload) => {
  const { booking_id, payment_method } = payload;

  if (!booking_id || !payment_method) {
    throw new Error('Missing booking_id or payment_method');
  }

  const booking = await Booking.findById(booking_id);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user_id.toString() !== user._id.toString()) {
    throw new Error('Not authorized to pay for this booking');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    throw new Error(`Cannot pay for a ${booking.status} booking`);
  }

  const existingPayment = await Payment.findOne({ booking_id });
  if (existingPayment) {
    throw new Error('Payment already exists for this booking');
  }

  const payment = await Payment.create({
    booking_id,
    amount: booking.total_price,
    payment_method,
    payment_status: 'pending'
  });

  console.log(`[Payment] Đã khởi tạo giao dịch ${payment._id} (${payment_method}) cho đơn ${booking_id}`);

  // Tạo URL thanh toán giả lập cho MoMo/VNPAY/Banking
  let payment_url = null;
  if (['momo', 'vnpay', 'banking', 'visa'].includes(payment_method)) {
    // Trong thực tế, đây sẽ là gọi API của MoMo/VNPAY để lấy link
    // Ở đây ta tạo link dẫn đến một route giả lập trên server của mình
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    payment_url = `${baseUrl}/api/payments/simulate/${payment._id}?method=${payment_method}`;
  }

  return { ...payment._doc, payment_url };
};

const simulatePaymentProcess = async (paymentId, success) => {
  const status = success ? 'paid' : 'failed';

  // Sử dụng hàm updatePaymentStatus đã có (giả lập admin/hệ thống gọi)
  // Tạo một object user giả lập quyền admin để pass qua check authorized
  const adminUser = { _id: 'system', role: 'admin' };
  return await updatePaymentStatus(adminUser, paymentId, status);
};

const updatePaymentStatus = async (user, paymentId, status) => {
  const payment = await Payment.findById(paymentId).populate({
    path: 'booking_id',
    populate: { path: 'field_id' }
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const booking = payment.booking_id;
  const field = booking?.field_id;

  // Quyền hạn: Admin, Người đặt sân, hoặc Chủ sở hữu sân bóng đó
  const isOwner = field && field.owner_id && field.owner_id.toString() === user._id.toString();
  const isBooker = booking && booking.user_id.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isBooker && !isOwner && !isAdmin) {
    throw new Error('Not authorized to update this payment');
  }

  if (!status) {
    throw new Error('Status is required');
  }

  // Nếu chuyển trạng thái sang paid, lưu thời gian thanh toán
  if (status === 'paid' && payment.payment_status !== 'paid') {
    payment.payment_time = new Date();

    // Nếu thanh toán thành công, tự động chuyển booking sang confirmed nếu đang pending
    if (booking && booking.status === 'pending') {
      booking.status = 'confirmed';
      await booking.save();
    }
  }

  payment.payment_status = status;
  await payment.save();

  // Hoàn tiền/Hủy
  if (status === 'refunded' && booking) {
    booking.status = 'cancelled';
    await booking.save();
  }

  return payment;
};

const getMyPayments = async (user) => {
  let bookingIds = [];

  if (user.role === 'owner') {
    const fields = await Field.find({ owner_id: user._id }).distinct('_id');
    bookingIds = await Booking.find({ field_id: { $in: fields } }).distinct('_id');
  } else if (user.role === 'admin') {
    return await Payment.find({})
      .populate({
        path: 'booking_id',
        populate: { path: 'field_id', select: 'field_name address images' }
      })
      .sort({ createdAt: -1 });
  } else {
    bookingIds = await Booking.find({ user_id: user._id }).distinct('_id');
  }

  return await Payment.find({ booking_id: { $in: bookingIds } })
    .populate({
      path: 'booking_id',
      populate: { path: 'field_id', select: 'field_name address images' }
    })
    .sort({ createdAt: -1 });
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getMyPayments,
  simulatePaymentProcess
};
