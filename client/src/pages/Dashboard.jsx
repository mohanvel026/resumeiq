import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Upload Resume', icon: '↑', path: '/upload' },
  { label: 'My Resumes', icon: '📄', path: '/resumes' },
  { label: 'Job Listings', icon: '💼', path: '/jobs' },
  { label: 'Tracker', icon: '📋', path: '/tracker' },
  { label: 'Interview Prep', icon: '🎤', path: '/interview' },
  { label: 'Mock Interview', icon: '🤖', path: '/mock-interview' },
  { label: 'Skill Gap', icon: '📈', path: '/skills' },
  { label: 'Analytics', icon: '📊', path: '/analytics' },
  { label: 'LinkedIn Check', icon: '🔗', path: '/linkedin' },
  { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
  { label: 'Profile', icon: '👤', path: '/profile' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span><span></span><span></span>
          </button>
          <div className="navbar-brand">Resume<span>IQ</span></div>
        </div>
        <div className="navbar-actions">
          <div className="navbar-user">
            <span style={{ display: 'none' }} className="hide-mobile">{user?.name}</span>
            <div className="navbar-avatar">{initials}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-300)', borderColor: 'var(--navy-600)' }} onClick={() => { logout(); navigate('/') }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main Menu</div>
          {NAV.slice(0, 4).map(item => (
            <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">AI Tools</div>
          {NAV.slice(4, 9).map(item => (
            <Link key={item.path} to={item.path} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">More</div>
          {NAV.slice(9).map(item => (
            <Link key={item.path} to={item.path} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-layout">
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p className="page-subtitle">Here's your career progress at a glance</p>
          </div>

          {/* Metric Cards */}
          <div className="metric-grid" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Resumes Uploaded', value: '0', sub: 'Upload your first resume' },
              { label: 'Jobs Applied', value: '0', sub: 'Start applying today' },
              { label: 'Best Resume Score', value: '—', sub: 'Analyze a resume first' },
              { label: 'Interviews Scheduled', value: '0', sub: 'Track your progress' },
            ].map(m => (
              <div key={m.label} className="metric-card gold-accent">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h3 style={{ color: 'var(--navy-900)', marginBottom: '1rem' }}>Quick Actions</h3>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            {[
              { icon: '↑', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume for AI analysis', path: '/upload', primary: true },
              { icon: '💼', title: 'Browse Jobs', desc: 'Find jobs matching your skills in real-time', path: '/jobs', primary: false },
              { icon: '🎤', title: 'Interview Prep', desc: 'Practice with AI-generated interview questions', path: '/interview', primary: false },
            ].map(a => (
              <div key={a.title} className={`card ${a.primary ? 'card-gold' : ''}`} style={{ cursor: 'pointer' }} onClick={() => navigate(a.path)}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{a.icon}</div>
                <h4 style={{ color: a.primary ? 'var(--gold-500)' : 'var(--navy-800)', marginBottom: '6px' }}>{a.title}</h4>
                <p style={{ color: a.primary ? 'var(--gray-300)' : 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* All Features Grid */}
          <h3 style={{ color: 'var(--navy-900)', marginBottom: '1rem' }}>All Features</h3>
          <div className="grid-4">
            {NAV.slice(1).map(item => (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--navy-800)' }}>{item.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}