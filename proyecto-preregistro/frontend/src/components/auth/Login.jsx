import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Completa todos los campos')
      return
    }
    setSubmitting(true)
    try {
      const user = await login(form.username, form.password)
      const dest = user.rol === 'Estudiante' ? '/feria' :
                   user.rol === 'Becario' ? '/buscar-estudiante' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas')
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
          <p>Gestiona tus pre-registros a proyectos académicos y controla tu asistencia a ferias de forma sencilla.</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon"><HiOutlineAcademicCap /></div>
            <span>Registro rápido a ferias académicas</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><HiOutlineClipboardDocumentList /></div>
            <span>Pre-registro a servicios y proyectos</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><HiOutlineChartBarSquare /></div>
            <span>Dashboard con estadísticas en tiempo real</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><HiOutlineShieldCheck /></div>
            <span>Control de asistencia digitalizado</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Iniciar Sesión</h2>
          <p className="auth-card-sub">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="text"
                placeholder="Tu nombre de usuario"
                value={form.username}
                onChange={(e) => { setError(''); setForm({ ...form, username: e.target.value }) }}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={(e) => { setError(''); setForm({ ...form, password: e.target.value }) }}
                autoComplete="current-password"
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
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="auth-link" style={{ marginTop: 'var(--space-md)' }}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </p>
          <p className="auth-link">
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
