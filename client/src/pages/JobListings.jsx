import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function JobListings() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState([])
  const [matchLoading, setMatchLoading] = useState(null)
  const [matches, setMatches] = useState({})
  const [searched, setSearched] = useState(false)
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [showResumeModal, setShowResumeModal] = useState(null)

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => {
        setResumes(r.data)
        if (r.data.length === 1) setSelectedResume(r.data[0])
      })
      .catch(() => {})
  }, [])

  const fetchJobs = async (query) => {
    const searchQuery = query || search
    if (!searchQuery.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const r = await api.get(`/api/jobs/search?skills=${encodeURIComponent(searchQuery)}`)
      setJobs(r.data)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleMatchClick = (job) => {
    if (resumes.length === 0) {
      alert('Please upload a resume first to check job match!')
      return
    }
    if (resumes.length === 1) {
      checkMatch(job, resumes[0])
    } else {
      setShowResumeModal(job)
    }
  }

  const checkMatch = async (job, resume) => {
    setShowResumeModal(null)
    setMatchLoading(job.id)
    try {
      const r = await api.post('/api/analysis/job-match', {
        jobDescription: `${job.title} at ${job.company}. ${job.description}`,
        resumeId: resume.id,
      })
      setMatches(prev => ({ ...prev, [job.id]: { ...r.data, resumeTitle: resume.title } }))
    } catch {}
    finally { setMatchLoading(null) }
  }

  const toggleSave = (id) => setSaved(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  )

  return (
    <Layout>
      {/* Resume Selector Modal */}
      {showResumeModal && (
        <div className="overlay" onClick={() => setShowResumeModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>
              Select Resume to Compare
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Which resume do you want to match against <strong>{showResumeModal.title}</strong> at {showResumeModal.company}?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  onClick={() => checkMatch(showResumeModal, resume)}
                  style={{
                    padding: '1rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-500)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--navy-800)' }}>{resume.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {new Date(resume.createdAt).toLocaleDateString()} · {resume.fileType?.toUpperCase()}
                    </div>
                  </div>
                  <span className={`badge ${resume.fileType === 'pdf' ? 'badge-navy' : 'badge-gold'}`}>
                    {resume.fileType?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-ghost btn-full"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowResumeModal(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <h2 className="page-title">Job Listings</h2>
        <p className="page-subtitle">Search real-time jobs from LinkedIn, Indeed, Glassdoor and more</p>
      </div>

      {/* Resume info bar */}
      {resumes.length > 0 && (
        <div style={{
          background: 'var(--navy-900)', border: '1px solid var(--navy-700)',
          borderRadius: 'var(--border-radius)', padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem', flexWrap: 'wrap', gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--gold-500)', fontSize: '0.875rem' }}>📄</span>
            <span style={{ color: 'var(--gray-300)', fontSize: '0.875rem' }}>
              {resumes.length === 1
                ? `Using: ${resumes[0].title}`
                : `${resumes.length} resumes available — select when checking match`}
            </span>
          </div>
          {resumes.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {resumes.map(r => (
                <span key={r.id} style={{
                  fontSize: '0.75rem', padding: '2px 8px',
                  borderRadius: '20px', background: 'var(--navy-700)',
                  color: 'var(--gray-300)'
                }}>{r.title}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="Search any job (e.g. CAD Designer, React Developer, Data Analyst)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchJobs(search)}
          />
          <button
            className="btn btn-primary"
            onClick={() => fetchJobs(search)}
            disabled={loading || !search.trim()}
          >
            {loading ? '🔍 Searching...' : '🔍 Search Jobs'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Quick:</span>
          {['React Developer', 'Node.js', 'Full Stack', 'CAD Designer',
            'Data Analyst', 'Python Developer', 'UI/UX Designer', 'DevOps'].map(q => (
            <button key={q}
              onClick={() => { setSearch(q); fetchJobs(q) }}
              style={{
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px',
                border: '1px solid var(--gray-300)', background: 'var(--gray-50)',
                cursor: 'pointer', color: 'var(--gray-600)'
              }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!searched && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>Search any job title</h3>
          <p style={{ color: 'var(--gray-500)' }}>
            Real-time results from LinkedIn, Indeed, Glassdoor and 50+ job boards
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)' }}>Searching live job listings...</p>
        </div>
      )}

      {/* No results */}
      {!loading && searched && jobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray-500)' }}>No jobs found. Try a different search term.</p>
        </div>
      )}

      {/* Job Cards */}
      {!loading && jobs.length > 0 && (
        <div>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Found <strong>{jobs.length}</strong> jobs for "<strong>{search}</strong>"
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {job.logo && (
                        <img src={job.logo} alt={job.company}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }}
                          onError={e => e.target.style.display = 'none'} />
                      )}
                      <h4 style={{ color: 'var(--navy-800)', margin: 0 }}>{job.title}</h4>
                      {job.remote && <span className="badge badge-success">🌐 Remote</span>}
                      {matches[job.id] && (
                        <span className={`badge ${matches[job.id].jobMatchScore >= 70 ? 'badge-success' : matches[job.id].jobMatchScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                          {matches[job.id].jobMatchScore}% Match
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>🏢 {job.company}</span>
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>📍 {job.location}</span>
                      {job.salary && job.salary !== 'Salary not disclosed' && (
                        <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>💰 {job.salary}</span>
                      )}
                      {job.employment_type && (
                        <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>⏰ {job.employment_type}</span>
                      )}
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>via {job.source}</span>
                    </div>

                    <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', margin: '0 0 8px', lineHeight: '1.6' }}>
                      {job.description?.slice(0, 200)}...
                    </p>

                    {matches[job.id] && (
                      <div style={{ marginTop: '10px' }}>
                        <div className="alert alert-info" style={{ marginBottom: '4px' }}>
                          <strong>Resume used:</strong> {matches[job.id].resumeTitle} •{' '}
                          {matches[job.id].jobMatchSummary}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px' }}>
                    <a href={job.jobUrl} target="_blank" rel="noreferrer"
                      className="btn btn-primary btn-sm">
                      Apply →
                    </a>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleMatchClick(job)}
                      disabled={matchLoading === job.id}
                    >
                      {matchLoading === job.id ? '...' : '% Match'}
                    </button>
                    <button
                      className={`btn btn-sm ${saved.includes(job.id) ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => toggleSave(job.id)}
                    >
                      {saved.includes(job.id) ? '★ Saved' : '☆ Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}