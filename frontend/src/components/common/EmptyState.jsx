/**
 * EmptyState Component
 * 
 * Provides consistent, user-friendly empty states throughout the application.
 * Includes helpful illustrations, messages, and optional action buttons.
 * 
 * @module components/common/EmptyState
 */

import { FaDatabase, FaUsers, FaKey, FaSearch, FaInbox } from 'react-icons/fa'
import '../../styles/components/common/EmptyState.scss'

const EmptyState = ({ 
  type = 'default', 
  title, 
  message, 
  icon: CustomIcon,
  action,
  actionLabel 
}) => {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon />
    
    switch (type) {
      case 'credentials':
        return <FaKey />
      case 'users':
        return <FaUsers />
      case 'repositories':
        return <FaDatabase />
      case 'search':
        return <FaSearch />
      case 'notifications':
        return <FaInbox />
      default:
        return <FaDatabase />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'credentials':
        return 'No Credentials Found'
      case 'users':
        return 'No Users Found'
      case 'repositories':
        return 'No Repositories Available'
      case 'search':
        return 'No Results Found'
      case 'notifications':
        return 'No Notifications'
      default:
        return 'Nothing Here'
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'credentials':
        return 'Get started by adding your first credential to this repository.'
      case 'users':
        return 'No users match your search criteria. Try adjusting your filters.'
      case 'repositories':
        return 'You don\'t have access to any repositories yet. Contact an administrator to get assigned.'
      case 'search':
        return 'We couldn\'t find anything matching your search. Try different keywords.'
      case 'notifications':
        return 'You\'re all caught up! No new notifications.'
      default:
        return 'There\'s nothing to display here yet.'
    }
  }

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon">
        {getIcon()}
      </div>
      <h3 className="empty-state-title">{title || getDefaultTitle()}</h3>
      <p className="empty-state-message">{message || getDefaultMessage()}</p>
      {action && actionLabel && (
        <button 
          onClick={action}
          className="empty-state-action"
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState

