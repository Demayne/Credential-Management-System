/**
 * RepositoryView Component
 * 
 * Displays a division's credential repository with full CRUD operations.
 * Shows credentials in a table format with actions based on user role.
 * 
 * Features:
 * - View all credentials in a division's repository
 * - Add new credentials (user, management, admin)
 * - Edit credentials (management, admin)
 * - Delete credentials (management, admin)
 * - View credential details with decrypted password
 * - Access tracking and logging
 * 
 * Role Permissions:
 * - user: Read and add credentials
 * - management: Read, add, and update credentials
 * - admin: Full access (read, add, update, delete)
 * 
 * @module components/repositories/RepositoryView/RepositoryView
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { usePageTitle } from '../../../contexts/PageTitleContext'
import { useRecentReposContext } from '../../../contexts/RecentReposContext'
import api from '../../../services/api'
import RepositoryHeader from './RepositoryHeader'
import CredentialTable from './CredentialTable'
import AddCredentialModal from '../CredentialModals/AddCredentialModal'
import EditCredentialModal from '../CredentialModals/EditCredentialModal'
import ViewCredentialModal from '../CredentialModals/ViewCredentialModal'
import ConfirmModal from '../../common/ConfirmModal'
import SkeletonLoader from '../../common/SkeletonLoader'
import '../../../styles/components/repositories/RepositoryView.scss'

const RepositoryView = () => {
  const { divisionId } = useParams()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [repository, setRepository] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null })
  const { setPageTitle } = usePageTitle()
  const { addRecentRepo } = useRecentReposContext()

  useEffect(() => {
    loadRepository()
  }, [divisionId])

  const loadRepository = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/repositories/${divisionId}`)
      if (response.data.success && response.data.repository) {
        setRepository(response.data.repository)
        const divName = response.data.repository.division?.name || 'Repository'
        setPageTitle(divName)
        addRecentRepo({ id: divisionId, name: divName })
      } else {
        error(response.data.message || 'Failed to load repository')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load repository'
      console.error('Load repository error:', err)
      error(errorMessage)
      setRepository(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredential = async (credentialData) => {
    try {
      await api.post(`/repositories/${divisionId}/credentials`, credentialData)
      success('Credential added successfully')
      setShowAddModal(false)
      loadRepository()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add credential')
    }
  }

  const handleEditCredential = async (credentialId, credentialData) => {
    try {
      await api.put(`/repositories/credentials/${credentialId}`, credentialData)
      success('Credential updated successfully')
      setShowEditModal(false)
      setSelectedCredential(null)
      loadRepository()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update credential')
    }
  }

  const handleDeleteCredential = (credentialId) => {
    setConfirmState({
      open: true,
      title: 'Delete Credential',
      message: 'This credential will be permanently deleted. This action cannot be undone.',
      onConfirm: async () => {
        setConfirmState(s => ({ ...s, open: false }))
        try {
          await api.delete(`/repositories/credentials/${credentialId}`)
          success('Credential deleted successfully')
          loadRepository()
        } catch (err) {
          error(err.response?.data?.message || 'Failed to delete credential')
        }
      },
    })
  }

  const handleBulkDelete = (credentialIds) => {
    setConfirmState({
      open: true,
      title: `Delete ${credentialIds.length} Credential${credentialIds.length !== 1 ? 's' : ''}`,
      message: `${credentialIds.length} credential${credentialIds.length !== 1 ? 's' : ''} will be permanently deleted. This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmState(s => ({ ...s, open: false }))
        try {
          const results = await Promise.allSettled(
            credentialIds.map(id => api.delete(`/repositories/credentials/${id}`))
          )
          const succeeded = results.filter(r => r.status === 'fulfilled').length
          const failed = results.filter(r => r.status === 'rejected').length
          if (succeeded > 0) {
            success(`${succeeded} credential(s) deleted successfully`)
            loadRepository()
          }
          if (failed > 0) {
            error(`${failed} credential(s) could not be deleted`)
          }
        } catch (err) {
          error(err.response?.data?.message || 'Failed to delete credentials')
        }
      },
    })
  }

  const handleViewCredential = async (credential) => {
    try {
      const response = await api.get(`/repositories/credentials/${credential._id}/access`)
      setSelectedCredential(response.data.credential)
      setShowViewModal(true)
    } catch (err) {
      error('Failed to load credential details')
    }
  }

  if (loading) {
    return <SkeletonLoader type="table" count={5} />
  }

  if (!repository) {
    return <div className="error-state">Repository not found</div>
  }

  return (
    <div className="repository-view">
      <RepositoryHeader 
        repository={repository}
        onExport={(format) => {
          success(`Credentials exported as ${format.toUpperCase()} successfully`)
        }}
      />
      <CredentialTable
        credentials={repository.credentials || []}
        userRole={user?.role}
        onView={handleViewCredential}
        onEdit={(cred) => {
          setSelectedCredential(cred)
          setShowEditModal(true)
        }}
        onDelete={handleDeleteCredential}
        onBulkDelete={handleBulkDelete}
      />
      
      {user?.role && ['user', 'management', 'admin'].includes(user.role) && (
        <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add new credential">
          + Add Credential
        </button>
      )}

      {showAddModal && (
        <AddCredentialModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCredential}
        />
      )}

      {showEditModal && selectedCredential && (
        <EditCredentialModal
          credential={selectedCredential}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCredential(null)
          }}
          onSave={(data) => handleEditCredential(selectedCredential._id, data)}
        />
      )}

      {showViewModal && selectedCredential && (
        <ViewCredentialModal
          credential={selectedCredential}
          onClose={() => {
            setShowViewModal(false)
            setSelectedCredential(null)
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Delete"
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(s => ({ ...s, open: false }))}
      />
    </div>
  )
}

export default RepositoryView

