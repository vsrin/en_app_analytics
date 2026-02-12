import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/analytics';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const analyticsAPI = {
  // Get all apps
  getApps: () => api.get('/apps'),
  
  // System health
  getSystemHealth: (appId: string, days: number = 7) => 
    api.get(`/apps/${appId}/system-health`, { params: { days } }),
  
  // Users
  getUsers: (appId: string, params?: { sort?: string; limit?: number; organization?: string }) =>
    api.get(`/apps/${appId}/users`, { params }),
  
  // Batches
  getBatches: (appId: string, params?: { user?: string; date?: string; status?: string; limit?: number }) =>
    api.get(`/apps/${appId}/batches`, { params }),
  
  // Batch detail
  getBatchDetail: (appId: string, batchId: string) =>
    api.get(`/apps/${appId}/batches/${batchId}`),
  
  // Failures
  getFailures: (appId: string, params?: { group_by?: string; min_incurred?: number; limit?: number }) =>
    api.get(`/apps/${appId}/failures`, { params }),
  
  // Products
  getProducts: (appId: string) =>
    api.get(`/apps/${appId}/products`),
};

export default api;