import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

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

function ScoreBadge({ score }) {
  const bg = score >= 90 ? 'rgba(40,167,69,0.15)' : score >= 80 ? 'rgba(201,168,76,0.15)' : 'rgba(30,58,95,0.1)'
  const color = score >= 90 ? '#1a7a32' : score >= 80 ? '#C9A84C' : '#1E3A5F'
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: '600', background: bg, color }}>
      {score}
    </span>
  )
}

function TopCard({ player }) {
  const isFirst = player.rank === 1
  return (
    <div style={{
      background: isFirst ? '#0A1628' : 'white',
      border: isFirst ? '2px solid #C9A84C' : '1px solid #E9ECEF',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{player.badge || ''}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: isFirst ? '#C9A84C' : '#0D1F3C', marginBottom: '4px' }}>
        {player.score}
      </div>
      <div style={{ fontWeight: '600', color: isFirst ? 'white' : '#0D1F3C', marginBottom: '4px' }}>
        {player.name}
      </div>
      <div style={{ fontSize: '0.8125rem', color: isFirst ? '#ADB5BD' : '#6C757D' }}>
        {player.role}
      </div>
    </div>
  )
}

export default function Leaderboard() {
  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#0A1628', margin: '0 0 4px' }}>Global Leaderboard</h2>
        <p style={{ color: '#6C757D', margin: 0 }}>See how your resume ranks globally</p>
      </div>

      {/* Top 3 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {BOARD.slice(0, 3).map(p => (
          <TopCard key={p.rank} player={p} />
        ))}
      </div>

      {/* Full Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #E9ECEF',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1628' }}>
              <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Rank</th>
              <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Role</th>
              <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {BOARD.map(p => (
              <tr
                key={p.rank}
                style={{
                  borderBottom: '1px solid #F1F3F5',
                  background: p.name.includes('Mohan') ? 'rgba(201,168,76,0.04)' : 'white'
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: '700', color: p.rank <= 3 ? '#C9A84C' : '#6C757D', fontSize: '0.875rem' }}>
                  #{p.rank}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0D1F3C', fontSize: '0.875rem' }}>
                  {p.name}
                  {p.name.includes('Mohan') && (
                    <span style={{ color: '#C9A84C', fontSize: '0.75rem', marginLeft: '6px' }}>← You</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: '#6C757D', fontSize: '0.875rem' }}>
                  {p.role}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <ScoreBadge score={p.score} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA Card */}
      <div style={{
        background: '#0A1628',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#C9A84C', marginBottom: '0.5rem', margin: '0 0 8px' }}>
          Your Current Rank: #9
        </h4>
        <p style={{ color: '#ADB5BD', margin: '0 0 1rem', fontSize: '0.875rem' }}>
          Score 85+ to enter the top 5! Analyze your resume to improve.
        </p>
        <Link
          to="/upload"
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: '#C9A84C',
            color: '#0A1628',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.875rem',
            textDecoration: 'none'
          }}
        >
          Improve My Score
        </Link>
      </div>
    </Layout>
  )
}