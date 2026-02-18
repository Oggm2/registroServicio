import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sociosFormadoresAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineEye,
} from 'react-icons/hi2'

export default function GestionSocios() {
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [nombre, setNombre] = useState('')
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { loadSocios() }, [page])

  const loadSocios = async () => {
    setLoading(true)
    try {
      const { data } = await sociosFormadoresAPI.getAll({ page, per_page: 20 })
      setSocios(data.data || data)
      setPagination(data.pagination || null)
    } catch {
      toast.error('Error al cargar socios formadores')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setNombre(''); setEditId(null); setModal('create') }
  const openEdit = (s) => { setNombre(s.nombre); setEditId(s.id); setModal('edit') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    setSubmitting(true)
    try {
      if (modal === 'create') { await sociosFormadoresAPI.create({ nombre: nombre.trim() }); toast.success('Socio formador creado') }
      else { await sociosFormadoresAPI.update(editId, { nombre: nombre.trim() }); toast.success('Socio formador actualizado') }
      setModal(null); loadSocios()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al guardar') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este socio formador?')) return
    try {
      await sociosFormadoresAPI.delete(id)
      toast.success('Socio formador eliminado'); loadSocios()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar') }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1><span className="page-header-icon teal"><HiOutlineBuildingOffice2 /></span>Socios Formadores</h1>
          <p className="page-subtitle">Gestiona los socios formadores del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Nuevo Socio</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-container table-responsive">
            <table className="table">
              <thead><tr><th>Nombre</th><th style={{ width: 160 }}>Acciones</th></tr></thead>
              <tbody>
                {socios.map((s) => (
                  <tr key={s.id}>
                    <td data-label="Nombre" style={{ fontWeight: 500 }}>{s.nombre}</td>
                    <td data-label="Acciones">
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => navigate(`/socios-formadores/${s.id}`)} title="Ver detalle"><HiOutlineEye /></button>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)} title="Editar"><HiOutlinePencilSquare /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)} title="Eliminar"><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {socios.length === 0 && (
                  <tr><td colSpan={2} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>No hay socios formadores registrados</td></tr>
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
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'create' ? 'Nuevo Socio Formador' : 'Editar Socio Formador'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><HiOutlineXMark /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input className="form-input" placeholder="Nombre del socio formador" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : modal === 'create' ? 'Crear' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
