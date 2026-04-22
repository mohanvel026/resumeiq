import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function MockInterview() {
  const [role, setRole] = useState('')
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const start = async () => {
    if (!role) return
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/interview-questions', { targetRole: role })
      const qs = JSON.parse(r.data.interviewQuestions || '[]')
      setQuestions(qs)
      setStarted(true)
      setMessages([{ role: 'ai', text: `Welcome! I'll be your interviewer for a ${role} position. Let's begin.\n\n**Question 1:** ${qs[0]?.question}` }])
    } catch { alert('Failed to start. Check API key.') }
    finally { setLoading(false) }
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/evaluate-answer', {
        question: questions[qIndex]?.question,
        answer: userMsg,
        role,
      })
      const nextQ = qIndex + 1
      const feedback = r.data.feedback || 'Good answer!'
      let aiMsg = `**Feedback:** ${feedback}`
      if (nextQ < questions.length) {
        aiMsg += `\n\n**Question ${nextQ + 1}:** ${questions[nextQ]?.question}`
        setQIndex(nextQ)
      } else {
        aiMsg += '\n\n🎉 **Interview Complete!** Great job practicing. Review your answers and keep improving!'
      }
      setMessages(prev => [...prev, { role: 'ai', text: aiMsg }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Could not evaluate. Please try again.' }])
    }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">AI Mock Interview</h2>
        <p className="page-subtitle">Practice with an AI interviewer and get real-time feedback</p>
      </div>

      {!started ? (
        <div className="card" style={{ maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🤖</div>
          <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem', textAlign: 'center' }}>Start Mock Interview</h3>
          <p style={{ color: 'var(--gray-500)', textAlign: 'center', marginBottom: '1.5rem' }}>Enter your target role and practice answering AI-generated questions</p>
          <div className="form-group">
            <label className="form-label">Target Role</label>
            <input className="form-input" placeholder="e.g. Full Stack Developer" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" onClick={start} disabled={loading || !role}>
            {loading ? 'Preparing Interview...' : '🎤 Start Interview'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'var(--navy-900)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--gold-500)', fontWeight: '600' }}>AI Interviewer</span>
              <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginLeft: '8px' }}>— {role}</span>
            </div>
            <span style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>Q {Math.min(qIndex + 1, questions.length)}/{questions.length}</span>
          </div>

          {/* Messages */}
          <div style={{ height: '400px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '12px 16px', borderRadius: '12px',
                  background: m.role === 'user' ? 'var(--navy-700)' : 'var(--gray-100)',
                  color: m.role === 'user' ? 'var(--white)' : 'var(--gray-800)',
                  fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gray-400)', animation: 'pulse 1s infinite' }} />
                <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>AI is evaluating...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '10px' }}>
            <textarea className="form-textarea" style={{ flex: 1, minHeight: '60px', resize: 'none' }}
              placeholder="Type your answer here..." value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
            <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ alignSelf: 'flex-end' }}>Send</button>
          </div>
        </div>
      )}
    </Layout>
  )
}