import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Đã cập nhật về cổng 3000

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const ownerService = {
  getDashboard: () => api.get('/owner/dashboard'),
  getBookings: () => api.get('/owner/bookings'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  toggleUserBlock: (id) => api.patch(`/admin/users/${id}/block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllFields: () => api.get('/admin/fields'),
  updateFieldStatus: (id, status) => api.patch(`/admin/fields/${id}/status`, { status }),
  getAllBookings: () => api.get('/admin/bookings'), // Cập nhật đúng route backend
};

export const fieldService = {
  getMyFields: () => api.get('/fields/owner/my-fields'),
  getAllFields: () => api.get('/fields'), // Admin dùng cái này
  getFieldById: (id) => api.get(`/fields/${id}`),
  createField: (data) => api.post('/fields', data),
  updateField: (id, data) => api.put(`/fields/${id}`, data),
  deleteField: (id) => api.delete(`/fields/${id}`),
  // Slot management
  addSlot: (fieldId, data) => api.post(`/fields/${fieldId}/slots`, data),
  updateSlot: (fieldId, slotId, data) => api.put(`/fields/${fieldId}/slots/${slotId}`, data),
  deleteSlot: (fieldId, slotId) => api.delete(`/fields/${fieldId}/slots/${slotId}`),
};

export const bookingService = {
  getOwnerBookings: () => api.get('/owner/bookings'),
  getAllBookings: () => api.get('/admin/bookings'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/mark-read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;
