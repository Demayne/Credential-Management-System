import { useState, useCallback } from 'react'

const STORAGE_KEY = 'cooltech_recent_repos'
const MAX_RECENT = 5

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentRepos() {
  const [recent, setRecent] = useState(readRecent)

  const addRecentRepo = useCallback((repo) => {
    // repo: { id, name }
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== repo.id)
      const next = [{ ...repo, visitedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { recent, addRecentRepo }
}
