import { useState, useEffect } from 'react'
import { estudiantesAPI, preregistrosAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineClipboardDocumentList,
  HiOutlineTrash,
  HiOutlineAcademicCap,
} from 'react-icons/hi2'

export default function MisProyectos() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('')
  const [cancelando, setCancelando] = useState(null)

  useEffect(() => {
    loadProyectos()
  }, [periodo])

  const loadProyectos = async () => {
    setLoading(true)
    try {
      const { data } = await estudiantesAPI.getMisProyectos(periodo)
      setProyectos(data)
    } catch {
      toast.error('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async (preregistroId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta inscripción?')) return
    setCancelando(preregistroId)
    try {
      await preregistrosAPI.delete(preregistroId)
      setProyectos(proyectos.filter(p => p.preregistro_id !== preregistroId))
      toast.success('Inscripción cancelada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cancelar')
    } finally {
      setCancelando(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon amber"><HiOutlineClipboardDocumentList /></span>
          Mis Proyectos
        </h1>
        <p className="page-subtitle">Proyectos y servicios en los que estás inscrito</p>
      </div>

      {/* Filtro por periodo */}
      <div style={{ marginBottom: 'var(--space-lg)', maxWidth: 250 }}>
        <label className="form-label">Periodo</label>
        <input
          className="form-input"
          type="text"
          placeholder="ej. 2025-1"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : proyectos.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineAcademicCap /></div>
            <h3>Sin inscripciones</h3>
            <p>Aún no estás inscrito en ningún proyecto o servicio para este periodo.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {proyectos.map((p, i) => (
            <div className="card stagger-item" key={p.preregistro_id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 'var(--space-md)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                  <h4 style={{ margin: 0 }}>{p.servicio_descripcion}</h4>
                  <span className="badge badge-navy">CRN: {p.crn}</span>
                </div>
                <div className="text-sm text-muted">
                  Periodo: {p.periodo} · Inscrito el {new Date(p.fecha_registro).toLocaleDateString('es-MX')}
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleCancelar(p.preregistro_id)}
                disabled={cancelando === p.preregistro_id}
              >
                <HiOutlineTrash />
                {cancelando === p.preregistro_id ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
