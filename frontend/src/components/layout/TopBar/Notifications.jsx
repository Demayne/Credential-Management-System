import { FaBell } from 'react-icons/fa'
import '../../../styles/components/layout/Notifications.scss'

const Notifications = () => {
  // Placeholder for future notification implementation
  // TODO: Implement notification system
  const hasNotifications = false

  return (
    <button 
      className="notifications-btn"
      title="Notifications (Coming Soon)"
      disabled
    >
      <FaBell />
      {hasNotifications && (
        <span className="notification-badge">0</span>
      )}
    </button>
  )
}

export default Notifications

