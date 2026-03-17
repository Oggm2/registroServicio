import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          background: '#f8f9fc',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#003366' }}>Algo salió mal</h1>
          <p style={{ color: '#8892a6', margin: 0, textAlign: 'center' }}>
            Ocurrió un error inesperado. Por favor recarga la página.
          </p>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0056b8',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
