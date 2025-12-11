/**
 * SkeletonLoader Component
 * 
 * Provides skeleton loading states for better perceived performance.
 * Shows placeholder content while data is loading instead of blank screens.
 * 
 * @module components/common/SkeletonLoader
 */

import '../../styles/components/common/SkeletonLoader.scss'

const SkeletonLoader = ({ type = 'default', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return (
          <div className="skeleton-table">
            <div className="skeleton-table-header">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-cell skeleton-header-cell" />
              ))}
            </div>
            {[...Array(count)].map((_, rowIndex) => (
              <div key={rowIndex} className="skeleton-table-row">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-cell" />
                ))}
              </div>
            ))}
          </div>
        )

      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-card-header">
              <div className="skeleton-avatar" />
              <div className="skeleton-text-group">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-subtitle" />
              </div>
            </div>
            <div className="skeleton-card-body">
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-short" />
            </div>
            <div className="skeleton-card-footer">
              <div className="skeleton-button" />
            </div>
          </div>
        )

      case 'list':
        return (
          <div className="skeleton-list">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="skeleton-list-item">
                <div className="skeleton-avatar skeleton-small" />
                <div className="skeleton-text-group">
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              </div>
            ))}
          </div>
        )

      case 'grid':
        return (
          <div className="skeleton-grid">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-card-header">
                  <div className="skeleton-icon" />
                  <div className="skeleton-line skeleton-title" />
                </div>
                <div className="skeleton-card-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div className="skeleton-default">
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-short" />
            <div className="skeleton-line" />
          </div>
        )
    }
  }

  return <div className="skeleton-loader">{renderSkeleton()}</div>
}

export default SkeletonLoader

