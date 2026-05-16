import { apiCall } from "./api";

export const adminService = {
  getDashboard: async () => {
    return await apiCall("/admin/dashboard", {
      method: "GET",
    });
  },

  getAllBookings: async () => {
    return await apiCall("/admin/bookings", {
      method: "GET",
    });
  },

  getAllFields: async () => {
    return await apiCall("/admin/fields", {
      method: "GET",
    });
  },

  getAllUsers: async () => {
    return await apiCall("/admin/users", {
      method: "GET",
    });
  },
};
