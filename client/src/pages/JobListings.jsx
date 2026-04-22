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

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/api/jobs/search?skills=${encodeURIComponent(search || 'react node javascript')}`)
      setJobs(r.data)
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  const checkMatch = async (jobId, jobDescription) => {
    setMatchLoading(jobId)
    try {
      const r = await api.post('/api/analysis/job-match', { jobDescription })
      setMatches(prev => ({ ...prev, [jobId]: r.data }))
    } catch {}
    finally { setMatchLoading(null) }
  }

  const toggleSave = (id) => setSaved(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Job Listings</h2>
        <p className="page-subtitle">Real-time jobs matched to your skills</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: 1, minWidth: '200px' }} placeholder="Search by skills (e.g. react, node, python)" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchJobs()} />
        <button className="btn btn-primary" onClick={fetchJobs} disabled={loading}>{loading ? 'Searching...' : '🔍 Search'}</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray-500)' }}>No jobs found. Try different skills or check your Adzuna API key.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h4 style={{ color: 'var(--navy-800)', margin: 0 }}>{job.title}</h4>
                    {matches[job.id] && (
                      <span className={`badge ${matches[job.id].jobMatchScore >= 70 ? 'badge-success' : matches[job.id].jobMatchScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                        {matches[job.id].jobMatchScore}% Match
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: '0 0 4px' }}>🏢 {job.company} · 📍 {job.location || 'Remote'} {job.salary && `· 💰 ${job.salary}`}</p>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', margin: 0 }}>{job.description?.slice(0, 150)}...</p>
                  {matches[job.id]?.jobMatchSummary && (
                    <div className="alert alert-info" style={{ marginTop: '10px', marginBottom: 0 }}>
                      {matches[job.id].jobMatchSummary}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                  <a href={job.jobUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Apply →</a>
                  <button className="btn btn-ghost btn-sm" onClick={() => checkMatch(job.id, job.description)} disabled={matchLoading === job.id}>
                    {matchLoading === job.id ? '...' : '% Match'}
                  </button>
                  <button className={`btn btn-sm ${saved.includes(job.id) ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => toggleSave(job.id)}>
                    {saved.includes(job.id) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}