import { useState, useEffect } from 'react'
import api, { gestionEstudiantesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineKey,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'

const INITIAL_FORM = {
  username: '', password: '', nombre_completo: '',
  matricula: '', carrera_id: '', celular: '', correo_alterno: '',
}

const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  celular: /^\d{10}$/,
  matricula: /^[Aa]\d{8}$/,
}

export default function GestionEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [resetModal, setResetModal] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => { loadCarreras() }, [])
  useEffect(() => { loadEstudiantes() }, [page])

  const loadEstudiantes = async (q = search) => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (q) params.q = q
      const { data } = await gestionEstudiantesAPI.getAll(params)
      setEstudiantes(data.data || data)
      setPagination(data.pagination || null)
    } catch {
      toast.error('Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const loadCarreras = async () => {
    try { const { data } = await api.get('/carreras'); setCarreras(data) } catch { /* ignore */ }
  }

  const handleSearch = (val) => {
    setSearch(val)
    if (searchTimer) clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => { setPage(1); loadEstudiantes(val) }, 400))
  }

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (formErrors[field]) setFormErrors({ ...formErrors, [field]: '' })
  }

  const validateField = (field, value) => {
    if (field === 'username' && value.length < 4) return 'Mínimo 4 caracteres'
    if (field === 'password' && value.length < 6) return 'Mínimo 6 caracteres'
    if (field === 'matricula' && !REGEX.matricula.test(value)) return 'Formato: A00000000'
    if (field === 'celular' && value && !REGEX.celular.test(value)) return '10 dígitos'
    if (field === 'correo_alterno' && value && !REGEX.email.test(value)) return 'Correo inválido'
    return ''
  }

  const handleBlur = (field) => () => {
    const error = validateField(field, form[field])
    if (error) setFormErrors(prev => ({ ...prev, [field]: error }))
  }

  const validate = () => {
    const errors = {}
    if (!form.username || form.username.length < 4) errors.username = 'Mínimo 4 caracteres'
    if (!form.password || form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
    if (!form.nombre_completo.trim()) errors.nombre_completo = 'Requerido'
    if (!REGEX.matricula.test(form.matricula)) errors.matricula = 'Formato: A00000000'
    if (!form.carrera_id) errors.carrera_id = 'Requerido'
    if (form.celular && !REGEX.celular.test(form.celular)) errors.celular = '10 dígitos'
    if (form.correo_alterno && !REGEX.email.test(form.correo_alterno)) errors.correo_alterno = 'Correo inválido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreate = () => { setForm(INITIAL_FORM); setFormErrors({}); setModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await gestionEstudiantesAPI.create({ ...form, carrera_id: parseInt(form.carrera_id) })
      toast.success('Estudiante creado'); setModal(false); loadEstudiantes()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al crear estudiante') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Dar de baja a este estudiante? Se eliminarán también sus pre-registros y asistencias.')) return
    try {
      await gestionEstudiantesAPI.delete(id)
      toast.success('Estudiante eliminado'); loadEstudiantes()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar') }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    setResetting(true)
    try {
      await gestionEstudiantesAPI.resetPassword(resetModal.usuario_id, { new_password: newPassword })
      toast.success('Contraseña restablecida'); setResetModal(null); setNewPassword('')
    } catch (err) { toast.error(err.response?.data?.error || 'Error al restablecer contraseña') }
    finally { setResetting(false) }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1><span className="page-header-icon navy"><HiOutlineAcademicCap /></span>Gestión de Estudiantes</h1>
          <p className="page-subtitle">Alta y baja de estudiantes del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Nuevo Estudiante</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
          <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
          <input className="form-input" placeholder="Buscar por nombre, matrícula o username..." value={search} onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-container table-responsive">
            <table className="table">
              <thead>
                <tr><th>Nombre</th><th>Matrícula</th><th>Carrera</th><th>Celular</th><th>Username</th><th style={{ width: 120 }}>Acciones</th></tr>
              </thead>
              <tbody>
                {estudiantes.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Nombre" style={{ fontWeight: 500 }}>{e.nombre_completo}</td>
                    <td data-label="Matrícula"><span className="badge badge-navy">{e.matricula}</span></td>
                    <td data-label="Carrera" className="text-muted">{e.carrera}</td>
                    <td data-label="Celular" className="text-muted">{e.celular || '—'}</td>
                    <td data-label="Username" className="text-muted">{e.username}</td>
                    <td data-label="Acciones">
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => { setNewPassword(''); setResetModal(e) }} title="Reset Password"><HiOutlineKey /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(e.id)} title="Dar de baja"><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {estudiantes.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>{search ? 'Sin resultados' : 'No hay estudiantes registrados'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
              <span className="pagination-info">Página {pagination.page} de {pagination.pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Siguiente</button>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Estudiante</h2>
              <button className="modal-close" onClick={() => setModal(false)}><HiOutlineXMark /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input className={`form-input ${formErrors.username ? 'invalid' : ''}`} placeholder="ej. juan.perez" value={form.username} onChange={set('username')} onBlur={handleBlur('username')} />
                    {formErrors.username && <div className="form-error">{formErrors.username}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contraseña *</label>
                    <input className={`form-input ${formErrors.password ? 'invalid' : ''}`} type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} onBlur={handleBlur('password')} />
                    {formErrors.password && <div className="form-error">{formErrors.password}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input className={`form-input ${formErrors.nombre_completo ? 'invalid' : ''}`} placeholder="Nombre completo del estudiante" value={form.nombre_completo} onChange={set('nombre_completo')} />
                  {formErrors.nombre_completo && <div className="form-error">{formErrors.nombre_completo}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Matrícula *</label>
                    <input className={`form-input ${formErrors.matricula ? 'invalid' : ''}`} placeholder="ej. A01234567" value={form.matricula} onChange={set('matricula')} onBlur={handleBlur('matricula')} />
                    {formErrors.matricula && <div className="form-error">{formErrors.matricula}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carrera *</label>
                    <select className={`form-select ${formErrors.carrera_id ? 'invalid' : ''}`} value={form.carrera_id} onChange={set('carrera_id')}>
                      <option value="">Seleccionar carrera</option>
                      {carreras.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                    </select>
                    {formErrors.carrera_id && <div className="form-error">{formErrors.carrera_id}</div>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Celular</label>
                    <input className={`form-input ${formErrors.celular ? 'invalid' : ''}`} placeholder="ej. 8112345678" value={form.celular} onChange={set('celular')} onBlur={handleBlur('celular')} />
                    {formErrors.celular && <div className="form-error">{formErrors.celular}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Alterno</label>
                    <input className={`form-input ${formErrors.correo_alterno ? 'invalid' : ''}`} type="email" placeholder="correo@ejemplo.com" value={form.correo_alterno} onChange={set('correo_alterno')} onBlur={handleBlur('correo_alterno')} />
                    {formErrors.correo_alterno && <div className="form-error">{formErrors.correo_alterno}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creando...' : 'Crear Estudiante'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetModal && (
        <div className="modal-overlay" onClick={() => setResetModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="modal-close" onClick={() => setResetModal(null)}><HiOutlineXMark /></button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)' }}>
                  Restablecer contraseña de <strong>{resetModal.nombre_completo}</strong> ({resetModal.username})
                </p>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setResetModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={resetting}>{resetting ? 'Restableciendo...' : 'Restablecer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
