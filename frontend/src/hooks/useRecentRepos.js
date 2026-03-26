import { useState, useCallback, useEffect } from 'react'

const MAX_RECENT = 5

function storageKey(userId) {
  return userId ? `cooltech_recent_repos_${userId}` : null
}

function readRecent(userId) {
  const key = storageKey(userId)
  if (!key) return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export function useRecentRepos(userId) {
  const [recent, setRecent] = useState(() => readRecent(userId))

  // Reset when user changes (login/logout)
  useEffect(() => {
    setRecent(readRecent(userId))
  }, [userId])

  const addRecentRepo = useCallback((repo) => {
    const key = storageKey(userId)
    if (!key) return
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== repo.id)
      const next = [{ ...repo, visitedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [userId])

  return { recent, addRecentRepo }
}
