import axios, { AxiosError } from 'axios'
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
const JWT_STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for auth-related endpoints
    const publicPaths = [
      '/auth/register',
      '/auth/login',
      '/auth/verify-email',
      '/auth/request-password-reset',
      '/auth/reset-password',
    ]

    const isPublic = publicPaths.some(path => config.url?.startsWith(path));

    if (!isPublic && typeof window !== 'undefined') {
      const tokenKey = JWT_STORAGE_KEY || 'hayah_auth_token';
      const token = window.localStorage.getItem(tokenKey);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Broadcast event instead of redirecting
      window.dispatchEvent(new Event('auth:unauthorized'));
      
      // Also clean up token
      const tokenKey = JWT_STORAGE_KEY || 'hayah_auth_token';
      localStorage.removeItem(tokenKey);
    }
    return Promise.reject(error);
  },
);

export { apiClient }

