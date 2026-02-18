import { useState, useEffect } from 'react'
import { gestionBecariosAPI, gestionEstudiantesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineKey,
} from 'react-icons/hi2'

export default function GestionBecarios() {
  const [becarios, setBecarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [resetModal, setResetModal] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => { loadBecarios() }, [page])

  const loadBecarios = async () => {
    setLoading(true)
    try {
      const { data } = await gestionBecariosAPI.getAll({ page, per_page: 20 })
      setBecarios(data.data || data)
      setPagination(data.pagination || null)
    } catch {
      toast.error('Error al cargar becarios')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setUsername(''); setPassword(''); setFormErrors({}); setModal(true) }

  const validate = () => {
    const errors = {}
    if (!username.trim() || username.trim().length < 4) errors.username = 'Mínimo 4 caracteres'
    if (!password || password.length < 6) errors.password = 'Mínimo 6 caracteres'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await gestionBecariosAPI.create({ username: username.trim(), password })
      toast.success('Becario creado'); setModal(false); loadBecarios()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al crear becario') }
    finally { setSubmitting(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    setResetting(true)
    try {
      await gestionEstudiantesAPI.resetPassword(resetModal.id, { new_password: newPassword })
      toast.success('Contraseña restablecida'); setResetModal(null); setNewPassword('')
    } catch (err) { toast.error(err.response?.data?.error || 'Error al restablecer contraseña') }
    finally { setResetting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Dar de baja a este becario?')) return
    try {
      await gestionBecariosAPI.delete(id)
      toast.success('Becario eliminado'); loadBecarios()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar') }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1><span className="page-header-icon navy"><HiOutlineUserGroup /></span>Gestión de Becarios</h1>
          <p className="page-subtitle">Alta y baja de becarios del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Nuevo Becario</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-container table-responsive">
            <table className="table">
              <thead><tr><th>Username</th><th style={{ width: 120 }}>Acciones</th></tr></thead>
              <tbody>
                {becarios.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Username" style={{ fontWeight: 500 }}>{b.username}</td>
                    <td data-label="Acciones">
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => { setNewPassword(''); setResetModal(b) }} title="Reset Password"><HiOutlineKey /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(b.id)} title="Dar de baja"><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {becarios.length === 0 && (
                  <tr><td colSpan={2} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>No hay becarios registrados</td></tr>
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
              <h2>Nuevo Becario</h2>
              <button className="modal-close" onClick={() => setModal(false)}><HiOutlineXMark /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className={`form-input ${formErrors.username ? 'invalid' : ''}`} placeholder="ej. becario01"
                    value={username} onChange={(e) => { setUsername(e.target.value); setFormErrors(prev => ({ ...prev, username: '' })) }} />
                  {formErrors.username && <div className="form-error">{formErrors.username}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input className={`form-input ${formErrors.password ? 'invalid' : ''}`} type="password" placeholder="Mínimo 6 caracteres"
                    value={password} onChange={(e) => { setPassword(e.target.value); setFormErrors(prev => ({ ...prev, password: '' })) }} />
                  {formErrors.password && <div className="form-error">{formErrors.password}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creando...' : 'Crear Becario'}</button>
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
                <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)' }}>Restablecer contraseña de <strong>{resetModal.username}</strong></p>
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
