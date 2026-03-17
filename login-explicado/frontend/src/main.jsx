import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'

// ── Punto de entrada del frontend ─────────────────────────────────────────────
// ReactDOM.createRoot toma el <div id="root"> del index.html y lo convierte
// en el contenedor de toda la aplicación React.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      El orden de los wrappers importa — de afuera hacia adentro:

      BrowserRouter   → habilita el sistema de rutas (react-router-dom)
        AuthProvider  → provee user, login, logout a toda la app
          App         → define las rutas con <Routes> y <Route>
    */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
