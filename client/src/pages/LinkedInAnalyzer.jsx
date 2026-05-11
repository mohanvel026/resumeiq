import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function LinkedInAnalyzer() {
  const { dark } = useTheme()
  const [url, setUrl] = useState('')
  const [resumeId, setResumeId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/linkedin', { linkedinUrl: url, resumeId: parseInt(resumeId) })
      setResult(r.data)
    } catch { alert('Analysis failed. Make sure your resume ID and LinkedIn URL are correct.') }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">LinkedIn Profile Analyzer</h2>
        <p className="page-subtitle">Compare your LinkedIn vs resume and fix inconsistencies</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">LinkedIn Profile URL</label>
          <input className="form-input" placeholder="https://linkedin.com/in/yourname" value={url} onChange={e => setUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Resume ID (from My Resumes)</label>
          <input className="form-input" type="number" placeholder="e.g. 1" value={resumeId} onChange={e => setResumeId(e.target.value)} />
          <span className="form-hint">Go to My Resumes → open a resume → copy the ID from the URL</span>
        </div>
        <button className="btn btn-primary" onClick={analyze} disabled={loading || !url || !resumeId}>
          {loading ? 'Analyzing...' : '🔗 Analyze LinkedIn vs Resume'}
        </button>
      </div>

      {result && (
        <div className="grid-2">
          <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
            <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>✓ Consistent Points</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(result.consistent || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {p}
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ borderTop: '3px solid var(--danger)' }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>✗ Inconsistencies Found</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(result.inconsistencies || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  <span style={{ color: 'var(--danger)', flexShrink: 0 }}>✗</span> {p}
                </div>
              ))}
            </div>
          </div>
          {result.suggestions && (
            <div className="card" style={{ gridColumn: '1 / -1', borderTop: '3px solid var(--gold-500)' }}>
              <h4 style={{ color: 'var(--gold-500)', marginBottom: '1rem' }}>💡 Recommendations</h4>
              <p style={{ color: 'var(--gray-700)', lineHeight: '1.8', margin: 0 }}>{result.suggestions}</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}