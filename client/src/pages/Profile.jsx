import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { dark } = useTheme()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', location: '', title: '', bio: '' })
  const [saved, setSaved] = useState(false)
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const completion = [form.name, form.email, form.phone, form.location, form.title, form.bio].filter(Boolean).length
  const pct = Math.round((completion / 6) * 100)

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--navy-900)', border: '3px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem', fontWeight: '700', color: 'var(--gold-500)' }}>{initials}</div>
            <h3 style={{ color: 'var(--navy-800)', marginBottom: '4px' }}>{user?.name}</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{user?.email}</p>
            <span className="badge badge-gold">Free Plan</span>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Profile Completion</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Completed</span>
              <span style={{ fontWeight: '600', color: pct === 100 ? 'var(--success)' : 'var(--navy-800)' }}>{pct}%</span>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--gold-500)' }} />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[['Name', form.name], ['Email', form.email], ['Phone', form.phone], ['Location', form.location], ['Job Title', form.title], ['Bio', form.bio]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem' }}>
                  <span style={{ color: val ? 'var(--success)' : 'var(--gray-300)' }}>{val ? '✓' : '○'}</span>
                  <span style={{ color: val ? 'var(--gray-700)' : 'var(--gray-400)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1.5rem' }}>Edit Profile</h4>
          {saved && <div className="alert alert-success">✓ Profile saved successfully!</div>}
          <form onSubmit={save}>
            {[['name', 'Full Name', 'text', 'Mohan Vel'], ['email', 'Email Address', 'email', 'you@example.com'], ['phone', 'Phone Number', 'tel', '+91 98765 43210'], ['location', 'Location', 'text', 'Chennai, Tamil Nadu'], ['title', 'Current/Target Job Title', 'text', 'Full Stack Developer']].map(([key, label, type, ph]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" rows={3} placeholder="A brief professional summary..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Save Profile</button>
          </form>
        </div>
      </div>
    </Layout>
  )
}