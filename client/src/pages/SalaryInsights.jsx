import { useState, useMemo, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../utils/api'

// ── Realistic 2024-25 Indian Market Data (LPA) ──
const SALARY_DATA = {
  // CSE
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
  // IT
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
  // AIML
  'ML Engineer':                 { min: 10,  avg: 22, max: 50, trend: '+28%', hot: true  },
  'AI/LLM Engineer':             { min: 15,  avg: 30, max: 70, trend: '+45%', hot: true  },
  'Computer Vision Engineer':    { min: 10,  avg: 20, max: 45, trend: '+30%', hot: true  },
  'NLP Engineer':                { min: 10,  avg: 22, max: 48, trend: '+32%', hot: true  },
  'Deep Learning Engineer':      { min: 12,  avg: 25, max: 55, trend: '+35%', hot: true  },
  'MLOps Engineer':              { min: 10,  avg: 22, max: 48, trend: '+30%', hot: true  },
  'AI Research Scientist':       { min: 15,  avg: 32, max: 80, trend: '+38%', hot: true  },
  'Robotics Engineer (AI)':      { min: 6,   avg: 14, max: 32, trend: '+22%', hot: true  },
  // AIDS
  'Data Scientist':              { min: 8,   avg: 18, max: 40, trend: '+20%', hot: true  },
  'Data Engineer':               { min: 7,   avg: 15, max: 32, trend: '+22%', hot: true  },
  'Data Analyst':                { min: 3,   avg: 7,  max: 16, trend: '+10%', hot: false },
  'BI Developer':                { min: 5,   avg: 11, max: 22, trend: '+9%',  hot: false },
  'Statistician / Quant Analyst':{ min: 6,   avg: 14, max: 30, trend: '+15%', hot: false },
  'Big Data Engineer':           { min: 8,   avg: 17, max: 36, trend: '+18%', hot: true  },
  'Analytics Manager':           { min: 14,  avg: 28, max: 58, trend: '+16%', hot: false },
  // ECE
  'Embedded Systems Engineer':   { min: 3,   avg: 7,  max: 16, trend: '+8%',  hot: false },
  'VLSI Design Engineer':        { min: 5,   avg: 11, max: 26, trend: '+12%', hot: true  },
  'RF/Antenna Engineer':         { min: 4,   avg: 9,  max: 20, trend: '+9%',  hot: false },
  'Signal Processing Engineer':  { min: 4,   avg: 9,  max: 20, trend: '+10%', hot: false },
  'IoT Engineer':                { min: 4,   avg: 9,  max: 20, trend: '+18%', hot: true  },
  'Telecom Engineer':            { min: 3,   avg: 7,  max: 15, trend: '+6%',  hot: false },
  'Hardware Design Engineer':    { min: 4,   avg: 9,  max: 22, trend: '+10%', hot: false },
  'PCB Design Engineer':         { min: 3,   avg: 6,  max: 14, trend: '+7%',  hot: false },
  'Test & Verification Engineer':{ min: 4,   avg: 9,  max: 20, trend: '+9%',  hot: false },
  // EEE
  'Electrical Design Engineer':  { min: 3,   avg: 6.5,max: 15, trend: '+7%',  hot: false },
  'Power Systems Engineer':      { min: 3,   avg: 6,  max: 14, trend: '+7%',  hot: false },
  'Instrumentation Engineer':    { min: 3,   avg: 6,  max: 13, trend: '+6%',  hot: false },
  'Automation/PLC Engineer':     { min: 3.5, avg: 7,  max: 16, trend: '+10%', hot: false },
  'Control Systems Engineer':    { min: 4,   avg: 8,  max: 18, trend: '+9%',  hot: false },
  'EV/Battery Engineer':         { min: 5,   avg: 11, max: 24, trend: '+30%', hot: true  },
  'Solar/Renewable Engineer':    { min: 3,   avg: 7,  max: 15, trend: '+20%', hot: true  },
  'Electrical Site Engineer':    { min: 2.5, avg: 5,  max: 11, trend: '+5%',  hot: false },
  // Mechanical
  'Mechanical Design Engineer':  { min: 3,   avg: 6,  max: 14, trend: '+7%',  hot: false },
  'Manufacturing Engineer':      { min: 2.5, avg: 5.5,max: 12, trend: '+6%',  hot: false },
  'Automotive Engineer':         { min: 3,   avg: 6.5,max: 15, trend: '+8%',  hot: false },
  'CAD/CAM Engineer':            { min: 2.5, avg: 5,  max: 11, trend: '+6%',  hot: false },
  'Quality Engineer (Mech)':     { min: 2.5, avg: 5,  max: 11, trend: '+5%',  hot: false },
  'Tool & Die Engineer':         { min: 2.5, avg: 5,  max: 10, trend: '+4%',  hot: false },
  'Thermal/HVAC Engineer':       { min: 3,   avg: 6,  max: 13, trend: '+7%',  hot: false },
  'Production Engineer':         { min: 2.5, avg: 5,  max: 11, trend: '+5%',  hot: false },
  'R&D Engineer (Mech)':         { min: 4,   avg: 8,  max: 18, trend: '+9%',  hot: false },
  // Civil
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
  'CSE - Software Engineering': ['Software Engineer','Senior Software Engineer','Full Stack Developer','Frontend Developer','Backend Developer','React Developer','Node.js Developer','Python Developer','Java Developer','Android Developer','iOS Developer','Flutter Developer','Systems Programmer','Compiler Engineer','Game Developer'],
  'IT - Information Technology': ['IT Support Engineer','Network Administrator','Database Administrator','QA Engineer','SDET','UI/UX Designer','Product Manager','Scrum Master','IT Project Manager','Cybersecurity Analyst','Penetration Tester','Cloud Engineer','DevOps Engineer','SRE','Business Analyst'],
  'AIML - AI & Machine Learning': ['ML Engineer','AI/LLM Engineer','Computer Vision Engineer','NLP Engineer','Deep Learning Engineer','MLOps Engineer','AI Research Scientist','Robotics Engineer (AI)'],
  'AIDS - AI & Data Science': ['Data Scientist','Data Engineer','Data Analyst','BI Developer','Statistician / Quant Analyst','Big Data Engineer','Analytics Manager'],
  'ECE - Electronics & Communication': ['Embedded Systems Engineer','VLSI Design Engineer','RF/Antenna Engineer','Signal Processing Engineer','IoT Engineer','Telecom Engineer','Hardware Design Engineer','PCB Design Engineer','Test & Verification Engineer'],
  'EEE - Electrical & Electronics': ['Electrical Design Engineer','Power Systems Engineer','Instrumentation Engineer','Automation/PLC Engineer','Control Systems Engineer','EV/Battery Engineer','Solar/Renewable Engineer','Electrical Site Engineer'],
  'Mechanical Engineering': ['Mechanical Design Engineer','Manufacturing Engineer','Automotive Engineer','CAD/CAM Engineer','Quality Engineer (Mech)','Tool & Die Engineer','Thermal/HVAC Engineer','Production Engineer','R&D Engineer (Mech)'],
  'Civil Engineering': ['Civil Site Engineer','Structural Engineer','Geotechnical Engineer','Environmental Engineer','Transportation Engineer','Urban Planner','Construction Manager','BIM Engineer','Water Resources Engineer'],
}

const fmt = (n) => Number(n).toFixed(1)
const MAX_C = Math.max(...Object.values(CITY_MULT))

export default function SalaryInsights() {
  const { dark } = useTheme()
  const [category, setCategory] = useState('CSE - Software Engineering')
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
    console.log('Fetching resumes for SalaryInsights...')
    api.get('/api/resume/all')
      .then(r => {
        console.log('Resumes fetched:', r.data?.length)
        setResumes(r.data || [])
        if (r.data && r.data.length > 0) {
          const firstId = String(r.data[0].id)
          setResumeId(firstId)
          console.log('Initial resumeId set to:', firstId)
        }
      })
      .catch(err => {
        console.error('Failed to load resumes:', err)
        setResumes([])
      })
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

  // FIX: Filter roles PER CATEGORY first, then sort by salary
  const categoryRoles = useMemo(() => {
    const m = (CITY_MULT[city] || 1) * (EXP_MULT[exp] || 1) * (TIER_MULT[tier] || 1)
    const allowed = CATEGORIES[category] || []
    return Object.entries(SALARY_DATA)
      .filter(([r]) => allowed.includes(r))
      .map(([r, d]) => ({ role: r, avg: d.avg * m, max: d.max * m, hot: d.hot, trend: d.trend }))
      .sort((a, b) => b.avg - a.avg)
  }, [category, city, exp, tier])

  const getAiTip = async () => {
    if (!resumeId) {
      console.warn('Attempted roadmap generation without resumeId')
      return alert('Please upload and select a resume first.')
    }
    setLoading(true); setAiResult(null)
    console.log('Generating roadmap for resumeId:', resumeId)
    try {
      const res = await api.post('/api/analysis/salary-tips', {
        resumeId: String(resumeId),
        role,
        domain: category,
        experience: exp,
        city,
        tier,
        targetSalary: metrics.max
      })
      console.log('Roadmap received:', !!res.data)
      setAiResult(res.data)
    } catch (error) {
      console.error('Roadmap API failed:', error)
      setAiResult({
        strategy: `Your path to ₹${metrics.max}L involves strategic upskilling in high-demand technical areas.`,
        topSkills: ['System Design', 'Scalability', 'Backend Architecture'],
        targetCompanies: ['MAANG', 'Tier-1 Startups'],
        certifications: ['AWS Solutions Architect'],
        leverageTip: 'Negotiate based on your specific projects and business outcomes from your resume.',
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
        <p className="page-subtitle">2024-25 Market Data & Career Strategy</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-hover)', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['calculator','🧮 Calculator'], ['market','📊 Market Trends']].map(([id, label]) => (
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
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Roadmap Settings</h4>
                <div style={{ fontSize: '0.7rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>LIVE AI CHECK</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Select Your Resume</label>
                {resumes.length > 0 ? (
                  <select className="form-select" value={resumeId} onChange={e => setResumeId(e.target.value)} style={{ border: '1px solid var(--gold-500)', fontWeight: '600' }}>
                    <option value="">-- Choose Resume --</option>
                    {resumes.map(r => <option key={r.id} value={String(r.id)}>{r.title}</option>)}
                  </select>
                ) : (
                  <div style={{ padding: '10px', border: '1px dashed var(--gray-400)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    No resumes found. Please <a href="/upload" style={{ color: 'var(--gold-500)' }}>upload one</a> first.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setRole(CATEGORIES[e.target.value][0]) }}>
                  {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  {(CATEGORIES[category] || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Exp (Yrs)</label>
                  <select className="form-select" value={exp} onChange={e => setExp(e.target.value)}>
                    {Object.keys(EXP_MULT).map(e => <option key={e} value={e}>{e}</option>)}
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
                {loading ? 'Analyzing...' : 'Generate Roadmap'}
              </button>
            </div>

            <div className="card">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>📍 City Benchmark</h4>
              {cityRows.map(row => (
                <div key={row.city} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', width: '80px', color: row.active ? 'var(--gold-500)' : 'var(--text-secondary)' }}>{row.city}</span>
                  <div style={{ flex: 1, background: 'var(--border-color)', height: '4px', borderRadius: '4px' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', background: row.active ? 'var(--gold-500)' : 'var(--navy-600)', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', width: '45px', textAlign: 'right' }}>₹{row.avg}L</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: 'var(--navy-800)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', color: 'white' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Estimated Range</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{role}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', textAlign: 'center', marginBottom: '1.5rem' }}>
                {[
                  ['MIN', aiResult?.marketRange?.min || metrics.min, '#ef4444'],
                  ['AVG', aiResult?.marketRange?.avg || metrics.avg, '#C9A84C'],
                  ['MAX', aiResult?.marketRange?.max || metrics.max, '#22c55e']
                ].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: c }}>₹{v}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--gray-400)' }}>{l} (LPA)</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1a202c', height: '8px', borderRadius: '4px', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #ef4444, #C9A84C, #22c55e)', borderRadius: '4px' }} />
                <div style={{ position: 'absolute', top: '-4px', left: `calc(${gaugePos}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: 'white', border: '3px solid #C9A84C' }} />
              </div>
            </div>

            {aiResult && (
              <div className="card" style={{ borderLeft: '4px solid var(--gold-500)' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>✨ AI Roadmap</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{aiResult.strategy}</p>
                <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>SKILL GAPS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {aiResult.topSkills?.map(s => <span key={s} style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--navy-600)', marginBottom: '8px' }}>TARGETS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {aiResult.targetCompanies?.map(c => <span key={c} style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{c}</span>)}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--gold-500)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--gold-500)' }}>LEVERAGE TIP</div>
                  <div style={{ fontSize: '0.8rem' }}>{aiResult.leverageTip}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Domain:</span>
            <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setRole(CATEGORIES[e.target.value][0]) }} style={{ width: 'auto' }}>
              {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          {categoryRoles.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {categoryRoles.map(r => (
                <div key={r.role} className="card" onClick={() => { setRole(r.role); setActiveTab('calculator') }} style={{ cursor: 'pointer' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>{r.role}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--gold-500)' }}>₹{fmt(r.avg)}L</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Avg LPA</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: '700' }}>{r.trend}</div>
                      {r.hot && <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: '800' }}>HOT</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No data available for this category yet.
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}