import { apiCall } from "./api";

export const notificationService = {
  getNotifications: async () => {
    return await apiCall("/notifications", {
      method: "GET",
    });
  },

  markAsRead: async (id) => {
    return await apiCall(`/notifications/${id}/mark-read`, {
      method: "PUT",
    });
  },

  markAllAsRead: async () => {
    return await apiCall("/notifications/mark-all-read", {
      method: "PUT",
    });
  },

  deleteNotification: async (id) => {
    return await apiCall(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};
