import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import DarkModeToggle from './DarkModeToggle'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="hamburger" onClick={onMenuClick}>
          <span /><span /><span />
        </button>
        <Link to="/dashboard" className="navbar-brand">Resume<span>IQ</span></Link>
      </div>
      <div className="navbar-actions" style={{ gap: '8px' }}>
        <DarkModeToggle />
        <NotificationBell />
        <div className="navbar-user">
          <span style={{ color: 'var(--gray-300)', fontSize: '0.875rem' }}>{user?.name}</span>
          <div className="navbar-avatar">{initials}</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--gray-300)', borderColor: 'var(--navy-600)' }}
          onClick={() => { logout(); navigate('/') }}
        >Logout</button>
      </div>
    </nav>
  )
}