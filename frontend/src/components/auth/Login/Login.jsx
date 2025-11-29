import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import LoginForm from './LoginForm'
import '../../../styles/components/auth/Login.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (email, password) => {
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      success('Login successful! Welcome back!')
      navigate('/')
    } else {
      // Show helpful error messages
      if (result.message) {
        if (result.message.includes('Invalid credentials') || result.message.includes('credentials')) {
          showError('Invalid email or password. Please check your credentials and try again.')
        } else if (result.message.includes('locked')) {
          showError('Account is temporarily locked due to multiple failed login attempts. Please try again later.')
        } else if (result.message.includes('deactivated')) {
          showError('Your account has been deactivated. Please contact an administrator.')
        } else {
          showError(result.message)
        }
      } else {
        showError('Login failed. Please check your credentials and try again.')
      }
    }
  }

  return (
    <div className="login">
      <LoginForm onSubmit={handleSubmit} loading={loading} />
      <div className="auth-footer">
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

