import { useState, useEffect } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import '../../../../styles/components/admin/OUHierarchy.scss'

const OUHierarchy = ({ structure, selectedUser, onAssign, onRemove }) => {
  const [selectedOUs, setSelectedOUs] = useState([])
  const [selectedDivisions, setSelectedDivisions] = useState([])
  const [expandedOUs, setExpandedOUs] = useState({})

  useEffect(() => {
    // Initialize with user's current assignments
    if (selectedUser) {
      setSelectedOUs(selectedUser.organizationalUnits?.map(ou => ou._id) || [])
      setSelectedDivisions(selectedUser.divisions?.map(div => div._id) || [])
    }
  }, [selectedUser])

  const toggleOU = (ouId) => {
    setExpandedOUs(prev => ({
      ...prev,
      [ouId]: !prev[ouId]
    }))
  }

  const toggleOUSelection = (ouId) => {
    setSelectedOUs(prev =>
      prev.includes(ouId)
        ? prev.filter(id => id !== ouId)
        : [...prev, ouId]
    )
  }

  const toggleDivisionSelection = (divId) => {
    setSelectedDivisions(prev =>
      prev.includes(divId)
        ? prev.filter(id => id !== divId)
        : [...prev, divId]
    )
  }

  const handleAssign = () => {
    onAssign(selectedOUs, selectedDivisions)
  }

  const handleRemove = () => {
    onRemove(selectedOUs, selectedDivisions)
  }

  return (
    <div className="ou-hierarchy">
      <div className="hierarchy-header">
        <h3>Organizational Structure</h3>
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleAssign}>
            Assign Selected
          </button>
          <button className="btn-secondary" onClick={handleRemove}>
            Remove Selected
          </button>
        </div>
      </div>

      <div className="hierarchy-tree">
        {structure?.map(ou => (
          <div key={ou._id} className="ou-node">
            <div className="ou-header">
              <button
                className="expand-btn"
                onClick={() => toggleOU(ou._id)}
              >
                {expandedOUs[ou._id] ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              <label className="ou-checkbox">
                <input
                  type="checkbox"
                  checked={selectedOUs.includes(ou._id)}
                  onChange={() => toggleOUSelection(ou._id)}
                />
                <span className="ou-name">{ou.name}</span>
                <span className="ou-code">{ou.code}</span>
              </label>
            </div>

            {expandedOUs[ou._id] && ou.divisions && (
              <div className="divisions-list">
                {ou.divisions.map(div => (
                  <label key={div._id} className="division-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDivisions.includes(div._id)}
                      onChange={() => toggleDivisionSelection(div._id)}
                    />
                    <span className="division-name">{div.name}</span>
                    <span className="division-code">{div.code}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OUHierarchy

