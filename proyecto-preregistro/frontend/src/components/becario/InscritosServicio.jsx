import { useState, useEffect } from 'react'
import { serviciosAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineUserGroup,
  HiOutlineMagnifyingGlass,
  HiOutlineAcademicCap,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from 'react-icons/hi2'

export default function InscritosServicio() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')  // valor confirmado al hacer submit
  const [expanded, setExpanded] = useState({})
  const [inscritos, setInscritos] = useState({})
  const [loadingInscritos, setLoadingInscritos] = useState({})
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  // El efecto solo corre cuando cambian page o activeSearch (no hay double-fetch)
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { page, per_page: 15 }
        if (activeSearch) params.q = activeSearch
        const { data } = await serviciosAPI.getAll(params)
        setServicios(data.data || [])
        setPagination(data.pagination || null)
      } catch {
        toast.error('Error al cargar servicios')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, activeSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    // Actualizar activeSearch dispara el efecto; setPage(1) también si era distinto
    setActiveSearch(search)
    setPage(1)
  }

  const toggleServicio = async (servicioId) => {
    const isOpen = expanded[servicioId]
    setExpanded(prev => ({ ...prev, [servicioId]: !isOpen }))

    if (!isOpen && !inscritos[servicioId]) {
      setLoadingInscritos(prev => ({ ...prev, [servicioId]: true }))
      try {
        const { data } = await serviciosAPI.getInscritos(servicioId)
        setInscritos(prev => ({ ...prev, [servicioId]: data }))
      } catch {
        toast.error('Error al cargar inscritos')
      } finally {
        setLoadingInscritos(prev => ({ ...prev, [servicioId]: false }))
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon teal"><HiOutlineUserGroup /></span>
          Inscritos por Servicio
        </h1>
        <p className="page-subtitle">Consulta qué estudiantes están registrados en cada servicio</p>
      </div>

      <form onSubmit={handleSearch}>
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
            <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
            <input
              className="form-input"
              placeholder="Buscar servicio por descripción o CRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </div>
      </form>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {servicios.map((servicio) => (
            <div key={servicio.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => toggleServicio(servicio.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 'var(--space-md)', padding: 'var(--space-lg)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: '1.1rem' }}>
                  {expanded[servicio.id] ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{servicio.descripcion}</span>
                    <span className="badge badge-navy">{servicio.crn}</span>
                    <span className="badge badge-amber">{servicio.periodo}</span>
                  </div>
                  <div className="text-sm text-muted" style={{ marginTop: 4 }}>
                    {servicio.inscritos} / {servicio.cupo_maximo} inscritos
                    {servicio.socio_formador_nombre && ` · ${servicio.socio_formador_nombre}`}
                  </div>
                </div>
                <div style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: servicio.inscritos >= servicio.cupo_maximo ? 'var(--danger)' : 'var(--teal-500)',
                }}>
                  {Math.round((servicio.inscritos / servicio.cupo_maximo) * 100)}%
                </div>
              </button>

              {expanded[servicio.id] && (
                <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-md) var(--space-lg) var(--space-lg)' }}>
                  {loadingInscritos[servicio.id] ? (
                    <div className="loading-spinner" style={{ padding: 'var(--space-lg)' }}>
                      <div className="spinner" />
                    </div>
                  ) : inscritos[servicio.id]?.length > 0 ? (
                    <div className="table-container table-responsive">
                      <table className="table" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Matrícula</th>
                            <th>Carrera</th>
                            <th>Fecha Registro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscritos[servicio.id].map((est) => (
                            <tr key={est.matricula}>
                              <td data-label="Nombre" style={{ fontWeight: 500 }}>{est.nombre_completo}</td>
                              <td data-label="Matrícula"><span className="badge badge-navy">{est.matricula}</span></td>
                              <td data-label="Carrera" className="text-muted">
                                <span className="flex gap-sm">
                                  <HiOutlineAcademicCap /> {est.carrera}
                                </span>
                              </td>
                              <td data-label="Fecha" className="text-muted text-sm">
                                {est.fecha_registro ? new Date(est.fecha_registro).toLocaleDateString('es-MX') : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                      No hay estudiantes inscritos en este servicio.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {servicios.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><HiOutlineUserGroup /></div>
                <h3>Sin servicios</h3>
                <p>No se encontraron servicios con ese criterio.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span className="pagination-info">Página {pagination.page} de {pagination.pages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      )}
    </div>
  )
}
