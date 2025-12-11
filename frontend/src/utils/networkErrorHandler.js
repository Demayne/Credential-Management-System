/**
 * Network Error Handler Utilities
 * 
 * Provides utilities for handling network errors and retry mechanisms.
 * 
 * @module utils/networkErrorHandler
 */

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return (
    !error.response ||
    error.code === 'NETWORK_ERROR' ||
    error.message === 'Network Error' ||
    error.message.includes('Failed to fetch')
  )
}

/**
 * Check if error is a timeout error
 * @param {Error} error - Error object
 * @returns {boolean} True if timeout error
 */
export const isTimeoutError = (error) => {
  return (
    error.code === 'ECONNABORTED' ||
    error.message.includes('timeout') ||
    error.message.includes('Timeout')
  )
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const waitTime = delay * Math.pow(2, i)
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError
}

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.'
  }
  
  if (error.response) {
    const status = error.response.status
    
    switch (status) {
      case 401:
        return 'Your session has expired. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return error.response.data?.message || `An error occurred (${status}). Please try again.`
    }
  }
  
  return error.message || 'An unexpected error occurred. Please try again.'
}

