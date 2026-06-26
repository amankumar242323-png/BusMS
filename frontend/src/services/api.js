import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || "https://busms-backend.onrender.com";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────
export const register = (data)  => api.post('/auth/register', data);
export const login    = (data)  => api.post('/auth/login',    data);

// ── Buses ────────────────────────────────────────────────
export const getBuses   = ()         => api.get('/buses');
export const getBus     = (id)       => api.get(`/buses/${id}`);
export const addBus     = (data)     => api.post('/buses', data);
export const updateBus  = (id, data) => api.put(`/buses/${id}`, data);
export const deleteBus  = (id)       => api.delete(`/buses/${id}`);

// ── Routes ───────────────────────────────────────────────
export const getRoutes   = ()         => api.get('/routes');
export const addRoute    = (data)     => api.post('/routes', data);
export const updateRoute = (id, data) => api.put(`/routes/${id}`, data);
export const deleteRoute = (id)       => api.delete(`/routes/${id}`);

// ── Schedules ────────────────────────────────────────────
export const searchSchedules = (params) => api.get('/schedules', { params });
export const getSchedules    = ()       => api.get('/schedules');
export const getAllSchedules = ()      => api.get('/schedules/admin/all');
export const getSchedule     = (id)     => api.get(`/schedules/${id}`);
export const addSchedule     = (data)   => api.post('/schedules', data);
export const updateSchedule  = (id, d)  => api.put(`/schedules/${id}`, d);
export const deleteSchedule  = (id)     => api.delete(`/schedules/${id}`);

// ── Bookings ─────────────────────────────────────────────
export const createBooking  = (data) => api.post('/bookings', data);
export const getMyBookings  = ()     => api.get('/bookings/me');
export const getAllBookings  = ()     => api.get('/bookings/admin/all');
export const cancelBooking  = (id)   => api.delete(`/bookings/${id}`);

// ── Payments ─────────────────────────────────────────────
export const makePayment    = (data) => api.post('/payments', data);
export const getPaymentHistory = ()  => api.get('/payments/history');

// ── Alerts ───────────────────────────────────────────────
export const getAlerts      = ()   => api.get('/alerts');
export const markAlertRead  = (id) => api.put(`/alerts/${id}/read`);
export const markAllRead    = ()   => api.put('/alerts/read-all');

// ── Admin ────────────────────────────────────────────────
export const getAdminStats  = ()   => api.get('/admin/stats');

export default api;
