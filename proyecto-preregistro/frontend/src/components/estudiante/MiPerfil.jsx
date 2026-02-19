import { useState, useEffect } from 'react'
import { estudiantesAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { HiOutlineUserCircle, HiOutlineKey, HiOutlineXMark } from 'react-icons/hi2'

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
  const [pwModal, setPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwSubmitting, setPwSubmitting] = useState(false)

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

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setPwSubmitting(true)
    try {
      await authAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Contraseña actualizada')
      setPwModal(false)
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setPwSubmitting(false)
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

      <div className="card" style={{ maxWidth: 600, marginTop: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Seguridad</h3>
            <p className="text-sm text-muted">Actualiza tu contraseña de acceso</p>
          </div>
          <button className="btn btn-outline" onClick={() => { setPwForm({ current_password: '', new_password: '', confirm: '' }); setPwModal(true) }}>
            <HiOutlineKey /> Cambiar Contraseña
          </button>
        </div>
      </div>

      {pwModal && (
        <div className="modal-overlay" onClick={() => setPwModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button className="modal-close" onClick={() => setPwModal(false)}><HiOutlineXMark /></button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Contraseña Actual</label>
                  <input className="form-input" type="password" placeholder="Tu contraseña actual"
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <input className="form-input" type="password" placeholder="Repite la nueva contraseña"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setPwModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={pwSubmitting}>
                  {pwSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
