import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'
import DarkModeToggle from './DarkModeToggle'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: '64px', background: dark ? '#020817' : '#0A1628',
      borderBottom: `1px solid ${dark ? '#1E293B' : '#1E3A5F'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: '1.25rem', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: '#CBD5E1' }} />
          <span style={{ display: 'block', width: '20px', height: '2px', background: '#CBD5E1' }} />
          <span style={{ display: 'block', width: '20px', height: '2px', background: '#CBD5E1' }} />
        </button>
        <Link to="/dashboard" style={{ textDecoration: 'none', fontSize: '1.25rem', fontWeight: '700', color: '#F8FAFC', letterSpacing: '-0.5px' }}>
          Resume<span style={{ color: '#C9A84C' }}>IQ</span>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DarkModeToggle />
        <NotificationBell />
        <span style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>{user?.name}</span>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#C9A84C', color: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8125rem' }}>
          {initials}
        </div>
        <button onClick={() => { logout(); navigate('/') }}
          style={{ background: 'none', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.8125rem' }}>
          Logout
        </button>
      </div>
    </nav>
  )
}