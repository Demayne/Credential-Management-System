import { useState } from 'react'
import { FaEye, FaEdit, FaTrash, FaCopy, FaCheckSquare, FaSquare } from 'react-icons/fa'
import EmptyState from '../../common/EmptyState'
import '../../../styles/components/repositories/CredentialTable.scss'

const CredentialTable = ({ credentials = [], userRole, onView, onEdit, onDelete, onBulkDelete }) => {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set())
      setSelectAll(false)
    } else {
      const allIds = credentials && credentials.length > 0 
        ? credentials.map(c => c._id).filter(Boolean)
        : []
      setSelectedIds(new Set(allIds))
      setSelectAll(true)
    }
  }

  const handleSelectOne = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    setSelectAll(newSelected.size === (credentials?.length || 0))
  }

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
      setSelectAll(false)
    }
  }

  if (!credentials || credentials.length === 0) {
    return (
      <EmptyState 
        type="credentials"
        title="No Credentials Found"
        message="Get started by adding your first credential to this repository."
      />
    )
  }

  const canBulkDelete = (userRole === 'management' || userRole === 'admin') && selectedIds.size > 0

  return (
    <div className="credential-table-container">
      {canBulkDelete && (
        <div className="bulk-actions" role="toolbar" aria-label="Bulk actions">
          <span className="bulk-selection-info">
            {selectedIds.size} credential{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <button
            className="bulk-delete-btn"
            onClick={handleBulkDelete}
            aria-label={`Delete ${selectedIds.size} selected credentials`}
          >
            <FaTrash /> Delete Selected
          </button>
        </div>
      )}
      <table className="credential-table" role="table" aria-label="Credentials table">
        <thead>
          <tr>
            {(userRole === 'management' || userRole === 'admin') && (
              <th className="checkbox-column">
                <button
                  className="select-all-btn"
                  onClick={handleSelectAll}
                  aria-label={selectAll ? 'Deselect all' : 'Select all'}
                  title={selectAll ? 'Deselect all' : 'Select all'}
                >
                  {selectAll ? <FaCheckSquare /> : <FaSquare />}
                </button>
              </th>
            )}
            <th scope="col">Title</th>
            <th scope="col">Category</th>
            <th scope="col">URL</th>
            <th scope="col">Username</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(credentials || []).map(credential => {
            const isSelected = selectedIds.has(credential._id)
            return (
              <tr key={credential._id} className={isSelected ? 'selected' : ''}>
                {(userRole === 'management' || userRole === 'admin') && (
                  <td className="checkbox-column" data-label="">
                    <button
                      className="select-checkbox"
                      onClick={() => handleSelectOne(credential._id)}
                      aria-label={`Select ${credential.title}`}
                      aria-checked={isSelected}
                      role="checkbox"
                    >
                      {isSelected ? <FaCheckSquare /> : <FaSquare />}
                    </button>
                  </td>
                )}
                <td data-label="Title">{credential.title}</td>
              <td data-label="Category">
                <span className="category-badge">{credential.category}</span>
              </td>
              <td data-label="URL">
                <a href={credential.url} target="_blank" rel="noopener noreferrer" className="url-link">
                  {credential.url}
                </a>
              </td>
              <td data-label="Username">
                <div className="username-cell">
                  <span>{credential.username}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(credential.username)}
                    title="Copy username"
                    aria-label={`Copy username: ${credential.username}`}
                  >
                    <FaCopy aria-hidden="true" />
                  </button>
                </div>
              </td>
              <td data-label="Actions">
                <div className="action-buttons">
                  <button
                    className="action-btn view-btn"
                    onClick={() => onView(credential)}
                    title="View"
                    aria-label={`View ${credential.title}`}
                  >
                    <FaEye aria-hidden="true" />
                  </button>
                  {(userRole === 'management' || userRole === 'admin') && (
                    <>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEdit(credential)}
                        title="Edit"
                        aria-label={`Edit ${credential.title}`}
                      >
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(credential._id)}
                        title="Delete"
                        aria-label={`Delete ${credential.title}`}
                      >
                        <FaTrash aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default CredentialTable

