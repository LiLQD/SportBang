const Booking = require('../models/Booking');
const Field = require('../models/Field');
const notificationService = require('./notification.service');
const Payment = require('../models/Payment');

const timeToMinutes = (time) => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const createBooking = async (user, payload) => {
  const { field_id, booking_date, booking_slot } = payload;

  if (!field_id || !booking_date || !booking_slot || !booking_slot.start || !booking_slot.end) {
    throw new Error('Missing required booking fields');
  }

  // 1. Validate Field
  const field = await Field.findById(field_id);
  if (!field || field.isDeleted) {
    throw new Error('Field not found');
  }
  if (field.status !== 'active') {
    throw new Error('Field is not available for booking');
  }

  // 2. Validate Slot inside field.available_time
  const reqStart = timeToMinutes(booking_slot.start);
  const reqEnd = timeToMinutes(booking_slot.end);

  if (reqStart >= reqEnd) {
    throw new Error('Invalid booking time range');
  }

  const isValidSlot = field.available_time.some(slot => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    return reqStart >= slotStart && reqEnd <= slotEnd;
  });

  if (!isValidSlot) {
    throw new Error('Requested time is outside available slots');
  }

  // Ensure booking_date is midnight UTC for accurate matching
  const date = new Date(booking_date);
  date.setUTCHours(0, 0, 0, 0);

  // Helper to ensure HH:mm padding for safe string comparison in DB
  const padTime = (time) => {
    if (!time) return time;
    const [h, m] = time.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };

  const formattedStart = padTime(booking_slot.start);
  const formattedEnd = padTime(booking_slot.end);

  // 3. Double booking validation
  // Prevent double booking: same field, same date, overlapping time, not cancelled
  const overlappingBooking = await Booking.findOne({
    field_id,
    booking_date: date,
    status: { $ne: 'cancelled' },
    'booking_slot.start': { $lt: formattedEnd },
    'booking_slot.end': { $gt: formattedStart }
  });

  if (overlappingBooking) {
    const error = new Error('Slot already booked');
    error.statusCode = 409;
    throw error;
  }

  // 4. Calculate total price
  const durationHours = (reqEnd - reqStart) / 60;
  const total_price = durationHours * field.price_per_hour;

  // 5. Create Booking
  const booking = await Booking.create({
    user_id: user._id,
    field_id,
    booking_date: date,
    booking_slot,
    total_price,
    status: 'pending' // Chuyển thành pending để yêu cầu thanh toán/duyệt
  });

  // 6. Create Payment automatically
  const payment = await Payment.create({
    booking_id: booking._id,
    amount: total_price,
    payment_method: payload.payment_method || 'cash',
    payment_status: 'pending'
  });

  // Create notification for user
  await notificationService.createNotification(
    user._id,
    'Đặt sân thành công',
    `Đơn đặt sân của bạn tại ${field.field_name} vào lúc ${booking_slot.start} - ${booking_slot.end} ngày ${new Date(booking_date).toLocaleDateString('vi-VN')} đã được tạo thành công. Vui lòng thanh toán để hoàn tất.`,
    'booking',
    { booking_id: booking._id }
  );

  // Create notification for owner
  await notificationService.createNotification(
    field.owner_id,
    'Có đơn đặt sân mới',
    `Sân ${field.field_name} vừa có đơn đặt mới vào lúc ${booking_slot.start} - ${booking_slot.end} ngày ${new Date(booking_date).toLocaleDateString('vi-VN')}.`,
    'booking',
    { booking_id: booking._id }
  );

  return {
    ...booking.toObject(),
    payment_id: payment._id
  };
};

const getMyBookings = async (user) => {
  return await Booking.find({ user_id: user._id })
    .populate('field_id', 'field_name address map_url images price_per_hour')
    .sort({ booking_date: -1, 'booking_slot.start': -1 });
};

const getBookingById = async (id, user) => {
  const booking = await Booking.findById(id)
    .populate('field_id', 'field_name address owner_id status')
    .populate('user_id', 'full_name email phone');

  if (!booking) {
    throw new Error('Booking not found');
  }

  const isCustomerOwner = booking.user_id._id.toString() === user._id.toString();
  const isFieldOwner = booking.field_id && booking.field_id.owner_id.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isCustomerOwner && !isFieldOwner && !isAdmin) {
    throw new Error('Not authorized to view this booking');
  }

  return booking;
};

const cancelBooking = async (id, user) => {
  const booking = await Booking.findById(id);
  
  if (!booking) {
    throw new Error('Đơn đặt sân không tồn tại.');
  }

  // Kiểm tra quyền sở hữu
  if (booking.user_id.toString() !== user._id.toString()) {
    throw new Error('Bạn không có quyền hủy đơn đặt này.');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Đơn này đã được hủy trước đó.');
  }
  
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    throw new Error(`Không thể hủy đơn đang ở trạng thái: ${booking.status}`);
  }

  // Tính toán thời gian bắt đầu của sân theo UTC
  const [hours, minutes] = booking.booking_slot.start.split(':').map(Number);
  const bookingDateTime = new Date(booking.booking_date);
  // Vì booking_date đã lưu ở 00:00 UTC, ta set giờ bắt đầu cũng theo UTC
  bookingDateTime.setUTCHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = bookingDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  console.log(`[CancelBooking] BookingTime: ${bookingDateTime.toISOString()}, Now: ${now.toISOString()}, DiffHours: ${diffHours}`);

  // Cho phép hủy nếu thời gian hiện tại còn cách giờ bắt đầu ít nhất 24h
  if (diffHours < 24) {
    throw new Error('Bạn chỉ có thể hủy sân trước giờ bắt đầu ít nhất 24 tiếng.');
  }

  booking.status = 'cancelled';
  const savedBooking = await booking.save();

  // Create notification for user
  await notificationService.createNotification(
    user._id,
    'Hủy đơn đặt sân',
    `Bạn đã hủy thành công đơn đặt sân vào ngày ${bookingDateTime.toLocaleDateString('vi-VN')}.`,
    'booking',
    { booking_id: booking._id }
  );

  return savedBooking;
};

const updateBookingStatus = async (id, status, user) => {
  const booking = await Booking.findById(id).populate('field_id');
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check if user is owner of the field
  if (user.role !== 'admin' && booking.field_id.owner_id.toString() !== user._id.toString()) {
    throw new Error('Not authorized to update this booking status');
  }

  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  booking.status = status;
  const savedBooking = await booking.save();

  // Đồng bộ trạng thái thanh toán
  const payment = await Payment.findOne({ booking_id: id });
  if (payment) {
    if (status === 'completed' && payment.payment_status !== 'paid') {
      payment.payment_status = 'paid';
      payment.payment_time = new Date();
      await payment.save();
    } else if (status === 'cancelled') {
      payment.payment_status = 'failed';
      await payment.save();
    }
  }

  // Create notification for customer
  await notificationService.createNotification(
    booking.user_id,
    'Trạng thái đơn đặt sân đã cập nhật',
    `Đơn đặt sân của bạn đã được chuyển sang trạng thái: ${status === 'confirmed' ? 'Đã duyệt' : (status === 'completed' ? 'Hoàn thành' : (status === 'cancelled' ? 'Đã hủy' : status))}`,
    'booking',
    { booking_id: booking._id }
  );

  return savedBooking;
};

const getOwnerBookings = async (user) => {
  const ownerFields = await Field.find({ owner_id: user._id }).select('_id');
  const fieldIds = ownerFields.map(f => f._id);

  return await Booking.find({ field_id: { $in: fieldIds } })
    .populate('field_id', 'field_name address')
    .populate('user_id', 'full_name phone email')
    .sort({ booking_date: -1, 'booking_slot.start': -1 });
};

const getAllBookings = async () => {
  return await Booking.find()
    .populate('field_id', 'field_name address')
    .populate('user_id', 'full_name phone email')
    .sort({ booking_date: -1, 'booking_slot.start': -1 });
};

const getBusySlots = async (fieldId, date) => {
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Lấy các đơn đặt không phải trạng thái 'cancelled'
  const bookings = await Booking.find({
    field_id: fieldId,
    booking_date: targetDate,
    status: { $in: ['pending', 'confirmed', 'completed'] }
  }).select('booking_slot');

  return bookings.map(b => b.booking_slot);
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  getOwnerBookings,
  getAllBookings,
  getBusySlots
};
