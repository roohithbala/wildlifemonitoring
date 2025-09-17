import axios from 'axios';

/**
 * API utilities for wildlife monitoring system
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Base API configuration
console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🚀 API REQUEST:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
      tokenIsValid: token && token !== 'undefined' && token !== 'null'
    });
    
    // Only add authorization header if token exists and is not 'undefined' string
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set:', config.headers.Authorization.substring(0, 40) + '...');
    } else {
      console.log('⚠️ No valid token found in localStorage');
      // Remove authorization header if it exists
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE SUCCESS:', {
      url: response.config.url,
      status: response.status,
      data: response.data?.success ? 'Success' : 'Failed'
    });
    return response;
  },
  (error) => {
    console.error('❌ API RESPONSE ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - Clearing tokens and redirecting');
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/debug page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/debug')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: (token) => api.post('/auth/verify-token', { token }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  getUsers: (params) => api.get('/users', { params }),
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  updateUserStatus: (userId, isActive) => api.put(`/users/${userId}/status`, { isActive }),
};

// Detection API
export const detectionAPI = {
  analyzeImage: (formData) => api.post('/detections/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDetections: (params) => api.get('/detections', { params }),
  getDetection: (id) => api.get(`/detections/${id}`),
  deleteDetection: (id) => api.delete(`/detections/${id}`),
  verifyDetection: (id, notes) => api.put(`/detections/${id}/verify`, { verificationNotes: notes }),
  getNearbyDetections: (id, maxDistance) => api.get(`/detections/nearby/${id}`, { 
    params: { maxDistance } 
  }),
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: (params) => api.get('/analytics', { params }),
  getDashboard: async (timeframe) => {
    try {
      console.log('📊 [analyticsAPI] Calling MongoDB dashboard API...');
      const response = await api.get('/analytics/dashboard', { params: { timeframe } });
      console.log('✅ [analyticsAPI] MongoDB data received:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ [analyticsAPI] Valid MongoDB dashboard data from API');
        return {
          data: response.data.data,
          status: response.status,
          statusText: response.statusText
        };
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('❌ [analyticsAPI] MongoDB API call failed:', error.message);
      // Instead of fallback, throw error to show real issue
      throw new Error(`Failed to connect to MongoDB backend: ${error.message}`);
    }
  },
  getSpeciesAnalytics: (species, timeframe) => api.get(`/analytics/species/${species}`, { 
    params: { timeframe } 
  }),
  getHeatmapData: (params) => api.get('/analytics/heatmap', { params }),
  exportData: (params) => api.get('/analytics/export', { params }),
  getGlobalAnalytics: (timeframe) => api.get('/analytics/global', { params: { timeframe } }),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const formatApiResponse = (response) => {
  console.log('🔍 formatApiResponse - Full response:', response);
  console.log('🔍 formatApiResponse - response.data:', response.data);
  console.log('🔍 formatApiResponse - response.data.data:', response.data.data);
  
  // The axios response contains our API response in response.data
  // Our API response structure is { success, message, data: { user, token } }
  // So we need response.data.data to get the actual user and token
  return response.data.data || response.data;
};

// Utility function to clean up invalid tokens
export const cleanupInvalidTokens = () => {
  const token = localStorage.getItem('token');
  if (token === 'undefined' || token === 'null' || !token || token.trim() === '') {
    console.log('🧹 Cleaning up invalid token from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  }
  return false;
};

export default api;