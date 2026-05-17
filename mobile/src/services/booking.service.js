import { apiCall } from "./api";

export const bookingService = {
  createBooking: async (bookingData) => {
    return await apiCall("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  getMyBookings: async () => {
    return await apiCall("/bookings/my", {
      method: "GET",
    });
  },

  getBookingById: async (id) => {
    return await apiCall(`/bookings/${id}`, {
      method: "GET",
    });
  },

  cancelBooking: async (id) => {
    return await apiCall(`/bookings/${id}/cancel`, {
      method: "PATCH",
    });
  },

  getAllBookings: async () => {
    return await apiCall("/bookings", {
      method: "GET",
    });
  },

  updateBookingStatus: async (id, status) => {
    return await apiCall(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getBusySlots: async (fieldId, date) => {
    return await apiCall(`/bookings/busy-slots?fieldId=${fieldId}&date=${date}`, {
      method: "GET",
    });
  },
};
