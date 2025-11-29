import { FaDatabase } from 'react-icons/fa'
import '../../../styles/components/repositories/RepositoryHeader.scss'

const RepositoryHeader = ({ repository }) => {
  return (
    <div className="repository-header">
      <div className="header-content">
        <FaDatabase className="header-icon" />
        <div className="header-info">
          <h2>{repository.division?.name}</h2>
          <p className="header-code">{repository.division?.code}</p>
          <p className="header-ou">{repository.division?.organizationalUnit?.name}</p>
        </div>
      </div>
      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{repository.credentials?.length || 0}</span>
          <span className="stat-label">Credentials</span>
        </div>
      </div>
    </div>
  )
}

export default RepositoryHeader

