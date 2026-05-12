import { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function UploadResume() {

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) return setError('Only PDF and DOCX files are allowed')
    setFile(f); setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please select a file')
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('resume', file)
      fd.append('title', title || file.name.replace(/\.[^/.]+$/, ''))
      await api.post('/api/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess('Resume uploaded successfully! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/dashboard" style={{ color: 'var(--gold-500)', fontSize: '1.25rem', fontWeight: '700', textDecoration: 'none' }}>
            ← <span style={{ color: 'var(--white)' }}>Resume</span>IQ
          </Link>
        </div>
        <div className="navbar-actions">
          <div className="navbar-avatar">{initials}</div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-300)', borderColor: 'var(--navy-600)' }} onClick={() => { logout(); navigate('/') }}>Logout</button>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingTop: 'calc(var(--navbar-height) + 2rem)', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="page-header">
            <h2 className="page-title">Upload Your Resume</h2>
            <p className="page-subtitle">Upload your PDF or DOCX resume to get an AI-powered analysis</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card">
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Resume title (optional)</label>
                <input type="text" className="form-input" placeholder="e.g. Frontend Developer v1" value={title} onChange={e => setTitle(e.target.value)} />
                <span className="form-hint">Give it a name to identify this version later</span>
              </div>

              <div className="form-group">
                <label className="form-label">Resume file</label>
                <div
                  className={`upload-zone ${dragging ? 'dragging' : ''}`}
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="upload-zone-icon">📄</div>
                  {file ? (
                    <>
                      <div className="upload-zone-title" style={{ color: 'var(--navy-700)' }}>✓ {file.name}</div>
                      <div className="upload-zone-sub">{(file.size / 1024).toFixed(0)} KB — Click to change file</div>
                    </>
                  ) : (
                    <>
                      <div className="upload-zone-title">Drop your resume here or click to browse</div>
                      <div className="upload-zone-sub">Supports PDF and DOCX files up to 5MB</div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/dashboard')}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading || !file}>
                  {loading ? 'Uploading & Analyzing...' : 'Upload Resume →'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: '1rem', background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}>
            <h4 style={{ color: 'var(--gold-500)', marginBottom: '0.75rem' }}>What happens after upload?</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['AI parses your resume text automatically', 'You get a 6-dimension score instantly', 'Skills are extracted for job matching', 'You can generate cover letters and more'].map(s => (
                <div key={s} style={{ display: 'flex', gap: '10px', color: 'var(--gray-300)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--gold-500)' }}>✓</span> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}