// import { useState, useEffect } from 'react'
// import { useTheme } from '../context/ThemeContext'
// import Layout from '../components/Layout'
// import api from '../utils/api'

// const SALARY_DATA = {
//   'React Developer': { min: 4, max: 18, avg: 9, currency: '₹L' },
//   'Full Stack Developer': { min: 5, max: 22, avg: 12, currency: '₹L' },
//   'Node.js Developer': { min: 4, max: 16, avg: 8, currency: '₹L' },
//   'Frontend Developer': { min: 3, max: 15, avg: 8, currency: '₹L' },
//   'Backend Developer': { min: 4, max: 18, avg: 10, currency: '₹L' },
//   'Data Analyst': { min: 3, max: 14, avg: 7, currency: '₹L' },
//   'Python Developer': { min: 4, max: 20, avg: 10, currency: '₹L' },
//   'DevOps Engineer': { min: 6, max: 25, avg: 14, currency: '₹L' },
//   'UI/UX Designer': { min: 3, max: 16, avg: 8, currency: '₹L' },
//   'Software Engineer': { min: 4, max: 20, avg: 11, currency: '₹L' },
//   'Machine Learning Engineer': { min: 8, max: 35, avg: 18, currency: '₹L' },
//   'Cloud Engineer': { min: 7, max: 28, avg: 16, currency: '₹L' },
// }

// const CITIES = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Delhi NCR', 'Remote']
// const CITY_MULTIPLIER = { 'Bangalore': 1.2, 'Mumbai': 1.15, 'Hyderabad': 1.1, 'Chennai': 1.0, 'Pune': 1.05, 'Delhi NCR': 1.1, 'Remote': 1.0 }
// const EXP_MULTIPLIER = { '0-1': 0.7, '1-3': 1.0, '3-5': 1.4, '5-8': 1.8, '8+': 2.3 }

// export default function SalaryInsights() {
// 
//   const [role, setRole] = useState('Full Stack Developer')
//   const [city, setCity] = useState('Bangalore')
//   const [experience, setExperience] = useState('1-3')
//   const [aiInsight, setAiInsight] = useState('')
//   const [loading, setLoading] = useState(false)

//   const base = SALARY_DATA[role] || { min: 4, max: 15, avg: 8, currency: '₹L' }
//   const cityMult = CITY_MULTIPLIER[city] || 1
//   const expMult = EXP_MULTIPLIER[experience] || 1

//   const salaryMin = (base.min * cityMult * expMult).toFixed(1)
//   const salaryMax = (base.max * cityMult * expMult).toFixed(1)
//   const salaryAvg = (base.avg * cityMult * expMult).toFixed(1)

//   const getAIInsight = async () => {
//     setLoading(true)
//     try {
//       const r = await api.post('/api/analysis/skill-gap', {
//         jobDescription: `${role} with ${experience} years experience in ${city}. What skills should they focus on to command higher salary?`
//       })
//       setAiInsight('Focus on cloud certifications, system design, and leadership skills to reach the higher end of this range.')
//     } catch {
//       setAiInsight('Develop cloud skills, contribute to open source, and get certified to increase your market value significantly.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Layout>
//       <div className="page-header">
//         <h2 className="page-title">Salary Insights</h2>
//         <p className="page-subtitle">Discover expected salary ranges based on role, city and experience</p>
//       </div>

//       <div className="grid-2" style={{ alignItems: 'start' }}>
//         <div className="card">
//           <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Configure Search</h4>
//           <div className="form-group">
//             <label className="form-label">Job Role</label>
//             <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
//               {Object.keys(SALARY_DATA).map(r => <option key={r} value={r}>{r}</option>)}
//             </select>
//           </div>
//           <div className="form-group">
//             <label className="form-label">City</label>
//             <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
//               {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
//             </select>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Years of Experience</label>
//             <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)}>
//               {Object.keys(EXP_MULTIPLIER).map(e => <option key={e} value={e}>{e} years</option>)}
//             </select>
//           </div>
//           <button className="btn btn-primary btn-full" onClick={getAIInsight} disabled={loading}>
//             {loading ? '🤖 Getting AI tips...' : '🤖 Get AI Career Tips'}
//           </button>
//         </div>

//         <div>
//           <div className="card" style={{ marginBottom: '1rem', background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}>
//             <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', margin: '0 0 8px' }}>
//               {role} in {city} ({experience} yrs exp)
//             </p>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
//               {[
//                 { label: 'Minimum', value: `${salaryMin}${base.currency}`, color: 'var(--danger)' },
//                 { label: 'Average', value: `${salaryAvg}${base.currency}`, color: 'var(--gold-500)' },
//                 { label: 'Maximum', value: `${salaryMax}${base.currency}`, color: 'var(--success)' },
//               ].map(s => (
//                 <div key={s.label} style={{ textAlign: 'center' }}>
//                   <div style={{ fontSize: '1.5rem', fontWeight: '700', color: s.color }}>{s.value}</div>
//                   <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{s.label}</div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ background: 'var(--navy-800)', borderRadius: '8px', padding: '10px' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
//                 <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>₹{salaryMin}L</span>
//                 <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>₹{salaryMax}L</span>
//               </div>
//               <div style={{ background: 'var(--navy-700)', borderRadius: '20px', height: '8px', position: 'relative' }}>
//                 <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: '20px', background: 'linear-gradient(to right, var(--danger), var(--gold-500), var(--success))' }} />
//                 <div style={{ position: 'absolute', left: '45%', top: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--gold-500)', border: '2px solid white' }} />
//               </div>
//             </div>
//           </div>

//           <div className="card" style={{ marginBottom: '1rem' }}>
//             <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>City Comparison</h4>
//             {CITIES.map(c => {
//               const mult = CITY_MULTIPLIER[c] || 1
//               const avg = (base.avg * mult * expMult).toFixed(1)
//               const pct = Math.round((mult - 0.7) / 0.5 * 100)
//               return (
//                 <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
//                   <span style={{ fontSize: '0.8125rem', color: 'var(--gray-700)', minWidth: '90px' }}>{c}</span>
//                   <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
//                     <div style={{ width: `${pct}%`, height: '100%', background: c === city ? 'var(--gold-500)' : 'var(--navy-600)', borderRadius: '20px', transition: 'width 0.3s' }} />
//                   </div>
//                   <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: c === city ? 'var(--gold-500)' : 'var(--navy-800)', minWidth: '60px', textAlign: 'right' }}>₹{avg}L</span>
//                 </div>
//               )
//             })}
//           </div>

//           {aiInsight && (
//             <div className="card" style={{ borderLeft: '3px solid var(--gold-500)' }}>
//               <h4 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>💡 AI Career Tip</h4>
//               <p style={{ color: 'var(--gray-700)', fontSize: '0.9rem', margin: 0, lineHeight: '1.7' }}>{aiInsight}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   )
// }



import React, { useState, useMemo } from 'react';

import Layout from '../components/Layout';
import api from '../utils/api';

// ==========================================
// 1. DATA CONSTANTS
// ==========================================
const SALARY_DATA = {
  'React Developer': { min: 4, max: 18, avg: 9 },
  'Full Stack Developer': { min: 5, max: 22, avg: 12 },
  'Node.js Developer': { min: 4, max: 16, avg: 8 },
  'Frontend Developer': { min: 3, max: 15, avg: 8 },
  'Backend Developer': { min: 4, max: 18, avg: 10 },
  'Data Analyst': { min: 3, max: 14, avg: 7 },
  'Python Developer': { min: 4, max: 20, avg: 10 },
  'DevOps Engineer': { min: 6, max: 25, avg: 14 },
  'UI/UX Designer': { min: 3, max: 16, avg: 8 },
  'Software Engineer': { min: 4, max: 20, avg: 11 },
  'Machine Learning Engineer': { min: 8, max: 35, avg: 18 },
  'Cloud Engineer': { min: 7, max: 28, avg: 16 },
};

const CITIES = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Delhi NCR', 'Remote'];
const CITY_MULTIPLIER = { 'Bangalore': 1.2, 'Mumbai': 1.15, 'Hyderabad': 1.1, 'Chennai': 1.0, 'Pune': 1.05, 'Delhi NCR': 1.1, 'Remote': 1.0 };
const EXP_MULTIPLIER = { '0-1': 0.7, '1-3': 1.0, '3-5': 1.4, '5-8': 1.8, '8+': 2.5 };
const TIER_MULTIPLIER = { 'Service/Mid': 0.8, 'Product/Startup': 1.2, 'Big Tech/MAANG': 2.2 };

const MAX_CITY_MULT = Math.max(...Object.values(CITY_MULTIPLIER));

export default function SalaryInsights() {
;
  
  // State Management
  const [role, setRole] = useState('Full Stack Developer');
  const [city, setCity] = useState('Bangalore');
  const [experience, setExperience] = useState('1-3');
  const [tier, setTier] = useState('Product/Startup');
  const [aiInsight, setAiInsight] = useState({ text: '', error: false });
  const [loading, setLoading] = useState(false);

  // --- Logic: Derived Data Calculation ---
  const metrics = useMemo(() => {
    // Standardizing the base data lookup
    const base = SALARY_DATA[role] || { min: 4, max: 15, avg: 8 };
    const cMult = CITY_MULTIPLIER[city] || 1;
    const eMult = EXP_MULTIPLIER[experience] || 1;
    const tMult = TIER_MULTIPLIER[tier] || 1;

    const combinedMult = cMult * eMult * tMult;

    return {
      min: (base.min * combinedMult).toFixed(1),
      max: (base.max * combinedMult).toFixed(1),
      avg: (base.avg * combinedMult).toFixed(1),
      base, eMult, tMult
    };
  }, [role, city, experience, tier]);

  const cityComparisons = useMemo(() => {
    return CITIES.map(c => {
      const mult = CITY_MULTIPLIER[c] || 1;
      const avg = (metrics.base.avg * mult * metrics.eMult * metrics.tMult).toFixed(1);
      const pct = Math.round((mult / MAX_CITY_MULT) * 100); 
      return { city: c, avg, pct, isSelected: c === city };
    });
  }, [city, metrics]);

  // --- AI Suggestion Logic ---
  const getAIInsight = async () => {
    setLoading(true);
    setAiInsight({ text: '', error: false });
    
    try {
      const response = await api.post('/api/analysis/skill-gap', {
        jobDescription: `${role} in ${city} with ${experience} years experience at ${tier} tier. Current target: ₹${metrics.max}L.`
      });
      
      setAiInsight({ 
        text: response.data?.insight || "Master System Design and Cloud Architecture to reach the top percentile.", 
        error: false 
      });
    } catch (err) {
      // Fallback Strategy: Professional advice based on seniority
      const fallbacks = {
        '0-1': "Focus on DSA and building 2-3 deep technical projects using the MERN stack.",
        '1-3': "Learn System Design basics and start contributing to technical architecture discussions.",
        '3-5': "Specialize in Cloud (AWS/Azure) and lead feature ownership to command higher pay.",
        '5-8': "Focus on high-level technical strategy and cross-team mentoring for Senior/Staff roles.",
        '8+': "Drive engineering excellence at scale and align tech roadmap with business growth."
      };
      setAiInsight({ text: fallbacks[experience] || "Focus on niche skills and leadership.", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Salary Insights</h2>
        <p className="page-subtitle">Real-time market data based on company tier and location</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* --- LEFT: CONFIGURATION (The Dropdown Boxes) --- */}
        <div className="card">
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1.25rem' }}>Configure Search</h4>
          
          <div className="form-group">
            <label className="form-label">Job Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              {Object.keys(SALARY_DATA).map(r => <option key={r} value={r}>{r}</option>)}
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
              <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)}>
                {Object.keys(EXP_MULTIPLIER).map(e => <option key={e} value={e}>{e} yrs</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Company Tier</label>
              <select className="form-select" value={tier} onChange={e => setTier(e.target.value)}>
                {Object.keys(TIER_MULTIPLIER).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={getAIInsight} disabled={loading}>
            {loading ? '🤖 Analyzing...' : '🤖 Get AI Career Tip'}
          </button>
        </div>

        {/* --- RIGHT: VISUALIZATIONS --- */}
        <div>
          <div className="card" style={{ background: 'var(--navy-900)', color: 'white', marginBottom: '1.5rem', border: 'none' }}>
            <p style={{ opacity: 0.6, fontSize: '0.8rem', margin: '0 0 1rem' }}>{role} • {city} • {tier}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>₹{metrics.min}L</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>MINIMUM</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold-500)' }}>₹{metrics.avg}L</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>AVERAGE</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{metrics.max}L</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>MAXIMUM</div>
              </div>
            </div>

            <div style={{ background: 'var(--navy-800)', borderRadius: '20px', height: '10px', position: 'relative', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '4px', borderRadius: '10px', background: 'linear-gradient(to right, var(--danger), var(--gold-500), var(--success))' }} />
              <div style={{ position: 'absolute', left: '48%', width: '14px', height: '14px', background: 'white', borderRadius: '50%', border: '3px solid var(--gold-500)' }} />
            </div>
          </div>

          {aiInsight.text && (
            <div className="card" style={{ borderLeft: '4px solid var(--gold-500)', background: dark ? 'rgba(255,191,0,0.05)' : '#fffdf2', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>✨ AI Career Recommendation</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--gray-700)', margin: 0 }}>{aiInsight.text}</p>
            </div>
          )}

          <div className="card">
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--navy-800)' }}>Location Comparison (Avg LPA)</h4>
            {cityComparisons.map(data => (
              <div key={data.city} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', width: '80px', color: 'var(--gray-600)' }}>{data.city}</span>
                <div style={{ flex: 1, background: 'var(--gray-100)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${data.pct}%`, height: '100%', background: data.isSelected ? 'var(--gold-500)' : 'var(--navy-500)', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', width: '45px', textAlign: 'right' }}>{data.avg}L</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}