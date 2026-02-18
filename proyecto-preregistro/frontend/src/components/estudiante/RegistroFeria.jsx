import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { asistenciasAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi2'

const HORARIOS = [
  { value: '09:00 - 10:00', label: '9:00 AM — 10:00 AM' },
  { value: '10:00 - 11:00', label: '10:00 AM — 11:00 AM' },
  { value: '11:00 - 12:00', label: '11:00 AM — 12:00 PM' },
  { value: '12:00 - 13:00', label: '12:00 PM — 1:00 PM' },
  { value: '13:00 - 14:00', label: '1:00 PM — 2:00 PM' },
  { value: '14:00 - 15:00', label: '2:00 PM — 3:00 PM' },
  { value: '15:00 - 16:00', label: '3:00 PM — 4:00 PM' },
  { value: '16:00 - 17:00', label: '4:00 PM — 5:00 PM' },
]

export default function RegistroFeria() {
  const { user } = useAuth()
  const [registro, setRegistro] = useState(null)
  const [horario, setHorario] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    loadRegistro()
  }, [])

  const loadRegistro = async () => {
    try {
      // Intentar obtener registro existente de la feria del estudiante
      const { data } = await asistenciasAPI.registrar({ check: true })
      if (data.registro) {
        setRegistro(data.registro)
        setHorario(data.registro.horario_seleccionado)
      }
    } catch {
      // No hay registro previo
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrar = async () => {
    if (!horario) {
      toast.error('Selecciona un horario')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await asistenciasAPI.registrar({
        horario_seleccionado: horario,
      })
      setRegistro(data.registro || { horario_seleccionado: horario, estatus_asistencia: 'pendiente' })
      toast.success('Registro a feria exitoso')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCambiarHorario = async () => {
    if (!horario || horario === registro?.horario_seleccionado) {
      toast.error('Selecciona un horario diferente')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await asistenciasAPI.actualizar(registro.id, {
        horario_seleccionado: horario,
      })
      setRegistro({ ...registro, horario_seleccionado: horario })
      toast.success('Horario actualizado')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  // Ya registrado
  if (registro && !editing) {
    return (
      <div>
        <div className="page-header">
          <h1>
            <span className="page-header-icon teal"><HiOutlineCheckCircle /></span>
            Registro a Feria
          </h1>
          <p className="page-subtitle">Ya estás registrado para asistir a la feria</p>
        </div>

        <div className="card" style={{ maxWidth: 520 }}>
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-xl) 0',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--radius-xl)',
              background: 'var(--success-soft)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: 'var(--teal-500)',
              margin: '0 auto var(--space-lg)',
            }}>
              <HiOutlineCheckCircle />
            </div>

            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Registro Confirmado</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
              Tu asistencia a la feria está registrada
            </p>

            <div style={{
              background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
            }}>
              <div className="text-xs text-muted" style={{ marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Horario Seleccionado
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                {registro.horario_seleccionado}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
              <span className="text-sm">Estatus:</span>
              <span className={`badge ${
                registro.estatus_asistencia === 'asistió' ? 'badge-teal' :
                registro.estatus_asistencia === 'no_asistió' ? 'badge-red' : 'badge-amber'
              }`}>
                {registro.estatus_asistencia || 'pendiente'}
              </span>
            </div>

            <button className="btn btn-outline" onClick={() => setEditing(true)}>
              <HiOutlineClock /> Cambiar Horario
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Formulario de registro / edición
  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon amber"><HiOutlineCalendarDays /></span>
          {editing ? 'Cambiar Horario' : 'Registro a Feria'}
        </h1>
        <p className="page-subtitle">
          {editing ? 'Selecciona tu nuevo horario de asistencia' : 'Selecciona tu horario de asistencia a la feria'}
        </p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>
          Selecciona un Horario
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-xl)',
        }}>
          {HORARIOS.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => setHorario(h.value)}
              style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${horario === h.value ? 'var(--amber-500)' : 'var(--border)'}`,
                background: horario === h.value ? 'var(--accent-soft)' : 'var(--white)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: horario === h.value ? 600 : 400,
                color: horario === h.value ? 'var(--amber-600)' : 'var(--text-primary)',
              }}
            >
              <HiOutlineClock style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {h.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {editing && (
            <button className="btn btn-outline" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          )}
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            onClick={editing ? handleCambiarHorario : handleRegistrar}
            disabled={submitting || !horario}
          >
            {submitting ? 'Procesando...' : editing ? 'Actualizar Horario' : 'Confirmar Registro'}
          </button>
        </div>
      </div>
    </div>
  )
}
