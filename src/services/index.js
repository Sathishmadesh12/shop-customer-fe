import api from '../config/axios.config';

export const authService = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/me', d),
  changePassword: (d) => api.put('/auth/change-password', d),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  resetPassword: (d) => api.post('/auth/reset-password', d),
};

export const shopService = {
  getAll: (p) => api.get('/shops', { params: p }),
  getById: (id) => api.get(`/shops/${id}`),
};

export const itemService = {
  getAll: (p) => api.get('/items', { params: p }),
  getById: (id) => api.get(`/items/${id}`),
};

export const categoryService = {
  getAll: (p) => api.get('/categories', { params: p }),
};

export const cartService = {
  get: () => api.get('/cart'),
  addItem: (d) => api.post('/cart/add', d),
  updateItem: (id, d) => api.put(`/cart/item/${id}`, d),
  removeItem: (id) => api.delete(`/cart/item/${id}`),
  applyCoupon: (d) => api.post('/cart/coupon', d),
  removeCoupon: () => api.delete('/cart/coupon'),
  toggleWallet: (d) => api.post('/cart/wallet', d),
  clear: () => api.delete('/cart/clear'),
};

export const orderService = {
  create: (d) => api.post('/orders', d),
  getAll: (p) => api.get('/orders', { params: p }),
  getById: (id) => api.get(`/orders/${id}`),
};

export const walletService = {
  get: () => api.get('/wallet'),
  getHistory: (p) => api.get('/wallet/history', { params: p }),
};

export const notificationService = {
  getAll: (p) => api.get('/notifications', { params: p }),
  getUnread: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

export const analyticsService = {
  getSummary: () => api.get('/analytics/customer/summary'),
};
