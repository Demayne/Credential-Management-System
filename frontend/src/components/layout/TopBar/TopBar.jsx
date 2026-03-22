import { FaBars } from 'react-icons/fa'
import Breadcrumbs from './Breadcrumbs'
import SearchBar from './SearchBar'
import { usePageTitle } from '../../../contexts/PageTitleContext'
import '../../../styles/components/layout/TopBar.scss'

const TopBar = ({ onMenuClick }) => {
  const { pageTitle } = usePageTitle()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <FaBars />
        </button>
        <Breadcrumbs />
      </div>
      <div className="topbar-center">
        <h1 className="page-title">{pageTitle}</h1>
      </div>
      <div className="topbar-right">
        <SearchBar />
      </div>
    </header>
  )
}

export default TopBar

