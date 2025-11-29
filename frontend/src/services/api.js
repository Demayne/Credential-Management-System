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

/**
 * Axios Instance Configuration
 * 
 * Creates a configured Axios instance with:
 * - Base URL: '/api' (proxied to backend via Vite config)
 * - Default JSON content type header
 */
const api = axios.create({
  baseURL: '/api',
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

