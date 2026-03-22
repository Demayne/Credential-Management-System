import { createContext, useContext } from 'react'
import { useRecentRepos } from '../hooks/useRecentRepos'

const RecentReposContext = createContext({ recent: [], addRecentRepo: () => {} })

export const RecentReposProvider = ({ children }) => {
  const { recent, addRecentRepo } = useRecentRepos()
  return (
    <RecentReposContext.Provider value={{ recent, addRecentRepo }}>
      {children}
    </RecentReposContext.Provider>
  )
}

export const useRecentReposContext = () => useContext(RecentReposContext)
