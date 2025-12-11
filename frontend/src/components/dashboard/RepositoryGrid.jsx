import { useState, useEffect } from 'react'
import { FaChevronRight, FaChevronDown, FaDatabase } from 'react-icons/fa'
import SkeletonLoader from '../common/SkeletonLoader'
import EmptyState from '../common/EmptyState'
import '../../styles/components/dashboard/RepositoryGrid.scss'

const RepositoryGrid = ({ divisions = [], loading, onRepositoryClick }) => {
  const [expandedOUs, setExpandedOUs] = useState({})

  // Group divisions by Organizational Unit (calculate before early returns)
  const groupedByOU = !loading && divisions && divisions.length > 0 ? divisions.reduce((acc, division) => {
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
    return <SkeletonLoader type="grid" count={6} />
  }

  if (!divisions || divisions.length === 0) {
    return (
      <EmptyState 
        type="repositories"
        title="No Repositories Available"
        message="You don't have access to any repositories yet. Contact an administrator to get assigned to organizational units and divisions."
      />
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
              <button
                className="category-header"
                onClick={() => toggleOU(ouGroup.id)}
                aria-expanded={isExpanded}
                aria-controls={`ou-${ouGroup.id}`}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${ouGroup.name} repositories`}
              >
                <div className="category-title">
                  {isExpanded ? <FaChevronDown aria-hidden="true" /> : <FaChevronRight aria-hidden="true" />}
                  <h4>{ouGroup.name}</h4>
                  <span className="category-code" aria-label={`Code: ${ouGroup.code}`}>{ouGroup.code}</span>
                  <span className="division-count" aria-label={`${ouGroup.divisions.length} divisions`}>
                    ({ouGroup.divisions.length})
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div 
                  id={`ou-${ouGroup.id}`}
                  className="category-divisions"
                  role="region"
                  aria-label={`Repositories for ${ouGroup.name}`}
                >
                  {ouGroup.divisions.map(division => (
                    <button
                      key={division._id}
                      className="repository-card"
                      onClick={() => onRepositoryClick(division._id)}
                      aria-label={`View ${division.name} repository`}
                      type="button"
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
                          View Repository <FaChevronRight aria-hidden="true" />
                        </span>
                      </div>
                    </button>
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

