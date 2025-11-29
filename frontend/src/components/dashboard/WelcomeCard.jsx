import { useAuth } from '../../contexts/AuthContext'
import '../../styles/components/dashboard/WelcomeCard.scss'

const WelcomeCard = ({ user }) => {
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'management':
        return 'Management'
      default:
        return 'User'
    }
  }

  return (
    <div className="welcome-card">
      <h2>Welcome back, {user?.username}!</h2>
      <p className="welcome-role">Role: {getRoleDisplay(user?.role)}</p>
      <p className="welcome-description">
        Manage and access your division's credential repositories from here.
      </p>
    </div>
  )
}

export default WelcomeCard

