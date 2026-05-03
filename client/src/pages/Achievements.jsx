import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const BADGES = [
  { id: 'first_upload', icon: '📄', name: 'First Resume', desc: 'Uploaded your first resume', check: (stats) => stats.resumes >= 1 },
  { id: 'analyzer', icon: '⚡', name: 'AI Analyzer', desc: 'Analyzed your resume with AI', check: (stats) => stats.analyses >= 1 },
  { id: 'score_70', icon: '🎯', name: 'Score 70+', desc: 'Achieved a resume score of 70 or above', check: (stats) => stats.bestScore >= 70 },
  { id: 'score_80', icon: '🏅', name: 'Score 80+', desc: 'Achieved a resume score of 80 or above', check: (stats) => stats.bestScore >= 80 },
  { id: 'score_90', icon: '🏆', name: 'Score 90+', desc: 'Achieved an exceptional resume score of 90+', check: (stats) => stats.bestScore >= 90 },
  { id: 'job_hunter', icon: '💼', name: 'Job Hunter', desc: 'Applied to your first job', check: (stats) => stats.applications >= 1 },
  { id: 'networker', icon: '🤝', name: 'Networker', desc: 'Applied to 5 or more jobs', check: (stats) => stats.applications >= 5 },
  { id: 'interviewer', icon: '🎤', name: 'Interview Ready', desc: 'Generated interview questions', check: (stats) => stats.interviews >= 1 },
  { id: 'multi_resume', icon: '📚', name: 'Multi-Version', desc: 'Uploaded 3 or more resume versions', check: (stats) => stats.resumes >= 3 },
  { id: 'cover_letter', icon: '📧', name: 'Cover Letter Pro', desc: 'Generated a cover letter', check: (stats) => stats.coverLetters >= 1 },
  { id: 'mock_star', icon: '🌟', name: 'Mock Star', desc: 'Completed a mock interview', check: (stats) => stats.mockInterviews >= 1 },
  { id: 'skill_gap', icon: '📈', name: 'Self Aware', desc: 'Analyzed your skill gaps', check: (stats) => stats.skillGaps >= 1 },
]

export default function Achievements() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ resumes: 0, analyses: 0, bestScore: 0, applications: 0, interviews: 0, coverLetters: 0, mockInterviews: 0, skillGaps: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/resume/all').catch(() => ({ data: [] })),
    ]).then(([resumesRes]) => {
      setStats(prev => ({ ...prev, resumes: resumesRes.data.length }))
    }).finally(() => setLoading(false))
  }, [])

  const earned = BADGES.filter(b => b.check(stats))
  const locked = BADGES.filter(b => !b.check(stats))

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Achievements</h2>
        <p className="page-subtitle">Earn badges as you progress in your career journey</p>
      </div>

      <div className="metric-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Badges Earned', value: earned.length },
          { label: 'Total Badges', value: BADGES.length },
          { label: 'Completion', value: `${Math.round((earned.length / BADGES.length) * 100)}%` },
          { label: 'Resumes Uploaded', value: stats.resumes },
        ].map(m => (
          <div key={m.label} className="metric-card gold-accent">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      {earned.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🏆 Earned Badges ({earned.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {earned.map(b => (
              <div key={b.id} className="card" style={{ textAlign: 'center', border: '2px solid var(--gold-500)', background: 'rgba(201,168,76,0.04)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{b.icon}</div>
                <div style={{ fontWeight: '700', color: 'var(--navy-800)', marginBottom: '4px' }}>{b.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{b.desc}</div>
                <div style={{ marginTop: '8px' }}><span className="badge badge-gold">Earned ✓</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🔒 Locked Badges ({locked.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {locked.map(b => (
            <div key={b.id} className="card" style={{ textAlign: 'center', opacity: 0.5, filter: 'grayscale(1)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{b.icon}</div>
              <div style={{ fontWeight: '700', color: 'var(--navy-800)', marginBottom: '4px' }}>{b.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{b.desc}</div>
              <div style={{ marginTop: '8px' }}><span className="badge badge-navy">Locked 🔒</span></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}