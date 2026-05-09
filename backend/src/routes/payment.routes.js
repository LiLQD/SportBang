const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorize('customer'), paymentController.createPayment);
router.patch('/:id/status', authorize('customer'), paymentController.updatePaymentStatus);

module.exports = router;
