import api from './api';

const AUTH = '/auth';

const authService = {
  register: (data) => api.post(`${AUTH}/register`, data),
  login: (data) => api.post(`${AUTH}/login`, data),
  logout: () => api.post(`${AUTH}/logout`),
  forgotPassword: (email) => api.post(`${AUTH}/forgot-password`, { email }),
  resetPassword: (token, password) => api.post(`${AUTH}/reset-password`, { token, password }),
  changePassword: (data) => api.put(`${AUTH}/change-password`, data),
  refreshToken: (refreshToken) => api.post(`${AUTH}/refresh`, { refreshToken }),
  getProfile: () => api.get(`${AUTH}/me`),
};

export default authService;
