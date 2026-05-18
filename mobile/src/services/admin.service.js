import { apiCall } from "./api";

export const adminService = {
  getDashboard: async () => {
    return await apiCall("/admin/dashboard");
  },

  getAllBookings: async () => {
    return await apiCall("/admin/bookings");
  },

  getAllFields: async () => {
    return await apiCall("/admin/fields");
  },

  updateFieldStatus: async (id, status) => {
    return await apiCall(`/admin/fields/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  getAllUsers: async () => {
    return await apiCall("/admin/users");
  },

  blockUser: async (id) => {
    return await apiCall(`/admin/users/${id}/block`, {
      method: "PATCH",
    });
  },

  deleteUser: async (id) => {
    return await apiCall(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  createUser: async (userData) => {
    return await apiCall("/admin/users", {
      method: "POST",
      body: userData,
    });
  },
};
