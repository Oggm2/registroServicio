import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

// ── 1. Crear el Contexto ──────────────────────────────────────────────────────
// createContext() crea un "contenedor" de datos global.
// null es el valor por defecto si alguien usa useAuth() fuera del Provider.
const AuthContext = createContext(null)


// ── 2. Provider ───────────────────────────────────────────────────────────────
// AuthProvider envuelve toda la app (en main.jsx).
// Cualquier componente dentro de él puede leer user, login, logout, etc.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // datos del usuario autenticado (o null)
  const [loading, setLoading] = useState(true) // true mientras se verifica la sesión guardada


  // ── Verificar sesión al cargar la app ─────────────────────────────────────
  // useEffect con [] se ejecuta UNA sola vez cuando el componente monta.
  // Sirve para "recordar" la sesión si el usuario ya había iniciado antes.
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (stored && token) {
      try {
        // JSON.parse convierte el string guardado de vuelta a objeto JavaScript
        setUser(JSON.parse(stored))
      } catch {
        // Si el JSON estaba corrupto, limpiar todo
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setLoading(false)  // ya terminamos de revisar → dejar de mostrar spinner
  }, [])


  // ── Función login ─────────────────────────────────────────────────────────
  // useCallback memoriza la función para que no se recree en cada render.
  const login = useCallback(async (username, password) => {
    // 1. Llamar al backend (POST /api/auth/login)
    const { data } = await authAPI.login({ username, password })
    //    data = { token: "eyJ...", user: { id, username, rol, nombre } }

    // 2. Guardar en localStorage (persiste aunque el usuario cierre el navegador)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // 3. Actualizar el estado → todos los componentes que usan useAuth() se re-renderizan
    setUser(data.user)

    return data.user  // devolver el user para que Login.jsx pueda redirigir según el rol
  }, [])


  // ── Función logout ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    // El router detectará user=null y redirigirá al login automáticamente
  }, [])


  // ── 3. Exponer valores ────────────────────────────────────────────────────
  // Todo lo que pongamos en value estará disponible con useAuth()
  const value = { user, loading, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


// ── 4. Hook personalizado ─────────────────────────────────────────────────────
// En vez de escribir useContext(AuthContext) en cada componente,
// exportamos useAuth() que ya lo hace y agrega validación.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
