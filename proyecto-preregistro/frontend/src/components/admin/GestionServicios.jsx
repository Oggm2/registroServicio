import { useState, useEffect } from 'react'
import { serviciosAPI, sociosFormadoresAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineCog6Tooth,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2'

const INITIAL_FORM = { descripcion: '', crn: '', periodo: '', cupo_maximo: '', socio_formador_id: '' }

export default function GestionServicios() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(INITIAL_FORM)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [socios, setSocios] = useState([])

  useEffect(() => { loadServicios(); loadSocios() }, [])

  const loadSocios = async () => {
    try {
      const { data } = await sociosFormadoresAPI.getAll()
      setSocios(data)
    } catch { /* ignore */ }
  }

  const loadServicios = async () => {
    try {
      const { data } = await serviciosAPI.getAll()
      setServicios(data)
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const openCreate = () => {
    setForm(INITIAL_FORM)
    setEditId(null)
    setModal('create')
  }

  const openEdit = (s) => {
    setForm({
      descripcion: s.descripcion,
      crn: s.crn,
      periodo: s.periodo,
      cupo_maximo: s.cupo_maximo?.toString() || '',
      socio_formador_id: s.socio_formador_id?.toString() || '',
    })
    setEditId(s.id)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.descripcion || !form.crn || !form.periodo || !form.cupo_maximo) {
      toast.error('Completa todos los campos')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        cupo_maximo: parseInt(form.cupo_maximo),
        socio_formador_id: form.socio_formador_id ? parseInt(form.socio_formador_id) : null,
      }
      if (modal === 'create') {
        await serviciosAPI.create(payload)
        toast.success('Servicio creado')
      } else {
        await serviciosAPI.update(editId, payload)
        toast.success('Servicio actualizado')
      }
      setModal(null)
      loadServicios()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return
    try {
      await serviciosAPI.delete(id)
      setServicios(servicios.filter(s => s.id !== id))
      toast.success('Servicio eliminado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const handleCupoChange = async (id, nuevoCupo) => {
    const cupo = parseInt(nuevoCupo)
    if (isNaN(cupo) || cupo < 0) return
    try {
      await serviciosAPI.updateCupo(id, cupo)
      setServicios(servicios.map(s => s.id === id ? { ...s, cupo_maximo: cupo } : s))
      toast.success('Cupo actualizado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar cupo')
    }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>
            <span className="page-header-icon amber"><HiOutlineCog6Tooth /></span>
            Gestión de Servicios
          </h1>
          <p className="page-subtitle">Administra servicios y proyectos académicos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>CRN</th>
                <th>Descripción</th>
                <th>Socio Formador</th>
                <th>Periodo</th>
                <th>Cupo Máximo</th>
                <th>Inscritos</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-navy">{s.crn}</span></td>
                  <td style={{ fontWeight: 500 }}>{s.descripcion}</td>
                  <td className="text-muted">{s.socio_formador_nombre || '—'}</td>
                  <td className="text-muted">{s.periodo}</td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 80, padding: '4px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                      defaultValue={s.cupo_maximo}
                      onBlur={(e) => {
                        if (e.target.value !== s.cupo_maximo?.toString()) {
                          handleCupoChange(s.id, e.target.value)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur()
                        }
                      }}
                      min={0}
                    />
                  </td>
                  <td>{s.inscritos || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)} title="Editar">
                        <HiOutlinePencilSquare />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)} title="Eliminar">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {servicios.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
                    No hay servicios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">CRN</label>
                  <input className="form-input" placeholder="ej. 12345"
                    value={form.crn} onChange={set('crn')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <input className="form-input" placeholder="Nombre del servicio o proyecto"
                    value={form.descripcion} onChange={set('descripcion')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Socio Formador</label>
                  <select className="form-select" value={form.socio_formador_id} onChange={set('socio_formador_id')}>
                    <option value="">— Sin socio formador —</option>
                    {socios.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Periodo</label>
                    <input className="form-input" placeholder="ej. 2025-1"
                      value={form.periodo} onChange={set('periodo')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cupo Máximo</label>
                    <input className="form-input" type="number" placeholder="30" min={1}
                      value={form.cupo_maximo} onChange={set('cupo_maximo')} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>
                  Cancelar
                </button>
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
