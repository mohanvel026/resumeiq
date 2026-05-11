import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { section: 'Main', items: [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Upload Resume', icon: '↑', path: '/upload' },
    { label: 'My Resumes', icon: '📄', path: '/resumes' },
    { label: 'Export PDF', icon: '📥', path: '/export' },
    { label: 'Job Listings', icon: '💼', path: '/jobs' },
  ]},
  { section: 'AI Tools', items: [
    { label: 'Tracker', icon: '📋', path: '/tracker' },
    { label: 'Interview Prep', icon: '🎤', path: '/interview' },
    { label: 'Mock Interview', icon: '🤖', path: '/mock-interview' },
    { label: 'Skill Gap', icon: '📈', path: '/skills' },
    { label: 'LinkedIn Check', icon: '🔗', path: '/linkedin' },
    { label: 'Cover Letters', icon: '📧', path: '/cover-templates' },
  ]},
  { section: 'Career Tools', items: [
    { label: 'Salary Insights', icon: '💰', path: '/salary' },
    { label: '30-Day Plan', icon: '📅', path: '/job-plan' },
    { label: 'Achievements', icon: '🏅', path: '/achievements' },
    { label: 'Refer a Friend', icon: '🎁', path: '/referral' },
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
  const { dark } = useTheme()

  const bg = dark ? '#020817' : '#0A1628'
  const activeBg = dark ? '#1E293B' : '#1E3A5F'
  const textColor = '#94A3B8'
  const activeText = '#F1F5F9'
  const sectionColor = dark ? '#475569' : '#4A6080'

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
      )}
      <aside style={{
        position: 'fixed', top: '64px', left: 0, bottom: 0,
        width: '240px', background: bg,
        borderRight: `1px solid ${dark ? '#1E293B' : '#1E3A5F'}`,
        overflowY: 'auto', zIndex: 999, padding: '1rem 0',
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s',
      }}>
        {NAV.map(group => (
          <div key={group.section} style={{ marginBottom: '0.5rem' }}>
            <div style={{ padding: '6px 16px', fontSize: '0.6875rem', fontWeight: '600', color: sectionColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} onClick={onClose}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', textDecoration: 'none', color: isActive ? activeText : textColor, background: isActive ? activeBg : 'transparent', borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent', fontSize: '0.875rem', fontWeight: isActive ? '600' : '400', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </aside>
    </>
  )
}