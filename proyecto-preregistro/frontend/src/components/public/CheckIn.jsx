import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { checkinAPI } from '../../services/api'
import {
  HiOutlineQrCode,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
} from 'react-icons/hi2'

export default function CheckIn() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [matricula, setMatricula] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resultado, setResultado] = useState(null) // { nombre_completo, matricula, horario_seleccionado }
  const [error, setError] = useState('')

  const tokenValido = token.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    const mat = matricula.trim().toLowerCase()
    if (!mat) {
      setError('Ingresa tu matrícula')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const { data } = await checkinAPI.entrada({ matricula: mat, token })
      setResultado(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada')
    } finally {
      setSubmitting(false)
    }
  }

  if (!tokenValido) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <HiOutlineExclamationTriangle style={{ fontSize: '2.5rem', color: 'var(--red-500)', marginBottom: 'var(--space-md)' }} />
          <h2>QR inválido</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>
            Este enlace no contiene un código válido. Escanea el QR de la entrada de la feria.
          </p>
        </div>
      </div>
    )
  }

  if (resultado) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-xl)',
            background: 'var(--success-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'var(--teal-500)',
            margin: '0 auto var(--space-lg)',
          }}>
            <HiOutlineCheckCircle />
          </div>
          <h2 style={{ marginBottom: 'var(--space-xs)' }}>¡Bienvenido!</h2>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            {resultado.nombre_completo}
          </p>
          <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-lg)' }}>
            {resultado.matricula}
          </p>
          <div style={{
            background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)', display: 'flex',
            alignItems: 'center', gap: 'var(--space-sm)', justifyContent: 'center',
          }}>
            <HiOutlineClock style={{ color: 'var(--amber-500)' }} />
            <span className="text-sm" style={{ fontWeight: 600 }}>
              {resultado.horario_seleccionado}
            </span>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: 'var(--space-md)' }}>
            Tu entrada ha sido registrada exitosamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page" style={{ justifyContent: 'center' }}>
      <div className="auth-card" style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-xl)',
            background: 'var(--accent-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', color: 'var(--amber-500)',
            margin: '0 auto var(--space-md)',
          }}>
            <HiOutlineQrCode />
          </div>
          <h2 style={{ marginBottom: 'var(--space-xs)' }}>Registro de Entrada</h2>
          <p className="text-muted text-sm">Ingresa tu matrícula para registrar tu asistencia a la feria</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Matrícula</label>
            <input
              className={`form-input ${error ? 'error' : ''}`}
              type="text"
              placeholder="Ej. A01234567"
              value={matricula}
              onChange={(e) => { setError(''); setMatricula(e.target.value) }}
              autoFocus
              autoComplete="off"
              style={{ letterSpacing: '0.05em', fontSize: '1.1rem' }}
            />
          </div>

          {error && (
            <div className="login-error" style={{ marginBottom: 'var(--space-md)' }}>
              <HiOutlineExclamationTriangle /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={submitting || !matricula.trim()}
          >
            {submitting ? 'Verificando...' : 'Registrar Entrada'}
          </button>
        </form>
      </div>
    </div>
  )
}
