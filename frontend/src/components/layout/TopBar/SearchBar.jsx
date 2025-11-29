import { useState, useEffect, useRef } from 'react'
import { FaSearch, FaTimes, FaExternalLinkAlt } from 'react-icons/fa'
import { useSearch } from '../../../contexts/SearchContext'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'
import '../../../styles/components/layout/SearchBar.scss'

const SearchBar = () => {
  const { searchQuery, searchResults, isSearching, showResults, setSearchQuery, setSearchResults, setIsSearching, setShowResults, clearSearch, navigateToCredential } = useSearch()
  const { user } = useAuth()
  const [debounceTimer, setDebounceTimer] = useState(null)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowResults])

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        performSearch(searchQuery)
      }, 300) // Debounce 300ms
      setDebounceTimer(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [searchQuery])

  const performSearch = async (query) => {
    try {
      const response = await api.get('/repositories/search', {
        params: { q: query }
      })
      
      if (response.data.success) {
        setSearchResults(response.data.credentials || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim().length >= 2) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const handleClear = () => {
    clearSearch()
    if (searchRef.current) {
      searchRef.current.focus()
    }
  }

  const handleCredentialClick = (credential) => {
    navigateToCredential(credential)
  }

  return (
    <div className="search-bar-container">
      <div className="search-bar" ref={searchRef}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search credentials..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
              setShowResults(true)
            }
          }}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results" ref={resultsRef}>
          {isSearching ? (
            <div className="search-loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
              </div>
              <div className="search-results-list">
                {searchResults.map((credential) => (
                  <div
                    key={credential._id}
                    className="search-result-item"
                    onClick={() => handleCredentialClick(credential)}
                  >
                    <div className="result-title">
                      {credential.title}
                      <FaExternalLinkAlt className="result-link-icon" />
                    </div>
                    <div className="result-details">
                      <span className="result-category">{credential.category}</span>
                      <span className="result-division">
                        {credential.division?.name} ({credential.division?.code})
                      </span>
                    </div>
                    <div className="result-meta">
                      <span className="result-username">{credential.username}</span>
                      {credential.url && (
                        <span className="result-url">{credential.url}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : searchQuery.trim().length >= 2 ? (
            <div className="search-no-results">No credentials found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar

