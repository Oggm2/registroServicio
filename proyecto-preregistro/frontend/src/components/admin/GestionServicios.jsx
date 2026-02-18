import { useState, useEffect, useCallback } from 'react'
import { serviciosAPI, sociosFormadoresAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineCog6Tooth,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

const INITIAL_FORM = { descripcion: '', crn: '', periodo: '', cupo_maximo: '', socio_formador_id: '' }

export default function GestionServicios() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [socios, setSocios] = useState([])
  const [inscritosModal, setInscritosModal] = useState(null)
  const [inscritosList, setInscritosList] = useState([])
  const [inscritosLoading, setInscritosLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState(null)

  useEffect(() => { loadSocios() }, [])
  useEffect(() => { loadServicios() }, [page])

  const openInscritos = async (servicio) => {
    setInscritosModal(servicio)
    setInscritosLoading(true)
    try {
      const { data } = await serviciosAPI.getInscritos(servicio.id)
      setInscritosList(data)
    } catch (err) {
      console.error('Error al cargar inscritos:', err)
      toast.error('Error al cargar inscritos')
    } finally {
      setInscritosLoading(false)
    }
  }

  const loadSocios = async () => {
    try {
      const { data } = await sociosFormadoresAPI.getAll({ per_page: 100 })
      setSocios(data.data || data)
    } catch { /* ignore */ }
  }

  const loadServicios = async (q = search) => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (q) params.q = q
      const { data } = await serviciosAPI.getAll(params)
      setServicios(data.data || data)
      setPagination(data.pagination || null)
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (val) => {
    setSearch(val)
    if (searchTimer) clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => { setPage(1); loadServicios(val) }, 400))
  }

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (formErrors[field]) setFormErrors({ ...formErrors, [field]: '' })
  }

  const validate = () => {
    const errors = {}
    if (!form.descripcion.trim()) errors.descripcion = 'Requerido'
    if (!form.crn.trim()) errors.crn = 'Requerido'
    if (!form.periodo.trim()) errors.periodo = 'Requerido'
    if (!form.cupo_maximo || parseInt(form.cupo_maximo) < 1) errors.cupo_maximo = 'Mínimo 1'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreate = () => { setForm(INITIAL_FORM); setEditId(null); setFormErrors({}); setModal('create') }
  const openEdit = (s) => {
    setForm({ descripcion: s.descripcion, crn: s.crn, periodo: s.periodo, cupo_maximo: s.cupo_maximo?.toString() || '', socio_formador_id: s.socio_formador_id?.toString() || '' })
    setEditId(s.id); setFormErrors({}); setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = { ...form, cupo_maximo: parseInt(form.cupo_maximo), socio_formador_id: form.socio_formador_id ? parseInt(form.socio_formador_id) : null }
      if (modal === 'create') { await serviciosAPI.create(payload); toast.success('Servicio creado') }
      else { await serviciosAPI.update(editId, payload); toast.success('Servicio actualizado') }
      setModal(null); loadServicios()
    } catch (err) { console.error('Error al guardar servicio:', err); toast.error(err.response?.data?.error || 'Error al guardar') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return
    try {
      await serviciosAPI.delete(id)
      toast.success('Servicio eliminado'); loadServicios()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar') }
  }

  const handleCupoChange = async (id, nuevoCupo) => {
    const cupo = parseInt(nuevoCupo)
    if (isNaN(cupo) || cupo < 0) return
    try {
      await serviciosAPI.updateCupo(id, cupo)
      setServicios(servicios.map(s => s.id === id ? { ...s, cupo_maximo: cupo } : s))
      toast.success('Cupo actualizado')
    } catch (err) { toast.error(err.response?.data?.error || 'Error al actualizar cupo') }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1><span className="page-header-icon amber"><HiOutlineCog6Tooth /></span>Gestión de Servicios</h1>
          <p className="page-subtitle">Administra servicios y proyectos académicos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Nuevo Servicio</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
          <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
          <input className="form-input" placeholder="Buscar por CRN, descripción o periodo..." value={search} onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-container table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>CRN</th><th>Descripción</th><th>Socio Formador</th><th>Periodo</th><th>Cupo Máximo</th><th>Inscritos</th><th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.id}>
                    <td data-label="CRN"><span className="badge badge-navy">{s.crn}</span></td>
                    <td data-label="Descripción" style={{ fontWeight: 500 }}>{s.descripcion}</td>
                    <td data-label="Socio Formador" className="text-muted">{s.socio_formador_nombre || '—'}</td>
                    <td data-label="Periodo" className="text-muted">{s.periodo}</td>
                    <td data-label="Cupo Máximo">
                      <input type="number" className="form-input" style={{ width: 80, padding: '4px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                        defaultValue={s.cupo_maximo}
                        onBlur={(e) => { if (e.target.value !== s.cupo_maximo?.toString()) handleCupoChange(s.id, e.target.value) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }} min={0} />
                    </td>
                    <td data-label="Inscritos">
                      {(s.inscritos || 0) > 0 ? (
                        <button className="btn btn-outline btn-sm" onClick={() => openInscritos(s)} style={{ gap: 4 }}>
                          <HiOutlineUserGroup /> {s.inscritos}
                        </button>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td data-label="Acciones">
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)} title="Editar"><HiOutlinePencilSquare /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)} title="Eliminar"><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {servicios.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>No hay servicios registrados</td></tr>
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

      {inscritosModal && (
        <div className="modal-overlay" onClick={() => setInscritosModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Inscritos — {inscritosModal.crn}</h2>
              <button className="modal-close" onClick={() => setInscritosModal(null)}><HiOutlineXMark /></button>
            </div>
            <div className="modal-body">
              {inscritosLoading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : inscritosList.length === 0 ? (
                <p className="text-muted text-center">No hay inscritos</p>
              ) : (
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Matrícula</th>
                      <th>Carrera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosList.map((est, idx) => (
                      <tr key={idx}>
                        <td className="text-muted">{idx + 1}</td>
                        <td style={{ fontWeight: 500 }}>{est.nombre_completo}</td>
                        <td><span className="badge badge-navy">{est.matricula}</span></td>
                        <td className="text-muted">{est.carrera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setInscritosModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><HiOutlineXMark /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">CRN</label>
                  <input className={`form-input ${formErrors.crn ? 'invalid' : ''}`} placeholder="ej. 12345" value={form.crn} onChange={set('crn')} />
                  {formErrors.crn && <div className="form-error">{formErrors.crn}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <input className={`form-input ${formErrors.descripcion ? 'invalid' : ''}`} placeholder="Nombre del servicio o proyecto" value={form.descripcion} onChange={set('descripcion')} />
                  {formErrors.descripcion && <div className="form-error">{formErrors.descripcion}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Socio Formador</label>
                  <select className="form-select" value={form.socio_formador_id} onChange={set('socio_formador_id')}>
                    <option value="">— Sin socio formador —</option>
                    {socios.map(s => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Periodo</label>
                    <input className={`form-input ${formErrors.periodo ? 'invalid' : ''}`} placeholder="ej. 2025-1" value={form.periodo} onChange={set('periodo')} />
                    {formErrors.periodo && <div className="form-error">{formErrors.periodo}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cupo Máximo</label>
                    <input className={`form-input ${formErrors.cupo_maximo ? 'invalid' : ''}`} type="number" placeholder="30" min={1} value={form.cupo_maximo} onChange={set('cupo_maximo')} />
                    {formErrors.cupo_maximo && <div className="form-error">{formErrors.cupo_maximo}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : modal === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
