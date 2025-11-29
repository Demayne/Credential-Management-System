import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { FaHome, FaDatabase, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import NavigationMenu from './NavigationMenu'
import UserProfile from './UserProfile'
import '../../../styles/components/layout/Sidebar.scss'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/admin', icon: FaCog, label: 'Admin Panel', roles: ['admin'] }
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-text">CoolTech</span>
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      
      <NavigationMenu items={menuItems} collapsed={collapsed} />
      
      <UserProfile user={user} collapsed={collapsed} />
    </aside>
  )
}

export default Sidebar

