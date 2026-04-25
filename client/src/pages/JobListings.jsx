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

  const fetchJobs = async (query) => {
  const searchQuery = query || search
  if (!searchQuery.trim()) return
  setLoading(true)
  setSearched(true)
  try {
    const r = await api.get(`/api/jobs/search?skills=${encodeURIComponent(searchQuery)}`)
    setJobs(r.data)
    console.log('Jobs received:', r.data.length)
  } catch (err) {
    console.error('Job search error:', err)
    setJobs([])
  } finally {
    setLoading(false)
  }
}

  const checkMatch = async (jobId, jobDescription) => {
    setMatchLoading(jobId)
    try {
      const r = await api.post('/api/analysis/job-match', { jobDescription })
      setMatches(prev => ({ ...prev, [jobId]: r.data }))
    } catch {}
    finally { setMatchLoading(null) }
  }

  const toggleSave = (id) => setSaved(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  )

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Job Listings</h2>
        <p className="page-subtitle">Search real-time jobs from LinkedIn, Indeed, Glassdoor and more</p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="Search jobs (e.g. React Developer, CAD Designer, Data Analyst)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchJobs()}
          />
          <button 
  className="btn btn-primary" 
  onClick={() => fetchJobs(search)} 
  disabled={loading || !search.trim()}
>
  {loading ? '🔍 Searching...' : '🔍 Search Jobs'}
</button>
        </div>

        {/* Quick search chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Quick search:</span>
          {['React Developer', 'Node.js', 'Full Stack', 'Python Developer', 
  'CAD Designer', 'Data Analyst', 'UI/UX Designer', 'DevOps Engineer'].map(q => (
  <button key={q} 
    onClick={() => { setSearch(q); fetchJobs(q) }}
    style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', 
      border: '1px solid var(--gray-300)', background: 'var(--gray-50)', 
      cursor: 'pointer', color: 'var(--gray-600)' }}>
    {q}
  </button>
))}
        </div>
      </div>

      {/* Results */}
      {!searched && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>Search for any job</h3>
          <p style={{ color: 'var(--gray-500)' }}>Type any job title above — we'll find real live listings from top job boards</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)' }}>Searching live job listings...</p>
        </div>
      )}

      {!loading && searched && jobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray-500)' }}>No jobs found. Try a different search term.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Found <strong>{jobs.length}</strong> jobs for "<strong>{search}</strong>"
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {job.logo && (
                        <img src={job.logo} alt={job.company}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }}
                          onError={e => e.target.style.display = 'none'} />
                      )}
                      <h4 style={{ color: 'var(--navy-800)', margin: 0 }}>{job.title}</h4>
                      {job.remote && <span className="badge badge-success">Remote</span>}
                      {matches[job.id] && (
                        <span className={`badge ${matches[job.id].jobMatchScore >= 70 ? 'badge-success' : matches[job.id].jobMatchScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                          {matches[job.id].jobMatchScore}% Match
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>🏢 {job.company}</span>
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>📍 {job.location}</span>
                      {job.salary && <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>💰 {job.salary}</span>}
                      {job.employment_type && <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>⏰ {job.employment_type}</span>}
                    </div>

                    <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', margin: '0 0 8px', lineHeight: '1.5' }}>
                      {job.description?.slice(0, 200)}...
                    </p>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>via {job.source}</span>
                      {job.postedAt && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                          • {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {matches[job.id]?.jobMatchSummary && (
                      <div className="alert alert-info" style={{ marginTop: '10px', marginBottom: 0, fontSize: '0.8125rem' }}>
                        {matches[job.id].jobMatchSummary}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px' }}>
                    <a href={job.jobUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                      Apply →
                    </a>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => checkMatch(job.id, job.description)}
                      disabled={matchLoading === job.id}>
                      {matchLoading === job.id ? '...' : '% Match'}
                    </button>
                    <button
                      className={`btn btn-sm ${saved.includes(job.id) ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => toggleSave(job.id)}>
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