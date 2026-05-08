const Booking = require('../models/Booking');
const Field = require('../models/Field');

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

  // 3. Double booking validation
  // Prevent double booking: same field, same date, overlapping time, not cancelled
  const overlappingBooking = await Booking.findOne({
    field_id,
    booking_date: date,
    status: { $ne: 'cancelled' },
    'booking_slot.start': { $lt: booking_slot.end },
    'booking_slot.end': { $gt: booking_slot.start }
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
    status: 'confirmed'
  });

  return booking;
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
    throw new Error('Booking not found');
  }

  if (booking.user_id.toString() !== user._id.toString()) {
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    throw new Error(`Cannot cancel booking in ${booking.status} status`);
  }

  // Calculate 24h difference
  // Combine booking_date and booking_slot.start
  const [hours, minutes] = booking.booking_slot.start.split(':').map(Number);
  const bookingDateTime = new Date(booking.booking_date);
  bookingDateTime.setUTCHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

  if (diffHours < 24) {
    throw new Error('Can only cancel booking at least 1 day in advance');
  }

  booking.status = 'cancelled';
  return await booking.save();
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

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  getAllBookings
};
