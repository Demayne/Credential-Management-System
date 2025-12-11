/**
 * Keyboard Navigation Utilities
 * 
 * Provides utilities for managing keyboard navigation and focus.
 * Ensures WCAG 2.1 AA compliance for keyboard accessibility.
 * 
 * @module utils/keyboardNavigation
 */

/**
 * Trap focus within a container (for modals, dropdowns)
 * @param {HTMLElement} container - Container element to trap focus within
 * @param {HTMLElement} firstFocusable - First focusable element
 * @param {HTMLElement} lastFocusable - Last focusable element
 */
export const trapFocus = (container, firstFocusable, lastFocusable) => {
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)
  
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Handle Escape key to close modals/dropdowns
 * @param {Function} onClose - Function to call when Escape is pressed
 * @returns {Function} Cleanup function
 */
export const handleEscapeKey = (onClose) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Handle Enter key on interactive elements
 * @param {HTMLElement} element - Element to add listener to
 * @param {Function} callback - Function to call when Enter is pressed
 * @returns {Function} Cleanup function
 */
export const handleEnterKey = (element, callback) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      callback()
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export const getFocusableElements = (container) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(el => {
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
}

/**
 * Set focus to first focusable element in container
 * @param {HTMLElement} container - Container element
 */
export const focusFirstElement = (container) => {
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length > 0) {
    focusableElements[0].focus()
  }
}

/**
 * Skip link component helper - creates skip navigation link
 * Only creates if it doesn't already exist
 */
export const createSkipLink = () => {
  // Check if skip link already exists
  if (document.querySelector('.skip-link')) {
    return
  }

  // Ensure document.body exists
  if (!document.body) {
    return
  }

  try {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-link'
    skipLink.textContent = 'Skip to main content'
    skipLink.setAttribute('aria-label', 'Skip to main content')
    document.body.insertBefore(skipLink, document.body.firstChild)
  } catch (error) {
    console.warn('Failed to create skip link:', error)
  }
}

