/**
 * Main Application Component
 * 
 * Root component that sets up the React Router, Context providers, and route configuration.
 * Wraps the entire application with ErrorBoundary for graceful error handling.
 * 
 * Context Providers:
 * - AuthProvider: Manages authentication state and user session
 * - ToastProvider: Handles toast notifications throughout the app
 * - SearchProvider: Manages global search functionality
 * 
 * Routes:
 * - Public routes: /login, /register, /forgot-password, /reset-password
 * - Protected routes: / (dashboard), /repo/:divisionId (repository view)
 * - Admin-only route: /admin (admin panel)
 * 
 * @module App
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { SearchProvider } from './contexts/SearchContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/common/ProtectedRoute'
import AuthLayout from './components/auth/AuthLayout'
import Login from './components/auth/Login/Login'
import Register from './components/auth/Register/Register'
import ForgotPassword from './components/auth/ForgotPassword/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword/ResetPassword'
import Dashboard from './components/dashboard/Dashboard'
import RepositoryView from './components/repositories/RepositoryView/RepositoryView'
import AdminPanel from './components/admin/AdminPanel/AdminPanel'
import Layout from './components/layout/Layout'
import ToastContainer from './components/common/Toast/ToastContainer'

/**
 * App Component
 * 
 * Main application entry point that configures routing and context providers.
 * All routes are wrapped with ErrorBoundary for error handling.
 * 
 * @returns {JSX.Element} The root application component
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <SearchProvider>
              <ToastContainer />
              <Routes>
            <Route path="/login" element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            } />
            <Route path="/forgot-password" element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            } />
            <Route path="/reset-password" element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/repo/:divisionId" element={
              <ProtectedRoute>
                <Layout>
                  <RepositoryView />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SearchProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

