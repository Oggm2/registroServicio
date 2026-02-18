import { useState, useEffect } from 'react'
import { preregistrosAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineQueueList,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
} from 'react-icons/hi2'

export default function PreRegistros() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [carrera, setCarrera] = useState('')

  useEffect(() => {
    loadRegistros()
  }, [periodo, carrera])

  const loadRegistros = async () => {
    setLoading(true)
    try {
      const params = {}
      if (periodo) params.periodo = periodo
      if (carrera) params.carrera = carrera
      const { data } = await preregistrosAPI.getAll(params)
      setRegistros(data)
    } catch {
      toast.error('Error al cargar pre-registros')
    } finally {
      setLoading(false)
    }
  }

  const filtered = registros.filter(r =>
    r.estudiante_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    r.matricula?.toLowerCase().includes(search.toLowerCase()) ||
    r.crn?.toLowerCase().includes(search.toLowerCase()) ||
    r.servicio_descripcion?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon navy"><HiOutlineQueueList /></span>
          Pre-Registros
        </h1>
        <p className="page-subtitle">Listado de todos los pre-registros de estudiantes a servicios</p>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
          <input
            className="form-input"
            placeholder="Buscar por nombre, matrícula, CRN o servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <input
            className="form-input"
            style={{ width: 130 }}
            placeholder="Periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
          <input
            className="form-input"
            style={{ width: 150 }}
            placeholder="Carrera"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between mb-md">
        <span className="text-sm text-muted">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>CRN</th>
                <th>Servicio</th>
                <th>Periodo</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.estudiante_nombre}</td>
                  <td><span className="badge badge-navy">{r.matricula}</span></td>
                  <td className="text-muted text-sm">{r.carrera}</td>
                  <td><span className="badge badge-amber">{r.crn}</span></td>
                  <td>{r.servicio_descripcion}</td>
                  <td className="text-muted">{r.periodo}</td>
                  <td className="text-muted text-sm">
                    {new Date(r.fecha_registro).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
                    No se encontraron pre-registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
