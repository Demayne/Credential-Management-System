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

        {recent.length > 0 && (() => {
          const last = recent[0]
          const visitedAt = last.visitedAt
            ? new Date(last.visitedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : null
          return (
            <div className="recent-repos">
              {!collapsed && (
                <div className="recent-label">
                  <FaClock aria-hidden="true" />
                  <span>Recent</span>
                </div>
              )}
              <NavLink
                to={`/repo/${last.id}`}
                className={({ isActive }) => `nav-item recent-item ${isActive ? 'active' : ''}`}
                title={collapsed ? last.name : ''}
              >
                <FaDatabase className="nav-icon" aria-hidden="true" />
                {!collapsed && (
                  <span className="recent-item-info">
                    <span className="nav-label">{last.name}</span>
                    {visitedAt && <span className="recent-time">{visitedAt}</span>}
                  </span>
                )}
              </NavLink>
            </div>
          )
        })()}

        <UserProfile user={user} collapsed={collapsed} />
      </aside>
    </>
  )
}

export default Sidebar

