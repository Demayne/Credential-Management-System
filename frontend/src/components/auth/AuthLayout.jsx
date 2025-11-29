import '../../styles/components/auth/AuthLayout.scss'

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">CoolTech</h1>
            <p className="auth-subtitle">Credential Management System</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

