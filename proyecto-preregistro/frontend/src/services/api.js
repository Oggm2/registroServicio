import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// ── Estudiantes ──
export const estudiantesAPI = {
  getMisProyectos: (periodo) => api.get('/estudiantes/mis-proyectos', { params: { periodo } }),
  buscar: (params) => api.get('/estudiantes/buscar', { params }),
  getPerfil: () => api.get('/estudiantes/perfil'),
  updatePerfil: (data) => api.put('/estudiantes/perfil', data),
}

// ── Servicios ──
export const serviciosAPI = {
  getAll: (params) => api.get('/servicios', { params }),
  create: (data) => api.post('/servicios', data),
  update: (id, data) => api.put(`/servicios/${id}`, data),
  delete: (id) => api.delete(`/servicios/${id}`),
  updateCupo: (id, cupo) => api.put(`/servicios/${id}/cupo`, { cupo_maximo: cupo }),
}

// ── Pre-registros ──
export const preregistrosAPI = {
  getAll: (params) => api.get('/preregistros', { params }),
  create: (data) => api.post('/preregistros', data),
  delete: (id) => api.delete(`/preregistros/${id}`),
}

// ── Asistencias Feria ──
export const asistenciasAPI = {
  registrar: (data) => api.post('/asistencias-feria', data),
  actualizar: (id, data) => api.put(`/asistencias-feria/${id}`, data),
  validar: (id, data) => api.put(`/asistencias-feria/${id}/validar`, data),
  getDentro: () => api.get('/asistencias-feria/dentro'),
}

// ── Gestión Estudiantes (Admin) ──
export const gestionEstudiantesAPI = {
  getAll: (params) => api.get('/admin/estudiantes', { params }),
  create: (data) => api.post('/admin/estudiantes', data),
  delete: (id) => api.delete(`/admin/estudiantes/${id}`),
  resetPassword: (id, data) => api.put(`/admin/usuarios/${id}/reset-password`, data),
}

// ── Gestión Becarios (Admin) ──
export const gestionBecariosAPI = {
  getAll: (params) => api.get('/admin/becarios', { params }),
  create: (data) => api.post('/admin/becarios', data),
  delete: (id) => api.delete(`/admin/becarios/${id}`),
}

// ── Socios Formadores ──
export const sociosFormadoresAPI = {
  getAll: (params) => api.get('/socios-formadores', { params }),
  create: (data) => api.post('/socios-formadores', data),
  update: (id, data) => api.put(`/socios-formadores/${id}`, data),
  delete: (id) => api.delete(`/socios-formadores/${id}`),
  getDetalle: (id) => api.get(`/socios-formadores/${id}/detalle`),
  getStats: () => api.get('/socios-formadores/stats'),
}

// ── Dashboard / Reportes ──
export const adminAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  reporteEstudiantes: (params) => api.get('/reportes/estudiantes', { params, responseType: 'blob' }),
  reportePreregistros: (params) => api.get('/reportes/preregistros', { params, responseType: 'blob' }),
}

export default api
