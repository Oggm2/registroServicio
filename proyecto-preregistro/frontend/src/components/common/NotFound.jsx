import { Link } from 'react-router-dom'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 'var(--space-lg)',
      padding: 'var(--space-xl)',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ fontSize: '3.5rem', color: 'var(--text-muted)' }}>
        <HiOutlineExclamationTriangle />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          Página no encontrada
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          La ruta que buscas no existe.
        </p>
      </div>
      <Link to="/" className="btn btn-primary">
        Ir al inicio
      </Link>
    </div>
  )
}
