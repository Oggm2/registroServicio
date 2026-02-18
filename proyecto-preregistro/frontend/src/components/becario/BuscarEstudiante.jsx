import { useState } from 'react'
import { estudiantesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineAcademicCap,
} from 'react-icons/hi2'

export default function BuscarEstudiante() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const handleBuscar = async (e) => {
    e?.preventDefault()
    if (!query.trim()) {
      toast.error('Ingresa matrícula o nombre')
      return
    }
    setLoading(true)
    setBuscado(true)
    try {
      const { data } = await estudiantesAPI.buscar({ q: query.trim() })
      setResultados(data)
      if (data.length === 0) toast('No se encontraron resultados', { icon: '🔍' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon amber"><HiOutlineMagnifyingGlass /></span>
          Buscar Estudiante
        </h1>
        <p className="page-subtitle">Busca por matrícula o nombre del estudiante</p>
      </div>

      <form onSubmit={handleBuscar}>
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ maxWidth: 480 }}>
            <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
            <input
              className="form-input"
              placeholder="Matrícula o nombre del estudiante..."
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

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : resultados.length > 0 ? (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {resultados.map((est, i) => (
            <div className="card stagger-item" key={est.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-lg)' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--navy-600), var(--navy-500))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--amber-400)', fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: 600, flexShrink: 0,
                }}>
                  {est.nombre_completo?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 6 }}>
                    <h4 style={{ margin: 0 }}>{est.nombre_completo}</h4>
                    <span className="badge badge-navy">{est.matricula}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                    <span className="text-sm text-muted flex gap-sm">
                      <HiOutlineAcademicCap /> {est.carrera_nombre || est.carrera}
                    </span>
                    {est.celular && (
                      <span className="text-sm text-muted flex gap-sm">
                        <HiOutlinePhone /> {est.celular}
                      </span>
                    )}
                    {est.correo_alterno && (
                      <span className="text-sm text-muted flex gap-sm">
                        <HiOutlineEnvelope /> {est.correo_alterno}
                      </span>
                    )}
                  </div>

                  {est.preregistros && est.preregistros.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Servicios inscritos
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                        {est.preregistros.map((pr) => (
                          <span key={pr.id} className="badge badge-amber">{pr.crn} — {pr.descripcion}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {est.asistencia_feria && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Asistencia Feria
                      </div>
                      <span className="text-sm">
                        Horario: {est.asistencia_feria.horario_seleccionado} ·{' '}
                        <span className={`badge ${
                          est.asistencia_feria.estatus === 'asistió' ? 'badge-teal' :
                          est.asistencia_feria.estatus === 'no_asistió' ? 'badge-red' : 'badge-amber'
                        }`}>
                          {est.asistencia_feria.estatus || 'pendiente'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : buscado ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineUser /></div>
            <h3>Sin resultados</h3>
            <p>No se encontraron estudiantes con ese criterio de búsqueda.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
