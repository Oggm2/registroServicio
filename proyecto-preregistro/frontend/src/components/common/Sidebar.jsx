import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import {
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlineClipboardDocumentCheck,
  HiOutlineQueueList,
  HiOutlineUserPlus,
  HiOutlineChartBarSquare,
  HiOutlineCog6Tooth,
  HiOutlineDocumentArrowDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineUserCircle,
  HiOutlineKey,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const navByRole = {
  Estudiante: [
    { section: 'Mi Portal', items: [
      { to: '/feria', label: 'Registro Feria', icon: HiOutlineCalendarDays },
      { to: '/mis-proyectos', label: 'Mis Proyectos', icon: HiOutlineClipboardDocumentList },
      { to: '/servicios', label: 'Servicios Disponibles', icon: HiOutlineEye },
      { to: '/mi-perfil', label: 'Mi Perfil', icon: HiOutlineUserCircle },
    ]},
  ],
  Becario: [
    { section: 'Gestión', items: [
      { to: '/buscar-estudiante', label: 'Buscar Estudiante', icon: HiOutlineMagnifyingGlass },
      { to: '/validar-asistencia', label: 'Validar Asistencia', icon: HiOutlineClipboardDocumentCheck },
      { to: '/inscribir-servicio', label: 'Inscribir a Servicio', icon: HiOutlineUserPlus },
      { to: '/preregistros', label: 'Pre-registros', icon: HiOutlineQueueList },
    ]},
  ],
  Admin: [
    { section: 'Panel', items: [
      { to: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
    ]},
    { section: 'Gestión', items: [
      { to: '/buscar-estudiante', label: 'Buscar Estudiante', icon: HiOutlineMagnifyingGlass },
      { to: '/validar-asistencia', label: 'Validar Asistencia', icon: HiOutlineClipboardDocumentCheck },
      { to: '/inscribir-servicio', label: 'Inscribir a Servicio', icon: HiOutlineUserPlus },
      { to: '/preregistros', label: 'Pre-registros', icon: HiOutlineQueueList },
    ]},
    { section: 'Administración', items: [
      { to: '/gestion-servicios', label: 'Gestión Servicios', icon: HiOutlineCog6Tooth },
      { to: '/gestion-socios', label: 'Socios Formadores', icon: HiOutlineBuildingOffice2 },
      { to: '/gestion-estudiantes', label: 'Gestión Estudiantes', icon: HiOutlineAcademicCap },
      { to: '/gestion-becarios', label: 'Gestión Becarios', icon: HiOutlineUserGroup },
      { to: '/reportes', label: 'Reportes', icon: HiOutlineDocumentArrowDown },
    ]},
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const sections = navByRole[user?.rol] || []
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || '??'

  const [pwModal, setPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwSubmitting, setPwSubmitting] = useState(false)

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
    setPwSubmitting(true)
    try {
      await authAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Contraseña actualizada')
      setPwModal(false)
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setPwSubmitting(false)
    }
  }

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99,
        display: 'none',
      }} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/logo_borrego.png" alt="Logo" className="sidebar-logo-icon" />
            <div>
              <div className="sidebar-logo-text">Pre-Registro</div>
              <div className="sidebar-logo-sub">Sistema Académico</div>
            </div>
          </div>
        </div>

        {sections.map((section) => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            <ul className="sidebar-nav">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="sidebar-link-icon"><item.icon /></span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sidebar-footer">
          <img src="/images/logo.png" alt="Tec de Monterrey" className="sidebar-tec-logo" />
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nombre || user?.username}</div>
              <div className="sidebar-user-role">{user?.rol}</div>
            </div>
            <button className="sidebar-logout" onClick={() => { setPwForm({ current_password: '', new_password: '', confirm: '' }); setPwModal(true) }} title="Cambiar contraseña" style={{ marginLeft: 0 }}>
              <HiOutlineKey />
            </button>
            <button className="sidebar-logout" onClick={logout} title="Cerrar sesión">
              <HiOutlineArrowRightOnRectangle />
            </button>
          </div>
        </div>
      </aside>

      {pwModal && (
        <div className="modal-overlay" onClick={() => setPwModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button className="modal-close" onClick={() => setPwModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Contraseña Actual</label>
                  <input className="form-input" type="password" placeholder="Tu contraseña actual"
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <input className="form-input" type="password" placeholder="Repite la nueva contraseña"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setPwModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={pwSubmitting}>
                  {pwSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
