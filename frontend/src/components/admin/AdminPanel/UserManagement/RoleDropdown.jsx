import { useState, useRef, useEffect } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import '../../../../styles/components/admin/RoleDropdown.scss'

const RoleDropdown = ({ currentRole, userId, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const roles = ['user', 'management', 'admin']

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (role) => {
    if (role !== currentRole) {
      if (window.confirm(`Change user role to ${role}?`)) {
        onRoleChange(userId, role)
      }
    }
    setIsOpen(false)
  }

  return (
    <div className="role-dropdown" ref={dropdownRef}>
      <button
        className="role-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`role-badge role-${currentRole}`}>
          {currentRole}
        </span>
        <FaChevronDown />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {roles.map(role => (
            <button
              key={role}
              className={`dropdown-item ${role === currentRole ? 'active' : ''}`}
              onClick={() => handleSelect(role)}
            >
              <span className={`role-badge role-${role}`}>{role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoleDropdown

