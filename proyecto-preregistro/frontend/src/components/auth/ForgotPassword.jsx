import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { HiOutlineEnvelope } from 'react-icons/hi2'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">PR</div>
          <h1>Sistema de Pre-Registro</h1>
          <p>Recupera el acceso a tu cuenta</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Recuperar Contraseña</h2>
          <p className="auth-card-sub">
            Ingresa tu correo alterno registrado y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {sent ? (
            <div style={{
              padding: 'var(--space-xl)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                background: 'var(--success-soft)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-lg)', fontSize: '1.5rem',
                color: 'var(--teal-600)',
              }}>
                <HiOutlineEnvelope />
              </div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Revisa tu correo</h3>
              <p className="text-muted text-sm">
                Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Correo Alterno</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="tu-correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar Enlace'}
              </button>
            </form>
          )}

          <p className="auth-link">
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
