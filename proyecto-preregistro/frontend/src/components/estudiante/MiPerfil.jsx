import { useState, useEffect } from 'react'
import { estudiantesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { HiOutlineUserCircle } from 'react-icons/hi2'

const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  celular: /^\d{10}$/,
}

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null)
  const [form, setForm] = useState({ celular: '', correo_alterno: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadPerfil() }, [])

  const loadPerfil = async () => {
    try {
      const { data } = await estudiantesAPI.getPerfil()
      setPerfil(data)
      setForm({ celular: data.celular || '', correo_alterno: data.correo_alterno || '' })
    } catch {
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = (field) => () => {
    let error = ''
    if (field === 'celular' && form.celular && !REGEX.celular.test(form.celular)) error = '10 dígitos'
    if (field === 'correo_alterno' && form.correo_alterno && !REGEX.email.test(form.correo_alterno)) error = 'Correo inválido'
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validate = () => {
    const errs = {}
    if (form.celular && !REGEX.celular.test(form.celular)) errs.celular = '10 dígitos'
    if (form.correo_alterno && !REGEX.email.test(form.correo_alterno)) errs.correo_alterno = 'Correo inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await estudiantesAPI.updatePerfil(form)
      toast.success('Perfil actualizado')
      loadPerfil()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar perfil')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1><span className="page-header-icon navy"><HiOutlineUserCircle /></span>Mi Perfil</h1>
        <p className="page-subtitle">Consulta y edita tu información personal</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input className="form-input" value={perfil?.nombre_completo || ''} disabled />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Matrícula</label>
              <input className="form-input" value={perfil?.matricula || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Carrera</label>
              <input className="form-input" value={perfil?.carrera || ''} disabled />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Celular</label>
              <input className={`form-input ${errors.celular ? 'invalid' : ''}`} placeholder="ej. 8112345678"
                value={form.celular}
                onChange={(e) => { setForm({ ...form, celular: e.target.value }); setErrors(prev => ({ ...prev, celular: '' })) }}
                onBlur={handleBlur('celular')} />
              {errors.celular && <div className="form-error">{errors.celular}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Correo Alterno</label>
              <input className={`form-input ${errors.correo_alterno ? 'invalid' : ''}`} type="email" placeholder="correo@ejemplo.com"
                value={form.correo_alterno}
                onChange={(e) => { setForm({ ...form, correo_alterno: e.target.value }); setErrors(prev => ({ ...prev, correo_alterno: '' })) }}
                onBlur={handleBlur('correo_alterno')} />
              {errors.correo_alterno && <div className="form-error">{errors.correo_alterno}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
