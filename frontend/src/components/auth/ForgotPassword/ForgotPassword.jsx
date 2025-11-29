import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../../contexts/ToastContext'
import api from '../../../services/api'
import ForgotPasswordForm from './ForgotPasswordForm'
import '../../../styles/components/auth/ForgotPassword.scss'

const ForgotPassword = () => {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resetUrl, setResetUrl] = useState(null)

  const handleSubmit = async (email) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.success) {
        setEmailSent(true)
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl)
        }
        success(response.data.message)
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="forgot-password">
        <div className="forgot-password-success">
          <h1>Check Your Email</h1>
          <p className="success-message">
            We've sent password reset instructions to your email address.
          </p>
          {resetUrl && (
            <div className="dev-reset-link">
              <p><strong>Development Mode:</strong></p>
              <a href={resetUrl} target="_blank" rel="noopener noreferrer">
                {resetUrl}
              </a>
            </div>
          )}
          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password">
      <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />
      <div className="auth-footer">
        <p>
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

