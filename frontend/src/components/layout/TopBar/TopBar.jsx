import { useLocation } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'
import SearchBar from './SearchBar'
import Notifications from './Notifications'
import '../../../styles/components/layout/TopBar.scss'

const TopBar = () => {
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

