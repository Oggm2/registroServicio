import { useState } from 'react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineDocumentArrowDown,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2'

export default function Reportes() {
  const [descargando, setDescargando] = useState(null)
  const [filtros, setFiltros] = useState({ periodo: '', carrera: '', formato: 'csv' })

  const set = (field) => (e) => setFiltros({ ...filtros, [field]: e.target.value })

  const descargar = async (tipo) => {
    setDescargando(tipo)
    try {
      const params = { ...filtros }
      const response = tipo === 'estudiantes'
        ? await adminAPI.reporteEstudiantes(params)
        : await adminAPI.reportePreregistros(params)

      const ext = filtros.formato === 'excel' ? 'xlsx' : 'csv'
      const blob = new Blob([response.data], {
        type: ext === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.${ext}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      toast.success(`Reporte de ${tipo} descargado`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al generar reporte')
    } finally {
      setDescargando(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon navy"><HiOutlineDocumentArrowDown /></span>
          Reportes
        </h1>
        <p className="page-subtitle">Descarga reportes de estudiantes y pre-registros en formato CSV o Excel</p>
      </div>

      {/* Filtros globales */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h4 style={{ marginBottom: 'var(--space-md)' }}>Filtros</h4>
        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', maxWidth: 640 }}>
          <div className="form-group">
            <label className="form-label">Periodo</label>
            <input className="form-input" placeholder="ej. 2025-1"
              value={filtros.periodo} onChange={set('periodo')} />
          </div>
          <div className="form-group">
            <label className="form-label">Carrera</label>
            <input className="form-input" placeholder="Todas"
              value={filtros.carrera} onChange={set('carrera')} />
          </div>
          <div className="form-group">
            <label className="form-label">Formato</label>
            <select className="form-select" value={filtros.formato} onChange={set('formato')}>
              <option value="csv">CSV</option>
              <option value="excel">Excel (.xlsx)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas de reporte */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Reporte de Estudiantes */}
        <div className="card stagger-item" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: 'var(--amber-600)',
            marginBottom: 'var(--space-lg)',
          }}>
            <HiOutlineUsers />
          </div>
          <h3 style={{ marginBottom: 'var(--space-xs)' }}>Reporte de Estudiantes</h3>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-xl)', flex: 1 }}>
            Listado completo de estudiantes registrados con su información personal, carrera, matrícula y datos de contacto.
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => descargar('estudiantes')}
            disabled={descargando === 'estudiantes'}
          >
            <HiOutlineArrowDownTray />
            {descargando === 'estudiantes' ? 'Generando...' : 'Descargar Reporte'}
          </button>
        </div>

        {/* Reporte de Pre-registros */}
        <div className="card stagger-item" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--success-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: 'var(--teal-600)',
            marginBottom: 'var(--space-lg)',
          }}>
            <HiOutlineClipboardDocumentList />
          </div>
          <h3 style={{ marginBottom: 'var(--space-xs)' }}>Reporte de Pre-registros</h3>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-xl)', flex: 1 }}>
            Todos los pre-registros con detalle de estudiante, servicio, CRN, fecha de registro y periodo académico.
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => descargar('preregistros')}
            disabled={descargando === 'preregistros'}
          >
            <HiOutlineArrowDownTray />
            {descargando === 'preregistros' ? 'Generando...' : 'Descargar Reporte'}
          </button>
        </div>
      </div>
    </div>
  )
}
