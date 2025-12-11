import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { FaHome, FaDatabase, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'
import NavigationMenu from './NavigationMenu'
import UserProfile from './UserProfile'
import '../../../styles/components/layout/Sidebar.scss'

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/admin', icon: FaCog, label: 'Admin Panel', roles: ['admin'] }
  ]

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-text">CoolTech</span>
          </div>
          <div className="sidebar-controls">
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
            <button className="close-btn mobile-only" onClick={onClose} aria-label="Close sidebar">
              <FaTimes />
            </button>
          </div>
        </div>
        
        <NavigationMenu items={menuItems} collapsed={collapsed} />
        
        <UserProfile user={user} collapsed={collapsed} />
      </aside>
    </>
  )
}

export default Sidebar

