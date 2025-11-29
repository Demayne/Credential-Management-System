import { useState, useEffect } from 'react'
import { useToast } from '../../../../contexts/ToastContext'
import api from '../../../../services/api'
import OUHierarchy from './OUHierarchy'
import UserSearch from './UserSearch'
import LoadingSpinner from '../../../common/LoadingSpinner'
import '../../../../styles/components/admin/AssignmentManager.scss'

const AssignmentManager = () => {
  const { success, error } = useToast()
  const [structure, setStructure] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStructure()
  }, [])

  const loadStructure = async () => {
    try {
      const response = await api.get('/admin/organizational-structure')
      setStructure(response.data.organizationalUnits)
    } catch (err) {
      error('Failed to load organizational structure')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (organizationalUnits, divisions) => {
    if (!selectedUser) {
      error('Please select a user first')
      return
    }

    try {
      await api.post(`/admin/users/${selectedUser._id}/assignments`, {
        organizationalUnits,
        divisions
      })
      success('User assignments updated successfully')
      setSelectedUser(null)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update assignments')
    }
  }

  const handleRemove = async (organizationalUnits, divisions) => {
    if (!selectedUser) {
      error('Please select a user first')
      return
    }

    try {
      await api.delete(`/admin/users/${selectedUser._id}/assignments`, {
        data: { organizationalUnits, divisions }
      })
      success('Assignments removed successfully')
      setSelectedUser(null)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove assignments')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="assignment-manager">
      <div className="assignment-header">
        <h2>User Assignment Manager</h2>
        <p>Assign or remove users from organizational units and divisions</p>
      </div>

      <div className="assignment-content">
        <div className="assignment-sidebar">
          <UserSearch
            onUserSelect={setSelectedUser}
            selectedUser={selectedUser}
          />
        </div>

        <div className="assignment-main">
          {selectedUser ? (
            <OUHierarchy
              structure={structure}
              selectedUser={selectedUser}
              onAssign={handleAssign}
              onRemove={handleRemove}
            />
          ) : (
            <div className="select-user-prompt">
              <p>Select a user to manage their assignments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignmentManager

