import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import '../../../styles/components/common/Toast.scss'

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    warning: <FaExclamationCircle />,
    info: <FaInfoCircle />
  }

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  )
}

export default Toast

