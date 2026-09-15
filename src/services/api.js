// src/services/api.js - HTTP client giao tiếp với Backend
import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:3000/api/v1`;
  }
  return 'http://127.0.0.1:3000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 1. Cảm biến (Sensors)
export const getLatestSensors = async () => {
  const res = await api.get('/sensors/latest');
  return res.data;
};

export const getChartData = async (limit = 20) => {
  const res = await api.get(`/dashboard/chart-data?limit=${limit}`);
  return res.data;
};

export const getSensorData = async (params = {}) => {
  const res = await api.get('/sensors/data', { params });
  return res.data;
};

// 2. Thiết bị (Devices)
export const getDeviceStatuses = async () => {
  const res = await api.get('/devices/status');
  return res.data;
};

export const controlDevice = async (device, action) => {
  const res = await api.post('/devices/control', { device, action });
  return res.data;
};

export const getActionHistory = async (params = {}) => {
  const res = await api.get('/devices/history', { params });
  return res.data;
};

// 3. Hồ sơ người dùng (Profile)
export const getProfile = async () => {
  const res = await api.get('/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/profile', data);
  return res.data;
};

export default api;
