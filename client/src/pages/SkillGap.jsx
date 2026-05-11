import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'

export default function SkillGap() {
  const { dark } = useTheme()
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!jd) return
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/skill-gap', { jobDescription: jd })
      setResult(JSON.parse(r.data.missingSkills || '[]'))
      trackActivity('skillGaps')
    } catch { setResult([]) }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Skill Gap Analyzer</h2>
        <p className="page-subtitle">Find what skills you're missing and how to learn them</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Paste Job Description</label>
          <textarea className="form-textarea" rows={7} placeholder="Paste the full job description to find skill gaps..." value={jd} onChange={e => setJd(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={analyze} disabled={loading || !jd}>
          {loading ? 'Analyzing gaps...' : '📈 Analyze Skill Gaps'}
        </button>
      </div>

      {result && result.length === 0 && (
        <div className="alert alert-success">🎉 Great news! Your resume covers all the required skills for this role.</div>
      )}

      {result && result.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Missing Skills ({result.length})</h3>
          <div className="grid-2">
            {result.map((skill, i) => (
              <div key={i} className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ color: 'var(--navy-800)', margin: 0 }}>{skill.skill}</h4>
                  <span className="badge badge-danger">Missing</span>
                </div>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: '0 0 12px' }}>{skill.description}</p>
                {skill.resource && (
                  <a href={skill.resource} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
                    📚 Learn for Free →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}