import { useState } from 'react'
import { estudiantesAPI, asistenciasAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
} from 'react-icons/hi2'

const ESTATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', icon: HiOutlineClock, badge: 'badge-amber' },
  { value: 'dentro', label: 'Entrada', icon: HiOutlineArrowRightOnRectangle, badge: 'badge-navy' },
  { value: 'asistió', label: 'Salida', icon: HiOutlineArrowLeftOnRectangle, badge: 'badge-teal' },
  { value: 'no_asistió', label: 'No asistió', icon: HiOutlineXCircle, badge: 'badge-red' },
]

export default function ValidarAsistencia() {
  const [query, setQuery] = useState('')
  const [estudiante, setEstudiante] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validando, setValidando] = useState(false)

  const buscar = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setEstudiante(null)
    try {
      const { data } = await estudiantesAPI.buscar({ q: query.trim() })
      if (data.length > 0) {
        setEstudiante(data[0])
      } else {
        toast.error('Estudiante no encontrado')
      }
    } catch {
      toast.error('Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstatus = async (asistenciaId, nuevoEstatus) => {
    setValidando(true)
    try {
      await asistenciasAPI.validar(asistenciaId, { estatus_asistencia: nuevoEstatus })
      setEstudiante({
        ...estudiante,
        asistencia_feria: {
          ...estudiante.asistencia_feria,
          estatus: nuevoEstatus,
        },
      })
      toast.success(`Estatus actualizado a "${nuevoEstatus}"`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar estatus')
    } finally {
      setValidando(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon teal"><HiOutlineClipboardDocumentCheck /></span>
          Validar Asistencia
        </h1>
        <p className="page-subtitle">Busca un estudiante y actualiza su estatus de asistencia a la feria</p>
      </div>

      <form onSubmit={buscar}>
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ maxWidth: 480 }}>
            <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
            <input
              className="form-input"
              placeholder="Matrícula del estudiante..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {loading && <div className="loading-spinner"><div className="spinner" /></div>}

      {estudiante && (
        <div className="card" style={{ maxWidth: 600, animation: 'fadeInUp 0.3s var(--ease-out)' }}>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3>{estudiante.nombre_completo}</h3>
            <div className="text-sm text-muted">
              {estudiante.matricula} · {estudiante.carrera_nombre || estudiante.carrera}
            </div>
          </div>

          {estudiante.asistencia_feria ? (
            <>
              <div style={{
                background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
              }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Horario seleccionado
                </div>
                <div style={{ fontWeight: 600 }}>{estudiante.asistencia_feria.horario_seleccionado}</div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: 'var(--space-sm)' }}>
                  Estatus de asistencia
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {ESTATUS_OPTIONS.map((opt) => {
                    const isActive = estudiante.asistencia_feria.estatus === opt.value
                    return (
                      <button
                        key={opt.value}
                        className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        onClick={() => cambiarEstatus(estudiante.asistencia_feria.id, opt.value)}
                        disabled={validando || isActive}
                        style={{ flex: 1, gap: 6 }}
                      >
                        <opt.icon />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
              Este estudiante no tiene registro de asistencia a feria.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
