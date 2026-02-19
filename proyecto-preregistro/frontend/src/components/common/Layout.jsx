import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const BANNER_BY_ROLE = {
  Admin: '/images/Biblioteca.png',
  Becario: '/images/Biblioteca.png',
  Estudiante: '/images/servicio_social.png',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const bannerSrc = BANNER_BY_ROLE[user?.rol] || BANNER_BY_ROLE.Admin

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app-banner">
          <img src={bannerSrc} alt="" className="app-banner-img" />
        </div>
        <div className="app-content" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
