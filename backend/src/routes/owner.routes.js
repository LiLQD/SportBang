const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('owner'));

router.get('/dashboard', ownerController.getDashboard);
router.get('/bookings', ownerController.getBookings);

module.exports = router;
