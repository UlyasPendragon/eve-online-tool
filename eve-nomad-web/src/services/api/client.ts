/**
 * EVE Nomad Web - API Client
 *
 * Axios-based HTTP client for backend API communication with JWT authentication.
 * Adapted from mobile for web platform.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../../utils/config';
import { getToken, saveToken, removeToken } from '../storage';

// Create Axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Decode JWT token without verification
 * Returns null if token is invalid
 */
const decodeToken = (token: string): { exp: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[API Client] Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired or will expire soon
 * @param token - JWT token
 * @param bufferMinutes - Minutes before expiry to consider token as expired (default: 5)
 */
const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider invalid token as expired
  }

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const buffer = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds

  return expiryTime - now < buffer;
};

// Request interceptor: Attach JWT token and proactively refresh if expiring soon
apiClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    // Skip refresh for refresh endpoint itself
    if (requestConfig.url?.includes('/auth/refresh')) {
      const token = getToken();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    }

    const token = getToken();
    if (token) {
      // Check if token is expiring soon
      if (isTokenExpiringSoon(token)) {
        console.log('[API Client] Token expiring soon, refreshing proactively...');

        try {
          // Refresh token before making the request
          const response = await apiClient.post('/auth/refresh');
          const newToken = response.data.token;

          // Save new token
          saveToken(newToken);

          // Use new token for this request
          if (requestConfig.headers) {
            requestConfig.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (error) {
          console.error('[API Client] Proactive refresh failed:', error);
          // Continue with old token, let response interceptor handle 401
        }
      } else if (requestConfig.headers) {
        // Token is still valid, use it
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    }

    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track if token refresh is in progress
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const response = await apiClient.post('/auth/refresh');
        const newToken = response.data.token;

        // Save new token
        saveToken(newToken);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - logout user
        processQueue(refreshError as Error, null);
        removeToken();

        // Trigger logout by navigating to login screen
        // Using dynamic import to avoid circular dependencies and enable client-side navigation
        if (typeof window !== 'undefined') {
          import('next/navigation').then((nav) => {
            nav.redirect('/login');
          });
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    return Promise.reject(error);
  },
);

// API Error type
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
