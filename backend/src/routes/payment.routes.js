const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my', authorize('customer', 'owner', 'admin'), paymentController.getMyPayments);
router.get('/:id', authorize('customer', 'owner', 'admin'), paymentController.getPaymentById);
router.post('/', authorize('customer'), paymentController.createPayment);
router.patch('/:id/status', authorize('customer', 'owner', 'admin'), paymentController.updatePaymentStatus);

// Routes mô phỏng thanh toán (Không yêu cầu protect/authorize cho trang callback/page để dễ test)
router.get('/simulate/callback', paymentController.simulationCallback);
router.get('/simulate/:id', paymentController.simulatePaymentPage);
router.post('/simulate/:id/process', paymentController.processSimulation);

module.exports = router;
