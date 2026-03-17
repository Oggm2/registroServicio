import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
// En desarrollo: VITE_API_URL no existe → usa '/api'
// Vite tiene un proxy configurado en vite.config.js que redirige
//   /api  →  http://localhost:5000/api
// En producción: VITE_API_URL = 'https://tu-dominio.com/api'
const API_URL = import.meta.env.VITE_API_URL || '/api'


// ── Instancia de Axios ────────────────────────────────────────────────────────
// Axios es una librería para hacer peticiones HTTP (fetch mejorado).
// Al crear una instancia con baseURL, todas las rutas son relativas a ella.
//   api.post('/auth/login')  →  POST http://localhost:5000/api/auth/login
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})


// ── Interceptor de REQUEST ────────────────────────────────────────────────────
// Se ejecuta ANTES de enviar cada petición.
// Su trabajo: agregar el token JWT al header Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    // El backend espera el header:  Authorization: Bearer <token>
    config.headers.Authorization = `Bearer ${token}`
  }
  return config  // devolver config modificado para que axios continúe
})


// ── Interceptor de RESPONSE ───────────────────────────────────────────────────
// Se ejecuta cuando llega la respuesta (o el error).
api.interceptors.response.use(
  (response) => response,  // si fue exitosa, pásala tal cual

  (error) => {
    // Si el servidor responde 401 (no autorizado / token expirado)...
    if (error.response?.status === 401) {
      // ...pero NO si es la petición de login misma (ahí 401 = credenciales malas)
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      if (!isLoginRequest) {
        // Token expirado → limpiar sesión y redirigir al login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)  // propagar el error para que el catch del componente lo maneje
  }
)


// ── Funciones de Auth ─────────────────────────────────────────────────────────
// Exportamos un objeto con métodos para cada endpoint de autenticación.
export const authAPI = {
  // api.post('/auth/login', data)  →  POST /api/auth/login  con body JSON
  login: (data) => api.post('/auth/login', data),
}

export default api
