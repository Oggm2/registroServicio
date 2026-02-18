import { useState } from 'react'
import { estudiantesAPI, preregistrosAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineUserPlus,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'

export default function InscribirServicio() {
  const [matricula, setMatricula] = useState('')
  const [crn, setCrn] = useState('')
  const [estudiante, setEstudiante] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [exito, setExito] = useState(false)

  const buscarEstudiante = async () => {
    if (!matricula.trim()) {
      toast.error('Ingresa la matrícula')
      return
    }
    setBuscando(true)
    setEstudiante(null)
    setExito(false)
    try {
      const { data } = await estudiantesAPI.buscar({ q: matricula.trim() })
      if (data.length > 0) {
        setEstudiante(data[0])
      } else {
        toast.error('Estudiante no encontrado')
      }
    } catch {
      toast.error('Error al buscar estudiante')
    } finally {
      setBuscando(false)
    }
  }

  const handleInscribir = async (e) => {
    e.preventDefault()
    if (!estudiante || !crn.trim()) {
      toast.error('Busca un estudiante e ingresa el CRN')
      return
    }
    setInscribiendo(true)
    try {
      await preregistrosAPI.create({
        estudiante_id: estudiante.id,
        crn: crn.trim(),
      })
      setExito(true)
      toast.success('Estudiante inscrito exitosamente')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al inscribir')
    } finally {
      setInscribiendo(false)
    }
  }

  const resetForm = () => {
    setMatricula('')
    setCrn('')
    setEstudiante(null)
    setExito(false)
  }

  if (exito) {
    return (
      <div>
        <div className="page-header">
          <h1>
            <span className="page-header-icon teal"><HiOutlineCheckCircle /></span>
            Inscripción Exitosa
          </h1>
        </div>
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-xl)',
            background: 'var(--success-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'var(--teal-500)',
            margin: '0 auto var(--space-lg)',
          }}>
            <HiOutlineCheckCircle />
          </div>
          <h3>{estudiante.nombre_completo}</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-lg)' }}>
            Inscrito al servicio con CRN: <strong>{crn}</strong>
          </p>
          <button className="btn btn-primary" onClick={resetForm}>
            Nueva Inscripción
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon amber"><HiOutlineUserPlus /></span>
          Inscribir a Servicio
        </h1>
        <p className="page-subtitle">Inscribe un estudiante a un servicio mediante su CRN</p>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {/* Paso 1: Buscar estudiante */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}>1. Buscar Estudiante</h4>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
              <input
                className="form-input"
                placeholder="Matrícula del estudiante..."
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarEstudiante()}
              />
            </div>
            <button className="btn btn-secondary" onClick={buscarEstudiante} disabled={buscando}>
              {buscando ? '...' : 'Buscar'}
            </button>
          </div>

          {estudiante && (
            <div style={{
              marginTop: 'var(--space-md)', padding: 'var(--space-md)',
              background: 'var(--success-soft)', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(46, 196, 182, 0.2)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{estudiante.nombre_completo}</div>
              <div className="text-sm text-muted">
                {estudiante.matricula} · {estudiante.carrera_nombre || estudiante.carrera}
              </div>
            </div>
          )}
        </div>

        {/* Paso 2: Ingresar CRN */}
        <form onSubmit={handleInscribir}>
          <h4 style={{ marginBottom: 'var(--space-md)', opacity: estudiante ? 1 : 0.4 }}>
            2. Ingresar CRN del Servicio
          </h4>
          <div className="form-group">
            <input
              className="form-input"
              placeholder="CRN del servicio"
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
              disabled={!estudiante}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={!estudiante || !crn.trim() || inscribiendo}
          >
            {inscribiendo ? 'Inscribiendo...' : 'Inscribir Estudiante'}
          </button>
        </form>
      </div>
    </div>
  )
}
