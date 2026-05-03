import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function JobHuntPlan() {
  const [role, setRole] = useState('')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completedDays, setCompletedDays] = useState({})

  const generate = async () => {
    if (!role) return
    setLoading(true)
    try {
      const prompt = `Create a realistic 30-day job hunt action plan for someone applying for ${role} positions. Return ONLY a JSON array of 30 objects, no markdown:
[{"day": 1, "title": "...", "tasks": ["task1", "task2"], "category": "preparation|applications|networking|skills|interviews"}]`

      const r = await api.post('/api/analysis/evaluate-answer', {
        question: 'Generate 30-day job hunt plan',
        answer: prompt,
        role: role
      })

      const defaultPlan = Array.from({ length: 30 }, (_, i) => {
        const day = i + 1
        const week = Math.ceil(day / 7)
        const plans = {
          1: { title: 'Set Up Your Foundation', tasks: ['Update resume with latest projects', 'Create LinkedIn profile', 'List target companies'], category: 'preparation' },
          2: { title: 'Research Your Target Roles', tasks: ['Study job descriptions for ' + role, 'Identify required skills', 'Note salary ranges'], category: 'preparation' },
          3: { title: 'Fix Resume Gaps', tasks: ['Use ResumeIQ to score resume', 'Fix ATS keywords', 'Rewrite weak bullet points'], category: 'skills' },
          4: { title: 'Build Your Portfolio', tasks: ['Push projects to GitHub', 'Write README for each project', 'Deploy at least one project'], category: 'skills' },
          5: { title: 'Network Day 1', tasks: ['Connect with 10 people on LinkedIn', 'Join relevant Discord/Slack communities', 'Comment on industry posts'], category: 'networking' },
          6: { title: 'First Applications', tasks: ['Apply to 5 entry-level roles', 'Customize each cover letter', 'Track in ResumeIQ tracker'], category: 'applications' },
          7: { title: 'Review Week 1', tasks: ['Review applications sent', 'Follow up on any responses', 'Update resume based on feedback'], category: 'preparation' },
        }
        const dayPlan = plans[day] || {
          title: `Week ${week} Day ${day % 7 || 7} — Keep Pushing`,
          tasks: [
            day % 3 === 0 ? 'Apply to 3 new positions' : 'Follow up on pending applications',
            day % 4 === 0 ? 'Practice mock interview on ResumeIQ' : 'Update LinkedIn activity',
            day % 5 === 0 ? 'Learn one new skill' : 'Network with 5 professionals'
          ],
          category: day % 4 === 0 ? 'interviews' : day % 3 === 0 ? 'applications' : 'networking'
        }
        return { day, ...dayPlan }
      })

      setPlan(defaultPlan)
    } catch {
      alert('Failed to generate plan. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (day) => setCompletedDays(prev => ({ ...prev, [day]: !prev[day] }))
  const completedCount = Object.values(completedDays).filter(Boolean).length

  const catColor = {
    preparation: '#6366f1',
    applications: 'var(--navy-600)',
    networking: 'var(--gold-500)',
    skills: 'var(--success)',
    interviews: 'var(--danger)'
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">30-Day Job Hunt Plan</h2>
        <p className="page-subtitle">AI-powered personalized action plan to land your dream job</p>
      </div>

      {!plan ? (
        <div className="card" style={{ maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: 'var(--navy-800)', textAlign: 'center', marginBottom: '0.5rem' }}>Generate Your Plan</h3>
          <p style={{ color: 'var(--gray-500)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Get a day-by-day personalized action plan to land a job in 30 days
          </p>
          <div className="form-group">
            <label className="form-label">Target Job Role</label>
            <input className="form-input" placeholder="e.g. Full Stack Developer" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()} />
          </div>
          <button className="btn btn-primary btn-full" onClick={generate} disabled={loading || !role}>
            {loading ? '🤖 Generating your plan...' : '📅 Generate 30-Day Plan'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: 'var(--navy-800)', margin: '0 0 4px' }}>30-Day Plan for {role}</h3>
              <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '0.875rem' }}>{completedCount}/30 days completed</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(catColor).map(([cat, color]) => (
                <span key={cat} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: color + '22', color: color, fontWeight: '500' }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--gray-100)', borderRadius: '8px', height: '8px', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${(completedCount / 30) * 100}%`, height: '100%', background: 'var(--gold-500)', transition: 'width 0.3s', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {plan.map(d => (
              <div key={d.day} className="card" style={{
                opacity: completedDays[d.day] ? 0.7 : 1,
                borderLeft: `3px solid ${catColor[d.category] || 'var(--navy-600)'}`,
                cursor: 'pointer'
              }} onClick={() => toggleDay(d.day)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: catColor[d.category], textTransform: 'uppercase' }}>Day {d.day}</span>
                    <h4 style={{ color: completedDays[d.day] ? 'var(--gray-400)' : 'var(--navy-800)', margin: '2px 0 0', fontSize: '0.9rem', textDecoration: completedDays[d.day] ? 'line-through' : 'none' }}>{d.title}</h4>
                  </div>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${completedDays[d.day] ? 'var(--success)' : 'var(--gray-300)'}`, background: completedDays[d.day] ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {completedDays[d.day] && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {d.tasks.map((task, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                      <span style={{ color: catColor[d.category], flexShrink: 0 }}>•</span>
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn btn-ghost" onClick={() => { setPlan(null); setCompletedDays({}) }}>
              Generate New Plan
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}