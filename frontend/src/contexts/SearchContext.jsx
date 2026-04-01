import { createContext, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchContext = createContext()

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

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

