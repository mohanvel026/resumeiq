// import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
// import { Link } from 'react-router-dom'
// import Layout from '../components/Layout'
// import api from '../utils/api'

// function ScoreBadge({ score }) {
//   const bg = score >= 80 ? 'rgba(40,167,69,0.15)' : score >= 60 ? 'rgba(201,168,76,0.15)' : 'rgba(220,53,69,0.15)'
//   const color = score >= 80 ? '#1a7a32' : score >= 60 ? '#C9A84C' : '#9c1c28'
//   return (
//     <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: '600', background: bg, color }}>
//       {score}
//     </span>
//   )
// }

// export default function Leaderboard() {
  const { dark } = useTheme()
//   const [board, setBoard] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [currentUserRank, setCurrentUserRank] = useState(null)

//   useEffect(() => {
//     api.get('/api/analysis/leaderboard')
//       .then(r => {
//         setBoard(r.data)
//         const rank = r.data.find(p => p.isCurrentUser)
//         if (rank) setCurrentUserRank(rank.rank)
//       })
//       .catch(() => setError('Failed to load leaderboard'))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return (
//     <Layout>
//       <div style={{ textAlign: 'center', padding: '4rem' }}>
//         <div className="spinner" style={{ margin: '0 auto 1rem' }} />
//         <p style={{ color: 'var(--gray-500)' }}>Loading leaderboard...</p>
//       </div>
//     </Layout>
//   )

//   if (error) return (
//     <Layout>
//       <div className="alert alert-danger">{error}</div>
//     </Layout>
//   )

//   return (
//     <Layout>
//       <div style={{ marginBottom: '2rem' }}>
//         <h2 style={{ color: 'var(--navy-900)', margin: '0 0 4px' }}>Global Leaderboard</h2>
//         <p style={{ color: 'var(--gray-600)', margin: 0 }}>
//           Rankings based on real AI resume scores — updated live
//         </p>
//       </div>

//       {board.length === 0 ? (
//         <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
//           <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
//           <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>No scores yet!</h3>
//           <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
//             Be the first on the leaderboard! Upload and analyze your resume to get a score.
//           </p>
//           <Link to="/upload" className="btn btn-primary">
//             Upload Resume & Get Scored
//           </Link>
//         </div>
//       ) : (
//         <>
//           {/* Top 3 */}
//           {board.length >= 3 && (
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//               gap: '1rem',
//               marginBottom: '2rem'
//             }}>
//               {board.slice(0, 3).map(p => (
//                 <div key={p.rank} style={{
//                   background: p.rank === 1 ? '#0A1628' : 'white',
//                   border: p.isCurrentUser ? '2px solid #C9A84C' : p.rank === 1 ? '2px solid #C9A84C' : '1px solid #E9ECEF',
//                   borderRadius: '12px',
//                   padding: '1.5rem',
//                   textAlign: 'center'
//                 }}>
//                   <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{p.badge}</div>
//                   <div style={{ fontSize: '1.75rem', fontWeight: '700', color: p.rank === 1 ? '#C9A84C' : '#0D1F3C', marginBottom: '4px' }}>
//                     {p.score}
//                   </div>
//                   <div style={{ fontWeight: '600', color: p.rank === 1 ? 'white' : '#0D1F3C', marginBottom: '4px' }}>
//                     {p.name}
//                     {p.isCurrentUser && (
//                       <span style={{ color: '#C9A84C', fontSize: '0.75rem', display: 'block' }}>← You</span>
//                     )}
//                   </div>
//                   <div style={{ fontSize: '0.8125rem', color: p.rank === 1 ? '#ADB5BD' : '#6C757D' }}>
//                     {p.resumeTitle}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Full Table */}
//           <div style={{
//             background: 'var(--white)',
//             borderRadius: '12px',
//             border: '1px solid var(--gray-200)',
//             overflow: 'hidden',
//             marginBottom: '1.5rem'
//           }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#0A1628' }}>
//                   <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Rank</th>
//                   <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Name</th>
//                   <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>Resume</th>
//                   <th style={{ padding: '12px 16px', color: '#C9A84C', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600' }}>ATS Score</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {board.map(p => (
//                   <tr key={p.rank} style={{
//                     borderBottom: '1px solid #F1F3F5',
//                     background: p.isCurrentUser ? 'rgba(201,168,76,0.06)' : 'white'
//                   }}>
//                     <td style={{ padding: '12px 16px', fontWeight: '700', color: p.rank <= 3 ? '#C9A84C' : '#6C757D', fontSize: '0.875rem' }}>
//                       {p.badge || `#${p.rank}`}
//                     </td>
//                     <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--navy-800)', fontSize: '0.875rem' }}>
//                       {p.name}
//                       {p.isCurrentUser && (
//                         <span style={{ color: '#C9A84C', fontSize: '0.75rem', marginLeft: '6px', fontWeight: '400' }}>← You</span>
//                       )}
//                     </td>
//                     <td style={{ padding: '12px 16px', color: 'var(--gray-600)', fontSize: '0.8125rem' }}>
//                       {p.resumeTitle}
//                     </td>
//                     <td style={{ padding: '12px 16px' }}>
//                       <ScoreBadge score={p.score} />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Current user CTA */}
//           <div style={{
//             background: '#0A1628',
//             borderRadius: '12px',
//             padding: '1.5rem',
//             textAlign: 'center'
//           }}>
//             {currentUserRank ? (
//               <>
//                 <h4 style={{ color: '#C9A84C', marginBottom: '0.5rem' }}>
//                   Your Current Rank: #{currentUserRank}
//                 </h4>
//                 <p style={{ color: 'var(--gray-500)', margin: '0 0 1rem', fontSize: '0.875rem' }}>
//                   {currentUserRank === 1
//                     ? '🎉 You are #1! Keep improving!'
//                     : `Score higher to reach #${currentUserRank - 1}!`}
//                 </p>
//               </>
//             ) : (
//               <>
//                 <h4 style={{ color: '#C9A84C', marginBottom: '0.5rem' }}>
//                   You are not on the leaderboard yet!
//                 </h4>
//                 <p style={{ color: 'var(--gray-500)', margin: '0 0 1rem', fontSize: '0.875rem' }}>
//                   Analyze your resume to get an AI score and join the ranking!
//                 </p>
//               </>
//             )}
//             <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
//               <Link to="/resume/1" style={{
//                 display: 'inline-block',
//                 padding: '8px 20px',
//                 background: '#C9A84C',
//                 color: 'var(--navy-900)',
//                 borderRadius: '8px',
//                 fontWeight: '600',
//                 fontSize: '0.875rem',
//                 textDecoration: 'none'
//               }}>
//                 Improve My Score
//               </Link>
//               <Link to="/upload" style={{
//                 display: 'inline-block',
//                 padding: '8px 20px',
//                 background: 'transparent',
//                 color: 'var(--gray-500)',
//                 borderRadius: '8px',
//                 fontWeight: '500',
//                 fontSize: '0.875rem',
//                 textDecoration: 'none',
//                 border: '1px solid #1E3A5F'
//               }}>
//                 Upload New Resume
//               </Link>
//             </div>
//           </div>
//         </>
//       )}
//     </Layout>
//   )
// }

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

function ScoreBadge({ score }) {
  // Updated colors to match your ResumeDetail "Success/Gold/Danger" logic
  const bg = score >= 70 ? 'rgba(40,167,69,0.15)' : score >= 40 ? 'rgba(201,168,76,0.15)' : 'rgba(220,53,69,0.15)'
  const color = score >= 70 ? '#1a7a32' : score >= 40 ? '#C9A84C' : '#9c1c28'
  
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', background: bg, color }}>
      {score}%
    </span>
  )
}

export default function Leaderboard() {
  const { dark } = useTheme()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserRank, setCurrentUserRank] = useState(null)

  useEffect(() => {
    // This fetches the weighted 'scoreTotal' from your AI analysis table
    api.get('/api/analysis/leaderboard')
      .then(r => {
        setBoard(r.data)
        const rank = r.data.find(p => p.isCurrentUser)
        if (rank) setCurrentUserRank(rank.rank)
      })
      .catch(() => setError('Failed to load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--gray-500)' }}>Calculating global rankings...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--navy-900)', margin: '0 0 4px' }}>Global Leaderboard</h2>
        <p style={{ color: 'var(--gray-600)', margin: 0 }}>
          Rankings based on weighted AI analysis — real-time verification
        </p>
      </div>

      {board.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>The stage is empty!</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            Be the first to claim the top spot. High-impact resumes score the highest.
          </p>
          <Link to="/upload" className="btn btn-primary">Analyze & Join Leaderboard</Link>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            {board.slice(0, 3).map(p => (
              <div key={p.rank} style={{
                background: p.rank === 1 ? 'var(--navy-900)' : 'white',
                border: p.isCurrentUser ? '2px solid var(--gold-500)' : '1px solid #E9ECEF',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{p.badge}</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: p.rank === 1 ? 'var(--gold-500)' : 'var(--navy-900)', marginBottom: '4px' }}>
                  {p.score}%
                </div>
                <div style={{ fontWeight: '700', color: p.rank === 1 ? 'white' : 'var(--navy-900)' }}>
                  {p.name}
                  {p.isCurrentUser && <span style={{ color: 'var(--gold-500)', fontSize: '0.7rem', display: 'block' }}>YOU</span>}
                </div>
                <p style={{ fontSize: '0.75rem', color: p.rank === 1 ? '#ADB5BD' : '#6C757D', marginTop: '8px' }}>
                  {p.resumeTitle}
                </p>
              </div>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--navy-900)' }}>
                  <th style={{ padding: '15px', color: 'var(--gold-500)', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '15px', color: 'var(--gold-500)', textAlign: 'left' }}>Candidate</th>
                  <th style={{ padding: '15px', color: 'var(--gold-500)', textAlign: 'left' }}>Weighted Score</th>
                </tr>
              </thead>
              <tbody>
                {board.map(p => (
                  <tr key={p.rank} style={{ 
                    borderBottom: '1px solid #eee',
                    background: p.isCurrentUser ? 'rgba(201,168,76,0.08)' : 'transparent'
                  }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: p.rank <= 3 ? 'var(--gold-500)' : '#666' }}>
                      {p.badge || `#${p.rank}`}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{p.resumeTitle}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <ScoreBadge score={p.score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dynamic Progress Footer */}
          <div style={{ background: 'var(--navy-900)', borderRadius: '12px', padding: '1.5rem', color: 'var(--white)', textAlign: 'center' }}>
            {currentUserRank ? (
              <>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  You are currently ranked <strong>#{currentUserRank}</strong> out of {board.length} candidates.
                </p>
                {currentUserRank > 1 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--gold-500)', marginTop: '5px' }}>
                    Boost your <strong>Impact Score</strong> to climb higher!
                  </p>
                )}
              </>
            ) : (
              <p style={{ margin: 0 }}>Analyze a resume to see where you stand globally.</p>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}