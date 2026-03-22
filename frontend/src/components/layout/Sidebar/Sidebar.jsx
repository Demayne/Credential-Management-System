import { useState, useEffect } from 'react'
import { Link, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useRecentReposContext } from '../../../contexts/RecentReposContext'
import { FaHome, FaDatabase, FaCog, FaChevronLeft, FaChevronRight, FaTimes, FaClock } from 'react-icons/fa'
import NavigationMenu from './NavigationMenu'
import UserProfile from './UserProfile'
import '../../../styles/components/layout/Sidebar.scss'

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const { recent } = useRecentReposContext()
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

        {recent.length > 0 && (
          <div className="recent-repos">
            {!collapsed && (
              <div className="recent-label">
                <FaClock aria-hidden="true" />
                <span>Recent</span>
              </div>
            )}
            {recent.map(repo => (
              <NavLink
                key={repo.id}
                to={`/repo/${repo.id}`}
                className={({ isActive }) => `nav-item recent-item ${isActive ? 'active' : ''}`}
                title={collapsed ? repo.name : ''}
              >
                <FaDatabase className="nav-icon" aria-hidden="true" />
                {!collapsed && <span className="nav-label">{repo.name}</span>}
              </NavLink>
            ))}
          </div>
        )}

        <UserProfile user={user} collapsed={collapsed} />
      </aside>
    </>
  )
}

export default Sidebar

