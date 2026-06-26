import axios from "axios";

// Backend URL
const BASE_URL =
  process.env.REACT_APP_API_URL || "https://busms.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===================== AUTH =====================
export const register = (data) =>
  api.post("/api/auth/register", data);

export const login = (data) =>
  api.post("/api/auth/login", data);

// ===================== BUSES =====================
export const getBuses = () =>
  api.get("/api/buses");

export const getBus = (id) =>
  api.get(`/api/buses/${id}`);

export const addBus = (data) =>
  api.post("/api/buses", data);

export const updateBus = (id, data) =>
  api.put(`/api/buses/${id}`, data);

export const deleteBus = (id) =>
  api.delete(`/api/buses/${id}`);

// ===================== ROUTES =====================
export const getRoutes = () =>
  api.get("/api/routes");

export const addRoute = (data) =>
  api.post("/api/routes", data);

export const updateRoute = (id, data) =>
  api.put(`/api/routes/${id}`, data);

export const deleteRoute = (id) =>
  api.delete(`/api/routes/${id}`);

// ===================== SCHEDULES =====================
export const searchSchedules = (params) =>
  api.get("/api/schedules", { params });

export const getSchedules = () =>
  api.get("/api/schedules");

export const getAllSchedules = () =>
  api.get("/api/schedules/admin/all");

export const getSchedule = (id) =>
  api.get(`/api/schedules/${id}`);

export const addSchedule = (data) =>
  api.post("/api/schedules", data);

export const updateSchedule = (id, data) =>
  api.put(`/api/schedules/${id}`, data);

export const deleteSchedule = (id) =>
  api.delete(`/api/schedules/${id}`);

// ===================== BOOKINGS =====================
export const createBooking = (data) =>
  api.post("/api/bookings", data);

export const getMyBookings = () =>
  api.get("/api/bookings/me");

export const getAllBookings = () =>
  api.get("/api/bookings/admin/all");

export const cancelBooking = (id) =>
  api.delete(`/api/bookings/${id}`);

// ===================== PAYMENTS =====================
export const makePayment = (data) =>
  api.post("/api/payments", data);

export const getPaymentHistory = () =>
  api.get("/api/payments/history");

// ===================== ALERTS =====================
export const getAlerts = () =>
  api.get("/api/alerts");

export const markAlertRead = (id) =>
  api.put(`/api/alerts/${id}/read`);

export const markAllRead = () =>
  api.put("/api/alerts/read-all");

// ===================== ADMIN =====================
export const getAdminStats = () =>
  api.get("/api/admin/stats");

export default api;

