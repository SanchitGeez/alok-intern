import axios from 'axios';

// Get API URL from environment variable
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    console.warn('VITE_API_URL not found in environment variables, falling back to localhost');
    return 'http://localhost:5000/api';
  }
  return envUrl;
};

export const API_BASE_URL = getApiUrl();

// Helper function to get the base server URL (without /api)
export const getServerUrl = () => {
  return API_BASE_URL.replace('/api', '');
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;