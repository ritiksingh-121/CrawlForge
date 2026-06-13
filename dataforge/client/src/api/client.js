import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/forgot-password');

      if (!isAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const projects = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getData: (id, params) => api.get(`/projects/${id}/data`, { params }),
  export: (id, format) => api.get(`/projects/${id}/export`, { params: { format }, responseType: 'blob' }),
};

export const scraping = {
  start: (projectId) => api.post(`/scraping/projects/${projectId}/start`),
  getJobs: (params) => api.get('/scraping/jobs', { params }),
  getJob: (jobId) => api.get(`/scraping/jobs/${jobId}`),
  retryJob: (jobId) => api.post(`/scraping/jobs/${jobId}/retry`),
  cancelJob: (jobId) => api.post(`/scraping/jobs/${jobId}/cancel`),
};

export const analytics = {
  dashboard: () => api.get('/analytics/dashboard'),
  project: (id) => api.get(`/analytics/projects/${id}`),
};

export const payments = {
  createOrder: (planId) => api.post('/payments/create-order', { planId }),
  verify: (data) => api.post('/payments/verify', data),
  getSubscriptions: () => api.get('/payments/subscriptions'),
  getCurrent: () => api.get('/payments/current'),
  cancel: () => api.post('/payments/cancel'),
};

export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  getRevenue: () => api.get('/admin/revenue'),
};

export default api;
