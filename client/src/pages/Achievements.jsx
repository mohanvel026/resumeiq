import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

const BADGES = [
  { id: 'first_upload', icon: '📄', name: 'First Resume', desc: 'Upload your first resume', check: s => s.resumes >= 1, hint: 'Upload a resume to earn this' },
  { id: 'analyzer', icon: '⚡', name: 'AI Analyzer', desc: 'Analyze resume with AI', check: s => s.analyses >= 1, hint: 'Go to any resume → click Analyze' },
  { id: 'multi_resume', icon: '📚', name: 'Multi-Version', desc: 'Upload 3+ resumes', check: s => s.resumes >= 3, hint: 'Upload 2 more resumes' },
  { id: 'score_50', icon: '🎯', name: 'Score 50+', desc: 'ATS score above 50', check: s => s.bestScore >= 50, hint: 'Analyze your resume' },
  { id: 'score_65', icon: '🏅', name: 'Score 65+', desc: 'ATS score above 65', check: s => s.bestScore >= 65, hint: 'Improve your resume quality' },
  { id: 'score_80', icon: '🏆', name: 'Score 80+', desc: 'ATS score above 80', check: s => s.bestScore >= 80, hint: 'Near perfect resume needed' },
  { id: 'cover_letter', icon: '📧', name: 'Cover Letter Pro', desc: 'Generate AI cover letter', check: s => s.coverLetters >= 1, hint: 'Use Cover Letters page' },
  { id: 'keyword_hunter', icon: '🔍', name: 'Keyword Hunter', desc: 'Run keyword gap analysis', check: s => s.keywords >= 1, hint: 'Use Keywords tab in resume analysis' },
  { id: 'bullet_rewriter', icon: '✍️', name: 'Bullet Rewriter', desc: 'Use AI bullet rewriter', check: s => s.rewrites >= 1, hint: 'Use Rewriter tab in resume analysis' },
  { id: 'job_hunter', icon: '💼', name: 'Job Hunter', desc: 'Search for jobs', check: s => s.jobSearches >= 1, hint: 'Search in Job Listings page' },
  { id: 'interviewer', icon: '🎤', name: 'Interview Ready', desc: 'Generate interview questions', check: s => s.interviews >= 1, hint: 'Go to Interview Prep' },
  { id: 'mock_star', icon: '🌟', name: 'Mock Star', desc: 'Complete mock interview', check: s => s.mockInterviews >= 1, hint: 'Complete a mock interview session' },
  { id: 'skill_gap', icon: '📈', name: 'Self Aware', desc: 'Analyze skill gaps', check: s => s.skillGaps >= 1, hint: 'Use the Skill Gap page' },
  { id: 'planner', icon: '📅', name: 'Planner', desc: 'Generate 30-day plan', check: s => s.plans >= 1, hint: 'Go to 30-Day Plan page' },
  { id: 'pdf_export', icon: '📥', name: 'PDF Exporter', desc: 'Export resume as PDF', check: s => s.exports >= 1, hint: 'Go to Export PDF page' },
]

export default function Achievements() {
  const [stats, setStats] = useState({
    resumes: 0, analyses: 0, bestScore: 0,
    coverLetters: 0, keywords: 0, rewrites: 0,
    interviews: 0, jobSearches: 0, mockInterviews: 0,
    skillGaps: 0, plans: 0, exports: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get server stats (real data from DB)
      const serverStats = await api.get('/api/analysis/user-stats').then(r => r.data).catch(() => ({}))

      // Get localStorage activity (UI interactions)
      const activity = JSON.parse(localStorage.getItem('resumeiq_activity') || '{}')

      setStats({
        resumes: serverStats.resumes || 0,
        analyses: serverStats.analyses || 0,
        bestScore: serverStats.bestScore || 0,
        coverLetters: serverStats.coverLetters || 0,
        keywords: serverStats.keywords || 0,
        rewrites: serverStats.rewrites || 0,
        interviews: serverStats.interviews || 0,
        jobSearches: activity.jobSearches || 0,
        mockInterviews: activity.mockInterviews || 0,
        skillGaps: activity.skillGaps || 0,
        plans: activity.plans || 0,
        exports: activity.exports || 0,
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const earned = BADGES.filter(b => b.check(stats))
  const locked = BADGES.filter(b => !b.check(stats))
  const pct = Math.round((earned.length / BADGES.length) * 100)

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Achievements</h2>
          <p className="page-subtitle">Earn badges by using ResumeIQ features</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadStats}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: 'var(--navy-800)' }}>{earned.length}/{BADGES.length} Badges Earned</span>
              <span style={{ color: 'var(--gold-500)', fontWeight: '700' }}>{pct}%</span>
            </div>
            <div className="progress-bar-wrapper" style={{ height: '12px' }}>
              <div className="progress-bar gold" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
            {[
              { label: 'Resumes', value: stats.resumes, icon: '📄' },
              { label: 'Analyses', value: stats.analyses, icon: '⚡' },
              { label: 'Best Score', value: stats.bestScore || '—', icon: '🏆' },
              { label: 'Cover Letters', value: stats.coverLetters, icon: '📧' },
              { label: 'Keywords', value: stats.keywords, icon: '🔍' },
              { label: 'Rewrites', value: stats.rewrites, icon: '✍️' },
              { label: 'Interviews', value: stats.interviews, icon: '🎤' },
              { label: 'Job Searches', value: stats.jobSearches, icon: '💼' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--navy-800)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Earned */}
          {earned.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🏆 Earned Badges ({earned.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {earned.map(b => (
                  <div key={b.id} className="card" style={{ textAlign: 'center', border: '2px solid var(--gold-500)', background: 'rgba(201,168,76,0.04)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{b.icon}</div>
                    <div style={{ fontWeight: '700', color: 'var(--navy-800)', marginBottom: '4px', fontSize: '0.9rem' }}>{b.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '8px' }}>{b.desc}</div>
                    <span className="badge badge-success">✓ Earned</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          <div>
            <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🔒 Locked ({locked.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {locked.map(b => (
                <div key={b.id} className="card" style={{ textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px', filter: 'grayscale(1)' }}>{b.icon}</div>
                  <div style={{ fontWeight: '700', color: 'var(--navy-800)', marginBottom: '4px', fontSize: '0.9rem' }}>{b.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '6px' }}>{b.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontStyle: 'italic' }}>{b.hint}</div>
                </div>
              ))}
            </div>
          </div>

          {earned.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '1rem', background: 'var(--navy-900)' }}>
              <p style={{ color: 'var(--gray-400)', marginBottom: '1rem' }}>Start using ResumeIQ features to earn your first badge!</p>
              <Link to="/upload" className="btn btn-primary btn-sm">Upload Resume →</Link>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}