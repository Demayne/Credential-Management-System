import { useLocation } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import Breadcrumbs from './Breadcrumbs'
import SearchBar from './SearchBar'
import Notifications from './Notifications'
import '../../../styles/components/layout/TopBar.scss'

const TopBar = ({ onMenuClick }) => {
  const location = useLocation()

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard'
    if (location.pathname.startsWith('/repo/')) return 'Repository'
    if (location.pathname === '/admin') return 'Admin Panel'
    return 'Page'
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <FaBars />
        </button>
        <Breadcrumbs />
      </div>
      <div className="topbar-center">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      <div className="topbar-right">
        <SearchBar />
        <Notifications />
      </div>
    </header>
  )
}

export default TopBar

