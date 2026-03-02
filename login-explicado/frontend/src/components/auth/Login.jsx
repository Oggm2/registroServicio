import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── Login ──────────────────────────────────────────────────────────────────────
// Componente de formulario de inicio de sesión.
// NO habla directamente con el backend: llama a login() del contexto,
// que a su vez llama a authAPI.login(), que usa axios.
export default function Login() {
  // Estado del formulario: objeto con los campos del form
  const [form, setForm] = useState({ username: '', password: '' })

  // submitting: true mientras espera la respuesta del backend (deshabilita el botón)
  const [submitting, setSubmitting] = useState(false)

  // error: string con el mensaje de error a mostrar (o '' si no hay error)
  const [error, setError] = useState('')

  // useAuth() lee los valores expuestos por AuthProvider
  const { login } = useAuth()

  // useNavigate() permite redirigir al usuario por código (sin <Link>)
  const navigate = useNavigate()


  // ── handleSubmit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()  // evitar que el form recargue la página (comportamiento por defecto)

    // Validación en el frontend (antes de gastar una petición al backend)
    if (!form.username || !form.password) {
      setError('Completa todos los campos')
      return
    }

    setSubmitting(true)  // deshabilitar botón para evitar doble-submit

    try {
      // login() llama al backend y guarda token + user en localStorage
      // si falla, lanza una excepción que cae al catch
      const user = await login(form.username, form.password)

      // Redirigir según el rol del usuario:
      const destinos = {
        Estudiante: '/feria',
        Becario: '/buscar-estudiante',
        Admin: '/dashboard',
      }
      navigate(destinos[user.rol] || '/dashboard', { replace: true })
      // replace: true → reemplaza la ruta actual en el historial
      // (el usuario no puede volver al login con el botón "atrás")

    } catch (err) {
      // err.response.data.error = mensaje del backend (ej: 'Credenciales incorrectas')
      // Si no hay respuesta (red caída), mostrar mensaje genérico
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      // finally siempre se ejecuta, haya error o no
      setSubmitting(false)  // re-habilitar el botón
    }
  }


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <h2>Iniciar Sesión</h2>

        {/* Cada onChange actualiza el campo correspondiente del objeto form */}
        <input
          type="text"
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => {
            setError('')  // limpiar error al escribir
            setForm({ ...form, username: e.target.value })
            // { ...form } copia el objeto actual, y username: e.target.value sobreescribe ese campo
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => {
            setError('')
            setForm({ ...form, password: e.target.value })
          }}
        />

        {/* Solo mostrar el error si hay un mensaje */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
