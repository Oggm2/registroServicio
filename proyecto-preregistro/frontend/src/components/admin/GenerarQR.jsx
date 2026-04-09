import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { checkinAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineQrCode,
  HiOutlineClock,
  HiOutlineArrowDownTray,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'

const OPCIONES_HORAS = [
  { value: 4, label: '4 horas' },
  { value: 8, label: '8 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '24 horas' },
]

export default function GenerarQR() {
  const [horas, setHoras] = useState(8)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef(null)

  const handleGenerar = async () => {
    setLoading(true)
    try {
      const { data } = await checkinAPI.generarToken({ horas_validez: horas })
      setQrData(data)
      toast.success('QR generado correctamente')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al generar QR')
    } finally {
      setLoading(false)
    }
  }

  const handleDescargar = () => {
    const canvas = document.getElementById('qr-canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-feria-${Date.now()}.png`
    a.click()
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon amber"><HiOutlineQrCode /></span>
          Generar QR de Entrada
        </h1>
        <p className="page-subtitle">
          Genera el código QR que los estudiantes escanearán para registrar su asistencia de forma autónoma
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', maxWidth: 800 }}>

        {/* Panel izquierdo: configuración */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Configuración</h3>

          <div className="form-group">
            <label className="form-label">Validez del QR</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
              {OPCIONES_HORAS.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setHoras(op.value)}
                  style={{
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${horas === op.value ? 'var(--amber-500)' : 'var(--border)'}`,
                    background: horas === op.value ? 'var(--accent-soft)' : 'var(--white)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: horas === op.value ? 600 : 400,
                    color: horas === op.value ? 'var(--amber-600)' : 'var(--text-primary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <HiOutlineClock style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleGenerar}
            disabled={loading}
            style={{ marginTop: 'var(--space-md)' }}
          >
            {loading ? 'Generando...' : 'Generar QR'}
          </button>

          <div style={{
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-md)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'flex-start' }}>
              <HiOutlineShieldCheck style={{ flexShrink: 0, marginTop: 2, color: 'var(--teal-500)' }} />
              <span>
                El QR está firmado con <strong>HMAC-SHA256</strong>. No puede ser falsificado ni reutilizado fuera del periodo de validez.
              </span>
            </div>
          </div>
        </div>

        {/* Panel derecho: QR */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          {qrData ? (
            <>
              <QRCodeCanvas
                id="qr-canvas"
                value={qrData.qr_url}
                size={220}
                level="H"
                includeMargin
                style={{ borderRadius: 'var(--radius-md)' }}
              />
              <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
                <div className="badge badge-amber" style={{ marginBottom: 'var(--space-sm)' }}>
                  <HiOutlineClock style={{ marginRight: 4 }} />
                  Expira: {qrData.expires_at_readable}
                </div>
                <br />
                <button
                  className="btn btn-outline"
                  onClick={handleDescargar}
                  style={{ marginTop: 'var(--space-sm)' }}
                >
                  <HiOutlineArrowDownTray /> Descargar QR
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <HiOutlineQrCode style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', opacity: 0.3 }} />
              <p className="text-sm">El QR aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
