const paymentService = require('../services/payment.service');
const { sendResponse } = require('../utils/response');

const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.user, req.body);
    return sendResponse(res, 201, true, 'Payment created successfully', payment);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const payment = await paymentService.updatePaymentStatus(req.user, req.params.id, req.body.status);
    return sendResponse(res, 200, true, 'Payment status updated successfully', payment);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

module.exports = {
  createPayment,
  updatePaymentStatus
};
