import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PageTitleContext = createContext({ pageTitle: '', setPageTitle: () => {} })

const STATIC_TITLES = {
  '/': 'Dashboard',
  '/admin': 'Admin Panel',
  '/login': 'Login',
  '/register': 'Register',
  '/forgot-password': 'Forgot Password',
  '/reset-password': 'Reset Password',
}

export const PageTitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('Dashboard')
  const location = useLocation()

  // Reset to static title on route change (RepositoryView will override for /repo/)
  useEffect(() => {
    const static_ = STATIC_TITLES[location.pathname]
    if (static_) setPageTitle(static_)
  }, [location.pathname])

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export const usePageTitle = () => useContext(PageTitleContext)
