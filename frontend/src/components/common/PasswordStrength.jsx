import { checkPasswordStrength } from '../../utils/passwordStrength'
import '../../styles/components/common/PasswordStrength.scss'

const LEVELS = [
  { min: 0, max: 2, segments: 1, label: 'Weak',      color: '#ef4444' },
  { min: 3, max: 3, segments: 2, label: 'Fair',      color: '#f59e0b' },
  { min: 4, max: 5, segments: 3, label: 'Good',      color: '#06b6d4' },
  { min: 6, max: 7, segments: 4, label: 'Strong',    color: '#10b981' },
]

function getLevel(strength) {
  return LEVELS.find(l => strength >= l.min && strength <= l.max) || LEVELS[0]
}

const PasswordStrength = ({ password, showFeedback = false }) => {
  if (!password) return null

  const { strength, feedback } = checkPasswordStrength(password)
  const level = getLevel(strength)

  return (
    <div className="password-strength">
      <div className="strength-track" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="strength-segment"
            style={i < level.segments ? { background: level.color, opacity: 1 } : {}}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: level.color }}>
        {level.label}
      </span>
      {showFeedback && feedback.length > 0 && feedback[0] !== 'Strong password!' && (
        <p className="strength-hint">{feedback[0]}</p>
      )}
    </div>
  )
}

export default PasswordStrength
