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

  let payment = await Payment.findOne({ booking_id });

  if (payment) {
    if (payment.payment_status === 'paid') {
      throw new Error('Đơn hàng này đã được thanh toán trước đó.');
    }
    // Cập nhật phương thức thanh toán mới
    payment.payment_method = payment_method;
    await payment.save();
  } else {
    payment = await Payment.create({
      booking_id,
      amount: booking.total_price,
      payment_method,
      payment_status: 'pending'
    });
  }

  console.log(`[Payment] Khởi tạo thanh toán: ${payment._id} (${payment_method})`);

  // Tạo URL thanh toán giả lập
  let payment_url = null;
  const methodsWithUrl = ['momo', 'vnpay', 'banking', 'visa'];

  if (methodsWithUrl.includes(payment_method.toLowerCase())) {
    // Sử dụng IP host của Android Emulator nếu đang chạy local
    const baseUrl = process.env.BASE_URL || `http://10.0.2.2:3000`;
    payment_url = `${baseUrl}/api/payments/simulate/${payment._id}?method=${payment_method}`;
  }

  return { ...payment.toObject(), payment_url };
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

const getPaymentById = async (paymentId, user) => {
  try {
    const payment = await Payment.findById(paymentId).populate({
      path: 'booking_id',
      populate: { path: 'field_id', select: 'field_name address images owner_id' }
    });

    if (!payment) {
      throw new Error('Không tìm thấy thông tin thanh toán.');
    }

    const booking = payment.booking_id;
    if (!booking) {
      throw new Error('Không tìm thấy thông tin đơn đặt sân liên quan.');
    }

    const isAdmin = user.role === 'admin';
    const isBooker = booking.user_id && booking.user_id.toString() === user._id.toString();
    const isOwner = booking.field_id && booking.field_id.owner_id && booking.field_id.owner_id.toString() === user._id.toString();

    if (!isAdmin && !isBooker && !isOwner) {
      throw new Error('Bạn không có quyền xem thông tin thanh toán này.');
    }

    return payment;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getMyPayments,
  simulatePaymentProcess,
  getPaymentById
};
