import { useState, useEffect, useRef } from 'react'
import { useToast } from '../../../../contexts/ToastContext'
import api from '../../../../services/api'
import '../../../../styles/components/admin/UserSearch.scss'

const UserSearch = ({ onUserSelect, selectedUser }) => {
  const { error } = useToast()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const searchContainerRef = useRef(null)

  useEffect(() => {
    if (search.length > 2) {
      loadUsers()
    } else {
      setUsers([])
    }
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearch('')
      }
    }

    if (search.length > 2) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [search])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/users', {
        params: { search, limit: 10 }
      })
      setUsers(response.data.users)
    } catch (err) {
      error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user) => {
    onUserSelect(user)
    setSearch('')
  }

  return (
    <div className="user-search" ref={searchContainerRef}>
      <h3>Search User</h3>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search.length > 2 && (
          <div className="search-results">
            {loading ? (
              <div className="loading">Searching...</div>
            ) : users.length > 0 ? (
              users.map(user => (
                <div
                  key={user._id}
                  className="user-result"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="result-name">{user.username}</div>
                  <div className="result-email">{user.email}</div>
                </div>
              ))
            ) : (
              <div className="no-results">No users found</div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="selected-user">
          <h4>Selected User</h4>
          <div className="user-card">
            <div className="user-name">{selectedUser.username}</div>
            <div className="user-email">{selectedUser.email}</div>
            <div className={`user-role role-${selectedUser.role}`}>
              {selectedUser.role}
            </div>
            <button
              className="clear-btn"
              onClick={() => onUserSelect(null)}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSearch

