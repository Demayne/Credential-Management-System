import { useState, useRef, useEffect } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import ConfirmModal from '../../../common/ConfirmModal'
import '../../../../styles/components/admin/RoleDropdown.scss'

const RoleDropdown = ({ currentRole, userId, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState(null)
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
      setPendingRole(role)
    }
    setIsOpen(false)
  }

  const handleConfirm = () => {
    onRoleChange(userId, pendingRole)
    setPendingRole(null)
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
      <ConfirmModal
        isOpen={!!pendingRole}
        title="Change User Role"
        message={`Change this user's role to "${pendingRole}"? This will affect their access permissions immediately.`}
        confirmLabel="Change Role"
        variant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setPendingRole(null)}
      />
    </div>
  )
}

export default RoleDropdown

