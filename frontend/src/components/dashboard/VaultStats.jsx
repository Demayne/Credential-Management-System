import { FaDatabase, FaBuilding, FaLayerGroup } from 'react-icons/fa'
import '../../styles/components/dashboard/VaultStats.scss'

const VaultStats = ({ divisions = [], loading = false }) => {
  const totalRepos = divisions.length

  const ouMap = divisions.reduce((acc, d) => {
    const id = d.organizationalUnit?._id
    if (id) acc[id] = true
    return acc
  }, {})
  const totalOUs = Object.keys(ouMap).length
  const avgPerOU = totalOUs > 0 ? Math.round(totalRepos / totalOUs) : 0

  const stats = [
    {
      icon: <FaDatabase aria-hidden="true" />,
      value: loading ? '—' : totalRepos,
      label: 'Repositories',
      accent: '#6366f1',
    },
    {
      icon: <FaBuilding aria-hidden="true" />,
      value: loading ? '—' : totalOUs,
      label: 'Org Units',
      accent: '#06b6d4',
    },
    {
      icon: <FaLayerGroup aria-hidden="true" />,
      value: loading ? '—' : avgPerOU,
      label: 'Avg per OU',
      accent: '#10b981',
    },
  ]

  return (
    <div className="vault-stats" role="region" aria-label="Vault overview">
      {stats.map(stat => (
        <div key={stat.label} className="vault-stat-card">
          <span className="stat-icon" style={{ color: stat.accent }}>
            {stat.icon}
          </span>
          <div className="stat-body">
            <span className="stat-value" style={{ color: stat.accent }}>
              {stat.value}
            </span>
            <span className="stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default VaultStats
