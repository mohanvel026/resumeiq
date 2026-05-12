import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick}>
          <span /><span /><span />
        </button>
        <Link to="/dashboard" className="navbar-brand">
          Resume<span>IQ</span>
        </Link>
      </div>
      <div className="navbar-right">
        <NotificationBell />
        <span className="navbar-username">{user?.name}</span>
        <div className="navbar-avatar">{initials}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/') }}>
          Logout
        </button>
      </div>
    </nav>
  )
}