import { useState } from 'react'
import Layout from '../components/Layout'

const COLS = ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']
const COL_COLORS = { APPLIED: 'var(--info)', INTERVIEWING: 'var(--gold-500)', OFFER: 'var(--success)', REJECTED: 'var(--danger)' }

export default function Tracker() {
  const [cards, setCards] = useState([
    { id: 1, company: 'Google', role: 'Frontend Developer', status: 'APPLIED', date: '2026-04-20' },
    { id: 2, company: 'Zoho', role: 'Full Stack Developer', status: 'INTERVIEWING', date: '2026-04-18' },
    { id: 3, company: 'Freshworks', role: 'React Developer', status: 'APPLIED', date: '2026-04-21' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company: '', role: '', jobUrl: '', status: 'APPLIED' })
  const [dragging, setDragging] = useState(null)

  const addCard = () => {
    if (!form.company || !form.role) return
    setCards(prev => [...prev, { id: Date.now(), ...form, date: new Date().toISOString().slice(0, 10) }])
    setForm({ company: '', role: '', jobUrl: '', status: 'APPLIED' })
    setShowForm(false)
  }

  const moveCard = (id, newStatus) => setCards(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  const deleteCard = (id) => setCards(prev => prev.filter(c => c.id !== id))

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Application Tracker</h2>
          <p className="page-subtitle">Track every job application in one place</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Application</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>New Application</h4>
          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="e.g. Google" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Job Role</label>
              <input className="form-input" placeholder="e.g. Frontend Developer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Job URL (optional)</label>
              <input className="form-input" placeholder="https://..." value={form.jobUrl} onChange={e => setForm({ ...form, jobUrl: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {COLS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={addCard}>Add Application</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
        {COLS.map(col => (
          <div key={col} className="metric-card" style={{ borderTop: `3px solid ${COL_COLORS[col]}` }}>
            <div className="metric-label">{col}</div>
            <div className="metric-value">{cards.filter(c => c.status === col).length}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLS.map(col => (
          <div key={col} className="kanban-col"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragging) moveCard(dragging, col) }}>
            <div className="kanban-col-header">
              <span className="kanban-col-title">{col}</span>
              <span className="badge" style={{ background: `${COL_COLORS[col]}22`, color: COL_COLORS[col] }}>
                {cards.filter(c => c.status === col).length}
              </span>
            </div>
            {cards.filter(c => c.status === col).map(card => (
              <div key={card.id} className="kanban-card" draggable
                onDragStart={() => setDragging(card.id)}
                onDragEnd={() => setDragging(null)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--navy-800)' }}>{card.company}</span>
                  <button onClick={() => deleteCard(card.id)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', margin: '0 0 8px' }}>{card.role}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{card.date}</span>
                  {card.jobUrl && <a href={card.jobUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--navy-600)' }}>View Job</a>}
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {COLS.filter(c => c !== col).map(c => (
                    <button key={c} onClick={() => moveCard(card.id, c)}
                      style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${COL_COLORS[c]}`, color: COL_COLORS[c], background: 'transparent', cursor: 'pointer' }}>
                      → {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  )
}