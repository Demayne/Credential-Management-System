import { useState, useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { FaHome, FaChevronRight } from 'react-icons/fa'
import api from '../../../services/api'
import '../../../styles/components/layout/Breadcrumbs.scss'

const Breadcrumbs = () => {
  const location = useLocation()
  const { divisionId } = useParams()
  const [divisionName, setDivisionName] = useState(null)
  
  const paths = location.pathname.split('/').filter(Boolean)
  
  useEffect(() => {
    // If we're on a repository page, fetch the division name
    if (divisionId && location.pathname.startsWith('/repo/')) {
      const fetchDivisionName = async () => {
        try {
          const response = await api.get(`/repositories/${divisionId}`)
          if (response.data.success && response.data.repository?.division?.name) {
            setDivisionName(response.data.repository.division.name)
          }
        } catch (err) {
          // If fetch fails, just use the ID
          console.error('Failed to fetch division name:', err)
        }
      }
      fetchDivisionName()
    } else {
      setDivisionName(null)
    }
  }, [divisionId, location.pathname])
  
  return (
    <nav className="breadcrumbs">
      <Link to="/" className="breadcrumb-item">
        <FaHome />
      </Link>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1
        const route = '/' + paths.slice(0, index + 1).join('/')
        
        // Replace division ID with division name if available
        let label = path.charAt(0).toUpperCase() + path.slice(1)
        if (path === divisionId && divisionName) {
          label = divisionName
        } else if (path === 'repo') {
          label = 'Repository'
        }
        
        return (
          <span key={route} className="breadcrumb-segment">
            <FaChevronRight className="separator" />
            {isLast ? (
              <span className="breadcrumb-item current">{label}</span>
            ) : (
              <Link to={route} className="breadcrumb-item">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs

