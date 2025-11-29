import Sidebar from './Sidebar/Sidebar'
import TopBar from './TopBar/TopBar'
import '../../styles/components/layout/Layout.scss'

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-content">
        <TopBar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

