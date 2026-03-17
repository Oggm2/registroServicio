import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { HiOutlineUserCircle, HiOutlineKey, HiOutlineShieldCheck } from 'react-icons/hi2'

export default function MiPerfilAdmin() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setSubmitting(true)
    try {
      await authAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Contraseña actualizada correctamente')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
      setShowPw(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <span className="page-header-icon navy"><HiOutlineUserCircle /></span>
          Mi Perfil
        </h1>
        <p className="page-subtitle">Información de tu cuenta de administrador</p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: 560 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--navy-700), var(--navy-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700,
              fontFamily: 'var(--font-display)', flexShrink: 0,
            }}>
              {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>{user?.username}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <HiOutlineShieldCheck style={{ color: 'var(--teal-500)' }} />
                <span className="text-sm text-muted">{user?.rol}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HiOutlineKey /> Cambiar Contraseña
            </h3>
            {!showPw && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowPw(true)}>
                Cambiar
              </button>
            )}
          </div>

          {showPw ? (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Contraseña Actual</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Tu contraseña actual"
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPw(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted">
              Por seguridad, actualiza tu contraseña periódicamente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
