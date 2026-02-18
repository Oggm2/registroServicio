import { useState, useEffect, useRef } from 'react'
import { adminAPI, asistenciasAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area, PieChart, Pie, Legend,
} from 'recharts'
import {
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineSignal,
  HiOutlineExclamationTriangle,
  HiOutlineFunnel,
} from 'react-icons/hi2'

const TOOLTIP_STYLE = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
}

const getOcupacionColor = (pct) => {
  if (pct > 90) return '#1e3a5f'
  if (pct >= 60) return '#4a90d9'
  return '#a8cfef'
}

const ESTATUS_COLORS = {
  pendiente: '#b8c0d0',
  dentro: '#3378c6',
  'asistió': '#2ca05a',
  'no_asistió': '#f25c69',
}

const CARRERA_BLUES = ['#001a33', '#003366', '#004d99', '#0056b8', '#3378c6', '#6699cc', '#99bbdd', '#b8d4ee']

const formatFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dentroAhora, setDentroAhora] = useState(null)
  const [periodoFiltro, setPeriodoFiltro] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchDentro()
    intervalRef.current = setInterval(fetchDentro, 30000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    loadStats()
  }, [periodoFiltro])

  const fetchDentro = async () => {
    try {
      const { data } = await asistenciasAPI.getDentro()
      setDentroAhora(data)
    } catch { /* silencioso */ }
  }

  const loadStats = async () => {
    try {
      const params = periodoFiltro ? { periodo: periodoFiltro } : {}
      const { data } = await adminAPI.getStats(params)
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
          {[1, 2, 3, 4, 5].map(i => (
            <div className="stat-card" key={i}>
              <div className="skeleton" style={{ width: 44, height: 44, marginBottom: 16, borderRadius: 10 }} />
              <div className="skeleton" style={{ width: 80, height: 32, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 120, height: 14 }} />
            </div>
          ))}
        </div>
        <div className="charts-grid">
          {[1, 2, 3, 4].map(i => (
            <div className="chart-card" key={i}>
              <div className="skeleton" style={{ width: 160, height: 18, marginBottom: 24 }} />
              <div className="skeleton" style={{ width: '100%', height: 200 }} />
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

      {/* Filtro por periodo */}
      {stats?.periodos_disponibles?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
          <HiOutlineFunnel style={{ color: 'var(--text-muted)' }} />
          <button
            className={`filter-chip ${!periodoFiltro ? 'active' : ''}`}
            onClick={() => setPeriodoFiltro('')}
          >Todos</button>
          {stats.periodos_disponibles.map(p => (
            <button
              key={p}
              className={`filter-chip ${periodoFiltro === p ? 'active' : ''}`}
              onClick={() => setPeriodoFiltro(p)}
            >{p}</button>
          ))}
        </div>
      )}

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
        {/* Tasa de no-asistencia */}
        <div className="stat-card navy stagger-item">
          <div className="stat-icon navy"><HiOutlineExclamationTriangle /></div>
          <div className="stat-value">{stats?.tasa_no_asistencia ?? 0}%</div>
          <div className="stat-label">Tasa No-Asistencia</div>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>
            {stats?.no_asistieron ?? 0} de {stats?.total_asistencias_feria ?? 0} registros
          </div>
        </div>
        {dentroAhora !== null && (
          <div className="stat-card stagger-item pulse-glow" style={{ border: '2px solid #4a90d9', background: '#f0f7ff' }}>
            <div className="stat-icon" style={{ color: '#4a90d9', background: 'rgba(51, 120, 198, 0.12)' }}><HiOutlineSignal /></div>
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
        {/* 1a. Asistencias por horario */}
        <div className="chart-card">
          <div className="chart-card-title">Asistencias por Horario</div>
          {stats?.asistencias_por_horario?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.asistencias_por_horario}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="horario" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="total" fill="var(--amber-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
            </div>
          )}
        </div>

        {/* 1b. Distribución de Estatus (Donut) */}
        <div className="chart-card">
          <div className="chart-card-title">Distribución de Estatus de Asistencia</div>
          {stats?.estatus_distribucion?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.estatus_distribucion}
                  dataKey="total"
                  nameKey="estatus"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {stats.estatus_distribucion.map((entry, i) => (
                    <Cell key={i} fill={ESTATUS_COLORS[entry.estatus] || '#b8c0d0'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
            </div>
          )}
        </div>

        {/* 2a. Ocupación por Periodo */}
        <div className="chart-card">
          <div className="chart-card-title">Ocupación por Periodo</div>
          {stats?.ocupacion_por_periodo?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.ocupacion_por_periodo}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
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
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
            </div>
          )}
        </div>

        {/* 2b. Pre-registros por Carrera (horizontal) */}
        <div className="chart-card">
          <div className="chart-card-title">Pre-registros por Carrera</div>
          {stats?.preregistros_por_carrera?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.preregistros_por_carrera} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis
                  type="category"
                  dataKey="carrera"
                  width={80}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name, props) => [value, props.payload.nombre]}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {stats.preregistros_por_carrera.map((entry, i) => (
                    <Cell key={i} fill={CARRERA_BLUES[i % CARRERA_BLUES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
            </div>
          )}
        </div>

        {/* 3. Inscritos por Socio Formador */}
        <div className="chart-card">
          <div className="chart-card-title">Inscritos por Socio Formador</div>
          {stats?.inscritos_por_socio_formador?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.inscritos_por_socio_formador}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="socio_formador" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="total" fill="var(--verde-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
            </div>
          )}
        </div>

        {/* 4. Tendencia de Inscripciones (full-width AreaChart) */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-card-title">Tendencia de Inscripciones</div>
          {stats?.tendencia_inscripciones?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.tendencia_inscripciones}>
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3378c6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3378c6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={formatFecha} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatFecha} />
                <Area type="monotone" dataKey="total" stroke="#3378c6" fill="url(#gradBlue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
            </div>
          )}
        </div>

        {/* 5. Proyectos más solicitados (full-width) */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
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
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="inscritos" fill="var(--teal-500)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="cupo_maximo" fill="var(--gray-200)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineChartBarSquare /></div>
              <p>Sin datos disponibles</p>
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
          <div className="table-container table-responsive" style={{ border: 'none', borderRadius: 0 }}>
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
                      <td data-label="Servicio" style={{ fontWeight: 500 }}>{s.descripcion}</td>
                      <td data-label="CRN"><span className="badge badge-navy">{s.crn}</span></td>
                      <td data-label="Inscritos">{s.inscritos}</td>
                      <td data-label="Cupo Máximo">{s.cupo_maximo}</td>
                      <td data-label="Disponibles">
                        <span className={`badge ${s.disponibles <= 0 ? 'badge-red' : s.disponibles <= 5 ? 'badge-amber' : 'badge-teal'}`}>
                          {s.disponibles}
                        </span>
                      </td>
                      <td data-label="Ocupación">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <div className="progress-track" style={{ flex: 1, maxWidth: 120 }}>
                            <div className="progress-fill" style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: pct >= 90 ? '#1e3a5f' : pct >= 60 ? '#4a90d9' : '#a8cfef',
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
