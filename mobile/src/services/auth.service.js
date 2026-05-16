import { apiCall } from "./api";

export const authService = {
  login: async (email, password) => {
    return await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return await apiCall("/auth/profile", {
      method: "GET",
    });
  },

  updateProfile: async (userData) => {
    return await apiCall("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  changePassword: async (passwordData) => {
    return await apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  },

  logout: async () => {
    return await apiCall("/auth/logout", {
      method: "POST",
    });
  },
};
