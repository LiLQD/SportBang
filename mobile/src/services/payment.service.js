import { apiCall } from "./api";

export const paymentService = {
  getMyPayments: async () => {
    return await apiCall("/payments/my");
  },

  createPayment: async (paymentData) => {
    return await apiCall("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },

  updatePaymentStatus: async (paymentId, status) => {
    return await apiCall(`/payments/${paymentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getPaymentById: async (id) => {
    return await apiCall(`/payments/${id}`);
  },
};
