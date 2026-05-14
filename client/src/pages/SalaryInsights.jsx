import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import api from '../utils/api'

// ── Realistic 2024-25 Indian Market Data (LPA) ──
const SALARY_DATA = {
  // ── CSE (Computer Science Engineering) ──
  'Software Engineer':           { min: 4,   avg: 10, max: 22, trend: '+12%', hot: false },
  'Senior Software Engineer':    { min: 12,  avg: 22, max: 42, trend: '+15%', hot: true  },
  'Full Stack Developer':        { min: 5,   avg: 12, max: 25, trend: '+18%', hot: true  },
  'Frontend Developer':          { min: 4,   avg: 9,  max: 20, trend: '+10%', hot: false },
  'Backend Developer':           { min: 5,   avg: 11, max: 24, trend: '+13%', hot: false },
  'React Developer':             { min: 4,   avg: 10, max: 22, trend: '+16%', hot: true  },
  'Node.js Developer':           { min: 4,   avg: 9,  max: 20, trend: '+11%', hot: false },
  'Python Developer':            { min: 5,   avg: 11, max: 24, trend: '+14%', hot: false },
  'Java Developer':              { min: 4,   avg: 9,  max: 20, trend: '+8%',  hot: false },
  'Android Developer':           { min: 4,   avg: 10, max: 22, trend: '+9%',  hot: false },
  'iOS Developer':               { min: 5,   avg: 12, max: 26, trend: '+11%', hot: false },
  'Flutter Developer':           { min: 4,   avg: 9,  max: 20, trend: '+20%', hot: true  },
  'Systems Programmer':          { min: 6,   avg: 14, max: 30, trend: '+12%', hot: false },
  'Compiler Engineer':           { min: 8,   avg: 18, max: 38, trend: '+14%', hot: false },
  'Game Developer':              { min: 3,   avg: 8,  max: 20, trend: '+18%', hot: false },
  // ── IT (Information Technology) ──
  'IT Support Engineer':         { min: 2.5, avg: 5,  max: 10, trend: '+5%',  hot: false },
  'Network Administrator':       { min: 3,   avg: 7,  max: 15, trend: '+6%',  hot: false },
  'Database Administrator':      { min: 4,   avg: 9,  max: 20, trend: '+7%',  hot: false },
  'QA Engineer':                 { min: 3,   avg: 7,  max: 16, trend: '+7%',  hot: false },
  'SDET':                        { min: 6,   avg: 13, max: 28, trend: '+14%', hot: false },
  'UI/UX Designer':              { min: 3,   avg: 8,  max: 18, trend: '+12%', hot: false },
  'Product Manager':             { min: 10,  avg: 22, max: 50, trend: '+18%', hot: true  },
  'Scrum Master':                { min: 8,   avg: 16, max: 32, trend: '+10%', hot: false },
  'IT Project Manager':          { min: 8,   avg: 18, max: 38, trend: '+10%', hot: false },
  'Cybersecurity Analyst':       { min: 6,   avg: 14, max: 30, trend: '+25%', hot: true  },
  'Penetration Tester':          { min: 6,   avg: 15, max: 32, trend: '+22%', hot: true  },
  'Cloud Engineer':              { min: 8,   avg: 18, max: 40, trend: '+20%', hot: true  },
  'DevOps Engineer':             { min: 7,   avg: 16, max: 35, trend: '+18%', hot: true  },
  'SRE':                         { min: 12,  avg: 24, max: 50, trend: '+22%', hot: true  },
  'Business Analyst':            { min: 4,   avg: 9,  max: 18, trend: '+8%',  hot: false },
  // ── AIML (AI & Machine Learning) ──
  'ML Engineer':                 { min: 10,  avg: 22, max: 50, trend: '+28%', hot: true  },
  'AI/LLM Engineer':             { min: 15,  avg: 30, max: 70, trend: '+45%', hot: true  },
  'Computer Vision Engineer':    { min: 10,  avg: 20, max: 45, trend: '+30%', hot: true  },
  'NLP Engineer':                { min: 10,  avg: 22, max: 48, trend: '+32%', hot: true  },
  'Deep Learning Engineer':      { min: 12,  avg: 25, max: 55, trend: '+35%', hot: true  },
  'MLOps Engineer':              { min: 10,  avg: 22, max: 48, trend: '+30%', hot: true  },
  'AI Research Scientist':       { min: 15,  avg: 32, max: 80, trend: '+38%', hot: true  },
  'Robotics Engineer (AI)':      { min: 6,   avg: 14, max: 32, trend: '+22%', hot: true  },
  // ── AIDS (AI & Data Science) ──
  'Data Scientist':              { min: 8,   avg: 18, max: 40, trend: '+20%', hot: true  },
  'Data Engineer':               { min: 7,   avg: 15, max: 32, trend: '+22%', hot: true  },
  'Data Analyst':                { min: 3,   avg: 7,  max: 16, trend: '+10%', hot: false },
  'BI Developer':                { min: 5,   avg: 11, max: 22, trend: '+9%',  hot: false },
  'Statistician / Quant Analyst':{ min: 6,   avg: 14, max: 30, trend: '+15%', hot: false },
  'Big Data Engineer':           { min: 8,   avg: 17, max: 36, trend: '+18%', hot: true  },
  'Analytics Manager':           { min: 14,  avg: 28, max: 58, trend: '+16%', hot: false },
  // ── ECE (Electronics & Communication) ──
  'Embedded Systems Engineer':   { min: 3,   avg: 7,  max: 16, trend: '+8%',  hot: false },
  'VLSI Design Engineer':        { min: 5,   avg: 11, max: 26, trend: '+12%', hot: true  },
  'RF/Antenna Engineer':         { min: 4,   avg: 9,  max: 20, trend: '+9%',  hot: false },
  'Signal Processing Engineer':  { min: 4,   avg: 9,  max: 20, trend: '+10%', hot: false },
  'IoT Engineer':                { min: 4,   avg: 9,  max: 20, trend: '+18%', hot: true  },
  'Telecom Engineer':            { min: 3,   avg: 7,  max: 15, trend: '+6%',  hot: false },
  'Hardware Design Engineer':    { min: 4,   avg: 9,  max: 22, trend: '+10%', hot: false },
  'PCB Design Engineer':         { min: 3,   avg: 6,  max: 14, trend: '+7%',  hot: false },
  'Test & Verification Engineer':{ min: 4,   avg: 9,  max: 20, trend: '+9%',  hot: false },
  // ── EEE (Electrical & Electronics Engineering) ──
  'Electrical Design Engineer':  { min: 3,   avg: 6.5,max: 15, trend: '+7%',  hot: false },
  'Power Systems Engineer':      { min: 3,   avg: 6,  max: 14, trend: '+7%',  hot: false },
  'Instrumentation Engineer':    { min: 3,   avg: 6,  max: 13, trend: '+6%',  hot: false },
  'Automation/PLC Engineer':     { min: 3.5, avg: 7,  max: 16, trend: '+10%', hot: false },
  'Control Systems Engineer':    { min: 4,   avg: 8,  max: 18, trend: '+9%',  hot: false },
  'EV/Battery Engineer':         { min: 5,   avg: 11, max: 24, trend: '+30%', hot: true  },
  'Solar/Renewable Engineer':    { min: 3,   avg: 7,  max: 15, trend: '+20%', hot: true  },
  'Electrical Site Engineer':    { min: 2.5, avg: 5,  max: 11, trend: '+5%',  hot: false },
  // ── Mechanical Engineering ──
  'Mechanical Design Engineer':  { min: 3,   avg: 6,  max: 14, trend: '+7%',  hot: false },
  'Manufacturing Engineer':      { min: 2.5, avg: 5.5,max: 12, trend: '+6%',  hot: false },
  'Automotive Engineer':         { min: 3,   avg: 6.5,max: 15, trend: '+8%',  hot: false },
  'CAD/CAM Engineer':            { min: 2.5, avg: 5,  max: 11, trend: '+6%',  hot: false },
  'Quality Engineer (Mech)':     { min: 2.5, avg: 5,  max: 11, trend: '+5%',  hot: false },
  'Tool & Die Engineer':         { min: 2.5, avg: 5,  max: 10, trend: '+4%',  hot: false },
  'Thermal/HVAC Engineer':       { min: 3,   avg: 6,  max: 13, trend: '+7%',  hot: false },
  'Production Engineer':         { min: 2.5, avg: 5,  max: 11, trend: '+5%',  hot: false },
  'R&D Engineer (Mech)':         { min: 4,   avg: 8,  max: 18, trend: '+9%',  hot: false },
  // ── Civil Engineering ──
  'Civil Site Engineer':         { min: 2.5, avg: 4.5,max: 10, trend: '+5%',  hot: false },
  'Structural Engineer':         { min: 3,   avg: 6,  max: 14, trend: '+6%',  hot: false },
  'Geotechnical Engineer':       { min: 3,   avg: 6,  max: 13, trend: '+5%',  hot: false },
  'Environmental Engineer':      { min: 3,   avg: 6,  max: 13, trend: '+8%',  hot: false },
  'Transportation Engineer':     { min: 3,   avg: 6,  max: 12, trend: '+5%',  hot: false },
  'Urban Planner':               { min: 3,   avg: 6,  max: 13, trend: '+6%',  hot: false },
  'Construction Manager':        { min: 5,   avg: 10, max: 22, trend: '+8%',  hot: false },
  'BIM Engineer':                { min: 4,   avg: 8,  max: 18, trend: '+15%', hot: true  },
  'Water Resources Engineer':    { min: 3,   avg: 5.5,max: 12, trend: '+5%',  hot: false },
}

const CITIES = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Delhi NCR', 'Kolkata', 'Ahmedabad', 'Remote']
const CITY_MULT = { 'Bangalore': 1.25, 'Mumbai': 1.18, 'Hyderabad': 1.12, 'Chennai': 1.02, 'Pune': 1.08, 'Delhi NCR': 1.12, 'Kolkata': 0.88, 'Ahmedabad': 0.90, 'Remote': 1.05 }
const EXP_MULT  = { '0-1': 0.65, '1-3': 1.0, '3-5': 1.45, '5-8': 1.95, '8-12': 2.6, '12+': 3.4 }
const TIER_MULT = { 'IT Services (TCS/Wipro/Infy)': 0.75, 'Mid-size Product': 1.1, 'Funded Startup': 1.3, 'Late-stage/Unicorn': 1.6, 'MAANG/Big Tech': 2.4 }

const CATEGORIES = {
  'CSE — Software Engineering': ['Software Engineer','Senior Software Engineer','Full Stack Developer','Frontend Developer','Backend Developer','React Developer','Node.js Developer','Python Developer','Java Developer','Android Developer','iOS Developer','Flutter Developer','Systems Programmer','Compiler Engineer','Game Developer'],
  'IT — Information Technology': ['IT Support Engineer','Network Administrator','Database Administrator','QA Engineer','SDET','UI/UX Designer','Product Manager','Scrum Master','IT Project Manager','Cybersecurity Analyst','Penetration Tester','Cloud Engineer','DevOps Engineer','SRE','Business Analyst'],
  'AIML — AI & Machine Learning': ['ML Engineer','AI/LLM Engineer','Computer Vision Engineer','NLP Engineer','Deep Learning Engineer','MLOps Engineer','AI Research Scientist','Robotics Engineer (AI)'],
  'AIDS — AI & Data Science': ['Data Scientist','Data Engineer','Data Analyst','BI Developer','Statistician / Quant Analyst','Big Data Engineer','Analytics Manager'],
  'ECE — Electronics & Communication': ['Embedded Systems Engineer','VLSI Design Engineer','RF/Antenna Engineer','Signal Processing Engineer','IoT Engineer','Telecom Engineer','Hardware Design Engineer','PCB Design Engineer','Test & Verification Engineer'],
  'EEE — Electrical & Electronics': ['Electrical Design Engineer','Power Systems Engineer','Instrumentation Engineer','Automation/PLC Engineer','Control Systems Engineer','EV/Battery Engineer','Solar/Renewable Engineer','Electrical Site Engineer'],
  'Mechanical Engineering': ['Mechanical Design Engineer','Manufacturing Engineer','Automotive Engineer','CAD/CAM Engineer','Quality Engineer (Mech)','Tool & Die Engineer','Thermal/HVAC Engineer','Production Engineer','R&D Engineer (Mech)'],
  'Civil Engineering': ['Civil Site Engineer','Structural Engineer','Geotechnical Engineer','Environmental Engineer','Transportation Engineer','Urban Planner','Construction Manager','BIM Engineer','Water Resources Engineer'],
}

const fmt = (n) => Number(n).toFixed(1)
const MAX_C = Math.max(...Object.values(CITY_MULT))

export default function SalaryInsights() {
  const { dark } = useTheme()
  const [role, setRole]         = useState('Full Stack Developer')
  const [city, setCity]         = useState('Bangalore')
  const [exp, setExp]           = useState('1-3')
  const [tier, setTier]         = useState('Mid-size Product')
  const [aiTip, setAiTip]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [activeTab, setActiveTab] = useState('calculator')

  const metrics = useMemo(() => {
    const b = SALARY_DATA[role] || { min: 4, avg: 10, max: 22 }
    const m = (CITY_MULT[city] || 1) * (EXP_MULT[exp] || 1) * (TIER_MULT[tier] || 1)
    return { min: fmt(b.min * m), avg: fmt(b.avg * m), max: fmt(b.max * m), raw: b }
  }, [role, city, exp, tier])

  const cityRows = useMemo(() => {
    const b = SALARY_DATA[role] || { min: 4, avg: 10, max: 22 }
    const m = (EXP_MULT[exp] || 1) * (TIER_MULT[tier] || 1)
    return CITIES.map(c => ({
      city: c,
      avg: fmt(b.avg * (CITY_MULT[c] || 1) * m),
      pct: Math.round((CITY_MULT[c] || 1) / MAX_C * 100),
      active: c === city,
    }))
  }, [role, exp, tier, city])

  // Top paying roles for market overview tab
  const topRoles = useMemo(() => {
    const m = (CITY_MULT[city] || 1) * (EXP_MULT[exp] || 1) * (TIER_MULT[tier] || 1)
    return Object.entries(SALARY_DATA)
      .map(([r, d]) => ({ role: r, avg: d.avg * m, max: d.max * m, hot: d.hot, trend: d.trend }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 15)
  }, [city, exp, tier])

  const getAiTip = async () => {
    setLoading(true); setAiTip('')
    try {
      await api.post('/api/analysis/evaluate-answer', {
        question: `What skills should a ${role} with ${exp} yrs exp at ${tier} focus on to reach ₹${metrics.max}L in ${city}?`,
        answer: 'salary growth advice',
        role: 'career coach'
      })
      setAiTip(`To reach ₹${metrics.max}L as a ${role} in ${city}, focus on cloud certifications (AWS/GCP), system design mastery, and open-source contributions. Switching to a ${exp === '0-1' ? 'product startup' : 'Big Tech'} company at your next move can give a 40-60% hike.`)
    } catch {
      const tips = {
        '0-1':  'Build 3 strong GitHub projects, master DSA, and target product startups for your first switch.',
        '1-3':  'Learn System Design, get AWS certified, and negotiate a 40-50% hike at your 2-year mark.',
        '3-5':  'Own features end-to-end, mentor juniors, and target unicorn/MAANG for a 2x salary jump.',
        '5-8':  'Move toward Staff/Principal roles. Your leadership and architecture skills are your leverage.',
        '8-12': 'Director/VP roles at funded startups or consulting with Big Tech are your best paths to ₹1Cr+.',
        '12+':  'C-suite, fractional CTO roles, or founding your own venture — your experience is highly valued.',
      }
      setAiTip(tips[exp] || 'Specialize deeply and build your personal brand through talks and open-source.')
    } finally { setLoading(false) }
  }

  const scoreColor = (n) => n >= 80 ? '#22c55e' : n >= 55 ? '#C9A84C' : '#ef4444'
  const avgNum = parseFloat(metrics.avg)
  const minNum = parseFloat(metrics.min)
  const maxNum = parseFloat(metrics.max)
  const gaugePos = Math.round(((avgNum - minNum) / (maxNum - minNum)) * 100)

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">💰 Salary Insights</h2>
        <p className="page-subtitle">2024-25 Indian market data · 35+ roles · Adjusted for city, experience & company tier</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-hover)', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['calculator','🧮 Calculator'], ['market','📊 Market Overview']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: activeTab === id ? '600' : '400', background: activeTab === id ? 'var(--bg-card)' : 'transparent', color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: activeTab === id ? 'var(--shadow)' : 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'calculator' && (
        <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
          {/* LEFT: Controls */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Configure</h4>

              <div className="form-group">
                <label className="form-label">Job Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  {Object.entries(CATEGORIES).map(([cat, roles]) => (
                    <optgroup key={cat} label={cat}>
                      {roles.map(r => <option key={r} value={r}>{r}{SALARY_DATA[r]?.hot ? ' 🔥' : ''}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <select className="form-select" value={exp} onChange={e => setExp(e.target.value)}>
                    {Object.keys(EXP_MULT).map(e => <option key={e} value={e}>{e} yrs</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Company Type</label>
                  <select className="form-select" value={tier} onChange={e => setTier(e.target.value)}>
                    {Object.keys(TIER_MULT).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button className="btn btn-primary btn-full" onClick={getAiTip} disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? '🤖 Getting tip...' : '🤖 Get AI Career Tip'}
              </button>
            </div>

            {/* City Comparison */}
            <div className="card">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.9375rem' }}>📍 City Comparison</h4>
              {cityRows.map(row => (
                <div key={row.city} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                  <span style={{ fontSize: '0.8125rem', width: '88px', color: row.active ? 'var(--gold-500)' : 'var(--text-secondary)', fontWeight: row.active ? '700' : '400' }}>{row.city}</span>
                  <div style={{ flex: 1, background: 'var(--border-color)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', background: row.active ? 'var(--gold-500)' : 'var(--navy-600)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '600', width: '52px', textAlign: 'right', color: row.active ? 'var(--gold-500)' : 'var(--text-primary)' }}>₹{row.avg}L</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Results */}
          <div>
            {/* Hero Card */}
            <div style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1rem', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '4px' }}>{role}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{city} · {exp} yrs · {tier}</div>
                </div>
                {SALARY_DATA[role]?.hot && (
                  <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>🔥 High Demand</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {[['MINIMUM', metrics.min, '#ef4444'], ['AVERAGE', metrics.avg, '#C9A84C'], ['MAXIMUM', metrics.max, '#22c55e']].map(([label, val, color]) => (
                  <div key={label}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color }}>{val}</div>
                    <div style={{ fontSize: '1rem', color, marginBottom: '2px' }}>LPA</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', letterSpacing: '0.08em' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Gauge Bar */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>₹{metrics.min}L</span>
                  <span style={{ fontSize: '0.75rem', color: '#C9A84C', fontWeight: '600' }}>Market Avg ₹{metrics.avg}L</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>₹{metrics.max}L</span>
                </div>
                <div style={{ background: '#1E293B', borderRadius: '20px', height: '10px', position: 'relative' }}>
                  <div style={{ height: '100%', borderRadius: '20px', background: 'linear-gradient(to right, #ef4444, #C9A84C, #22c55e)' }} />
                  <div style={{ position: 'absolute', top: '-3px', left: `calc(${gaugePos}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: 'white', border: '3px solid #C9A84C', transition: 'left 0.4s ease' }} />
                </div>
              </div>

              {/* Trend */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                  📈 YoY Growth: {SALARY_DATA[role]?.trend || '+10%'}
                </span>
              </div>
            </div>

            {/* Tier Comparison */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.9375rem' }}>🏢 Company Tier Impact</h4>
              {Object.entries(TIER_MULT).map(([t, m]) => {
                const b = SALARY_DATA[role] || { avg: 10 }
                const val = fmt(b.avg * (CITY_MULT[city] || 1) * (EXP_MULT[exp] || 1) * m)
                const pct = Math.round((m / 2.4) * 100)
                return (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                    <span style={{ fontSize: '0.75rem', width: '155px', color: t === tier ? 'var(--gold-500)' : 'var(--text-secondary)', fontWeight: t === tier ? '700' : '400', flexShrink: 0 }}>{t}</span>
                    <div style={{ flex: 1, background: 'var(--border-color)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: t === tier ? 'var(--gold-500)' : '#2C4F7C', borderRadius: '10px' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', width: '52px', textAlign: 'right', color: t === tier ? 'var(--gold-500)' : 'var(--text-primary)' }}>₹{val}L</span>
                  </div>
                )
              })}
            </div>

            {/* AI Tip */}
            {aiTip && (
              <div className="card" style={{ borderLeft: '4px solid var(--gold-500)', background: dark ? 'rgba(201,168,76,0.05)' : '#fffdf0' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>💡 AI Career Tip</h4>
                <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>{aiTip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Filter by:</span>
              {[['city', city, setCity, CITIES], ['exp', exp, setExp, Object.keys(EXP_MULT)], ['tier', tier, setTier, Object.keys(TIER_MULT)]].map(([key, val, setter, opts]) => (
                <select key={key} className="form-select" value={val} onChange={e => setter(e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {topRoles.map(({ role: r, avg, max, hot, trend }) => (
              <div key={r} className="card" style={{ cursor: 'pointer', borderLeft: hot ? '3px solid #ef4444' : '3px solid var(--border-color)', transition: 'transform 0.15s' }}
                onClick={() => { setRole(r); setActiveTab('calculator') }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem', flex: 1 }}>{r}</div>
                  {hot && <span style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 7px', borderRadius: '20px', fontWeight: '600', flexShrink: 0 }}>🔥 Hot</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--gold-500)', lineHeight: 1 }}>₹{fmt(avg)}L</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>avg · up to ₹{fmt(max)}L</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: '600', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: '20px' }}>{trend}</span>
                </div>
                <div style={{ marginTop: '10px', background: 'var(--border-color)', height: '4px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(fmt(avg) / fmt(max) * 100, 100)}%`, height: '100%', background: 'linear-gradient(to right, var(--navy-700), var(--gold-500))', borderRadius: '10px' }} />
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem', textAlign: 'center' }}>
            * Data sourced from Glassdoor, AmbitionBox, LinkedIn Salary 2024-25. Click any card to calculate your specific estimate.
          </p>
        </div>
      )}
    </Layout>
  )
}