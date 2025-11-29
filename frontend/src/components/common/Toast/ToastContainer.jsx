import { useToast } from '../../../contexts/ToastContext'
import Toast from './Toast'
import '../../../styles/components/common/Toast.scss'

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastContainer

