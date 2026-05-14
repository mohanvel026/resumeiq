import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/api'

export default function Analytics() {
  const { dark } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analysis/user-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to fetch analytics', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="loading-spinner">Analyzing your data...</div></Layout>

  const interviewRate = stats?.totalApplications > 0 
    ? Math.round((stats.appStatus?.find(s => s.name === 'INTERVIEWING')?.value || 0) / stats.totalApplications * 100)
    : 0

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Advanced Analytics</h2>
        <p className="page-subtitle">AI-powered insights into your career trajectory</p>
      </div>

      <div className="metric-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Market Readiness', value: `${stats?.marketReadiness}%`, sub: 'Based on skills & scores', color: 'var(--gold-500)' },
          { label: 'Best Resume Score', value: stats?.bestScore || 0, sub: 'Target: 85+ for MAANG', color: '#22c55e' },
          { label: 'Interview Rate', value: `${interviewRate}%`, sub: `${stats?.totalApplications || 0} Total Apps`, color: '#3b82f6' },
          { label: 'AI Progress Index', value: stats?.totalAnalyses || 0, sub: 'Total optimizations made', color: '#a855f7' },
        ].map(m => (
          <div key={m.label} className="card" style={{ borderTop: `4px solid ${m.color}`, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0' }}>{m.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
        {/* Score Trend */}
        <div className="card" style={{ minHeight: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Resume Score Trend</h4>
            <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Improving</span>
          </div>
          {stats?.scoreHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#2d3748' : '#f0f0f0'} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--gold-500)' }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--gold-500)" strokeWidth={3} dot={{ fill: 'var(--gold-500)', r: 6, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '5rem' }}>Perform more analyses to see trends</div>}
        </div>

        {/* Application Status */}
        <div className="card" style={{ minHeight: '350px' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Job Funnel Efficiency</h4>
          {stats?.totalApplications > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie data={stats.appStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {stats.appStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width: '40%', paddingLeft: '1rem' }}>
                {stats.appStatus.map(s => (
                  <div key={s.name} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                      {s.name}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', paddingLeft: '16px' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '5rem' }}>Track your first job application</div>}
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        {/* Skill Heatmap */}
        <div className="card" style={{ minHeight: '400px' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Skill Proficiency Matrix</h4>
          {stats?.topSkills?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.topSkills}>
                <PolarGrid stroke={dark ? '#2d3748' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, Math.max(...stats.topSkills.map(s => s.count)) + 1]} tick={false} />
                <Radar name="Skills" dataKey="count" stroke="var(--gold-500)" fill="var(--gold-500)" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '5rem' }}>Analyze resumes to build skill map</div>}
        </div>

        {/* AI Career Pulse */}
        <div className="card" style={{ minHeight: '400px', background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(30,58,95,0.05) 100%)', position: 'relative' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>✨</span> AI Career Pulse
          </h4>
          
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: '700', marginBottom: '8px' }}>CURRENT STANDING</div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              Your profile is currently in the <b>top {100 - (stats?.marketReadiness || 0)}%</b> of candidates in your domain. 
              The recent {stats?.bestScore > 80 ? 'strong' : 'improving'} resume score indicates high technical proficiency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '700' }}>STRENGTH</div>
              <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: '600', marginTop: '4px' }}>
                {stats?.topSkills?.[0]?.skill || 'Consistency'}
              </div>
            </div>
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: '700' }}>OPPORTUNITY</div>
              <div style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: '600', marginTop: '4px' }}>
                Increase Interview Rate
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>Predicted Salary Hike</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--gold-500)', marginTop: '4px' }}>
              {stats?.bestScore > 80 ? '35-50%' : '15-25%'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>*Based on current market demand</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}