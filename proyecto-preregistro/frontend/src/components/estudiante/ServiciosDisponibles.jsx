import { useState, useEffect } from 'react'
import { serviciosAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { HiOutlineEye, HiOutlineMagnifyingGlass } from 'react-icons/hi2'

export default function ServiciosDisponibles() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadServicios()
  }, [])

  const loadServicios = async () => {
    try {
      const { data } = await serviciosAPI.getAll()
      setServicios(data.data || data)
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  const filtered = servicios.filter(s =>
    s.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
    s.crn?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon navy"><HiOutlineEye /></span>
          Servicios Disponibles
        </h1>
        <p className="page-subtitle">Consulta los proyectos y servicios disponibles</p>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
          <input
            className="form-input"
            placeholder="Buscar por descripción o CRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                <th>Periodo</th>
                <th>Cupo</th>
                <th>Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const disponible = s.cupo_maximo - (s.inscritos || 0)
                const pct = s.cupo_maximo > 0 ? ((s.inscritos || 0) / s.cupo_maximo) * 100 : 0
                return (
                  <tr key={s.id} className="stagger-item">
                    <td><span className="badge badge-navy">{s.crn}</span></td>
                    <td style={{ fontWeight: 500 }}>{s.descripcion}</td>
                    <td className="text-muted">{s.periodo}</td>
                    <td>{s.inscritos || 0} / {s.cupo_maximo}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div style={{
                          flex: 1, height: 6, background: 'var(--gray-100)',
                          borderRadius: 3, maxWidth: 100, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: pct >= 90 ? 'var(--red-500)' : pct >= 60 ? 'var(--amber-500)' : 'var(--teal-500)',
                            borderRadius: 3, transition: 'width 0.3s',
                          }} />
                        </div>
                        <span className={`badge ${disponible <= 0 ? 'badge-red' : disponible <= 5 ? 'badge-amber' : 'badge-teal'}`}>
                          {disponible <= 0 ? 'Lleno' : `${disponible} disp.`}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
                    No se encontraron servicios
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
