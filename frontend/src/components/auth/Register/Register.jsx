import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import RegisterForm from './RegisterForm'
import '../../../styles/components/auth/Register.scss'

const Register = () => {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (username, email, password) => {
    setLoading(true)
    const result = await register(username, email, password)
    setLoading(false)

    if (result.success) {
      success('Registration successful! Welcome to CoolTech!')
      navigate('/')
    } else {
      // Show detailed error messages
      if (result.message) {
        if (result.message.includes('email') || result.message.includes('Email')) {
          showError('Email address is already registered. Please use a different email or try logging in.')
        } else if (result.message.includes('username') || result.message.includes('Username')) {
          showError('Username is already taken. Please choose a different username.')
        } else if (result.message.includes('validation') || result.message.includes('valid')) {
          showError('Please check your information and try again. Make sure all fields are filled correctly.')
        } else {
          showError(result.message)
        }
      } else {
        showError('Registration failed. Please check your information and try again.')
      }
    }
  }

  return (
    <div className="register">
      <RegisterForm onSubmit={handleSubmit} loading={loading} />
      <div className="auth-footer">
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

