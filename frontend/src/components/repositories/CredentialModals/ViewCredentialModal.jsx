import { FaTimes, FaCopy, FaExternalLinkAlt } from 'react-icons/fa'
import '../../../styles/components/repositories/Modal.scss'

const ViewCredentialModal = ({ credential, onClose }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{credential.title}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="credential-detail">
            <label>Category</label>
            <span className="category-badge">{credential.category}</span>
          </div>

          <div className="credential-detail">
            <label>URL</label>
            <div className="detail-value">
              <a href={credential.url} target="_blank" rel="noopener noreferrer">
                {credential.url}
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>

          <div className="credential-detail">
            <label>Username</label>
            <div className="detail-value">
              <span>{credential.username}</span>
              <button className="copy-btn" onClick={() => handleCopy(credential.username)}>
                <FaCopy /> Copy
              </button>
            </div>
          </div>

          <div className="credential-detail">
            <label>Password</label>
            <div className="detail-value">
              <span className="password-value">{credential.password}</span>
              <button className="copy-btn" onClick={() => handleCopy(credential.password)}>
                <FaCopy /> Copy
              </button>
            </div>
          </div>

          {credential.notes && (
            <div className="credential-detail">
              <label>Notes</label>
              <p className="notes-value">{credential.notes}</p>
            </div>
          )}

          {credential.tags && credential.tags.length > 0 && (
            <div className="credential-detail">
              <label>Tags</label>
              <div className="tags">
                {credential.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewCredentialModal

