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

const getMyPayments = async (req, res) => {
  try {
    const payments = await paymentService.getMyPayments(req.user);
    return sendResponse(res, 200, true, 'Payments fetched successfully', payments);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const simulatePaymentPage = async (req, res) => {
  const { id } = req.params;
  const { method } = req.query;

  // Trả về một trang HTML đơn giản để mô phỏng giao diện MoMo/VNPAY
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SportBang Payment Simulator</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6; }
        .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%; }
        .logo { font-size: 2rem; fontWeight: bold; color: #22C55E; margin-bottom: 1rem; }
        .method { font-weight: bold; color: #A50064; text-transform: uppercase; margin-bottom: 1rem; }
        .btn { display: block; width: 100%; padding: 0.75rem; margin-top: 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: bold; }
        .btn-success { background: #22C55E; color: white; }
        .btn-error { background: #EF4444; color: white; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">SportBang</div>
        <p>Mô phỏng thanh toán qua</p>
        <div class="method">${method || 'Cổng thanh toán'}</div>
        <p>Đây là môi trường thử nghiệm. Vui lòng chọn kết quả thanh toán:</p>
        <button class="btn btn-success" onclick="process(true)">THANH TOÁN THÀNH CÔNG</button>
        <button class="btn btn-error" onclick="process(false)">THANH TOÁN THẤT BẠI</button>
      </div>

      <script>
        function process(success) {
          fetch('/api/payments/simulate/' + '${id}' + '/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success })
          })
          .then(res => res.json())
          .then(data => {
            alert(success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!');
            // Gửi message cho React Native WebView nếu cần, hoặc đơn giản là đóng/chuyển hướng
            window.location.href = '/api/payments/simulate/callback?success=' + success;
          });
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
};

const processSimulation = async (req, res) => {
  try {
    const { id } = req.params;
    const { success } = req.body;
    await paymentService.simulatePaymentProcess(id, success);
    return sendResponse(res, 200, true, 'Simulation processed');
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const simulationCallback = (req, res) => {
  const { success } = req.query;
  res.send(`
    <html>
      <body style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <h2 style="color:${success === 'true' ? '#22C55E' : '#EF4444'}">
          ${success === 'true' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
        </h2>
        <p>Bạn có thể đóng cửa sổ này và quay lại ứng dụng.</p>
        <button onclick="window.close()" style="padding:10px 20px;background:#eee;border:none;border-radius:5px;cursor:pointer;">Đóng</button>
      </body>
    </html>
  `);
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getMyPayments,
  simulatePaymentPage,
  processSimulation,
  simulationCallback
};
