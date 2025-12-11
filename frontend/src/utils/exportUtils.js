/**
 * Export Utilities
 * 
 * Provides utilities for exporting data to various formats (CSV, JSON).
 * 
 * @module utils/exportUtils
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Array of column definitions [{key, label}]
 * @returns {string} CSV string
 */
export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) return ''

  // Create header row
  const headers = columns.map(col => col.label || col.key).join(',')
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key] || ''
      // Escape commas and quotes in CSV
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(',')
  })

  return [headers, ...rows].join('\n')
}

/**
 * Download data as CSV file
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Filename (without extension)
 */
export const downloadCSV = (data, columns, filename = 'export') => {
  const csv = convertToCSV(data, columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download data as JSON file
 * @param {Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export const downloadJSON = (data, filename = 'export') => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export credentials to CSV
 * @param {Array} credentials - Credentials array
 * @param {string} filename - Optional filename
 */
export const exportCredentialsCSV = (credentials, filename = 'credentials') => {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'url', label: 'URL' },
    { key: 'username', label: 'Username' },
    { key: 'notes', label: 'Notes' }
  ]
  
  downloadCSV(credentials, columns, filename)
}

/**
 * Export credentials to JSON
 * @param {Array} credentials - Credentials array
 * @param {string} filename - Optional filename
 */
export const exportCredentialsJSON = (credentials, filename = 'credentials') => {
  downloadJSON(credentials, filename)
}

