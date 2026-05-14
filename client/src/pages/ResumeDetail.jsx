import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { trackActivity, trackScore } from '../utils/activity'

const ScoreRing = ({ score, label, color }) => {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={radius} fill="none" stroke="#E9ECEF" strokeWidth="6" />
        <circle cx="35" cy="35" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 35 35)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="35" y="39" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{score}</text>
      </svg>
      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6C757D', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

const ScoreBar = ({ label, score, color, desc }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
      <div>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#0D1F3C' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color: '#6C757D', marginLeft: '8px' }}>{desc}</span>
      </div>
      <span style={{ fontWeight: '700', color, fontSize: '0.9rem' }}>{score}/100</span>
    </div>
    <div style={{ background: '#E9ECEF', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '20px', transition: 'width 1s ease' }} />
    </div>
  </div>
)

export default function ResumeDetail() {
  const { id } = useParams()
  const { dark } = useTheme()
  const { user } = useAuth()

  const [resume, setResume] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [tab, setTab] = useState('score')
  const [jobDesc, setJobDesc] = useState('')
  const [keywordResult, setKeywordResult] = useState(null)
  const [bulletResult, setBulletResult] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/resume/${id}`)
      .then(r => setResume(r.data))
      .catch(() => setError('Failed to load resume'))
      .finally(() => setLoading(false))
  }, [id])

  const analyze = async () => {
    setAnalyzing(true)
    setError('')
    try {
      const r = await api.post('/api/analysis/score', { resumeId: parseInt(id) })
      setAnalysis(r.data)
      trackActivity('analyses')
      if (r.data.scoreTotal) trackScore(r.data.scoreTotal)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const findKeywords = async () => {
    if (!jobDesc.trim()) return setError('Please paste a job description first')
    setAnalyzing(true)
    setError('')
    try {
      const r = await api.post('/api/analysis/keywords', { resumeId: parseInt(id), jobDescription: jobDesc })
      setKeywordResult(r.data)
      trackActivity('keywords')
    } catch (err) {
      setError(err.response?.data?.message || 'Keyword analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const rewrite = async () => {
    setAnalyzing(true)
    setError('')
    try {
      const r = await api.post('/api/analysis/rewrite', { resumeId: parseInt(id) })
      setBulletResult(r.data)
      trackActivity('rewrites')
    } catch (err) {
      setError(err.response?.data?.message || 'Rewrite failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const generateCL = async () => {
    if (!jobDesc.trim()) return setError('Please paste a job description first')
    setAnalyzing(true)
    setError('')
    try {
      const r = await api.post('/api/analysis/cover-letter', {
        resumeId: parseInt(id),
        jobDescription: jobDesc
      })
      setCoverLetter(r.data.coverLetter)
      trackActivity('coverLetters')
    } catch (err) {
      setError(err.response?.data?.message || 'Cover letter generation failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#28A745'
    if (score >= 65) return '#C9A84C'
    if (score >= 50) return '#FD7E14'
    return '#DC3545'
  }

  const sendEmail = async () => {
    if (!analysis) return alert('Analyze your resume first!')
    try {
      const r = await api.post('/api/email/send-analysis', {
        to: user?.email,
        resumeTitle: resume?.title,
        scoreTotal: analysis.scoreTotal,
        improvements: analysis.improvements,
        strengths: analysis.strengths,
      })
      alert(r.data.message)
    } catch {
      alert('Email failed. Check server configuration.')
    }
  }
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    if (score >= 50) return 'Average'
    if (score >= 35) return 'Below Average'
    return 'Poor'
  }

  const isDark = !!dark
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const textPrimary = isDark ? '#F1F5F9' : '#0D1F3C'
  const textSecondary = isDark ? '#94A3B8' : '#6C757D'
  const textBody = isDark ? '#CBD5E1' : '#495057'
  const borderColor = isDark ? '#334155' : '#E9ECEF'
  const inputBg = isDark ? '#0F172A' : '#FFFFFF'

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: textSecondary }}>Loading resume...</p>
      </div>
    </Layout>
  )

  if (error && !resume) return (
    <Layout>
      <div className="alert alert-danger">{error}</div>
      <Link to="/resumes" className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }}>← Back to Resumes</Link>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/resumes" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>← My Resumes</Link>
          </div>
          <h2 style={{ color: textPrimary, margin: '0 0 4px', fontSize: '1.5rem' }}>{resume?.title}</h2>
          <p style={{ color: textSecondary, margin: 0, fontSize: '0.875rem' }}>
            {resume?.fileType?.toUpperCase()} · Uploaded {new Date(resume?.createdAt).toLocaleDateString()}
            {analysis && <span style={{ marginLeft: '12px', fontWeight: '600', color: getScoreColor(analysis.scoreTotal) }}>ATS Score: {analysis.scoreTotal}/100</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/export" className="btn btn-ghost btn-sm">📄 Export PDF</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', flexWrap: 'wrap', background: dark ? '#0F172A' : '#F1F3F5', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'score', label: '📊 ATS Score' },
          { id: 'keywords', label: '🔍 Keywords' },
          { id: 'rewrite', label: '✍️ Rewriter' },
          { id: 'cover', label: '📧 Cover Letter' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: tab === t.id ? '600' : '400', background: tab === t.id ? (dark ? '#1E293B' : '#FFFFFF') : 'transparent', color: tab === t.id ? textPrimary : textSecondary, boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SCORE TAB ── */}
      {tab === 'score' && (
        <div>
          {!analysis ? (
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: textPrimary, marginBottom: '0.5rem' }}>Get Your ATS Score</h3>
              <p style={{ color: textSecondary, marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Our AI analyzes your resume like a real ATS system — checking keyword density, formatting, impact, and more.
              </p>
              <button className="btn btn-primary" onClick={analyze} disabled={analyzing} style={{ fontSize: '1rem', padding: '12px 28px' }}>
                {analyzing ? '🤖 Analyzing your resume...' : '⚡ Analyze Resume Now'}
              </button>
              {analyzing && (
                <p style={{ color: textSecondary, fontSize: '0.875rem', marginTop: '1rem' }}>
                  AI is reading your resume... this takes 10-15 seconds
                </p>
              )}
            </div>
          ) : (
            <div>
              {/* Overall score hero */}
              <div style={{ background: dark ? '#0F172A' : '#0A1628', border: `1px solid ${dark ? '#1E293B' : '#1E3A5F'}`, borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '8px' }}>Overall ATS Score</div>
                <div style={{ fontSize: '4rem', fontWeight: '800', color: getScoreColor(analysis.scoreTotal), marginBottom: '8px' }}>
                  {analysis.scoreTotal}
                  <span style={{ fontSize: '1.5rem', color: '#94A3B8' }}>/100</span>
                </div>
                <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '20px', background: getScoreColor(analysis.scoreTotal) + '22', color: getScoreColor(analysis.scoreTotal), fontWeight: '600', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {getScoreLabel(analysis.scoreTotal)}
                </div>

                {analysis.assessment && (
                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                    {analysis.assessment}
                  </p>
                )}

                {/* Score rings */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <ScoreRing score={analysis.scoreAts} label="ATS" color={getScoreColor(analysis.scoreAts)} />
                  <ScoreRing score={analysis.scoreKeywords} label="Keywords" color={getScoreColor(analysis.scoreKeywords)} />
                  <ScoreRing score={analysis.scoreImpact} label="Impact" color={getScoreColor(analysis.scoreImpact)} />
                  <ScoreRing score={analysis.scoreFormatting} label="Format" color={getScoreColor(analysis.scoreFormatting)} />
                  <ScoreRing score={analysis.scoreClarity} label="Clarity" color={getScoreColor(analysis.scoreClarity)} />
                  <ScoreRing score={analysis.scoreReadability} label="Readability" color={getScoreColor(analysis.scoreReadability)} />
                </div>
              </div>

              {/* Detailed bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem' }}>
                  <h4 style={{ color: textPrimary, marginBottom: '1.25rem' }}>📊 Detailed Breakdown</h4>
                  <ScoreBar label="ATS Compatibility" score={analysis.scoreAts} color={getScoreColor(analysis.scoreAts)} desc="How well ATS can parse your resume" />
                  <ScoreBar label="Keyword Density" score={analysis.scoreKeywords} color={getScoreColor(analysis.scoreKeywords)} desc="Industry keywords present" />
                  <ScoreBar label="Impact & Achievements" score={analysis.scoreImpact} color={getScoreColor(analysis.scoreImpact)} desc="Quantified results and action verbs" />
                  <ScoreBar label="Formatting" score={analysis.scoreFormatting} color={getScoreColor(analysis.scoreFormatting)} desc="Professional structure and layout" />
                  <ScoreBar label="Writing Clarity" score={analysis.scoreClarity} color={getScoreColor(analysis.scoreClarity)} desc="Clear concise language" />
                  <ScoreBar label="Readability" score={analysis.scoreReadability} color={getScoreColor(analysis.scoreReadability)} desc="6-second recruiter scan test" />
                </div>

                <div>
                  {/* Strengths */}
                  {analysis.strengths?.length > 0 && (
                    <div style={{ background: 'rgba(40,167,69,0.08)', border: '1px solid rgba(40,167,69,0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                      <h4 style={{ color: '#1a7a32', marginBottom: '0.75rem' }}>✅ What's Good</h4>
                      {analysis.strengths.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ color: '#28A745', flexShrink: 0 }}>•</span>
                          <span style={{ color: dark ? '#CBD5E1' : '#495057', fontSize: '0.9rem' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Improvements */}
                  {analysis.improvements?.length > 0 && (
                    <div style={{ background: 'rgba(220,53,69,0.06)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                      <h4 style={{ color: '#9c1c28', marginBottom: '0.75rem' }}>🔧 Must Improve</h4>
                      {analysis.improvements.map((imp, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                          <span style={{ background: '#DC3545', color: 'var(--bg-card)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ color: dark ? '#CBD5E1' : '#495057', fontSize: '0.9rem', lineHeight: '1.6' }}>{imp}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Re-analyze button */}
                  <button className="btn btn-ghost btn-sm btn-full" onClick={analyze} disabled={analyzing}>
                    {analyzing ? '🤖 Re-analyzing...' : '🔄 Re-analyze Resume'}
                  </button>
                  {analysis && (
  <button className="btn btn-ghost btn-sm" onClick={sendEmail}>
    📧 Email Report
  </button>
)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── KEYWORDS TAB ── */}
      {tab === 'keywords' && (
        <div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
            <h4 style={{ color: textPrimary, marginBottom: '0.5rem' }}>Paste Job Description</h4>
            <p style={{ color: textSecondary, fontSize: '0.875rem', marginBottom: '1rem' }}>
              Copy and paste the full job description to find which keywords you're missing
            </p>
            <textarea
              style={{ width: '100%', minHeight: '140px', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: dark ? '#E2E8F0' : '#212529', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              placeholder="Paste the full job description here..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
            />
            <button className="btn btn-primary" onClick={findKeywords} disabled={analyzing} style={{ marginTop: '1rem' }}>
              {analyzing ? '🔍 Analyzing keywords...' : '🔍 Find Keyword Gaps'}
            </button>
          </div>

          {keywordResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(40,167,69,0.08)', border: '1px solid rgba(40,167,69,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ color: '#1a7a32', marginBottom: '1rem' }}>✅ Keywords Found ({JSON.parse(keywordResult.keywordsFound || '[]').length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {JSON.parse(keywordResult.keywordsFound || '[]').map((k, i) => (
                    <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(40,167,69,0.15)', color: '#1a7a32', fontSize: '0.8125rem', fontWeight: '500' }}>{k}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(220,53,69,0.06)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ color: '#9c1c28', marginBottom: '1rem' }}>❌ Missing Keywords ({JSON.parse(keywordResult.keywordsMissing || '[]').length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                  {JSON.parse(keywordResult.keywordsMissing || '[]').map((k, i) => (
                    <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(220,53,69,0.1)', color: '#9c1c28', fontSize: '0.8125rem', fontWeight: '500' }}>{k}</span>
                  ))}
                </div>
                {keywordResult.suggestion && (
                  <div style={{ background: 'rgba(201,168,76,0.1)', borderRadius: '8px', padding: '10px 12px', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.8125rem', color: dark ? '#CBD5E1' : '#495057' }}>💡 {keywordResult.suggestion}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REWRITE TAB ── */}
      {tab === 'rewrite' && (
        <div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✍️</div>
            <h4 style={{ color: textPrimary, marginBottom: '0.5rem' }}>AI Bullet Point Rewriter</h4>
            <p style={{ color: textSecondary, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              AI reads your resume bullets and rewrites them with strong action verbs and quantified impact
            </p>
            <button className="btn btn-primary" onClick={rewrite} disabled={analyzing}>
              {analyzing ? '🤖 Rewriting bullets...' : '✨ Rewrite My Bullets'}
            </button>
          </div>

          {bulletResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {JSON.parse(bulletResult.originalBullets || '[]').map((orig, i) => {
                const rewrites = JSON.parse(bulletResult.rewrittenBullets || '[]')
                return (
                  <div key={i} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(220,53,69,0.1)', color: '#9c1c28', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0 }}>Original</span>
                      <p style={{ color: textSecondary, margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{orig}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(40,167,69,0.12)', color: '#1a7a32', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0 }}>AI Improved</span>
                      <p style={{ color: textPrimary, margin: 0, fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '500' }}>{rewrites[i] || 'Improved version coming...'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── COVER LETTER TAB ── */}
      {tab === 'cover' && (
        <div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
            <h4 style={{ color: textPrimary, marginBottom: '0.5rem' }}>Generate AI Cover Letter</h4>
            <p style={{ color: textSecondary, fontSize: '0.875rem', marginBottom: '1rem' }}>
              Paste the job description and AI will write a personalized cover letter using your resume
            </p>
            <textarea
              style={{ width: '100%', minHeight: '140px', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: dark ? '#E2E8F0' : '#212529', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              placeholder="Paste job description here..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
            />
            <button className="btn btn-primary" onClick={generateCL} disabled={analyzing} style={{ marginTop: '1rem' }}>
              {analyzing ? '🤖 Writing cover letter...' : '📧 Generate Cover Letter'}
            </button>
          </div>

          {coverLetter && (
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ color: textPrimary, margin: 0 }}>📧 Your Cover Letter</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(coverLetter); alert('Copied!') }}>📋 Copy</button>
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    const blob = new Blob([coverLetter], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'cover-letter.txt'; a.click()
                    URL.revokeObjectURL(url)
                  }}>⬇️ Download</button>
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: textBody, lineHeight: '1.9', fontSize: '0.9375rem', background: dark ? '#0F172A' : '#F8F9FA', padding: '1.5rem', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                {coverLetter}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}