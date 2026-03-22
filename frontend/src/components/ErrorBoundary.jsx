import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={styles.heading}>Something went wrong</h2>
            <p style={styles.subtext}>
              An unexpected error occurred. The issue has been logged.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={styles.errorDetail}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
            <button style={styles.button} onClick={this.handleReset}>
              Return to dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1117',
    padding: '1rem',
  },
  card: {
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  iconWrap: {
    marginBottom: '1.25rem',
    display: 'flex',
    justifyContent: 'center',
  },
  heading: {
    color: '#f1f5f9',
    fontSize: '1.25rem',
    fontWeight: '500',
    margin: '0 0 0.5rem',
  },
  subtext: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    margin: '0 0 1.5rem',
  },
  errorDetail: {
    background: '#0f1117',
    border: '1px solid #2d3148',
    borderRadius: '6px',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#f87171',
    textAlign: 'left',
    overflowX: 'auto',
    marginBottom: '1.5rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  button: {
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};

export default ErrorBoundary;
