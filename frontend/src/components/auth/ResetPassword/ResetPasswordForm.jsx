import { useState } from 'react'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { checkPasswordStrength } from '../../../utils/passwordStrength'
import '../../../styles/components/auth/ResetPasswordForm.scss'

const ResetPasswordForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [strength, setStrength] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Check password strength
    if (name === 'password' && value) {
      setStrength(checkPasswordStrength(value))
    } else if (name === 'password' && !value) {
      setStrength(null)
    }

    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData.password)
    }
  }

  return (
    <form className="reset-password-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="password">New Password</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
            className={errors.password ? 'error' : ''}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {strength && (
          <div className="password-strength">
            <div className={`strength-bar strength-${strength.strength}`}>
              <div className="strength-fill" style={{ width: `${(strength.strength / 6) * 100}%` }}></div>
            </div>
            <span className={`strength-label strength-${strength.strength}`}>
              {strength.strengthLabel}
            </span>
          </div>
        )}
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            className={errors.confirmPassword ? 'error' : ''}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  )
}

export default ResetPasswordForm

