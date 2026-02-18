import { useState, useEffect } from 'react'
import api, { gestionEstudiantesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineKey,
} from 'react-icons/hi2'

const INITIAL_FORM = {
  username: '', password: '', nombre_completo: '',
  matricula: '', carrera_id: '', celular: '', correo_alterno: '',
}

export default function GestionEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [resetModal, setResetModal] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    loadEstudiantes()
    loadCarreras()
  }, [])

  const loadEstudiantes = async () => {
    try {
      const { data } = await gestionEstudiantesAPI.getAll()
      setEstudiantes(data)
    } catch {
      toast.error('Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const loadCarreras = async () => {
    try {
      const { data } = await api.get('/carreras')
      setCarreras(data)
    } catch { /* ignore */ }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const openCreate = () => {
    setForm(INITIAL_FORM)
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.nombre_completo || !form.matricula || !form.carrera_id) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSubmitting(true)
    try {
      await gestionEstudiantesAPI.create({
        ...form,
        carrera_id: parseInt(form.carrera_id),
      })
      toast.success('Estudiante creado')
      setModal(false)
      loadEstudiantes()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear estudiante')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Dar de baja a este estudiante? Se eliminarán también sus pre-registros y asistencias.')) return
    try {
      await gestionEstudiantesAPI.delete(id)
      setEstudiantes(estudiantes.filter(e => e.id !== id))
      toast.success('Estudiante eliminado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setResetting(true)
    try {
      await gestionEstudiantesAPI.resetPassword(resetModal.usuario_id, { new_password: newPassword })
      toast.success('Contraseña restablecida')
      setResetModal(null)
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al restablecer contraseña')
    } finally {
      setResetting(false)
    }
  }

  const filtered = estudiantes.filter(e =>
    !search || e.nombre_completo.toLowerCase().includes(search.toLowerCase())
    || e.matricula.toLowerCase().includes(search.toLowerCase())
    || e.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>
            <span className="page-header-icon navy"><HiOutlineAcademicCap /></span>
            Gestión de Estudiantes
          </h1>
          <p className="page-subtitle">Alta y baja de estudiantes del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Estudiante
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
          <input className="form-input" placeholder="Buscar por nombre, matrícula o username..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>Celular</th>
                <th>Username</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.nombre_completo}</td>
                  <td><span className="badge badge-navy">{e.matricula}</span></td>
                  <td className="text-muted">{e.carrera}</td>
                  <td className="text-muted">{e.celular || '—'}</td>
                  <td className="text-muted">{e.username}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-outline btn-sm btn-icon"
                        onClick={() => { setNewPassword(''); setResetModal(e) }} title="Reset Password">
                        <HiOutlineKey />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon"
                        onClick={() => handleDelete(e.id)} title="Dar de baja">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
                    {search ? 'Sin resultados' : 'No hay estudiantes registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Estudiante</h2>
              <button className="modal-close" onClick={() => setModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input className="form-input" placeholder="ej. A01234567"
                      value={form.username} onChange={set('username')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contraseña *</label>
                    <input className="form-input" type="password" placeholder="Contraseña"
                      value={form.password} onChange={set('password')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input className="form-input" placeholder="Nombre completo del estudiante"
                    value={form.nombre_completo} onChange={set('nombre_completo')} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Matrícula *</label>
                    <input className="form-input" placeholder="ej. A01234567"
                      value={form.matricula} onChange={set('matricula')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carrera *</label>
                    <select className="form-select" value={form.carrera_id} onChange={set('carrera_id')}>
                      <option value="">Seleccionar carrera</option>
                      {carreras.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Celular</label>
                    <input className="form-input" placeholder="ej. 8112345678"
                      value={form.celular} onChange={set('celular')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Alterno</label>
                    <input className="form-input" type="email" placeholder="correo@ejemplo.com"
                      value={form.correo_alterno} onChange={set('correo_alterno')} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Estudiante'}
                </button>
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
              <button className="modal-close" onClick={() => setResetModal(null)}>
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)' }}>
                  Restablecer contraseña de <strong>{resetModal.nombre_completo}</strong> ({resetModal.username})
                </p>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setResetModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={resetting}>
                  {resetting ? 'Restableciendo...' : 'Restablecer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
