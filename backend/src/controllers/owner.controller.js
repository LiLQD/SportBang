const ownerService = require('../services/owner.service');
const bookingService = require('../services/booking.service');
const { sendResponse } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await ownerService.getDashboard(req.user);
    return sendResponse(res, 200, true, 'Owner dashboard retrieved successfully', data);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerBookings(req.user);
    return sendResponse(res, 200, true, 'Owner bookings retrieved successfully', bookings);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

module.exports = {
  getDashboard,
  getBookings
};
