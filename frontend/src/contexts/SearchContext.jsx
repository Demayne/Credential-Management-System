/**
 * Search Context
 * 
 * Provides global search functionality for credentials across accessible repositories.
 * Manages search state, results, and navigation to repository views.
 * 
 * Features:
 * - Global search query state
 * - Search results management
 * - Navigation to credential locations
 * - Search UI state (showing/hiding results)
 * 
 * Usage:
 *   const { searchQuery, setSearchQuery, searchResults, navigateToCredential } = useSearch()
 * 
 * @module contexts/SearchContext
 */

import { createContext, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchContext = createContext()

/**
 * Custom Hook: useSearch
 * 
 * Provides access to search context.
 * Must be used within SearchProvider component.
 * 
 * @returns {Object} Search context value
 * @throws {Error} If used outside SearchProvider
 */
export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

/**
 * SearchProvider Component
 * 
 * Provides search context to all child components.
 * Manages search query state, results, and navigation.
 * 
 * @param {React.ReactNode} children - Child components to wrap
 * @returns {JSX.Element} SearchContext.Provider component
 */
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim().length >= 2) {
      setShowResults(true)
    } else {
      setShowResults(false)
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  const navigateToCredential = (credential) => {
    if (credential.division && credential.division._id) {
      navigate(`/repo/${credential.division._id}`)
      clearSearch()
    }
  }

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    showResults,
    setSearchQuery: handleSearch,
    setSearchResults,
    setIsSearching,
    setShowResults,
    clearSearch,
    navigateToCredential
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

