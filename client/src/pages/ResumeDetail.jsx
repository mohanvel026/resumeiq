import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

const DIMS = ['scoreClarity', 'scoreImpact', 'scoreAts', 'scoreKeywords', 'scoreFormatting', 'scoreReadability']
const DIM_LABELS = { scoreClarity: 'Clarity', scoreImpact: 'Impact', scoreAts: 'ATS Score', scoreKeywords: 'Keywords', scoreFormatting: 'Formatting', scoreReadability: 'Readability' }

export default function ResumeDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('score')
  const [jd, setJd] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [keywords, setKeywords] = useState(null)
  const [bullets, setBullets] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const analyze = async (type) => {
    setLoading(true); setMsg('')
    try {
      if (type === 'score') {
        const r = await api.post('/api/analysis/score', { resumeId: parseInt(id) })
        setAnalysis(r.data)
      } else if (type === 'keywords') {
        const r = await api.post('/api/analysis/keywords', { resumeId: parseInt(id), jobDescription: jd })
        setKeywords(r.data)
      } else if (type === 'rewrite') {
        const r = await api.post('/api/analysis/rewrite', { resumeId: parseInt(id) })
        setBullets(r.data)
      } else if (type === 'cover') {
        const r = await api.post('/api/analysis/cover-letter', { resumeId: parseInt(id), jobDescription: jd })
        setCoverLetter(r.data.coverLetter)
      }
    } catch { setMsg('Analysis failed. Make sure your AI API key is set.') }
    finally { setLoading(false) }
  }

  const tabs = ['score', 'keywords', 'rewrite', 'cover']
  const tabLabels = { score: '📊 Score', keywords: '🔍 Keywords', rewrite: '✍️ Rewriter', cover: '📧 Cover Letter' }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Resume Analysis</h2>
        <p className="page-subtitle">AI-powered insights for your resume</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-secondary' : 'btn-ghost'}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {msg && <div className="alert alert-danger">{msg}</div>}

      {/* Score Tab */}
      {tab === 'score' && (
        <div>
          <button className="btn btn-primary" onClick={() => analyze('score')} disabled={loading} style={{ marginBottom: '1.5rem' }}>
            {loading ? 'Analyzing...' : '⚡ Analyze Resume'}
          </button>
          {analysis && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', background: 'var(--navy-900)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gold-500)' }}>{analysis.scoreTotal}</span>
                </div>
                <div>
                  <div style={{ color: 'var(--white)', fontWeight: '600', fontSize: '1.1rem' }}>Overall Score</div>
                  <div style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                    {analysis.scoreTotal >= 80 ? 'Excellent — Ready to apply!' : analysis.scoreTotal >= 60 ? 'Good — Small improvements needed' : 'Needs Work — Follow the suggestions below'}
                  </div>
                </div>
              </div>
              <div className="grid-3">
                {DIMS.map(dim => (
                  <div key={dim} className="metric-card gold-accent">
                    <div className="metric-label">{DIM_LABELS[dim]}</div>
                    <div className="metric-value" style={{ color: analysis[dim] >= 80 ? 'var(--success)' : analysis[dim] >= 60 ? 'var(--gold-500)' : 'var(--danger)' }}>{analysis[dim]}</div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar" style={{ width: `${analysis[dim]}%`, background: analysis[dim] >= 80 ? 'var(--success)' : analysis[dim] >= 60 ? 'var(--gold-500)' : 'var(--danger)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keywords Tab */}
      {tab === 'keywords' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Paste Job Description</label>
              <textarea className="form-textarea" rows={6} placeholder="Paste the full job description here..." value={jd} onChange={e => setJd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => analyze('keywords')} disabled={loading || !jd}>
              {loading ? 'Finding gaps...' : '🔍 Find Keyword Gaps'}
            </button>
          </div>
          {keywords && (
            <div className="grid-2">
              <div className="card">
                <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>✓ Keywords Found ({JSON.parse(keywords.keywordsFound || '[]').length})</h4>
                <div className="chip-list">
                  {JSON.parse(keywords.keywordsFound || '[]').map(k => <span key={k} className="chip chip-found">{k}</span>)}
                </div>
              </div>
              <div className="card">
                <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>✗ Missing Keywords ({JSON.parse(keywords.keywordsMissing || '[]').length})</h4>
                <div className="chip-list">
                  {JSON.parse(keywords.keywordsMissing || '[]').map(k => <span key={k} className="chip chip-missing">{k}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bullet Rewriter Tab */}
      {tab === 'rewrite' && (
        <div>
          <button className="btn btn-primary" onClick={() => analyze('rewrite')} disabled={loading} style={{ marginBottom: '1.5rem' }}>
            {loading ? 'Rewriting...' : '✍️ Rewrite Weak Bullets'}
          </button>
          {bullets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {JSON.parse(bullets.originalBullets || '[]').map((orig, i) => (
                <div key={i} className="card">
                  <div style={{ marginBottom: '10px' }}>
                    <span className="badge badge-danger" style={{ marginBottom: '6px' }}>Original</span>
                    <p style={{ color: 'var(--gray-700)', margin: 0 }}>{orig}</p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '10px' }}>
                    <span className="badge badge-success" style={{ marginBottom: '6px' }}>AI Improved</span>
                    <p style={{ color: 'var(--navy-800)', fontWeight: '500', margin: 0 }}>{JSON.parse(bullets.rewrittenBullets || '[]')[i]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cover Letter Tab */}
      {tab === 'cover' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Job Description (for tailored cover letter)</label>
              <textarea className="form-textarea" rows={5} placeholder="Paste job description..." value={jd} onChange={e => setJd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => analyze('cover')} disabled={loading || !jd}>
              {loading ? 'Generating...' : '📧 Generate Cover Letter'}
            </button>
          </div>
          {coverLetter && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--navy-800)' }}>Generated Cover Letter</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(coverLetter)}>Copy</button>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-700)', lineHeight: '1.8', fontSize: '0.9375rem', background: 'var(--gray-50)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--gray-200)' }}>
                {coverLetter}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}