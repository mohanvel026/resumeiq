import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { section: 'Main', items: [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Upload Resume', icon: '↑', path: '/upload' },
    { label: 'My Resumes', icon: '📄', path: '/resumes' },
    { label: 'Job Listings', icon: '💼', path: '/jobs' },
  ]},
  { section: 'AI Tools', items: [
    { label: 'Tracker', icon: '📋', path: '/tracker' },
    { label: 'Interview Prep', icon: '🎤', path: '/interview' },
    { label: 'Mock Interview', icon: '🤖', path: '/mock-interview' },
    { label: 'Skill Gap', icon: '📈', path: '/skills' },
    { label: 'LinkedIn Check', icon: '🔗', path: '/linkedin' },
  ]},
  { section: 'Insights', items: [
    { label: 'Analytics', icon: '📊', path: '/analytics' },
    { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
    { label: 'Profile', icon: '👤', path: '/profile' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ]},
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {NAV.map(group => (
          <div className="sidebar-section" key={group.section}>
            <div className="sidebar-section-title">{group.section}</div>
            {group.items.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={onClose}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
    </>
  )
}