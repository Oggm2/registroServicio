import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { serviciosAPI } from '../../services/api'
import toast from 'react-hot-toast'

const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  celular: /^\d{10}$/,
  matricula: /^[Aa]\d{8}$/,
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [carreras, setCarreras] = useState([])
  const [form, setForm] = useState({
    username: '', password: '', password2: '',
    nombre_completo: '', matricula: '', carrera_id: '',
    celular: '', correo_alterno: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/carreras')
      .then(r => r.ok ? r.json() : [])
      .then(setCarreras)
      .catch(() => {})
  }, [])

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleBlur = (field) => () => {
    const val = form[field]
    let error = ''
    if (field === 'username' && val && val.length < 4) error = 'Mínimo 4 caracteres'
    if (field === 'password' && val && val.length < 6) error = 'Mínimo 6 caracteres'
    if (field === 'matricula' && val && !REGEX.matricula.test(val)) error = 'Formato: A00000000'
    if (field === 'celular' && val && !REGEX.celular.test(val)) error = '10 dígitos'
    if (field === 'correo_alterno' && val && !REGEX.email.test(val)) error = 'Correo inválido'
    if (error) setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateStep1 = () => {
    const errs = {}
    if (!form.username || form.username.length < 4) errs.username = 'Mínimo 4 caracteres'
    if (!form.password || form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (!form.password2) errs.password2 = 'Requerido'
    else if (form.password !== form.password2) errs.password2 = 'Las contraseñas no coinciden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (!form.nombre_completo.trim()) errs.nombre_completo = 'Requerido'
    if (!REGEX.matricula.test(form.matricula)) errs.matricula = 'Formato: A00000000'
    if (!form.carrera_id) errs.carrera_id = 'Requerido'
    if (form.celular && !REGEX.celular.test(form.celular)) errs.celular = '10 dígitos'
    if (form.correo_alterno && !REGEX.email.test(form.correo_alterno)) errs.correo_alterno = 'Correo inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => { if (validateStep1()) { setErrors({}); setStep(2) } }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) return
    setSubmitting(true)
    try {
      await register({
        username: form.username, password: form.password,
        nombre_completo: form.nombre_completo, matricula: form.matricula,
        carrera_id: parseInt(form.carrera_id), celular: form.celular,
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

          <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-xl)' }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--amber-500)' }} />
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: step === 2 ? 'var(--amber-500)' : 'var(--gray-200)', transition: 'background 0.3s' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre de usuario</label>
                  <input className={`form-input ${errors.username ? 'invalid' : ''}`} type="text" placeholder="ej. juan.perez" value={form.username} onChange={set('username')} onBlur={handleBlur('username')} autoComplete="username" />
                  {errors.username && <div className="form-error">{errors.username}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input className={`form-input ${errors.password ? 'invalid' : ''}`} type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} onBlur={handleBlur('password')} autoComplete="new-password" />
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input className={`form-input ${errors.password2 ? 'invalid' : ''}`} type="password" placeholder="Repite tu contraseña" value={form.password2} onChange={set('password2')} autoComplete="new-password" />
                  {errors.password2 && <div className="form-error">{errors.password2}</div>}
                </div>
                <button type="button" className="btn btn-primary btn-lg w-full" onClick={handleNext}>Continuar</button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input className={`form-input ${errors.nombre_completo ? 'invalid' : ''}`} type="text" placeholder="Juan Pérez López" value={form.nombre_completo} onChange={set('nombre_completo')} />
                  {errors.nombre_completo && <div className="form-error">{errors.nombre_completo}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Matrícula *</label>
                    <input className={`form-input ${errors.matricula ? 'invalid' : ''}`} type="text" placeholder="A12345678" value={form.matricula} onChange={set('matricula')} onBlur={handleBlur('matricula')} />
                    {errors.matricula && <div className="form-error">{errors.matricula}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carrera *</label>
                    <select className={`form-select ${errors.carrera_id ? 'invalid' : ''}`} value={form.carrera_id} onChange={set('carrera_id')}>
                      <option value="">Selecciona...</option>
                      {carreras.map(c => (<option key={c.id} value={c.id}>{c.abreviatura} — {c.nombre}</option>))}
                    </select>
                    {errors.carrera_id && <div className="form-error">{errors.carrera_id}</div>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Celular</label>
                    <input className={`form-input ${errors.celular ? 'invalid' : ''}`} type="tel" placeholder="8112345678" value={form.celular} onChange={set('celular')} onBlur={handleBlur('celular')} />
                    {errors.celular && <div className="form-error">{errors.celular}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Alterno</label>
                    <input className={`form-input ${errors.correo_alterno ? 'invalid' : ''}`} type="email" placeholder="correo@ejemplo.com" value={form.correo_alterno} onChange={set('correo_alterno')} onBlur={handleBlur('correo_alterno')} />
                    {errors.correo_alterno && <div className="form-error">{errors.correo_alterno}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)}>Atrás</button>
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
