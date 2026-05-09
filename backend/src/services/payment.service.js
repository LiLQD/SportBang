const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

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

  return payment;
};

const updatePaymentStatus = async (user, paymentId, status) => {
  const payment = await Payment.findById(paymentId).populate('booking_id');
  if (!payment) {
    throw new Error('Payment not found');
  }

  const booking = payment.booking_id;
  
  if (booking && booking.user_id.toString() !== user._id.toString()) {
    throw new Error('Not authorized to update this payment');
  }

  if (!status) {
    throw new Error('Status is required');
  }

  if (status === 'paid' && payment.payment_status !== 'paid') {
    payment.payment_time = new Date();
  }

  payment.payment_status = status;
  await payment.save();

  if (status === 'refunded' && booking) {
    booking.status = 'cancelled';
    await booking.save();
  }

  return payment;
};

module.exports = {
  createPayment,
  updatePaymentStatus
};
