import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './components/auth/Login'
import ProtectedRoute from './components/common/ProtectedRoute'

// ── RedirectByRole ─────────────────────────────────────────────────────────────
// Componente auxiliar para la ruta raíz "/".
// Redirige según el rol: no es una pantalla, es lógica pura de navegación.
function RedirectByRole() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol === 'Estudiante') return <Navigate to="/feria" replace />
  if (user.rol === 'Becario') return <Navigate to="/buscar-estudiante" replace />
  return <Navigate to="/dashboard" replace />
}

// ── App ────────────────────────────────────────────────────────────────────────
// Define el mapa de rutas de la aplicación.
// BrowserRouter (en main.jsx) habilita la navegación por URL en React.
export default function App() {
  return (
    <Routes>

      {/* ── Rutas PÚBLICAS ─────────────────────────────────────────────────── */}
      {/* Cualquiera puede acceder sin token */}
      <Route path="/login" element={<Login />} />


      {/* ── Rutas PROTEGIDAS ───────────────────────────────────────────────── */}
      {/* ProtectedRoute verifica que haya sesión antes de renderizar el contenido */}
      <Route path="/" element={
        <ProtectedRoute>
          <RedirectByRole />
        </ProtectedRoute>
      } />

      {/* Ruta de ejemplo protegida para un solo rol */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['Admin']}>
          <div>Dashboard del Admin</div>
        </ProtectedRoute>
      } />

      {/* Catch-all: cualquier ruta no definida → ir a "/" (que redirige por rol) */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
