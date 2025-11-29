import { useAuth } from '../../../contexts/AuthContext'
import { FaSignOutAlt, FaUser } from 'react-icons/fa'
import '../../../styles/components/layout/UserProfile.scss'

const UserProfile = ({ user, collapsed }) => {
  const { logout } = useAuth()

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return '#ef4444'
      case 'management':
        return '#f59e0b'
      default:
        return '#10b981'
    }
  }

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          <FaUser />
        </div>
        {!collapsed && (
          <div className="user-details">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-role" style={{ color: getRoleBadgeColor(user?.role) }}>
              {user?.role || 'user'}
            </div>
          </div>
        )}
      </div>
      <button className="logout-btn" onClick={logout} title={collapsed ? 'Logout' : ''}>
        <FaSignOutAlt />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  )
}

export default UserProfile

