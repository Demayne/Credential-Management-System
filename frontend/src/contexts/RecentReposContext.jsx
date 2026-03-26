import { createContext, useContext } from 'react'
import { useRecentRepos } from '../hooks/useRecentRepos'
import { useAuth } from './AuthContext'

const RecentReposContext = createContext({ recent: [], addRecentRepo: () => {} })

export const RecentReposProvider = ({ children }) => {
  const { user } = useAuth()
  const { recent, addRecentRepo } = useRecentRepos(user?._id)
  return (
    <RecentReposContext.Provider value={{ recent, addRecentRepo }}>
      {children}
    </RecentReposContext.Provider>
  )
}

export const useRecentReposContext = () => useContext(RecentReposContext)
