import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useToast } from '../../../contexts/ToastContext'
import api from '../../../services/api'
import ResetPasswordForm from './ResetPasswordForm'
import '../../../styles/components/auth/ResetPassword.scss'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      error('Invalid reset token')
    }
  }, [searchParams, error])

  const handleSubmit = async (password) => {
    if (!token) {
      error('Invalid reset token')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/reset-password', {
        token,
        password
      })
      if (response.data.success) {
        success('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password">
      <div className="reset-password-card">
        <h1>Reset Password</h1>
        <p className="description">
          Enter your new password below.
        </p>
        {token ? (
          <ResetPasswordForm onSubmit={handleSubmit} loading={loading} />
        ) : (
          <div className="error-state">
            <p>Invalid or missing reset token.</p>
            <Link to="/forgot-password">Request a new reset link</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

