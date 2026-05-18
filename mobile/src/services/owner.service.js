import { apiCall } from "./api";

export const ownerService = {
  getDashboard: async () => {
    return await apiCall("/owner/dashboard");
  },

  getBookings: async () => {
    return await apiCall("/owner/bookings");
  },

  getFields: async () => {
    return await apiCall("/fields/owner/my-fields");
  },
};
