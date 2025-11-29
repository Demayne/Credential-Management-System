import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import '../../../styles/components/layout/NavigationMenu.scss'

const NavigationMenu = ({ items, collapsed }) => {
  const { user } = useAuth()

  const filteredItems = items.filter(item => {
    if (item.roles && !item.roles.includes(user?.role)) {
      return false
    }
    return true
  })

  return (
    <nav className="navigation-menu">
      {filteredItems.map(item => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <Icon className="nav-icon" />
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default NavigationMenu

