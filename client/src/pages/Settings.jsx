import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    jobAlerts: true, scoreUpdates: true, weeklyDigest: false
  })
  const [saved, setSaved] = useState(false)
  const toggle = (key) => setNotifications(p => ({ ...p, [key]: !p[key] }))
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your preferences and account</p>
      </div>
      {saved && <div className="alert alert-success">✓ Settings saved!</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px' }}>
        <div className="card">
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1.25rem' }}>🔔 Notifications</h4>
          {[
            ['jobAlerts', 'Daily Job Alerts', 'Get emailed about new job matches every day'],
            ['scoreUpdates', 'Score Updates', 'Notify when resume score changes'],
            ['weeklyDigest', 'Weekly Digest', 'Career progress summary every Monday'],
          ].map(([key, label, desc]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--navy-800)' }}>{label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{desc}</div>
              </div>
              <div onClick={() => toggle(key)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: notifications[key] ? 'var(--gold-500)' : 'var(--gray-300)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: notifications[key] ? '23px' : '3px', transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🔑 AI API Keys</h4>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1rem' }}>Add your API keys to the server/.env file directly for security.</p>
          <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--border-radius)', padding: '1rem' }}>
            <code style={{ fontSize: '0.8125rem', color: 'var(--gray-700)', lineHeight: '2', display: 'block' }}>
              OPENAI_API_KEY=sk-...<br/>
              GEMINI_API_KEY=AIza...<br/>
              ANTHROPIC_API_KEY=sk-ant-...
            </code>
          </div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--danger)' }}>
          <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>⚠️ Danger Zone</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/') }}>Logout</button>
            <button className="btn btn-danger btn-sm">Delete Account</button>
          </div>
        </div>
        <button className="btn btn-primary" onClick={save}>Save Settings</button>
      </div>
    </Layout>
  )
}