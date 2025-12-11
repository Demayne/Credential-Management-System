import { useState, useEffect } from 'react'
import Sidebar from './Sidebar/Sidebar'
import TopBar from './TopBar/TopBar'
import { createSkipLink } from '../../utils/keyboardNavigation'
import '../../styles/components/layout/Layout.scss'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Create skip link for accessibility
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        createSkipLink()
      } catch (error) {
        console.warn('Failed to create skip link:', error)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-content">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="main-content" role="main">
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSidebarOpen(false)
            }
          }}
        />
      )}
    </div>
  )
}

export default Layout

