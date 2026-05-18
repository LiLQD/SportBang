const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.delete('/users/:id', adminController.deleteUser);

// Field Management
router.get('/fields', adminController.getAllFields);
router.patch('/fields/:id/status', adminController.updateFieldStatus);

// Booking Management
router.get('/bookings', adminController.getAllBookings);

module.exports = router;
