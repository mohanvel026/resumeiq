import { useState } from 'react'

const NOTIFICATIONS = [
  { id: 1, icon: '⚡', text: 'Analyze your resume to get an ATS score', time: 'Now', unread: true },
  { id: 2, icon: '💼', text: 'New React Developer jobs available in Chennai', time: '2h ago', unread: true },
  { id: 3, icon: '🎯', text: 'Complete your profile to improve visibility', time: '1d ago', unread: false },
  { id: 4, icon: '📧', text: 'Generate a cover letter for your next application', time: '2d ago', unread: false },
]

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const unread = notifications.filter(n => n.unread).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px', color: 'var(--gray-300)', fontSize: '1.25rem' }}
      >
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--danger)', color: 'var(--white)', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: '40px', width: '320px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 99, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: 'var(--navy-800)', fontSize: '0.9rem' }}>Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--navy-600)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)', background: n.unread ? 'rgba(30,58,95,0.04)' : 'white', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '0.8125rem', color: 'var(--gray-800)', lineHeight: '1.4' }}>{n.text}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{n.time}</span>
                </div>
                {n.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--navy-600)', flexShrink: 0, marginTop: '4px' }} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}