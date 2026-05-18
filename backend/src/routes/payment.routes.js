const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my', authorize('user', 'owner', 'admin'), paymentController.getMyPayments);
router.post('/', authorize('user'), paymentController.createPayment);
router.patch('/:id/status', authorize('user', 'owner', 'admin'), paymentController.updatePaymentStatus);

// Routes mô phỏng thanh toán (Không yêu cầu protect/authorize cho trang callback/page để dễ test)
router.get('/simulate/callback', paymentController.simulationCallback);
router.get('/simulate/:id', paymentController.simulatePaymentPage);
router.post('/simulate/:id/process', paymentController.processSimulation);

module.exports = router;
