import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function InterviewPrep() {
  const [role, setRole] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(null)

  const generate = async () => {
    if (!role) return
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/interview-questions', { targetRole: role })
      setQuestions(JSON.parse(r.data.interviewQuestions || '[]'))
    } catch { setQuestions([]) }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Interview Prep</h2>
        <p className="page-subtitle">AI-generated questions tailored to your target role</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input className="form-input" style={{ flex: 1, minWidth: '200px' }} placeholder="Enter target role (e.g. Full Stack Developer)" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()} />
          <button className="btn btn-primary" onClick={generate} disabled={loading || !role}>
            {loading ? 'Generating...' : '🎤 Generate Questions'}
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {questions.map((q, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--navy-900)', color: 'var(--gold-500)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontWeight: '500', color: 'var(--navy-800)', fontSize: '0.9375rem' }}>{q.question}</span>
                </div>
                <span style={{ color: 'var(--gray-400)', fontSize: '1.2rem', flexShrink: 0 }}>{open === i ? '▲' : '▼'}</span>
              </div>
              {open === i && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--border-radius)', borderLeft: '3px solid var(--gold-500)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--gold-500)', marginBottom: '6px' }}>💡 STAR Format Hint</div>
                  <p style={{ color: 'var(--gray-700)', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>{q.hint}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {questions.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎤</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>Ready to Practice?</h3>
          <p style={{ color: 'var(--gray-500)' }}>Enter your target role and get 10 AI-generated interview questions with answer hints</p>
        </div>
      )}
    </Layout>
  )
}