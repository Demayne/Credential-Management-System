import { FaEye, FaEdit, FaTrash, FaCopy } from 'react-icons/fa'
import '../../../styles/components/repositories/CredentialTable.scss'

const CredentialTable = ({ credentials, userRole, onView, onEdit, onDelete }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (credentials.length === 0) {
    return (
      <div className="empty-credentials">
        <p>No credentials found in this repository</p>
      </div>
    )
  }

  return (
    <div className="credential-table-container">
      <table className="credential-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>URL</th>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map(credential => (
            <tr key={credential._id}>
              <td>{credential.title}</td>
              <td>
                <span className="category-badge">{credential.category}</span>
              </td>
              <td>
                <a href={credential.url} target="_blank" rel="noopener noreferrer">
                  {credential.url}
                </a>
              </td>
              <td>
                <div className="username-cell">
                  <span>{credential.username}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(credential.username)}
                    title="Copy username"
                  >
                    <FaCopy />
                  </button>
                </div>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="action-btn view-btn"
                    onClick={() => onView(credential)}
                    title="View"
                  >
                    <FaEye />
                  </button>
                  {(userRole === 'management' || userRole === 'admin') && (
                    <>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEdit(credential)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(credential._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CredentialTable

