/**
 * AdminPanel Component
 * 
 * Main admin interface for managing users, roles, and organizational assignments.
 * Provides tabbed interface with two main sections:
 * - User Management: View, search, and change user roles
 * - Assignments: Assign/unassign users to Organizational Units and Divisions
 * 
 * Features:
 * - User role management (user, management, admin)
 * - User search and filtering
 * - Organizational structure visualization
 * - Bulk assignment operations
 * - Activity logging for all admin actions
 * 
 * Access: Admin role only (enforced by ProtectedRoute)
 * 
 * @module components/admin/AdminPanel/AdminPanel
 */

import { useState } from 'react'
import UserManagement from './UserManagement/UserManagement'
import AssignmentManager from './AssignmentManager/AssignmentManager'
import '../../../styles/components/admin/AdminPanel.scss'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, roles, and organizational assignments</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'assignments' && <AssignmentManager />}
      </div>
    </div>
  )
}

export default AdminPanel

