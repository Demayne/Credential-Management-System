import { FaTrash } from 'react-icons/fa'
import RoleDropdown from './RoleDropdown'
import ConfirmModal from '../../../common/ConfirmModal'
import '../../../../styles/components/admin/UserTable.scss'

const UserTable = ({ users, loading, onRoleChange, onDeleteUser, deleteConfirm, onConfirmDelete, onCancelDelete }) => {
  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  if (users.length === 0) {
    return <div className="empty-state">No users found</div>
  }

  return (
    <>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organizational Units</th>
              <th>Divisions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td data-label="Username">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td data-label="Organizational Units">
                  {user.organizationalUnits?.length > 0 ? (
                    <div className="tags">
                      {user.organizationalUnits.map(ou => (
                        <span key={ou._id} className="tag">{ou.name}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="no-data">None</span>
                  )}
                </td>
                <td data-label="Divisions">
                  {user.divisions?.length > 0 ? (
                    <div className="tags">
                      {user.divisions.map(div => (
                        <span key={div._id} className="tag">{div.name}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="no-data">None</span>
                  )}
                </td>
                <td data-label="Actions" className="actions-cell">
                  <RoleDropdown
                    currentRole={user.role}
                    userId={user._id}
                    onRoleChange={onRoleChange}
                  />
                  <button
                    className="delete-user-btn"
                    onClick={() => onDeleteUser(user._id, user.username)}
                    aria-label={`Delete user ${user.username}`}
                    title="Delete user"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Delete User"
        message={`Permanently delete "${deleteConfirm.username}"? This cannot be undone. Their access to all repositories will be removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  )
}

export default UserTable
