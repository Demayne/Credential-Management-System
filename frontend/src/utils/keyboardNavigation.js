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

export const focusFirstElement = (container) => {
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length > 0) {
    focusableElements[0].focus()
  }
}

export const createSkipLink = () => {
  if (document.querySelector('.skip-link')) {
    return
  }

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
