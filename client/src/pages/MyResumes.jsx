import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function MyResumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => setResumes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">My Resumes</h2>
          <p className="page-subtitle">Manage and analyze your uploaded resumes</p>
        </div>
        <Link to="/upload" className="btn btn-primary">+ Upload New</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>No resumes yet</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Upload your first resume to get AI-powered analysis</p>
          <Link to="/upload" className="btn btn-primary">Upload Resume</Link>
        </div>
      ) : (
        <div className="grid-3">
          {resumes.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/resume/${r.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <span className={`badge ${r.fileType === 'pdf' ? 'badge-navy' : 'badge-gold'}`}>
                  {r.fileType?.toUpperCase()}
                </span>
              </div>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '4px' }}>{r.title}</h4>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', margin: '0 0 1rem' }}>
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Analyze</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}