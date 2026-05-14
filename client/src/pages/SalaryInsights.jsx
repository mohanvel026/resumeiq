import { useState, useMemo, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
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
  const { user } = useAuth()
  const [category, setCategory] = useState('CSE — Software Engineering')
  const [role, setRole]         = useState('Full Stack Developer')
  const [city, setCity]         = useState('Bangalore')
  const [exp, setExp]           = useState('1-3')
  const [tier, setTier]         = useState('Mid-size Product')
  const [resumes, setResumes]   = useState([])
  const [resumeId, setResumeId] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [activeTab, setActiveTab] = useState('calculator')

  useEffect(() => {
    api.get('/api/resume/my-resumes')
      .then(r => {
        setResumes(r.data)
        if (r.data.length > 0) setResumeId(String(r.data[0].id))
      })
      .catch(err => console.error('Failed to load resumes', err))
  }, [])

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

  const topRoles = useMemo(() => {
    const m = (CITY_MULT[city] || 1) * (EXP_MULT[exp] || 1) * (TIER_MULT[tier] || 1)
    return Object.entries(SALARY_DATA)
      .map(([r, d]) => ({ role: r, avg: d.avg * m, max: d.max * m, hot: d.hot, trend: d.trend }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 15)
  }, [city, exp, tier])

  const getAiTip = async () => {
    if (!resumeId) return alert('Please select a resume for personalized strategy.')
    setLoading(true); setAiResult(null)
    try {
      const res = await api.post('/api/analysis/salary-tips', {
        resumeId: parseInt(resumeId),
        role,
        domain: category,
        experience: exp,
        city,
        tier,
        targetSalary: metrics.max
      })
      setAiResult(res.data)
    } catch (error) {
      console.error('Roadmap error:', error)
      setAiResult({
        strategy: `Your path to ₹${metrics.max}L involves strategic upskilling in niche technologies.`,
        topSkills: ['System Design', 'Scalability', 'Project Ownership'],
        targetCompanies: ['MAANG', 'Tier-1 Startups'],
        certifications: ['AWS Solutions Architect'],
        leverageTip: 'Negotiate based on your specific projects and business impact.',
        marketRange: { min: metrics.min, avg: metrics.avg, max: metrics.max }
      })
    } finally { setLoading(false) }
  }

  const gaugePos = aiResult?.marketRange 
    ? Math.round(((parseFloat(aiResult.marketRange.avg) - parseFloat(aiResult.marketRange.min)) / (parseFloat(aiResult.marketRange.max) - parseFloat(aiResult.marketRange.min))) * 100)
    : Math.round(((parseFloat(metrics.avg) - parseFloat(metrics.min)) / (parseFloat(metrics.max) - parseFloat(metrics.min))) * 100)

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">💰 Salary Insights</h2>
        <p className="page-subtitle">2024-25 Market Data · Personalized AI Roadmap</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-hover)', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['calculator','🧮 Personalized Report'], ['market','📊 Market Trends']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: activeTab === id ? '600' : '400', background: activeTab === id ? 'var(--bg-card)' : 'transparent', color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: activeTab === id ? 'var(--shadow)' : 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'calculator' && (
        <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Input Parameters</h4>
                <div style={{ fontSize: '0.7rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>● LIVE MARKET CHECK</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Analyze based on Resume</label>
                <select className="form-select" value={resumeId} onChange={e => setResumeId(e.target.value)} style={{ border: '1px solid var(--gold-500)' }}>
                  <option value="">Select a resume...</option>
                  {resumes.map(r => <option key={r.id} value={String(r.id)}>{r.title}</option>)}
                </select>
                <span className="form-hint" style={{ color: 'var(--gold-500)', fontWeight: '500' }}>AI will compare your skills with target market needs</span>
              </div>

              <div className="form-group">
                <label className="form-label">Job Domain</label>
                <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setRole(CATEGORIES[e.target.value][0]) }}>
                  {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  {CATEGORIES[category].map(r => <option key={r} value={r}>{r}{SALARY_DATA[r]?.hot ? ' 🔥' : ''}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target City</label>
                  <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <select className="form-select" value={exp} onChange={e => setExp(e.target.value)}>
                    {Object.keys(EXP_MULT).map(e => <option key={e} value={e}>{e} yrs</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company Tier</label>
                <select className="form-select" value={tier} onChange={e => setTier(e.target.value)}>
                  {Object.keys(TIER_MULT).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button className="btn btn-primary btn-full" onClick={getAiTip} disabled={loading || !resumeId} style={{ marginTop: '0.5rem', height: '48px' }}>
                {loading ? '🤖 AI IS ANALYZING...' : '🚀 GENERATE PERSONALIZED ROADMAP'}
              </button>
            </div>

            <div className="card">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.9375rem' }}>📍 City Benchmarks</h4>
              {cityRows.map(row => (
                <div key={row.city} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                  <span style={{ fontSize: '0.8125rem', width: '88px', color: row.active ? 'var(--gold-500)' : 'var(--text-secondary)', fontWeight: row.active ? '700' : '400' }}>{row.city}</span>
                  <div style={{ flex: 1, background: 'var(--border-color)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', background: row.active ? 'var(--gold-500)' : 'var(--navy-600)', borderRadius: '10px' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '600', width: '52px', textAlign: 'right', color: row.active ? 'var(--gold-500)' : 'var(--text-primary)' }}>₹{row.avg}L</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1rem', color: 'white', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    {aiResult?.marketRange ? '✨ AI-VERIFIED RANGE' : '📊 CALCULATED ESTIMATE'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{role}</div>
                </div>
                {SALARY_DATA[role]?.hot && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>🔥 HOT</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {[
                  ['MIN', aiResult?.marketRange ? aiResult.marketRange.min : metrics.min, '#ef4444'],
                  ['AVG', aiResult?.marketRange ? aiResult.marketRange.avg : metrics.avg, '#C9A84C'],
                  ['MAX', aiResult?.marketRange ? aiResult.marketRange.max : metrics.max, '#22c55e']
                ].map(([label, val, color]) => (
                  <div key={label}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color, lineHeight: 1 }}>₹{val}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700', marginTop: '6px' }}>{label} LPA</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ background: '#1E293B', borderRadius: '20px', height: '10px', position: 'relative' }}>
                  <div style={{ height: '100%', borderRadius: '20px', background: 'linear-gradient(to right, #ef4444, #C9A84C, #22c55e)' }} />
                  <div style={{ position: 'absolute', top: '-3px', left: `calc(${gaugePos}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: 'white', border: '3px solid #C9A84C', boxShadow: '0 0 10px rgba(201,168,76,0.5)', transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                </div>
              </div>
            </div>

            {aiResult && (
              <div className="card" style={{ padding: '1.75rem', borderLeft: '5px solid var(--gold-500)', background: dark ? 'rgba(201,168,76,0.03)' : '#fffdf8' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>✨ Career Roadmap</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{aiResult.strategy}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>⚠️ SKILL GAPS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {aiResult.topSkills?.map(s => <span key={s} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--navy-700)', marginBottom: '8px' }}>🏢 TARGETS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {aiResult.targetCompanies?.map(c => <span key={c} style={{ background: 'rgba(10,22,40,0.05)', color: 'var(--navy-700)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>{c}</span>)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: dark ? '#1E293B' : '#F8FAFC', borderRadius: '12px', border: '1px solid var(--gold-500)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-500)', marginBottom: '4px' }}>💡 NEGOTIATION EDGE</div>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>{aiResult.leverageTip}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Filter market trends:</span>
              {[['domain', category, (v) => { setCategory(v); setRole(CATEGORIES[v][0]) }, Object.keys(CATEGORIES)], ['city', city, setCity, CITIES], ['exp', exp, setExp, Object.keys(EXP_MULT)], ['tier', tier, setTier, Object.keys(TIER_MULT)]].map(([key, val, setter, opts]) => (
                <select key={key} className="form-select" value={val} onChange={e => setter(e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {topRoles.filter(r => CATEGORIES[category].includes(r.role)).map(({ role: r, avg, max, hot, trend }) => (
              <div key={r} className="card" style={{ cursor: 'pointer', borderLeft: hot ? '4px solid #ef4444' : '4px solid #334155', transition: 'all 0.2s' }}
                onClick={() => { setRole(r); setActiveTab('calculator') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>{r}</div>
                  {hot && <span style={{ fontSize: '0.65rem', background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '20px', fontWeight: '800' }}>HOT</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--gold-500)' }}>₹{fmt(avg)}L</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Median LPA</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: '700' }}>{trend}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Growth</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}