import { HiOutlineBars3 } from 'react-icons/hi2'

export default function Navbar({ title, subtitle, onToggleSidebar }) {
  return (
    <nav className="navbar">
      <div>
        <button className="navbar-toggle" onClick={onToggleSidebar}>
          <HiOutlineBars3 />
        </button>
        <span className="navbar-title">{title}</span>
        {subtitle && <span className="navbar-breadcrumb"> — {subtitle}</span>}
      </div>
      <div className="navbar-actions" />
    </nav>
  )
}
