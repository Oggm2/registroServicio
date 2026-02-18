import { useState, useEffect } from 'react'
import { preregistrosAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineQueueList,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'

export default function PreRegistros() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState(null)
  const [periodo, setPeriodo] = useState('')
  const [carrera, setCarrera] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadRegistros()
  }, [page, periodo, carrera])

  const loadRegistros = async (q = search) => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (periodo) params.periodo = periodo
      if (carrera) params.carrera = carrera
      if (q) params.q = q
      const { data } = await preregistrosAPI.getAll(params)
      setRegistros(data.data || data)
      setPagination(data.pagination || null)
    } catch {
      toast.error('Error al cargar pre-registros')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (val) => {
    setSearch(val)
    if (searchTimer) clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => { setPage(1); loadRegistros(val) }, 400))
  }

  return (
    <div>
      <div className="page-header">
        <h1><span className="page-header-icon navy"><HiOutlineQueueList /></span>Pre-Registros</h1>
        <p className="page-subtitle">Listado de todos los pre-registros de estudiantes a servicios</p>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
          <input className="form-input" placeholder="Buscar por nombre, matrícula, CRN o servicio..." value={search} onChange={(e) => handleSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <input className="form-input" style={{ width: 130 }} placeholder="Periodo" value={periodo} onChange={(e) => { setPeriodo(e.target.value); setPage(1) }} />
          <input className="form-input" style={{ width: 150 }} placeholder="Carrera" value={carrera} onChange={(e) => { setCarrera(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="flex-between mb-md">
        <span className="text-sm text-muted">
          {pagination ? `${pagination.total} registro${pagination.total !== 1 ? 's' : ''}` : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-container table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Estudiante</th><th>Matrícula</th><th>Carrera</th><th>CRN</th><th>Servicio</th><th>Periodo</th><th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Estudiante" style={{ fontWeight: 500 }}>{r.estudiante_nombre}</td>
                    <td data-label="Matrícula"><span className="badge badge-navy">{r.matricula}</span></td>
                    <td data-label="Carrera" className="text-muted text-sm">{r.carrera}</td>
                    <td data-label="CRN"><span className="badge badge-amber">{r.crn}</span></td>
                    <td data-label="Servicio">{r.servicio_descripcion}</td>
                    <td data-label="Periodo" className="text-muted">{r.periodo}</td>
                    <td data-label="Fecha" className="text-muted text-sm">
                      {new Date(r.fecha_registro).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
                {registros.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>No se encontraron pre-registros</td></tr>
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
    </div>
  )
}
