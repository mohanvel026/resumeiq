import { useState } from 'react'

export default function InterviewScheduler({ onSave, onClose }) {
  const [form, setForm] = useState({ company: '', role: '', date: '', time: '', type: 'video', notes: '' })

  const save = () => {
    if (!form.company || !form.date) return
    onSave(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 style={{ color: 'var(--navy-800)', marginBottom: '1.5rem' }}>📅 Schedule Interview</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" placeholder="e.g. Google" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" placeholder="e.g. SDE" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input type="time" className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Interview Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="video">📹 Video Call</option>
            <option value="phone">📞 Phone Call</option>
            <option value="onsite">🏢 On-site</option>
            <option value="technical">💻 Technical Round</option>
            <option value="hr">👥 HR Round</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea" rows={3} placeholder="Preparation notes, interviewer name, etc." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={save}>Save Interview</button>
        </div>
      </div>
    </div>
  )
}