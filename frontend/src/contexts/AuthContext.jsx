/**
 * Authentication Context
 * 
 * Provides global authentication state management for the React application.
 * Manages user authentication, login, registration, and logout functionality.
 * 
 * Features:
 * - User state management (current authenticated user)
 * - Loading state for initial authentication check
 * - Login and registration functions
 * - Automatic token storage in localStorage
 * - User profile loading on app initialization
 * 
 * Usage:
 *   const { user, loading, login, logout } = useAuth()
 * 
 * @module contexts/AuthContext
 */

import { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

/**
 * Custom Hook: useAuth
 * 
 * Provides access to authentication context.
 * Must be used within AuthProvider component.
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * AuthProvider Component
 * 
 * Provides authentication context to all child components.
 * Manages user state, loading state, and authentication methods.
 * Automatically loads user profile on mount if token exists.
 * 
 * @param {React.ReactNode} children - Child components to wrap
 * @returns {JSX.Element} AuthContext.Provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * Load User Profile
   * 
   * Fetches the current user's profile from the API using stored JWT token.
   * Called automatically on app initialization if a token exists.
   * Clears tokens and user state if request fails (token expired/invalid).
   * 
   * @returns {Promise<void>}
   */
  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setUser(null)
      }
    } catch (error) {
      console.error('Load user error:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Login Function
   * 
   * Authenticates user with email and password.
   * Stores JWT tokens in localStorage upon successful login.
   * Updates user state with authenticated user data.
   * 
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<Object>} { success: boolean, message?: string }
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, refreshToken, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  /**
   * Register Function
   * 
   * Creates a new user account with provided credentials.
   * Default role is 'user' (normal user).
   * Stores JWT tokens and updates user state upon successful registration.
   * 
   * @param {string} username - Desired username (3-30 characters)
   * @param {string} email - User email address
   * @param {string} password - User password (minimum 8 characters)
   * @returns {Promise<Object>} { success: boolean, message?: string }
   */
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { token, refreshToken, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      // Extract detailed error messages
      let errorMessage = 'Registration failed'
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Handle validation errors
          const firstError = error.response.data.errors[0]
          if (firstError.msg) {
            errorMessage = firstError.msg
          } else if (firstError.message) {
            errorMessage = firstError.message
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  /**
   * Logout Function
   * 
   * Clears authentication tokens from localStorage and user state.
   * Redirects user to login page.
   * 
   * @returns {void}
   */
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    window.location.href = '/login'
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loadUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

