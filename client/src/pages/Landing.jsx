import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ fontFamily: 'Inter, Segoe UI, sans-serif' }}>

      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-brand">Resume<span>IQ</span></div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#stats" className="landing-nav-link">Results</a>
          <a href="#how" className="landing-nav-link">How It Works</a>
          <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-300)', borderColor: 'var(--navy-600)' }}>Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, background: 'var(--navy-900)', zIndex: 99, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--navy-700)' }}>
          <a href="#features" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#stats" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Results</a>
          <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)} style={{ color: 'var(--white)' }}>Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
        </div>
      )}

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-400)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: '500', marginBottom: '1.5rem' }}>
            AI-Powered Career Platform
          </div>
          <h1 className="hero-title">
            Land Your Dream Job<br />with <span className="gold">AI Precision</span>
          </h1>
          <p className="hero-subtitle">
            Upload your resume, get instant AI analysis, match with real jobs, and prepare for interviews — all in one platform built for serious job seekers.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Start Free — No Credit Card</Link>
            <a href="#features" className="btn btn-outline btn-lg">See All Features</a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
            {['500+ Hired', '89% Score Boost', '2.5x More Calls', 'Free to Start'].map(item => (
              <div key={item} style={{ color: 'var(--gray-400)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--gold-500)' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" id="stats">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="stats-grid">
            {[
              { number: '500+', label: 'Professionals Hired' },
              { number: '89%', label: 'Average Score Increase' },
              { number: '2.5x', label: 'More Interview Calls' },
              { number: '25+', label: 'AI-Powered Features' },
            ].map(s => (
              <div key={s.label}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 className="section-title-center">Everything You Need to Get Hired</h2>
          <p className="section-subtitle-center">25 powerful features designed for modern job seekers</p>
          <div className="features-grid">
            {[
              { icon: '📄', title: 'PDF & DOCX Upload', desc: 'Upload your resume in any format. Our AI parses every detail instantly.' },
              { icon: '⚡', title: 'AI Resume Scorer', desc: 'Get scored on 6 dimensions: ATS, clarity, impact, keywords, format, readability.' },
              { icon: '🎯', title: 'Job Match %', desc: 'Real-time job scraping with AI match percentage and skill gap analysis.' },
              { icon: '✍️', title: 'Bullet Rewriter', desc: 'Weak experience bullets rewritten with action verbs and quantified impact.' },
              { icon: '📧', title: 'Cover Letter AI', desc: 'Tailored cover letters generated for each specific job in seconds.' },
              { icon: '🎤', title: 'Mock Interview', desc: 'Practice with AI-powered interviews. Get real-time feedback on your answers.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your resume score history, applications, and interview success rate.' },
              { icon: '🏆', title: 'Leaderboard', desc: 'See how your resume ranks globally. Compete and improve.' },
              { icon: '🔗', title: 'LinkedIn Analyzer', desc: 'Compare your LinkedIn profile vs resume. Fix inconsistencies instantly.' },
            ].map(f => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" style={{ padding: '5rem 2rem', background: 'var(--navy-900)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: '3rem' }}>Get from resume to offer in 4 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume' },
              { step: '02', title: 'AI Analysis', desc: 'Get instant score and improvements' },
              { step: '03', title: 'Match Jobs', desc: 'Find roles that match your skills' },
              { step: '04', title: 'Get Hired', desc: 'Prep and apply with confidence' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1rem', fontWeight: '700', color: 'var(--gold-500)' }}>{s.step}</div>
                <h4 style={{ color: 'var(--white)', marginBottom: '6px' }}>{s.title}</h4>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', background: 'var(--white)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Ready to Transform Your Career?</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Join 500+ professionals who landed their dream jobs using ResumeIQ
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">Get Started Free Today →</Link>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--navy-900)', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--navy-700)' }}>
        <div className="navbar-brand" style={{ marginBottom: '0.5rem' }}>Resume<span>IQ</span></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>© 2026 ResumeIQ. Built with MERN + AI.</p>
      </footer>

    </div>
  )
}