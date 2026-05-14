import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function Leaderboard() {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(30)

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const r = await api.get('/api/analysis/leaderboard')
      setBoard(r.data)
      setLastUpdated(new Date())
      setCountdown(30)
    } catch (err) {
      console.error('Leaderboard error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Auto refresh every 30 seconds
  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(() => fetchLeaderboard(true), 30000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => c <= 1 ? 30 : c - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentUser = board.find(p => p.isCurrentUser)

  const getScoreColor = (score) => {
    if (score >= 80) return '#28A745'
    if (score >= 65) return '#C9A84C'
    if (score >= 50) return '#FD7E14'
    return '#DC3545'
  }

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Global Leaderboard</h2>
          <p className="page-subtitle">
            Live ATS rankings — auto-refreshes every 30 seconds
            {lastUpdated && (
              <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            Refreshing in {countdown}s
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => fetchLeaderboard(true)} disabled={refreshing}>
            {refreshing ? '⏳' : '🔄'} Refresh Now
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)' }}>Loading leaderboard...</p>
        </div>
      ) : board.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>No scores yet!</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            Be the first! Analyze your resume to get on the leaderboard.
          </p>
          <Link to="/resumes" className="btn btn-primary">Analyze Resume →</Link>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {board.slice(0, Math.min(3, board.length)).map(p => (
              <div key={p.rank} className="card" style={{
                textAlign: 'center',
                background: p.rank === 1 ? 'var(--navy-900)' : 'white',
                border: p.isCurrentUser ? '2px solid var(--gold-500)' : p.rank === 1 ? '2px solid var(--gold-500)' : '1px solid var(--gray-200)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{p.badge || `#${p.rank}`}</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: p.rank === 1 ? 'var(--gold-500)' : getScoreColor(p.score), marginBottom: '4px' }}>
                  {p.score}<span style={{ fontSize: '1rem', color: 'var(--gray-400)' }}>/100</span>
                </div>
                <div style={{ fontWeight: '600', color: p.rank === 1 ? 'white' : 'var(--navy-800)', marginBottom: '4px' }}>
                  {p.name}
                  {p.isCurrentUser && <span style={{ display: 'block', color: 'var(--gold-500)', fontSize: '0.75rem' }}>← You</span>}
                </div>
                <div style={{ fontSize: '0.8125rem', color: p.rank === 1 ? 'var(--gray-400)' : 'var(--gray-500)' }}>{p.resumeTitle}</div>
                <div style={{ marginTop: '10px', background: p.rank === 1 ? '#1E293B' : 'var(--gray-100)', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${p.score}%`, height: '100%', background: getScoreColor(p.score), borderRadius: '20px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Full table */}
          <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Resume</th>
                  <th>ATS Score</th>
                  <th>Grade</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {board.map(p => (
                  <tr key={p.rank} style={{ background: p.isCurrentUser ? 'rgba(201,168,76,0.06)' : '' }}>
                    <td>
                      <span style={{ fontWeight: '700', color: p.rank <= 3 ? 'var(--gold-500)' : 'var(--gray-600)', fontSize: '1rem' }}>
                        {p.badge || `#${p.rank}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--navy-800)' }}>
                        {p.name}
                        {p.isCurrentUser && <span style={{ marginLeft: '6px', color: 'var(--gold-500)', fontSize: '0.75rem' }}>← You</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-600)', fontSize: '0.8125rem' }}>{p.resumeTitle}</td>
                    <td>
                      <span style={{ fontSize: '1.1rem', fontWeight: '700', color: getScoreColor(p.score) }}>{p.score}</span>
                      <span style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>/100</span>
                    </td>
                    <td>
                      <span className={`badge ${p.score >= 80 ? 'badge-success' : p.score >= 65 ? 'badge-gold' : p.score >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                        {p.score >= 80 ? 'Excellent' : p.score >= 65 ? 'Good' : p.score >= 50 ? 'Average' : 'Poor'}
                      </span>
                    </td>
                    <td style={{ minWidth: '100px' }}>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar" style={{ width: `${p.score}%`, background: getScoreColor(p.score) }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA card */}
          <div className="card" style={{ background: 'var(--navy-900)', textAlign: 'center' }}>
            {currentUser ? (
              <>
                <h4 style={{ color: 'var(--gold-500)', marginBottom: '8px' }}>
                  Your Rank: #{currentUser.rank} · Score: {currentUser.score}/100
                </h4>
                <p style={{ color: 'var(--gray-400)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  {currentUser.rank === 1
                    ? '🎉 You are #1! Keep improving!'
                    : `Score higher than ${board[currentUser.rank - 2]?.score} to reach rank #${currentUser.rank - 1}!`}
                </p>
              </>
            ) : (
              <>
                <h4 style={{ color: 'var(--gold-500)', marginBottom: '8px' }}>You are not ranked yet!</h4>
                <p style={{ color: 'var(--gray-400)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Analyze your resume to get an ATS score and join the leaderboard!
                </p>
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/upload" className="btn btn-primary btn-sm">Upload Resume</Link>
              <Link to="/resumes" className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-300)', borderColor: 'var(--navy-600)' }}>
                Analyze Resume →
              </Link>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}