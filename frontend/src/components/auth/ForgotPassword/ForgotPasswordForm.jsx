import { useState } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import '../../../styles/components/auth/ForgotPasswordForm.scss'

const ForgotPasswordForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData.email)
    }
  }

  return (
    <form className="forgot-password-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Reset Password</h2>
      <p className="form-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrapper">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={errors.email ? 'error' : ''}
          />
        </div>
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  )
}

export default ForgotPasswordForm

