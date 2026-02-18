import { useState, useEffect, useRef } from 'react'
import { adminAPI, asistenciasAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineSignal,
} from 'react-icons/hi2'

const getOcupacionColor = (pct) => {
  if (pct > 90) return '#1e3a5f'
  if (pct >= 60) return '#4a90d9'
  return '#a8cfef'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dentroAhora, setDentroAhora] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    loadStats()
    fetchDentro()
    intervalRef.current = setInterval(fetchDentro, 30000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const fetchDentro = async () => {
    try {
      const { data } = await asistenciasAPI.getDentro()
      setDentroAhora(data)
    } catch { /* silencioso */ }
  }

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats()
      setStats(data)
    } catch {
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>
            <span className="page-header-icon amber"><HiOutlineChartBarSquare /></span>
            Dashboard
          </h1>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div className="stat-card" key={i}>
              <div className="skeleton" style={{ width: 44, height: 44, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: 80, height: 32, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 120, height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon amber"><HiOutlineChartBarSquare /></span>
          Dashboard
        </h1>
        <p className="page-subtitle">Resumen general del sistema de pre-registro</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card amber stagger-item">
          <div className="stat-icon amber"><HiOutlineUsers /></div>
          <div className="stat-value">{stats?.total_registrados ?? 0}</div>
          <div className="stat-label">Estudiantes Registrados</div>
        </div>
        <div className="stat-card teal stagger-item">
          <div className="stat-icon teal"><HiOutlineCalendarDays /></div>
          <div className="stat-value">{stats?.total_asistencias_feria ?? 0}</div>
          <div className="stat-label">Registros a Feria</div>
        </div>
        <div className="stat-card navy stagger-item">
          <div className="stat-icon navy"><HiOutlineClipboardDocumentList /></div>
          <div className="stat-value">{stats?.total_preregistros ?? 0}</div>
          <div className="stat-label">Pre-registros Totales</div>
        </div>
        <div className="stat-card red stagger-item">
          <div className="stat-icon red"><HiOutlineAcademicCap /></div>
          <div className="stat-value">{stats?.servicios_activos ?? 0}</div>
          <div className="stat-label">Servicios Activos</div>
        </div>
        {dentroAhora !== null && (
          <div className="stat-card stagger-item" style={{ border: '2px solid #4a90d9', background: '#f0f7ff' }}>
            <div className="stat-icon" style={{ color: '#4a90d9' }}><HiOutlineSignal /></div>
            <div className="stat-value" style={{ color: '#1e3a5f' }}>{dentroAhora.dentro_ahora}</div>
            <div className="stat-label">En Feria Ahora</div>
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>
              {dentroAhora.total_asistieron} asistieron · {dentroAhora.total_registrados} registrados
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Asistencias por horario */}
        <div className="chart-card stagger-item">
          <div className="chart-card-title">Asistencias por Horario</div>
          {stats?.asistencias_por_horario?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.asistencias_por_horario}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="horario" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                  }}
                />
                <Bar dataKey="total" fill="var(--amber-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted text-sm" style={{ padding: 'var(--space-2xl)' }}>
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Ocupación por Periodo */}
        <div className="chart-card stagger-item">
          <div className="chart-card-title">Ocupación por Periodo</div>
          {stats?.ocupacion_por_periodo?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.ocupacion_por_periodo}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                  }}
                  formatter={(value, name, props) => {
                    const d = props.payload
                    return [`${d.inscritos}/${d.cupo_total} (${d.porcentaje}%)`, 'Ocupación']
                  }}
                />
                <Bar dataKey="porcentaje" radius={[4, 4, 0, 0]}>
                  {stats.ocupacion_por_periodo.map((entry, i) => (
                    <Cell key={i} fill={getOcupacionColor(entry.porcentaje)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted text-sm" style={{ padding: 'var(--space-2xl)' }}>
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Inscritos por Socio Formador */}
        <div className="chart-card stagger-item">
          <div className="chart-card-title">Inscritos por Socio Formador</div>
          {stats?.inscritos_por_socio_formador?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.inscritos_por_socio_formador}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="socio_formador" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                  }}
                />
                <Bar dataKey="total" fill="var(--verde-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted text-sm" style={{ padding: 'var(--space-2xl)' }}>
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Proyectos más solicitados */}
        <div className="chart-card stagger-item" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-card-title">Servicios Más Solicitados</div>
          {stats?.proyectos_mas_solicitados?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.proyectos_mas_solicitados} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis
                  type="category"
                  dataKey="descripcion"
                  width={200}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                  }}
                />
                <Bar dataKey="inscritos" fill="var(--teal-500)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="cupo_maximo" fill="var(--gray-200)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted text-sm" style={{ padding: 'var(--space-2xl)' }}>
              Sin datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Cupos Disponibles */}
      {stats?.cupos_disponibles && stats.cupos_disponibles.length > 0 && (
        <div className="card stagger-item">
          <div className="card-header">
            <h3 className="card-title">Cupos Disponibles</h3>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>CRN</th>
                  <th>Inscritos</th>
                  <th>Cupo Máximo</th>
                  <th>Disponibles</th>
                  <th>Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {stats.cupos_disponibles.map((s) => {
                  const pct = s.cupo_maximo > 0 ? (s.inscritos / s.cupo_maximo) * 100 : 0
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.descripcion}</td>
                      <td><span className="badge badge-navy">{s.crn}</span></td>
                      <td>{s.inscritos}</td>
                      <td>{s.cupo_maximo}</td>
                      <td>
                        <span className={`badge ${s.disponibles <= 0 ? 'badge-red' : s.disponibles <= 5 ? 'badge-amber' : 'badge-teal'}`}>
                          {s.disponibles}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <div style={{
                            flex: 1, height: 6, background: 'var(--gray-100)',
                            borderRadius: 3, maxWidth: 120, overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${Math.min(pct, 100)}%`, height: '100%',
                              background: pct >= 90 ? '#1e3a5f' : pct >= 60 ? '#4a90d9' : '#a8cfef',
                              borderRadius: 3,
                            }} />
                          </div>
                          <span className="text-xs text-muted">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
