import { useState, useEffect } from 'react'
import { useToast } from '../../../../contexts/ToastContext'
import api from '../../../../services/api'
import UserTable from './UserTable'
import '../../../../styles/components/admin/UserManagement.scss'

const UserManagement = () => {
  const { success, error } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userId: null, username: '' })

  useEffect(() => {
    loadUsers()
  }, [search, roleFilter])

  const loadUsers = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const response = await api.get('/admin/users', { params })
      setUsers(response.data.users)
    } catch (err) {
      error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      success('User role updated successfully')
      loadUsers()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user role')
    }
  }

  const requestDeleteUser = (userId, username) => {
    setDeleteConfirm({ open: true, userId, username })
  }

  const handleDeleteUser = async () => {
    const { userId, username } = deleteConfirm
    setDeleteConfirm({ open: false, userId: null, username: '' })
    try {
      await api.delete(`/admin/users/${userId}`)
      success(`User "${username}" deleted successfully`)
      loadUsers()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, userId: null, username: '' })
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="filters">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="management">Management</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onRoleChange={handleRoleChange}
        onDeleteUser={requestDeleteUser}
        deleteConfirm={deleteConfirm}
        onConfirmDelete={handleDeleteUser}
        onCancelDelete={cancelDelete}
      />
    </div>
  )
}

export default UserManagement
