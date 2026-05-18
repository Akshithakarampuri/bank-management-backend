import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

// Customers
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Accounts
export const accountAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  getByCustomer: (customerId) => api.get(`/accounts/customer/${customerId}`),
  create: (customerId, data) => api.post(`/accounts/customer/${customerId}`, data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  deposit: (id, amount, description) => api.post(`/accounts/${id}/deposit`, { amount, description }),
  withdraw: (id, amount, description) => api.post(`/accounts/${id}/withdraw`, { amount, description }),
  transfer: (id, toAccountId, amount, description) => api.post(`/accounts/${id}/transfer`, { toAccountId, amount, description }),
  getTransactions: (id) => api.get(`/accounts/${id}/transactions`),
};
