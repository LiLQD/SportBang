const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/block', adminController.blockUser);

router.get('/fields', adminController.getAllFields);
router.get('/bookings', adminController.getAllBookings);

module.exports = router;
