export const CATEGORY_COLORS = {
  WordPress: '#0ea5e9',
  Server:    '#f97316',
  Database:  '#10b981',
  Financial: '#eab308',
  API:       '#a855f7',
  Other:     '#64748b',
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
}
