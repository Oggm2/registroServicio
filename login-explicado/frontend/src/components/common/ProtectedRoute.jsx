import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── ProtectedRoute ─────────────────────────────────────────────────────────────
// Componente "guardián": envuelve rutas que solo usuarios autenticados pueden ver.
//
// Props:
//   children → el componente que queremos proteger
//   roles    → array de roles permitidos, ej: ['Admin', 'Becario']
//              si no se pasa, solo verifica que el usuario esté logueado

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  // Mientras AuthProvider verifica si hay sesión guardada, mostrar spinner.
  // Sin esto, habría un parpadeo al inicio: la app llevaría al usuario al /login
  // aunque sí tenga sesión (porque user=null durante medio segundo).
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    )
  }

  // Si no hay usuario → redirigir al login.
  // <Navigate replace> evita que /ruta-protegida quede en el historial del navegador.
  if (!user) return <Navigate to="/login" replace />

  // Si la ruta requiere roles específicos y el usuario no tiene el rol correcto → redirigir.
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  // Todo bien → renderizar el componente protegido
  return children
}
