import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { serviciosAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const [step, setStep] = useState(1)
  const [carreras, setCarreras] = useState([])
  const [form, setForm] = useState({
    username: '',
    password: '',
    password2: '',
    nombre_completo: '',
    matricula: '',
    carrera_id: '',
    celular: '',
    correo_alterno: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Cargar carreras disponibles
    fetch('/api/carreras')
      .then(r => r.ok ? r.json() : [])
      .then(setCarreras)
      .catch(() => {})
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validateStep1 = () => {
    if (!form.username || !form.password || !form.password2) {
      toast.error('Completa todos los campos')
      return false
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (form.password !== form.password2) {
      toast.error('Las contraseñas no coinciden')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre_completo || !form.matricula || !form.carrera_id) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSubmitting(true)
    try {
      await register({
        username: form.username,
        password: form.password,
        nombre_completo: form.nombre_completo,
        matricula: form.matricula,
        carrera_id: parseInt(form.carrera_id),
        celular: form.celular,
        correo_alterno: form.correo_alterno,
      })
      navigate('/feria', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">PR</div>
          <h1>Crear Cuenta</h1>
          <p>Regístrate para acceder al sistema de pre-registro y participar en las ferias académicas.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>{step === 1 ? 'Datos de Acceso' : 'Información Personal'}</h2>
          <p className="auth-card-sub">
            Paso {step} de 2 — {step === 1 ? 'Crea tu cuenta' : 'Completa tu perfil'}
          </p>

          {/* Progress bar */}
          <div style={{
            display: 'flex', gap: '6px', marginBottom: 'var(--space-xl)',
          }}>
            <div style={{
              flex: 1, height: 3, borderRadius: 2,
              background: 'var(--amber-500)',
            }} />
            <div style={{
              flex: 1, height: 3, borderRadius: 2,
              background: step === 2 ? 'var(--amber-500)' : 'var(--gray-200)',
              transition: 'background 0.3s',
            }} />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre de usuario</label>
                  <input className="form-input" type="text" placeholder="ej. juan.perez"
                    value={form.username} onChange={set('username')} autoComplete="username" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={set('password')} autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input className="form-input" type="password" placeholder="Repite tu contraseña"
                    value={form.password2} onChange={set('password2')} autoComplete="new-password" />
                </div>
                <button type="button" className="btn btn-primary btn-lg w-full" onClick={handleNext}>
                  Continuar
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input className="form-input" type="text" placeholder="Juan Pérez López"
                    value={form.nombre_completo} onChange={set('nombre_completo')} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Matrícula *</label>
                    <input className="form-input" type="text" placeholder="A12345678"
                      value={form.matricula} onChange={set('matricula')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carrera *</label>
                    <select className="form-select" value={form.carrera_id} onChange={set('carrera_id')}>
                      <option value="">Selecciona...</option>
                      {carreras.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Celular</label>
                    <input className="form-input" type="tel" placeholder="614 123 4567"
                      value={form.celular} onChange={set('celular')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Alterno</label>
                    <input className="form-input" type="email" placeholder="correo@ejemplo.com"
                      value={form.correo_alterno} onChange={set('correo_alterno')} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)}>
                    Atrás
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? 'Registrando...' : 'Crear Cuenta'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
