/**
 * Dashboard Component
 * 
 * Main dashboard page displaying user's accessible credential repositories.
 * Shows welcome message and categorized repository grid grouped by Organizational Unit.
 * 
 * Features:
 * - Loads user's accessible repositories on mount
 * - Groups repositories by Organizational Unit
 * - Handles loading and error states
 * - Navigation to repository views
 * 
 * @module components/dashboard/Dashboard
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import WelcomeCard from './WelcomeCard'
import RepositoryGrid from './RepositoryGrid'
import '../../styles/components/dashboard/Dashboard.scss'

const Dashboard = () => {
  const { user } = useAuth()
  const { error } = useToast()
  const navigate = useNavigate()
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      const response = await api.get('/repositories/accessible')
      if (response.data.success) {
        setDivisions(response.data.divisions || [])
      } else {
        error(response.data.message || 'Failed to load repositories')
        setDivisions([])
      }
    } catch (err) {
      console.error('Load repositories error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load repositories'
      error(errorMessage)
      setDivisions([])
    } finally {
      setLoading(false)
    }
  }

  const handleRepositoryClick = (divisionId) => {
    navigate(`/repo/${divisionId}`)
  }

  return (
    <div className="dashboard">
      <WelcomeCard user={user} />
      <RepositoryGrid
        divisions={divisions}
        loading={loading}
        onRepositoryClick={handleRepositoryClick}
      />
    </div>
  )
}

export default Dashboard

