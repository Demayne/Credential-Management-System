import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import '../../../styles/components/repositories/Modal.scss'

const EditCredentialModal = ({ credential, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    url: '',
    username: '',
    password: '',
    notes: ''
  })

  useEffect(() => {
    if (credential) {
      setFormData({
        title: credential.title || '',
        category: credential.category || 'Other',
        url: credential.url || '',
        username: credential.username || '',
        password: '', // Don't pre-fill password for security
        notes: credential.notes || ''
      })
    }
  }, [credential])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Only send fields that have changed
    const updatedData = { ...formData }
    if (!updatedData.password) {
      delete updatedData.password
    }
    onSave(updatedData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Credential</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="WordPress">WordPress</option>
              <option value="Server">Server</option>
              <option value="Database">Database</option>
              <option value="Financial">Financial</option>
              <option value="API">API</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Credential
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCredentialModal

