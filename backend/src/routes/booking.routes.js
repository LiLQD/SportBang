const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorize('customer'), bookingController.createBooking);
router.get('/busy-slots', bookingController.getBusySlots);
router.get('/my', authorize('customer'), bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById); // Ownership checked in service
router.patch('/:id/cancel', authorize('customer'), bookingController.cancelBooking);
router.patch('/:id/status', authorize('owner', 'admin'), bookingController.updateBookingStatus);

module.exports = router;
