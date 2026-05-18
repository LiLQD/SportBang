const bookingService = require('../services/booking.service');
const { sendResponse } = require('../utils/response');

const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.user, req.body);
    return sendResponse(res, 201, true, 'Booking created successfully', booking);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return sendResponse(res, statusCode, false, error.message);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user);
    return sendResponse(res, 200, true, 'Bookings retrieved successfully', bookings);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    return sendResponse(res, 200, true, 'Booking retrieved successfully', booking);
  } catch (error) {
    const statusCode = error.message.includes('Not authorized') ? 403 : 404;
    return sendResponse(res, statusCode, false, error.message);
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);
    return sendResponse(res, 200, true, 'Booking cancelled successfully', booking);
  } catch (error) {
    const statusCode = error.message.includes('Not authorized') ? 403 : 400;
    return sendResponse(res, statusCode, false, error.message);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(req.params.id, status, req.user);
    return sendResponse(res, 200, true, 'Booking status updated successfully', booking);
  } catch (error) {
    const statusCode = error.message.includes('Not authorized') ? 403 : 400;
    return sendResponse(res, statusCode, false, error.message);
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerBookings(req.user);
    return sendResponse(res, 200, true, 'Owner bookings retrieved successfully', bookings);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    return sendResponse(res, 200, true, 'All bookings retrieved successfully', bookings);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getBusySlots = async (req, res) => {
  try {
    const { fieldId, date } = req.query;
    if (!fieldId || !date) {
      return sendResponse(res, 400, false, 'Field ID and Date are required');
    }
    const busySlots = await bookingService.getBusySlots(fieldId, date);
    return sendResponse(res, 200, true, 'Busy slots retrieved successfully', busySlots);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
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
