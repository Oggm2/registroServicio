import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'

export default function ResetPassword() {
  const { token } = useParams()
  const [form, setForm] = useState({ new_password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.new_password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (form.new_password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setSubmitting(true)
    try {
      await authAPI.resetPassword({ token, new_password: form.new_password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña')
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
          <p>Establece tu nueva contraseña</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Nueva Contraseña</h2>

          {success ? (
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
                <HiOutlineCheckCircle />
              </div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Contraseña actualizada</h3>
              <p className="text-muted text-sm">
                Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                Ir al Login
              </Link>
            </div>
          ) : (
            <>
              <p className="auth-card-sub">Ingresa tu nueva contraseña</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input
                    className={`form-input ${error ? 'error' : ''}`}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.new_password}
                    onChange={(e) => { setError(''); setForm({ ...form, new_password: e.target.value }) }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input
                    className={`form-input ${error ? 'error' : ''}`}
                    type="password"
                    placeholder="Repite la contraseña"
                    value={form.confirm}
                    onChange={(e) => { setError(''); setForm({ ...form, confirm: e.target.value }) }}
                  />
                </div>
                {error && (
                  <div className="login-error">
                    <HiOutlineExclamationTriangle /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
              </form>
            </>
          )}

          <p className="auth-link">
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
