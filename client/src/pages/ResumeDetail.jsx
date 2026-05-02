// import { useState } from 'react'
// import { useParams } from 'react-router-dom'
// import Layout from '../components/Layout'
// import api from '../utils/api'

// const DIMS = ['scoreClarity', 'scoreImpact', 'scoreAts', 'scoreKeywords', 'scoreFormatting', 'scoreReadability']
// const DIM_LABELS = { scoreClarity: 'Clarity', scoreImpact: 'Impact', scoreAts: 'ATS Score', scoreKeywords: 'Keywords', scoreFormatting: 'Formatting', scoreReadability: 'Readability' }

// export default function ResumeDetail() {
//   const { id } = useParams()
//   const [tab, setTab] = useState('score')
//   const [jd, setJd] = useState('')
//   const [analysis, setAnalysis] = useState(null)
//   const [keywords, setKeywords] = useState(null)
//   const [bullets, setBullets] = useState(null)
//   const [coverLetter, setCoverLetter] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [msg, setMsg] = useState('')

//   const analyze = async (type) => {
//     setLoading(true); setMsg('')
//     try {
//       if (type === 'score') {
//         const r = await api.post('/api/analysis/score', { resumeId: parseInt(id) })
//         setAnalysis(r.data)
//       } else if (type === 'keywords') {
//         const r = await api.post('/api/analysis/keywords', { resumeId: parseInt(id), jobDescription: jd })
//         setKeywords(r.data)
//       } else if (type === 'rewrite') {
//         const r = await api.post('/api/analysis/rewrite', { resumeId: parseInt(id) })
//         setBullets(r.data)
//       } else if (type === 'cover') {
//         const r = await api.post('/api/analysis/cover-letter', { resumeId: parseInt(id), jobDescription: jd })
//         setCoverLetter(r.data.coverLetter)
//       }
//     } catch { setMsg('Analysis failed. Make sure your AI API key is set.') }
//     finally { setLoading(false) }
//   }

//   const tabs = ['score', 'keywords', 'rewrite', 'cover']
//   const tabLabels = { score: '📊 Score', keywords: '🔍 Keywords', rewrite: '✍️ Rewriter', cover: '📧 Cover Letter' }

//   return (
//     <Layout>
//       <div className="page-header">
//         <h2 className="page-title">Resume Analysis</h2>
//         <p className="page-subtitle">AI-powered insights for your resume</p>
//       </div>

//       {/* Tabs */}
//       <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
//         {tabs.map(t => (
//           <button key={t} onClick={() => setTab(t)}
//             className={`btn btn-sm ${tab === t ? 'btn-secondary' : 'btn-ghost'}`}>
//             {tabLabels[t]}
//           </button>
//         ))}
//       </div>

//       {msg && <div className="alert alert-danger">{msg}</div>}

//       {/* Score Tab */}
// {tab === 'score' && (
//   <div>
//     <button className="btn btn-primary" onClick={() => analyze('score')} disabled={loading} style={{ marginBottom: '1.5rem' }}>
//       {loading ? 'Analyzing...' : '⚡ Analyze Resume'}
//     </button>

//     {analysis && (
//       <>
//         {/* Metric Cards Grid */}
//         <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
//           {DIMS.map(dim => (
//             <div key={dim} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${analysis[dim] > 70 ? 'var(--success)' : 'var(--gold-500)'}` }}>
//               <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
//                 {DIM_LABELS[dim]}
//               </p>
//               <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--navy-900)' }}>
//                 {analysis[dim] || 0}<span style={{ fontSize: '1rem' }}>%</span>
//               </h2>
//               <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: '10px', overflow: 'hidden' }}>
//                 <div style={{ 
//                   width: `${analysis[dim]}%`, 
//                   height: '100%', 
//                   background: analysis[dim] > 70 ? 'var(--success)' : analysis[dim] > 40 ? 'var(--gold-500)' : 'var(--danger)',
//                   transition: 'width 1s ease-out'
//                 }} />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Improvements Section */}
//         {analysis.improvements && (
//           <div className="card" style={{ borderLeft: '4px solid var(--gold-500)' }}>
//             <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>💡 AI Improvement Suggestions</h4>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//               {analysis.improvements.map((tip, i) => (
//                 <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
//                   <span style={{
//                     background: 'var(--navy-900)', color: 'var(--gold-500)',
//                     width: '24px', height: '24px', borderRadius: '50%',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
//                   }}>{i + 1}</span>
//                   <p style={{ color: 'var(--gray-700)', margin: 0, fontSize: '0.95rem' }}>{tip}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </>
//     )}
//   </div>
// )}

//       {/* Keywords Tab */}
//       {tab === 'keywords' && (
//         <div>
//           <div className="card" style={{ marginBottom: '1.5rem' }}>
//             <div className="form-group">
//               <label className="form-label">Paste Job Description</label>
//               <textarea className="form-textarea" rows={6} placeholder="Paste the full job description here..." value={jd} onChange={e => setJd(e.target.value)} />
//             </div>
//             <button className="btn btn-primary" onClick={() => analyze('keywords')} disabled={loading || !jd}>
//               {loading ? 'Finding gaps...' : '🔍 Find Keyword Gaps'}
//             </button>
//           </div>
//           {keywords && (
//             <div className="grid-2">
//               <div className="card">
//                 <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>✓ Keywords Found ({JSON.parse(keywords.keywordsFound || '[]').length})</h4>
//                 <div className="chip-list">
//                   {JSON.parse(keywords.keywordsFound || '[]').map(k => <span key={k} className="chip chip-found">{k}</span>)}
//                 </div>
//               </div>
//               <div className="card">
//                 <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>✗ Missing Keywords ({JSON.parse(keywords.keywordsMissing || '[]').length})</h4>
//                 <div className="chip-list">
//                   {JSON.parse(keywords.keywordsMissing || '[]').map(k => <span key={k} className="chip chip-missing">{k}</span>)}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Bullet Rewriter Tab */}
//       {tab === 'rewrite' && (
//         <div>
//           <button className="btn btn-primary" onClick={() => analyze('rewrite')} disabled={loading} style={{ marginBottom: '1.5rem' }}>
//             {loading ? 'Rewriting...' : '✍️ Rewrite Weak Bullets'}
//           </button>
//           {bullets && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//               {JSON.parse(bullets.originalBullets || '[]').map((orig, i) => (
//                 <div key={i} className="card">
//                   <div style={{ marginBottom: '10px' }}>
//                     <span className="badge badge-danger" style={{ marginBottom: '6px' }}>Original</span>
//                     <p style={{ color: 'var(--gray-700)', margin: 0 }}>{orig}</p>
//                   </div>
//                   <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '10px' }}>
//                     <span className="badge badge-success" style={{ marginBottom: '6px' }}>AI Improved</span>
//                     <p style={{ color: 'var(--navy-800)', fontWeight: '500', margin: 0 }}>{JSON.parse(bullets.rewrittenBullets || '[]')[i]}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Cover Letter Tab */}
//       {tab === 'cover' && (
//         <div>
//           <div className="card" style={{ marginBottom: '1.5rem' }}>
//             <div className="form-group">
//               <label className="form-label">Job Description (for tailored cover letter)</label>
//               <textarea className="form-textarea" rows={5} placeholder="Paste job description..." value={jd} onChange={e => setJd(e.target.value)} />
//             </div>
//             <button className="btn btn-primary" onClick={() => analyze('cover')} disabled={loading || !jd}>
//               {loading ? 'Generating...' : '📧 Generate Cover Letter'}
//             </button>
//           </div>
//           {coverLetter && (
//             <div className="card">
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//                 <h4 style={{ color: 'var(--navy-800)' }}>Generated Cover Letter</h4>
//                 <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(coverLetter)}>Copy</button>
//               </div>
//               <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-700)', lineHeight: '1.8', fontSize: '0.9375rem', background: 'var(--gray-50)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--gray-200)' }}>
//                 {coverLetter}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </Layout>
//   )
// }

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

const DIMS = ['scoreClarity', 'scoreImpact', 'scoreAts', 'scoreKeywords', 'scoreFormatting', 'scoreReadability']
const DIM_LABELS = { 
  scoreClarity: 'Clarity', 
  scoreImpact: 'Impact', 
  scoreAts: 'ATS Score', 
  scoreKeywords: 'Keywords', 
  scoreFormatting: 'Formatting', 
  scoreReadability: 'Readability' 
}

export default function ResumeDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('score')
  const [jd, setJd] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [keywords, setKeywords] = useState(null)
  const [bullets, setBullets] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const analyze = async (type) => {
    setLoading(true); setMsg('')
    try {
      if (type === 'score') {
        const r = await api.post('/api/analysis/score', { resumeId: parseInt(id) })
        setAnalysis(r.data)
      } else if (type === 'keywords') {
        const r = await api.post('/api/analysis/keywords', { resumeId: parseInt(id), jobDescription: jd })
        setKeywords(r.data)
      } else if (type === 'rewrite') {
        const r = await api.post('/api/analysis/rewrite', { resumeId: parseInt(id) })
        setBullets(r.data)
      } else if (type === 'cover') {
        const r = await api.post('/api/analysis/cover-letter', { resumeId: parseInt(id), jobDescription: jd })
        setCoverLetter(r.data.coverLetter)
      }
    } catch (err) { 
      setMsg('Analysis failed. Make sure your AI API key is set and your server is running.') 
    } finally { 
      setLoading(false) 
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--gold-500)';
    return 'var(--danger)';
  }

  const tabs = ['score', 'keywords', 'rewrite', 'cover']
  const tabLabels = { score: '📊 Score', keywords: '🔍 Keywords', rewrite: '✍️ Rewriter', cover: '📧 Cover Letter' }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Resume Analysis</h2>
        <p className="page-subtitle">AI-powered insights to beat the Applicant Tracking Systems</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-secondary' : 'btn-ghost'}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {msg && <div className="alert alert-danger">{msg}</div>}

      {/* Score Tab */}
      {tab === 'score' && (
        <div>
          <button className="btn btn-primary" onClick={() => analyze('score')} disabled={loading} style={{ marginBottom: '1.5rem' }}>
            {loading ? 'Crunching Numbers...' : '⚡ Generate ATS Score'}
          </button>

          {analysis && (
            <>
              {/* Overall Score Hero Card */}
              <div className="card" style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--navy-900)', color: 'white' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', opacity: 0.8 }}>Overall ATS Compatibility</h3>
                <h1 style={{ fontSize: '4rem', color: getScoreColor(analysis.scoreTotal), margin: '10px 0' }}>
                  {analysis.scoreTotal}%
                </h1>
                <p style={{ maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem', opacity: 0.9 }}>
                  Based on current industry standards, a score above 75% is considered highly competitive for Fortune 500 roles.
                </p>
              </div>

              {/* Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {DIMS.map(dim => (
                  <div key={dim} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${getScoreColor(analysis[dim])}` }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      {DIM_LABELS[dim]}
                    </p>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--navy-900)' }}>
                      {analysis[dim] || 0}<span style={{ fontSize: '1rem' }}>%</span>
                    </h2>
                    <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${analysis[dim]}%`, 
                        height: '100%', 
                        background: getScoreColor(analysis[dim]),
                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Improvements Section */}
              {analysis.improvements && (
                <div className="card" style={{ borderLeft: '4px solid var(--gold-500)' }}>
                  <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>💡 Strategic Improvements</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analysis.improvements.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{
                          background: 'var(--navy-900)', color: 'var(--gold-500)',
                          width: '24px', height: '24px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
                        }}>{i + 1}</span>
                        <p style={{ color: 'var(--gray-700)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Keywords Tab */}
      {tab === 'keywords' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Target Job Description</label>
              <textarea className="form-textarea" rows={6} placeholder="Paste the specific job description to find missing keywords..." value={jd} onChange={e => setJd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => analyze('keywords')} disabled={loading || !jd}>
              {loading ? 'Comparing...' : '🔍 Find Keyword Gaps'}
            </button>
          </div>
          {keywords && (
            <div className="grid-2">
              <div className="card">
                <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>✓ Optimized Keywords ({JSON.parse(keywords.keywordsFound || '[]').length})</h4>
                <div className="chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {JSON.parse(keywords.keywordsFound || '[]').map(k => <span key={k} className="chip chip-found" style={{ background: '#e6fffa', color: '#2c7a7b', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{k}</span>)}
                </div>
              </div>
              <div className="card">
                <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>✗ Missing Keywords ({JSON.parse(keywords.keywordsMissing || '[]').length})</h4>
                <div className="chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {JSON.parse(keywords.keywordsMissing || '[]').map(k => <span key={k} className="chip chip-missing" style={{ background: '#fff5f5', color: '#c53030', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{k}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bullet Rewriter Tab */}
      {tab === 'rewrite' && (
        <div>
          <button className="btn btn-primary" onClick={() => analyze('rewrite')} disabled={loading} style={{ marginBottom: '1.5rem' }}>
            {loading ? 'Enhancing...' : '✍️ Rewrite for High Impact'}
          </button>
          {bullets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {JSON.parse(bullets.originalBullets || '[]').map((orig, i) => (
                <div key={i} className="card">
                  <div style={{ marginBottom: '10px' }}>
                    <span className="badge badge-danger" style={{ marginBottom: '6px', fontSize: '0.7rem' }}>Current Bullet</span>
                    <p style={{ color: 'var(--gray-700)', margin: 0 }}>{orig}</p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '10px' }}>
                    <span className="badge badge-success" style={{ marginBottom: '6px', fontSize: '0.7rem' }}>Recommended (Quantified Impact)</span>
                    <p style={{ color: 'var(--navy-800)', fontWeight: '500', margin: 0 }}>{JSON.parse(bullets.rewrittenBullets || '[]')[i]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cover Letter Tab */}
      {tab === 'cover' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Job Details for Tailoring</label>
              <textarea className="form-textarea" rows={5} placeholder="Paste job description here to tailor your cover letter..." value={jd} onChange={e => setJd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => analyze('cover')} disabled={loading || !jd}>
              {loading ? 'Writing...' : '📧 Draft Tailored Cover Letter'}
            </button>
          </div>
          {coverLetter && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--navy-800)' }}>AI-Generated Draft</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                    navigator.clipboard.writeText(coverLetter);
                    alert('Copied to clipboard!');
                }}>Copy Text</button>
              </div>
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                color: 'var(--gray-700)', 
                lineHeight: '1.8', 
                fontSize: '0.9375rem', 
                background: 'var(--gray-50)', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                border: '1px solid var(--gray-200)' 
              }}>
                {coverLetter}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}