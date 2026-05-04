import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'

export default function MockInterview() {
  const [role, setRole] = useState('')
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [resumeInfo, setResumeInfo] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const start = async () => {
    if (!role) return
    setLoading(true)
    try {
      const r = await api.post('/api/analysis/interview-questions', { targetRole: role })
      const qs = JSON.parse(r.data.interviewQuestions || '[]')
      setQuestions(qs)
      setStarted(true)
      trackActivity('mockInterviews')
      const resumes = await api.get('/api/resume/all')
      const resumeName = resumes.data[0]?.title || 'your resume'
      setResumeInfo(resumeName)

      setMessages([{
        role: 'ai',
        text: `👋 Welcome! I'm your AI interviewer for the **${role}** position.\n\nI've analyzed **${resumeName}** and prepared ${qs.length} questions tailored to your background.\n\n**Question 1/${qs.length}:**\n${qs[0]?.question}`
      }])
    } catch (err) {
      alert('Failed to start interview. Make sure you have uploaded a resume first.')
    } finally {
      setLoading(false)
    }
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

      let aiMsg = `**✅ Feedback:**\n${feedback}`

      if (nextQ < questions.length) {
        aiMsg += `\n\n**Question ${nextQ + 1}/${questions.length}:**\n${questions[nextQ]?.question}`
        setQIndex(nextQ)
      } else {
        aiMsg += `\n\n🎉 **Interview Complete!**\n\nYou've answered all ${questions.length} questions. Great job practicing! Here are your next steps:\n• Review the feedback for each answer\n• Practice weak areas more\n• Apply for ${role} positions with confidence!`
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiMsg }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Could not evaluate your answer. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  if (!started) {
    return (
      <Layout>
        <div className="page-header">
          <h2 className="page-title">AI Mock Interview</h2>
          <p className="page-subtitle">Practice with an AI interviewer using questions based on your actual resume</p>
        </div>

        <div style={{ maxWidth: '560px' }}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem', textAlign: 'center' }}>Start Your Mock Interview</h3>
            <p style={{ color: 'var(--gray-500)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              AI will read your uploaded resume and ask questions tailored to your experience
            </p>

            <div className="form-group">
              <label className="form-label">Target Job Role</label>
              <input
                className="form-input"
                placeholder="e.g. Full Stack Developer, React Developer"
                value={role}
                onChange={e => setRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && start()}
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={start}
              disabled={loading || !role}
            >
              {loading ? '🔄 Preparing interview from your resume...' : '🎤 Start Interview'}
            </button>
          </div>

          <div className="card" style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}>
            <h4 style={{ color: 'var(--gold-500)', marginBottom: '0.75rem' }}>How it works</h4>
            {[
              '🤖 AI reads your uploaded resume',
              '❓ Generates role-specific questions from your experience',
              '💬 You answer each question in the chat',
              '✅ AI gives detailed feedback on each answer',
              '📊 Complete all questions to finish the interview',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', color: 'var(--gray-300)', fontSize: '0.875rem', marginBottom: '8px' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Mock Interview — {role}</h2>
          <p className="page-subtitle">Question {Math.min(qIndex + 1, questions.length)} of {questions.length} • Based on {resumeInfo}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setStarted(false); setMessages([]); setQIndex(0); setQuestions([]); }}>
          End Interview
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: '900px' }}>
        {/* Progress bar */}
        <div style={{ height: '4px', background: 'var(--gray-200)' }}>
          <div style={{ height: '100%', background: 'var(--gold-500)', width: `${((qIndex) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Header */}
        <div style={{ background: 'var(--navy-900)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--navy-700)', border: '2px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🤖</div>
            <div>
              <div style={{ color: 'var(--gold-500)', fontWeight: '600', fontSize: '0.9rem' }}>AI Interviewer</div>
              <div style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>Powered by LLaMA 3.3 70B</div>
            </div>
          </div>
          <div style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold-500)', color: 'var(--gold-500)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: '600' }}>
            Q{Math.min(qIndex + 1, questions.length)}/{questions.length}
          </div>
        </div>

        {/* Messages */}
        <div style={{ height: '450px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--gray-50)' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-start' }}>
              {m.role === 'ai' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>🤖</div>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'var(--navy-700)' : 'var(--white)',
                color: m.role === 'user' ? 'var(--white)' : 'var(--gray-800)',
                fontSize: '0.9rem',
                lineHeight: '1.7',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                border: m.role === 'ai' ? '1px solid var(--gray-200)' : 'none',
              }}
              dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
              />
              {m.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👤</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gray-400)', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-200)', background: 'var(--white)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            className="form-textarea"
            style={{ flex: 1, minHeight: '60px', maxHeight: '120px', resize: 'none', fontSize: '0.9rem' }}
            placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <button
            className="btn btn-primary"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ alignSelf: 'flex-end', minWidth: '80px' }}
          >
            {loading ? '...' : 'Send →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </Layout>
  )
}