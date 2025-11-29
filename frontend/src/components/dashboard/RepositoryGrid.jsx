import { useState, useEffect } from 'react'
import { FaDatabase, FaChevronRight, FaChevronDown } from 'react-icons/fa'
import LoadingSpinner from '../common/LoadingSpinner'
import '../../styles/components/dashboard/RepositoryGrid.scss'

const RepositoryGrid = ({ divisions, loading, onRepositoryClick }) => {
  const [expandedOUs, setExpandedOUs] = useState({})

  // Group divisions by Organizational Unit (calculate before early returns)
  const groupedByOU = !loading && divisions.length > 0 ? divisions.reduce((acc, division) => {
    const ouId = division.organizationalUnit?._id?.toString() || 'uncategorized'
    const ouName = division.organizationalUnit?.name || 'Uncategorized'
    
    if (!acc[ouId]) {
      acc[ouId] = {
        id: ouId,
        name: ouName,
        code: division.organizationalUnit?.code || '',
        divisions: []
      }
    }
    
    acc[ouId].divisions.push(division)
    return acc
  }, {}) : {}

  const ouGroups = Object.values(groupedByOU)

  // Initialize with first OU expanded by default
  useEffect(() => {
    if (!loading && ouGroups.length > 0 && Object.keys(expandedOUs).length === 0) {
      setExpandedOUs({ [ouGroups[0].id]: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, divisions.length])

  const toggleOU = (ouId) => {
    setExpandedOUs(prev => ({
      ...prev,
      [ouId]: !prev[ouId]
    }))
  }

  // Early returns after all hooks
  if (loading) {
    return <LoadingSpinner />
  }

  if (divisions.length === 0) {
    return (
      <div className="empty-state">
        <FaDatabase className="empty-icon" />
        <p>No repositories available</p>
      </div>
    )
  }

  return (
    <div className="repository-grid">
      <h3 className="section-title">Your Repositories</h3>
      <div className="repository-categories">
        {ouGroups.map(ouGroup => {
          const isExpanded = expandedOUs[ouGroup.id] === true
          return (
            <div key={ouGroup.id} className="ou-category">
              <div 
                className="category-header"
                onClick={() => toggleOU(ouGroup.id)}
              >
                <div className="category-title">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  <h4>{ouGroup.name}</h4>
                  <span className="category-code">{ouGroup.code}</span>
                  <span className="division-count">({ouGroup.divisions.length})</span>
                </div>
              </div>
              {isExpanded && (
                <div className="category-divisions">
                  {ouGroup.divisions.map(division => (
                    <div
                      key={division._id}
                      className="repository-card"
                      onClick={() => onRepositoryClick(division._id)}
                    >
                      <div className="card-header">
                        <FaDatabase className="card-icon" />
                        <h4>{division.name}</h4>
                      </div>
                      <div className="card-body">
                        <p className="card-code">{division.code}</p>
                        {division.description && (
                          <p className="card-description">{division.description}</p>
                        )}
                      </div>
                      <div className="card-footer">
                        <span className="view-link">
                          View Repository <FaChevronRight />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RepositoryGrid

