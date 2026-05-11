import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'

const STYLES = [
  { id: 'formal', name: '👔 Formal', desc: 'Corporate & professional' },
  { id: 'creative', name: '🎨 Creative', desc: 'Startups & modern companies' },
  { id: 'technical', name: '⚡ Technical', desc: 'Engineering & developer roles' },
  { id: 'entry', name: '🎓 Entry Level', desc: 'Fresh graduates' },
  { id: 'career_change', name: '🔄 Career Change', desc: 'Switching industries' },
]

export default function CoverLetterTemplates() {
  const { dark } = useTheme()
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [style, setStyle] = useState('formal')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('generate')

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => {
        setResumes(r.data)
        if (r.data[0]) setSelectedResume(r.data[0].id)
      })
      .catch(() => {})
  }, [])

  const generate = async () => {
    if (!jobTitle || !company) return alert('Please fill in Job Title and Company name')
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/cover-letter', {
        resumeId: parseInt(selectedResume),
        jobDescription: `Job Title: ${jobTitle}\nCompany: ${company}\nStyle: ${style}\nJob Description: ${jobDesc || `${jobTitle} position at ${company}`}\n\nWrite a ${style} cover letter tailored specifically for this role and company. Reference specific details from the resume.`,
      })
      setLetter(r.data.coverLetter)
      setTab('result')
      trackActivity('coverLetters')
    } catch (err) {
      alert('Failed to generate. Make sure you have uploaded and analyzed a resume first.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${company}-${jobTitle}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">AI Cover Letter Generator</h2>
        <p className="page-subtitle">Generate personalized cover letters using your actual resume content</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {['generate', 'result'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'generate' ? '⚙️ Generate' : '📄 Result'}
          </button>
        ))}
      </div>

      {tab === 'generate' ? (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Job Details</h4>

              <div className="form-group">
                <label className="form-label">Select Your Resume</label>
                <select className="form-select" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  {resumes.length === 0 && <option disabled>No resumes — upload one first</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" placeholder="e.g. Full Stack Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description (optional but recommended)</label>
                <textarea className="form-textarea" rows={4} placeholder="Paste the job description here for a more tailored cover letter..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Cover Letter Style</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {STYLES.map(s => (
                  <div key={s.id} onClick={() => setStyle(s.id)}
                    style={{ padding: '12px', border: `2px solid ${style === s.id ? 'var(--gold-500)' : 'var(--gray-200)'}`, borderRadius: 'var(--border-radius)', cursor: 'pointer', background: style === s.id ? 'rgba(201,168,76,0.05)' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--navy-800)', fontSize: '0.9rem' }}>{s.name}</div>
                      <div style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{s.desc}</div>
                    </div>
                    {style === s.id && <span style={{ color: 'var(--gold-500)', fontSize: '1.2rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={generate} disabled={loading || resumes.length === 0}>
              {loading ? '🤖 AI is writing your cover letter...' : '✨ Generate AI Cover Letter'}
            </button>

            {resumes.length === 0 && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginTop: '8px', textAlign: 'center' }}>
                Upload a resume first to generate a personalized cover letter
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {letter ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ color: 'var(--navy-800)', margin: '0 0 4px' }}>
                    Cover Letter — {jobTitle} at {company}
                  </h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    Style: {STYLES.find(s => s.id === style)?.name} • Generated by Groq AI
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                  <button className="btn btn-primary btn-sm" onClick={download}>⬇️ Download</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('generate')}>✏️ Edit</button>
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-700)', lineHeight: '1.9', fontSize: '0.9375rem', background: 'var(--gray-50)', padding: '2rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--gray-200)', minHeight: '400px' }}>
                {letter}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>No cover letter yet</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Go to the Generate tab and fill in the details</p>
              <button className="btn btn-primary" onClick={() => setTab('generate')}>Generate Cover Letter</button>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}