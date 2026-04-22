import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const BOARD = [
  { rank: 1, name: 'Arjun S.', score: 96, role: 'Senior Frontend Dev', badge: '🥇' },
  { rank: 2, name: 'Priya M.', score: 94, role: 'Full Stack Engineer', badge: '🥈' },
  { rank: 3, name: 'Karthik R.', score: 92, role: 'React Developer', badge: '🥉' },
  { rank: 4, name: 'Sneha T.', score: 89, role: 'UI/UX + Frontend', badge: '' },
  { rank: 5, name: 'Rahul V.', score: 87, role: 'Node.js Developer', badge: '' },
  { rank: 6, name: 'Ananya K.', score: 85, role: 'MERN Stack Dev', badge: '' },
  { rank: 7, name: 'Vijay P.', score: 83, role: 'Python + React', badge: '' },
  { rank: 8, name: 'Divya L.', score: 81, role: 'Software Engineer', badge: '' },
  { rank: 9, name: 'Mohan V.', score: 79, role: 'Full Stack Dev', badge: '' },
  { rank: 10, name: 'Ravi N.', score: 76, role: 'Frontend Developer', badge: '' },
]

export default function Leaderboard() {
  const { user } = useAuth()
  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Global Leaderboard</h2>
        <p className="page-subtitle">See how your resume score ranks globally (anonymous, opt-in)</p>
      </div>

      {/* Top 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {BOARD.slice(0, 3).map(p => (
          <div key={p.rank} className="card" style={{ textAlign: 'center', background: p.rank === 1 ? 'var(--navy-900)' : 'white', border: p.rank === 1 ? '2px solid var(--gold-500)' : '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{p.badge}</div>
            <div style={{ fontWeight: '700', fontSize: '2rem', color: p.rank === 1 ? 'var(--gold-500)' : 'var(--navy-800)' }}>{p.score}</div>
            <div style={{ fontWeight: '600', color: p.rank === 1 ? 'var(--white)' : 'var(--navy-800)', marginBottom: '4px' }}>{p.name}</div>
            <div style={{ fontSize: '0.8125rem', color: p.rank === 1 ? 'var(--gray-400)' : 'var(--gray-500)' }}>{p.role}</div>
          </div>
        ))}
      </div>

      {/* Full Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Rank</th><th>Name</th><th>Role</th><th>Score</th><th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {BOARD.map(p => (
              <tr key={p.rank} style={{ background: p.name.includes('Mohan') ? 'rgba(201,168,76,0.05)' : '' }}>
                <td><span style={{ fontWeight: '700', color: p.rank <= 3 ? 'var(--gold-500)' : 'var(--gray-600)' }}>#{p.rank}</span></td>
                <td><span style={{ fontWeight: '600', color: 'var(--navy-800)' }}>{p.name} {p.name.includes('Mohan') ? '← You' : ''}</span></td>
                <td><span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{p.role}</span></td>
                <td><span className={`badge ${p.score >= 90 ? 'badge-success' : p.score >= 80 ? 'badge-gold' : 'badge-navy'}`}>{p.score}</span></td>
                <td style={{ minWidth: '100px' }}>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar navy" style={{ width: `${p.score}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', background: 'var(--navy-900)', textAlign: 'center' }}>
        <h4 style={{ color: 'var(--gold-500)', marginBottom: '0.5rem' }}>Your Current Rank: #9</h4>
        <p style={{ color: 'var(--gray-400)', margin: '0 0 1rem', fontSize: '0.875rem' }}>Score 85+ to enter the top 5! Upload and analyze your resume to improve.</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/upload" className="btn btn-primary btn-sm">Improve My Score</a>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-300)', borderColor: 'var(--navy-600)' }}>Opt Out</button>
        </div>
      </div>
    </Layout>
  )
}