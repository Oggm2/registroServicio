import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sociosFormadoresAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineSquare3Stack3D,
  HiOutlineArrowLeft,
} from 'react-icons/hi2'

export default function DetalleSocio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDetalle()
  }, [id])

  const loadDetalle = async () => {
    try {
      const { data } = await sociosFormadoresAPI.getDetalle(id)
      setDetalle(data)
    } catch {
      toast.error('Error al cargar detalle del socio formador')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  if (!detalle) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><HiOutlineBuildingOffice2 /></div>
        <h3>Socio formador no encontrado</h3>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/gestion-socios')}>
          <HiOutlineArrowLeft /> Volver a Socios
        </button>
      </div>

      <div className="page-header">
        <h1>
          <span className="page-header-icon teal"><HiOutlineBuildingOffice2 /></span>
          {detalle.nombre}
        </h1>
        <p className="page-subtitle">Detalle y metricas del socio formador</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card teal stagger-item">
          <div className="stat-icon teal"><HiOutlineSquare3Stack3D /></div>
          <div className="stat-value">{detalle.total_servicios}</div>
          <div className="stat-label">Servicios</div>
        </div>
        <div className="stat-card amber stagger-item">
          <div className="stat-icon amber"><HiOutlineUsers /></div>
          <div className="stat-value">{detalle.total_inscritos}</div>
          <div className="stat-label">Inscritos Totales</div>
        </div>
        <div className="stat-card navy stagger-item">
          <div className="stat-icon navy"><HiOutlineClipboardDocumentList /></div>
          <div className="stat-value">{detalle.total_cupo}</div>
          <div className="stat-label">Cupo Total</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Servicios Asociados</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>CRN</th>
                <th>Descripcion</th>
                <th>Periodo</th>
                <th>Cupo Maximo</th>
                <th>Inscritos</th>
                <th>Disponibles</th>
              </tr>
            </thead>
            <tbody>
              {detalle.servicios.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-navy">{s.crn}</span></td>
                  <td style={{ fontWeight: 500 }}>{s.descripcion}</td>
                  <td className="text-muted">{s.periodo}</td>
                  <td>{s.cupo_maximo}</td>
                  <td>{s.inscritos}</td>
                  <td>
                    <span className={`badge ${(s.cupo_maximo - s.inscritos) <= 0 ? 'badge-red' : 'badge-teal'}`}>
                      {s.cupo_maximo - s.inscritos}
                    </span>
                  </td>
                </tr>
              ))}
              {detalle.servicios.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
                    No hay servicios asociados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
