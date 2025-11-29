/**
 * ProtectedRoute Component
 * 
 * Higher-order component that protects routes requiring authentication.
 * Redirects unauthenticated users to login page.
 * Optionally checks for specific role requirements.
 * 
 * Usage:
 *   <Route path="/admin" element={
 *     <ProtectedRoute requiredRole="admin">
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   } />
 * 
 * @param {React.ReactNode} children - Component(s) to render if authenticated
 * @param {string} requiredRole - Optional role requirement ('admin', 'management', 'user')
 * @returns {JSX.Element} Protected component or redirect to login
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

