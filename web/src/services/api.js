import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Update with your backend URL

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
};

export const fieldService = {
  getMyFields: () => api.get('/field/owner/my-fields'),
  createField: (data) => api.post('/field', data),
  updateField: (id, data) => api.put(`/field/${id}`, data),
  deleteField: (id) => api.delete(`/field/${id}`),
};

export const bookingService = {
  getOwnerBookings: () => api.get('/booking/owner'),
  getAllBookings: () => api.get('/booking/admin/all'),
  updateStatus: (id, status) => api.patch(`/booking/${id}/status`, { status }),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/mark-read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;
