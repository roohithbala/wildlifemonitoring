/**
 * API Configuration Service
 * Centralized API endpoint configuration for the wildlife monitoring system
 */

// Environment-based configuration
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Base URLs for different environments
const BASE_URLS = {
  development: 'http://localhost:5001',
  production: 'https://wildlife-api.yourdomain.com',
  staging: 'https://wildlife-api-staging.yourdomain.com'
};

// Get the appropriate base URL
const API_BASE_URL = BASE_URLS[import.meta.env.MODE] || BASE_URLS.development;

// API endpoints configuration
const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    profile: '/api/auth/profile'
  },
  
  // Detection endpoints
  detections: {
    analyze: '/api/detections/analyze',
    list: '/api/detections',
    single: '/api/detections/:id',
    verify: '/api/detections/:id/verify',
    delete: '/api/detections/:id',
    nearby: '/api/detections/nearby/:id'
  },
  
  // User endpoints
  users: {
    profile: '/api/users/profile',
    update: '/api/users/profile',
    settings: '/api/users/settings'
  },
  
  // Analytics endpoints
  analytics: {
    dashboard: '/api/analytics/dashboard',
    species: '/api/analytics/species',
    timeline: '/api/analytics/timeline',
    maps: '/api/analytics/maps'
  },
  
  // System endpoints
  system: {
    health: '/api/health',
    status: '/api/status',
    models: '/api/models'
  },
  
  // Test endpoints (development only)
  test: {
    login: '/api/test/login',
    analytics: '/api/test/analytics/dashboard',
    upload: '/api/test/camera-upload'
  }
};

/**
 * API Service Class
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.endpoints = API_ENDPOINTS;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    console.log(`🔗 API Service initialized for ${import.meta.env.MODE} environment`);
    console.log(`📡 Base URL: ${this.baseURL}`);
  }

  /**
   * Get full URL for an endpoint
   */
  getUrl(endpoint, params = {}) {
    let url = `${this.baseURL}${endpoint}`;
    
    // Replace URL parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
  }

  /**
   * Get headers with authentication if available
   */
  getHeaders(additionalHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...additionalHeaders };
    
    // Add authentication token if available
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Get authentication token from storage
   */
  getAuthToken() {
    try {
      return localStorage.getItem('wildlife_auth_token') || sessionStorage.getItem('wildlife_auth_token');
    } catch (error) {
      console.warn('Failed to get auth token from storage:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token, persistent = false) {
    try {
      if (persistent) {
        localStorage.setItem('wildlife_auth_token', token);
      } else {
        sessionStorage.setItem('wildlife_auth_token', token);
      }
    } catch (error) {
      console.warn('Failed to store auth token:', error);
    }
  }

  /**
   * Remove authentication token
   */
  removeAuthToken() {
    try {
      localStorage.removeItem('wildlife_auth_token');
      sessionStorage.removeItem('wildlife_auth_token');
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  }

  /**
   * Generic HTTP request method
   */
  async request(endpoint, options = {}) {
    try {
      const url = typeof endpoint === 'string' ? this.getUrl(endpoint, options.params) : endpoint;
      const headers = this.getHeaders(options.headers);
      
      const config = {
        method: options.method || 'GET',
        headers,
        ...options
      };
      
      // Don't set Content-Type for FormData
      if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
      } else if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
      }
      
      console.log(`📡 API Request: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response: ${config.method} ${url} - Success`);
      
      return data;
      
    } catch (error) {
      console.error(`❌ API Request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post(endpoint, body = null, options = {}) {
    return this.request(endpoint, { 
      method: 'POST', 
      body, 
      ...options 
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = null, options = {}) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body, 
      ...options 
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, params = {}) {
    return this.request(endpoint, { method: 'DELETE', params });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(endpoint, file, additionalData = {}, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add additional data
      Object.keys(additionalData).forEach(key => {
        if (typeof additionalData[key] === 'object') {
          formData.append(key, JSON.stringify(additionalData[key]));
        } else {
          formData.append(key, additionalData[key]);
        }
      });
      
      const url = this.getUrl(endpoint);
      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let browser set it for FormData
      
      // Use XMLHttpRequest for progress tracking
      if (onProgress) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error('Invalid JSON response'));
              }
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          });
          
          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });
          
          xhr.open('POST', url);
          
          // Set headers
          Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
          });
          
          xhr.send(formData);
        });
      } else {
        // Use fetch for simple uploads
        return this.request(endpoint, {
          method: 'POST',
          body: formData
        });
      }
      
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.get(this.endpoints.system.health);
      return response.status === 'OK';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get test authentication token
   */
  async getTestToken() {
    try {
      const response = await this.post(this.endpoints.test.login, {
        email: 'test@example.com',
        password: 'test123'
      });
      
      if (response.success && response.data.token) {
        this.setAuthToken(response.data.token);
        return response.data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get test token:', error);
      return null;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export both the service instance and configuration
export { apiService, API_BASE_URL, API_ENDPOINTS };
export default apiService;