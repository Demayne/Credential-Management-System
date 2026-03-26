/**
 * API Service
 * 
 * Configured Axios instance for making HTTP requests to the backend API.
 * Automatically adds JWT token to all requests via Authorization header.
 * Handles token expiration and redirects to login on 401 errors.
 * 
 * Features:
 * - Automatic token injection from localStorage
 * - Automatic redirect on authentication failure
 * - Base URL configuration via Vite proxy
 * 
 * Usage:
 *   import api from './services/api'
 *   const response = await api.get('/repositories/accessible')
 * 
 * @module services/api
 */

import axios from 'axios'
import { isNetworkError, isTimeoutError, getErrorMessage } from '../utils/networkErrorHandler'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

/**
 * Axios Instance Configuration
 * 
 * Creates a configured Axios instance with:
 * - Base URL: '/api' (proxied to backend via Vite config)
 * - Default JSON content type header
 * - Request timeout of 30 seconds
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Request Interceptor: Add Authentication Token
 * 
 * Automatically adds JWT token from localStorage to all API requests.
 * Token is added as Bearer token in Authorization header.
 * 
 * @param {Object} config - Axios request config
 * @returns {Object} Modified request config with Authorization header
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor: Handle Authentication Errors
 * 
 * Automatically handles 401 Unauthorized responses.
 * Clears stored tokens and redirects to login page when token expires or is invalid.
 * 
 * @param {Object} response - Successful Axios response
 * @param {Object} error - Axios error response
 * @returns {Object|Promise} Response object or rejected promise
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Attempt token refresh on 401, but not for the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        )
        const { token } = response.data
        localStorage.setItem('token', token)
        api.defaults.headers.common.Authorization = `Bearer ${token}`
        originalRequest.headers.Authorization = `Bearer ${token}`
        processQueue(null, token)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Enhance error with user-friendly message
    if (error.response) {
      error.userMessage = getErrorMessage(error)
    } else if (isNetworkError(error) || isTimeoutError(error)) {
      error.userMessage = getErrorMessage(error)
    } else {
      error.userMessage = 'An unexpected error occurred. Please try again.'
    }

    return Promise.reject(error)
  }
)

export default api

