import { useState, useEffect } from 'react'
import { carrerasAdminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineXMark,
} from 'react-icons/hi2'

const EMPTY_FORM = { nombre: '', abreviatura: '' }

export default function GestionCarreras() {
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadCarreras() }, [])

  const loadCarreras = async () => {
    setLoading(true)
    try {
      const { data } = await carrerasAdminAPI.getAll()
      setCarreras(data)
    } catch {
      toast.error('Error al cargar carreras')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setModal(true)
  }

  const openEdit = (carrera) => {
    setEditTarget(carrera)
    setForm({ nombre: carrera.nombre, abreviatura: carrera.abreviatura })
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.abreviatura.trim()) {
      toast.error('Nombre y abreviatura son requeridos')
      return
    }
    setSubmitting(true)
    try {
      if (editTarget) {
        await carrerasAdminAPI.update(editTarget.id, form)
        toast.success('Carrera actualizada')
      } else {
        await carrerasAdminAPI.create(form)
        toast.success('Carrera creada')
      }
      setModal(false)
      loadCarreras()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la carrera "${nombre}"? Solo es posible si no tiene estudiantes asignados.`)) return
    try {
      await carrerasAdminAPI.delete(id)
      toast.success('Carrera eliminada')
      loadCarreras()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>
            <span className="page-header-icon amber"><HiOutlineAcademicCap /></span>
            Gestión de Carreras
          </h1>
          <p className="page-subtitle">Alta, edición y baja de carreras del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Carrera
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-container table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Abreviatura</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carreras.map((c) => (
                <tr key={c.id}>
                  <td data-label="Nombre" style={{ fontWeight: 500 }}>{c.nombre}</td>
                  <td data-label="Abreviatura">
                    <span className="badge badge-navy">{c.abreviatura}</span>
                  </td>
                  <td data-label="Acciones">
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => openEdit(c)}
                        title="Editar"
                      >
                        <HiOutlinePencil />
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => handleDelete(c.id, c.nombre)}
                        title="Eliminar"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {carreras.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
                    No hay carreras registradas
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
              <h2>{editTarget ? 'Editar Carrera' : 'Nueva Carrera'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    className="form-input"
                    placeholder="ej. Ingeniería en Tecnologías Computacionales"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Abreviatura *</label>
                  <input
                    className="form-input"
                    placeholder="ej. ITC"
                    value={form.abreviatura}
                    onChange={(e) => setForm({ ...form, abreviatura: e.target.value.toUpperCase() })}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : editTarget ? 'Guardar Cambios' : 'Crear Carrera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
