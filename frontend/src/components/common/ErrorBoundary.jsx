/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Features:
 * - Catches rendering errors, lifecycle errors, and errors in constructors
 * - Provides user-friendly error messages
 * - Logs errors for debugging
 * - Allows recovery with retry functionality
 * 
 * @module components/common/ErrorBoundary
 */

import React from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'
import '../../styles/components/common/ErrorBoundary.scss'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Here you could log to an error reporting service like Sentry
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h2>Something went wrong</h2>
            <p className="error-message">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {this.state.error && (
              <details className="error-details">
                <summary>Error Details {import.meta.env.DEV ? '(Development)' : '(Click to view)'}</summary>
                <pre className="error-stack">
                  <strong>Error:</strong> {this.state.error?.toString() || 'Unknown error'}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <br /><br />
                      <strong>Component Stack:</strong>
                      <br />
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
            <div className="error-actions">
              <button 
                onClick={this.handleReset}
                className="retry-button"
                aria-label="Retry loading the page"
              >
                <FaRedo /> Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="home-button"
                aria-label="Go to home page"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

