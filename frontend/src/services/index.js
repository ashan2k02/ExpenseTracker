import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },
};

export const expenseService = {
  getAll: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/expenses/summary');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // Alias for create - matches POST /api/expenses/add
  add: async (data) => {
    const response = await api.post('/expenses/add', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const budgetService = {
  getAll: async (params = {}) => {
    const response = await api.get('/budgets', { params });
    return response.data;
  },

  getByPeriod: async (month, year, categoryId = null) => {
    const params = categoryId ? { categoryId } : {};
    const response = await api.get(`/budgets/${month}/${year}`, { params });
    return response.data;
  },

  upsert: async (data) => {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

export const reportService = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  // GET /api/reports/monthly/:year/:month
  getMonthly: async (year, month) => {
    const response = await api.get(`/reports/monthly/${year}/${month}`);
    return response.data;
  },

  // GET /api/reports/monthly?month=1&year=2026
  getMonthlySimple: async (month, year) => {
    const response = await api.get('/reports/monthly', { params: { month, year } });
    return response.data;
  },

  getWeekly: async (startDate = null) => {
    const params = startDate ? { startDate } : {};
    const response = await api.get('/reports/weekly', { params });
    return response.data;
  },

  getYearly: async (year) => {
    const response = await api.get(`/reports/yearly/${year}`);
    return response.data;
  },

  // GET /api/reports/category?month=1&year=2026&categoryId=1
  getByCategory: async (month, year, categoryId = null) => {
    const params = { month, year };
    if (categoryId) params.categoryId = categoryId;
    const response = await api.get('/reports/category', { params });
    return response.data;
  },
};
