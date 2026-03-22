import { FaDatabase, FaDownload } from 'react-icons/fa'
import { exportCredentialsCSV, exportCredentialsJSON } from '../../../utils/exportUtils'
import { CATEGORY_COLORS } from '../../../utils/categoryColors'
import '../../../styles/components/repositories/RepositoryHeader.scss'

const RepositoryHeader = ({ repository = {}, onExport }) => {
  const credentials = repository?.credentials || []
  const categoryCount = credentials.reduce((acc, c) => {
    const cat = c.category || 'Other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})
  const handleExportCSV = () => {
    try {
      const creds = repository?.credentials || []
      if (creds.length > 0) {
        exportCredentialsCSV(creds, `${repository?.division?.code || 'credentials'}-export`)
        if (onExport) onExport('csv')
      }
    } catch (error) {
      console.error('Export CSV failed:', error)
    }
  }

  const handleExportJSON = () => {
    try {
      const creds = repository?.credentials || []
      if (creds.length > 0) {
        exportCredentialsJSON(creds, `${repository?.division?.code || 'credentials'}-export`)
        if (onExport) onExport('json')
      }
    } catch (error) {
      console.error('Export JSON failed:', error)
    }
  }

  return (
    <div className="repository-header">
      <div className="header-content">
        <FaDatabase className="header-icon" aria-hidden="true" />
        <div className="header-info">
          <h2>{repository?.division?.name || 'Repository'}</h2>
          <p className="header-code">{repository?.division?.code || ''}</p>
          <p className="header-ou">{repository?.division?.organizationalUnit?.name || ''}</p>
        </div>
      </div>
      <div className="header-actions">
        {repository?.credentials && Array.isArray(repository.credentials) && repository.credentials.length > 0 && (
          <div className="export-dropdown">
            <button 
              className="export-btn"
              aria-label="Export credentials"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <FaDownload /> Export
            </button>
            <div className="export-menu" role="menu">
              <button onClick={handleExportCSV} role="menuitem" aria-label="Export as CSV">
                Export as CSV
              </button>
              <button onClick={handleExportJSON} role="menuitem" aria-label="Export as JSON">
                Export as JSON
              </button>
            </div>
          </div>
        )}
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{credentials.length}</span>
            <span className="stat-label">Credentials</span>
          </div>
          {Object.keys(categoryCount).length > 0 && (
            <div className="stat-categories" aria-label="Credentials by category">
              {Object.entries(categoryCount).map(([cat, count]) => (
                <span
                  key={cat}
                  className="cat-pill"
                  style={{
                    color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
                    background: `${CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other}1a`,
                    borderColor: `${CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other}33`,
                  }}
                  title={`${count} ${cat}`}
                >
                  {count} {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RepositoryHeader

