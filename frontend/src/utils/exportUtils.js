export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) return ''

  const headers = columns.map(col => col.label || col.key).join(',')

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

export const exportCredentialsJSON = (credentials, filename = 'credentials') => {
  downloadJSON(credentials, filename)
}
