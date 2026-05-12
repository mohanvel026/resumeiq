import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function MyResumes() {

  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = () => {
    api.get('/api/resume/all')
      .then(r => setResumes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/api/resume/${id}`)
      setResumes(prev => prev.filter(r => r.id !== id))
      setConfirmDelete(null)
    } catch {
      alert('Failed to delete resume. Try again.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Layout>
      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
              <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>Delete Resume?</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>?
                This will also delete all AI analyses for this resume.
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-full"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting === confirmDelete.id}
              >
                {deleting === confirmDelete.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${r.fileType === 'pdf' ? 'badge-navy' : 'badge-gold'}`}>
                    {r.fileType?.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setConfirmDelete(r)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--gray-400)', fontSize: '1.1rem', padding: '2px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}
                    title="Delete resume"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h4 style={{ color: 'var(--navy-800)', marginBottom: '4px' }}>{r.title}</h4>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', margin: '0 0 1rem' }}>
                📅 {new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/resume/${r.id}`)}
                >
                  ⚡ Analyze
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/resume/${r.id}`)}
                >
                  👁 View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}