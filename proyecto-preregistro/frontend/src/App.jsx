import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'

// Common
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Estudiante
import RegistroFeria from './components/estudiante/RegistroFeria'
import MisProyectos from './components/estudiante/MisProyectos'
import ServiciosDisponibles from './components/estudiante/ServiciosDisponibles'
import MiPerfil from './components/estudiante/MiPerfil'

// Becario
import BuscarEstudiante from './components/becario/BuscarEstudiante'
import ValidarAsistencia from './components/becario/ValidarAsistencia'
import InscribirServicio from './components/becario/InscribirServicio'
import PreRegistros from './components/becario/PreRegistros'

// Admin
import Dashboard from './components/admin/Dashboard'
import GestionServicios from './components/admin/GestionServicios'
import GestionSocios from './components/admin/GestionSocios'
import DetalleSocio from './components/admin/DetalleSocio'
import GestionEstudiantes from './components/admin/GestionEstudiantes'
import GestionBecarios from './components/admin/GestionBecarios'
import Reportes from './components/admin/Reportes'

function RedirectByRole() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol === 'Estudiante') return <Navigate to="/feria" replace />
  if (user.rol === 'Becario') return <Navigate to="/buscar-estudiante" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Auth (público) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* App (protegido) */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Redirect inteligente */}
        <Route index element={<RedirectByRole />} />

        {/* Estudiante */}
        <Route path="feria" element={
          <ProtectedRoute roles={['Estudiante']}>
            <RegistroFeria />
          </ProtectedRoute>
        } />
        <Route path="mis-proyectos" element={
          <ProtectedRoute roles={['Estudiante']}>
            <MisProyectos />
          </ProtectedRoute>
        } />
        <Route path="servicios" element={
          <ProtectedRoute roles={['Estudiante']}>
            <ServiciosDisponibles />
          </ProtectedRoute>
        } />
        <Route path="mi-perfil" element={
          <ProtectedRoute roles={['Estudiante']}>
            <MiPerfil />
          </ProtectedRoute>
        } />

        {/* Becario + Admin */}
        <Route path="buscar-estudiante" element={
          <ProtectedRoute roles={['Becario', 'Admin']}>
            <BuscarEstudiante />
          </ProtectedRoute>
        } />
        <Route path="validar-asistencia" element={
          <ProtectedRoute roles={['Becario', 'Admin']}>
            <ValidarAsistencia />
          </ProtectedRoute>
        } />
        <Route path="inscribir-servicio" element={
          <ProtectedRoute roles={['Becario', 'Admin']}>
            <InscribirServicio />
          </ProtectedRoute>
        } />
        <Route path="preregistros" element={
          <ProtectedRoute roles={['Becario', 'Admin']}>
            <PreRegistros />
          </ProtectedRoute>
        } />

        {/* Solo Admin */}
        <Route path="dashboard" element={
          <ProtectedRoute roles={['Admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="gestion-servicios" element={
          <ProtectedRoute roles={['Admin']}>
            <GestionServicios />
          </ProtectedRoute>
        } />
        <Route path="gestion-socios" element={
          <ProtectedRoute roles={['Admin']}>
            <GestionSocios />
          </ProtectedRoute>
        } />
        <Route path="socios-formadores/:id" element={
          <ProtectedRoute roles={['Admin']}>
            <DetalleSocio />
          </ProtectedRoute>
        } />
        <Route path="gestion-estudiantes" element={
          <ProtectedRoute roles={['Admin']}>
            <GestionEstudiantes />
          </ProtectedRoute>
        } />
        <Route path="gestion-becarios" element={
          <ProtectedRoute roles={['Admin']}>
            <GestionBecarios />
          </ProtectedRoute>
        } />
        <Route path="reportes" element={
          <ProtectedRoute roles={['Admin']}>
            <Reportes />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
