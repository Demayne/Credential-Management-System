import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { SearchProvider } from './contexts/SearchContext'
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

function App() {
  return (
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
  )
}

export default App

