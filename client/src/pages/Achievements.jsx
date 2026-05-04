import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

const BADGES = [
  { id: 'first_upload', icon: '📄', name: 'First Resume', desc: 'Upload your first resume', check: s => s.resumes >= 1, hint: 'Upload a resume to earn this' },
  { id: 'analyzer', icon: '⚡', name: 'AI Analyzer', desc: 'Analyze your resume with AI', check: s => s.analyses >= 1, hint: 'Go to any resume → click Analyze Resume' },
  { id: 'multi_resume', icon: '📚', name: 'Multi-Version', desc: 'Upload 3 or more resumes', check: s => s.resumes >= 3, hint: 'Upload 2 more resumes' },
  { id: 'score_60', icon: '🎯', name: 'Score 60+', desc: 'Achieve a resume score of 60+', check: s => s.bestScore >= 60, hint: 'Analyze your resume to get scored' },
  { id: 'score_75', icon: '🏅', name: 'Score 75+', desc: 'Achieve a resume score of 75+', check: s => s.bestScore >= 75, hint: 'Keep improving your resume' },
  { id: 'score_90', icon: '🏆', name: 'Top Scorer', desc: 'Achieve a resume score of 90+', check: s => s.bestScore >= 90, hint: 'Near perfect resume needed' },
  { id: 'cover_letter', icon: '📧', name: 'Cover Letter Pro', desc: 'Generate an AI cover letter', check: s => s.coverLetters >= 1, hint: 'Use Cover Letters page' },
  { id: 'keyword_hunter', icon: '🔍', name: 'Keyword Hunter', desc: 'Run keyword gap analysis', check: s => s.keywords >= 1, hint: 'Use Keywords tab in resume analysis' },
  { id: 'rewriter', icon: '✍️', name: 'Bullet Rewriter', desc: 'Use AI bullet rewriter', check: s => s.rewrites >= 1, hint: 'Use Rewriter tab in resume analysis' },
  { id: 'job_hunter', icon: '💼', name: 'Job Hunter', desc: 'Search for jobs', check: s => s.jobSearches >= 1, hint: 'Go to Job Listings and search' },
  { id: 'interviewer', icon: '🎤', name: 'Interview Ready', desc: 'Generate interview questions', check: s => s.interviews >= 1, hint: 'Go to Interview Prep' },
  { id: 'mock_star', icon: '🌟', name: 'Mock Star', desc: 'Complete a mock interview', check: s => s.mockInterviews >= 1, hint: 'Complete a mock interview session' },
  { id: 'skill_gap', icon: '📈', name: 'Self Aware', desc: 'Analyze your skill gaps', check: s => s.skillGaps >= 1, hint: 'Use the Skill Gap page' },
  { id: 'planner', icon: '📅', name: 'Planner', desc: 'Generate a 30-day job plan', check: s => s.plans >= 1, hint: 'Go to 30-Day Plan page' },
  { id: 'exporter', icon: '📥', name: 'PDF Exporter', desc: 'Export resume as PDF', check: s => s.exports >= 1, hint: 'Go to Export PDF page' },
]
const DEFAULT_STATS = {
  resumes: 0, analyses: 0, bestScore: 0,
  coverLetters: 0, keywords: 0, rewrites: 0,
  jobSearches: 0, interviews: 0, mockInterviews: 0,
  skillGaps: 0, plans: 0, exports: 0,
}

export default function Achievements() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
  try {
    // Get real stats from backend
    const statsRes = await api.get('/api/analysis/user-stats')
    const serverStats = statsRes.data

    // Get activity from localStorage
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
      <div className="page-header">
        <h2 className="page-title">Achievements</h2>
        <p className="page-subtitle">Earn badges by using ResumeIQ features</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: 'var(--navy-800)' }}>{earned.length}/{BADGES.length} Badges Earned</span>
              <span style={{ color: 'var(--gold-500)', fontWeight: '600' }}>{pct}% Complete</span>
            </div>
            <div style={{ background: 'var(--gray-200)', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(to right, var(--navy-600), var(--gold-500))', borderRadius: '20px', transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
            {[
              { label: 'Resumes', value: stats.resumes, icon: '📄' },
              { label: 'Analyses', value: stats.analyses, icon: '⚡' },
              { label: 'Best Score', value: stats.bestScore || '-', icon: '🏆' },
              { label: 'Cover Letters', value: stats.coverLetters, icon: '📧' },
              { label: 'Interviews', value: stats.interviews, icon: '🎤' },
              { label: 'Job Searches', value: stats.jobSearches, icon: '💼' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--navy-800)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Earned badges */}
          {earned.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🏆 Earned ({earned.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {earned.map(b => (
                  <div key={b.id} className="card" style={{ textAlign: 'center', border: '2px solid var(--gold-500)', background: 'rgba(201,168,76,0.04)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{b.icon}</div>
                    <div style={{ fontWeight: '700', color: 'var(--navy-800)', marginBottom: '4px', fontSize: '0.9rem' }}>{b.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '8px' }}>{b.desc}</div>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(40,167,69,0.15)', color: '#1a7a32' }}>✓ Earned</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked badges */}
          <div>
            <h3 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>🔒 Locked ({locked.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {locked.map(b => (
                <div key={b.id} className="card" style={{ textAlign: 'center', opacity: 0.6 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px', filter: 'grayscale(1)' }}>{b.icon}</div>
                  <div style={{ fontWeight: '700', color: 'var(--navy-800)', marginBottom: '4px', fontSize: '0.9rem' }}>{b.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '8px' }}>{b.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontStyle: 'italic' }}>{b.hint}</div>
                </div>
              ))}
            </div>
          </div>

          {earned.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '1rem', background: 'var(--navy-900)' }}>
              <p style={{ color: 'var(--gray-400)', marginBottom: '1rem' }}>Start using ResumeIQ to earn your first badge!</p>
              <Link to="/upload" className="btn btn-primary btn-sm">Upload Resume →</Link>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}