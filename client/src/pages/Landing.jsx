import { Link } from 'react-router-dom'
import { useState } from 'react'

const FEATURES = [
  { icon: '📄', title: 'PDF & DOCX Upload', desc: 'Upload any resume format. AI parses every detail instantly.' },
  { icon: '⚡', title: 'AI Resume Scorer', desc: 'Scored on 6 dimensions: ATS, clarity, impact, keywords, format, readability.' },
  { icon: '🎯', title: 'Job Match %', desc: 'Real-time job scraping with AI match percentage and skill gap analysis.' },
  { icon: '✍️', title: 'Bullet Rewriter', desc: 'Weak bullets rewritten with action verbs and quantified impact.' },
  { icon: '📧', title: 'Cover Letter AI', desc: 'Tailored cover letters generated for each specific job in seconds.' },
  { icon: '🎤', title: 'Mock Interview', desc: 'Practice with AI-powered interviews and get real-time feedback.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track score history, applications, and interview success rate.' },
  { icon: '🏆', title: 'Leaderboard', desc: 'See how your resume ranks globally. Compete and improve.' },
  { icon: '🔗', title: 'LinkedIn Analyzer', desc: 'Compare LinkedIn vs resume. Fix inconsistencies instantly.' },
]

const STEPS = [
  { n: '01', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume securely' },
  { n: '02', title: 'AI Analysis', desc: 'Get instant ATS score and specific improvements' },
  { n: '03', title: 'Match Jobs', desc: 'Find roles that match your exact skill set' },
  { n: '04', title: 'Get Hired', desc: 'Prep with mock interviews and apply with confidence' },
]

const STATS = [
  { value: '500+', label: 'Professionals Hired' },
  { value: '89%', label: 'Average Score Increase' },
  { value: '2.5x', label: 'More Interview Calls' },
  { value: '25+', label: 'AI-Powered Features' },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif', background: '#F8F9FA', color: '#212529', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,22,40,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #1E3A5F', height: '64px', display: 'flex', alignItems: 'center', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '1.375rem', fontWeight: '800', color: 'var(--bg-card)', letterSpacing: '-0.5px' }}>
            Resume<span style={{ color: '#C9A84C' }}>IQ</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="landing-nav-desktop">
            {[['#features', 'Features'], ['#stats', 'Results'], ['#how', 'How It Works']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#C9A84C'}
                onMouseLeave={e => e.target.style.color = '#CBD5E1'}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = '#1E293B'; e.target.style.color = 'var(--bg-card)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#CBD5E1' }}>
              Login
            </Link>
            <Link to="/register" style={{ background: '#C9A84C', color: '#0A1628', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', padding: '8px 18px', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = '#D4B55A'; e.target.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.target.style.background = '#C9A84C'; e.target.style.transform = 'translateY(0)' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 50%, #0A1628 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 1.5rem 60px' }}>
        <div style={{ maxWidth: '860px', width: '100%' }}>
          <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '0.8125rem', fontWeight: '600', color: '#C9A84C', marginBottom: '1.5rem' }}>
            🚀 AI-Powered Career Platform
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '800', color: 'var(--bg-card)', lineHeight: '1.15', marginBottom: '1.25rem', letterSpacing: '-1px' }}>
            Land Your Dream Job<br />
            <span style={{ color: '#C9A84C' }}>with AI Precision</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
            Upload your resume, get instant AI analysis, match with real jobs, and prepare for interviews — all in one platform built for serious job seekers.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/register" style={{ background: '#C9A84C', color: '#0A1628', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', padding: '14px 28px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
              Start Free — No Credit Card →
            </Link>
            <a href="#features" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--bg-card)', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', padding: '14px 28px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
              See All Features
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✓ 500+ Hired', '✓ 89% Score Boost', '✓ 2.5x More Calls', '✓ Free to Start'].map(badge => (
              <span key={badge} style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: '500' }}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ background: '#0A1628', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.value}>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '800', color: '#C9A84C', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '5rem 1.5rem', background: '#F8F9FA' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: '#0A1628', marginBottom: '12px' }}>
              Everything You Need to Get Hired
            </h2>
            <p style={{ color: '#6C757D', fontSize: '1.0625rem', maxWidth: '500px', margin: '0 auto' }}>
              25 powerful features designed for modern job seekers
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '1.5rem', border: '1px solid #E9ECEF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#C9A84C' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#E9ECEF' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0D1F3C', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ color: '#6C757D', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '5rem 1.5rem', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: '#0A1628', marginBottom: '12px' }}>
              How It Works
            </h2>
            <p style={{ color: '#6C757D', fontSize: '1.0625rem' }}>Get from resume to offer in 4 simple steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0A1628', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '800', margin: '0 auto 1rem' }}>
                  {step.n}
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0A1628', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: '#6C757D', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: '32px', left: 'calc(50% + 40px)', width: 'calc(100% - 80px)', height: '2px', background: 'linear-gradient(to right, #C9A84C, #E9ECEF)', display: 'none' }} className="step-connector" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0A1628, #1E3A5F)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: 'var(--bg-card)', marginBottom: '1rem' }}>
            Ready to Transform Your Career?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.0625rem', marginBottom: '2rem', lineHeight: '1.7' }}>
            Join 500+ professionals who landed their dream jobs using ResumeIQ
          </p>
          <Link to="/register" style={{ background: '#C9A84C', color: '#0A1628', textDecoration: 'none', fontWeight: '700', fontSize: '1.0625rem', padding: '16px 36px', borderRadius: '10px', display: 'inline-block', transition: 'all 0.2s' }}>
            Get Started Free Today →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#020817', padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid #1E293B' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--bg-card)', marginBottom: '8px' }}>
          Resume<span style={{ color: '#C9A84C' }}>IQ</span>
        </div>
        <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
          © 2026 ResumeIQ. Built with MERN + AI.
        </p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .landing-nav-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .landing-nav-desktop { display: flex !important; }
        }
        @media (min-width: 900px) {
          .step-connector { display: block !important; }
        }
      `}</style>
    </div>
  )
}