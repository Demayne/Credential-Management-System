import { useState } from 'react'
import { FaCopy, FaSync, FaCheck } from 'react-icons/fa'
import { useToast } from '../../../contexts/ToastContext'
import api from '../../../services/api'
import '../../../styles/components/common/PasswordGenerator.scss'

const PasswordGenerator = ({ onPasswordGenerated }) => {
  const { success } = useToast()
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  })
  const [strength, setStrength] = useState(null)

  const generatePassword = async () => {
    try {
      const response = await api.post('/utils/generate-password', options)
      if (response.data.success) {
        setPassword(response.data.password)
        setStrength(response.data.strength)
        setCopied(false)
        if (onPasswordGenerated) {
          onPasswordGenerated(response.data.password)
        }
      }
    } catch (err) {
      console.error('Failed to generate password:', err)
    }
  }

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      success('Password copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOptionChange = (key, value) => {
    setOptions({
      ...options,
      [key]: value
    })
  }

  return (
    <div className="password-generator">
      <div className="generator-header">
        <h3>Password Generator</h3>
        <button className="generate-btn" onClick={generatePassword}>
          <FaSync /> Generate
        </button>
      </div>

      {password && (
        <div className="generated-password">
          <div className="password-display">
            <input
              type="text"
              value={password}
              readOnly
              className="password-input"
            />
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          {strength && (
            <div className="password-strength">
              <div className={`strength-bar strength-${strength.strength}`}>
                <div
                  className="strength-fill"
                  style={{ width: `${(strength.strength / 6) * 100}%` }}
                ></div>
              </div>
              <span className={`strength-label strength-${strength.strength}`}>
                {strength.strengthLabel}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="generator-options">
        <div className="option-group">
          <label>
            <input
              type="range"
              min="8"
              max="32"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
            />
            <span>Length: {options.length}</span>
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
            />
            <span>Uppercase (A-Z)</span>
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
            />
            <span>Lowercase (a-z)</span>
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
            />
            <span>Numbers (0-9)</span>
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
            />
            <span>Symbols (!@#$...)</span>
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => handleOptionChange('excludeSimilar', e.target.checked)}
            />
            <span>Exclude Similar (i, l, 1, L, o, 0, O)</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default PasswordGenerator

