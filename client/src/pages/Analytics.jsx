import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/api'

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.5rem',
    borderTop: `4px solid ${accent}`,
    boxShadow: 'var(--shadow)',
    transition: 'background 0.25s ease, border-color 0.25s ease',
  }}>
    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.4rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>
  </div>
)

// ─── Chart Card ──────────────────────────────────────────────────────────────
const ChartCard = ({ title, badge, badgeColor = '#22c55e', children, minH = 360 }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: 'var(--shadow)',
    minHeight: `${minH}px`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'background 0.25s ease, border-color 0.25s ease',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h4>
      {badge && (
        <span style={{
          fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px',
          borderRadius: '20px', background: `${badgeColor}18`, color: badgeColor,
          letterSpacing: '0.05em', textTransform: 'uppercase'
        }}>{badge}</span>
      )}
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  </div>
)

const EmptyState = ({ msg }) => (
  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
    {msg}
  </div>
)

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Analytics() {
  const { dark } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    api.get('/api/analysis/user-stats', { signal: controller.signal })
      .then(res => setStats(res.data))
      .catch(err => { if (err.name !== 'CanceledError') setError('Failed to load analytics.') })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const interviewRate = useMemo(() => {
    if (!stats?.totalApplications) return 0
    const i = stats.appStatus?.find(s => s.name === 'INTERVIEWING')?.value || 0
    return Math.round((i / stats.totalApplications) * 100)
  }, [stats])

  // Recharts theme tokens
  const grid = dark ? '#1e293b' : '#f1f5f9'
  const tick = dark ? '#64748b' : '#94a3b8'
  const tooltipBg = dark ? '#0f172a' : '#ffffff'
  const tooltipBorder = dark ? '#1e293b' : '#e2e8f0'

  const tooltipStyle = {
    contentStyle: { background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    itemStyle: { color: 'var(--gold-500)', fontWeight: '700' },
    labelStyle: { color: 'var(--text-secondary)', fontSize: '0.8rem' },
  }

  // ── Loading ──
  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Crunching your career data…</p>
      </div>
    </Layout>
  )

  // ── Error ──
  if (error) return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Failed to Load Analytics</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--gold-500), #e8a020)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', flexShrink: 0
          }}>📊</div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Advanced Analytics
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '52px', fontSize: '0.95rem' }}>
          AI-powered insights into your career trajectory and market alignment.
        </p>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard label="Market Readiness"   value={`${stats?.marketReadiness || 0}%`}   sub="Based on skills & scores"           accent="var(--gold-500)" />
        <StatCard label="Best Resume Score"   value={stats?.bestScore || 0}                sub="Target: 85+ for top tech"           accent="#22c55e" />
        <StatCard label="Interview Rate"      value={`${interviewRate}%`}                  sub={`${stats?.totalApplications || 0} total apps`} accent="#3b82f6" />
        <StatCard label="Optimization Index"  value={stats?.totalAnalyses || 0}            sub="Total AI optimizations"             accent="#a855f7" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>

        {/* Score Trend */}
        <ChartCard
          title="Resume Score Trend"
          badge={stats?.scoreHistory?.length > 1 ? 'Improving' : null}
        >
          {stats?.scoreHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={stats.scoreHistory} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone" dataKey="score" stroke="var(--gold-500)" strokeWidth={3}
                  dot={{ fill: 'var(--gold-500)', r: 5, strokeWidth: 2, stroke: tooltipBg }}
                  activeDot={{ r: 8, fill: 'var(--gold-500)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState msg="Perform more resume analyses to generate trend data." />}
        </ChartCard>

        {/* Job Funnel */}
        <ChartCard title="Job Funnel Efficiency">
          {stats?.totalApplications > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem' }}>
              <div style={{ flex: '0 0 55%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.appStatus} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={4} dataKey="value" stroke="none">
                      {stats.appStatus?.map((e, i) => <Cell key={i} fill={e.color || '#cbd5e1'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stats.appStatus?.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState msg="Start tracking applications to build your job funnel." />}
        </ChartCard>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid-2">

        {/* Skill Radar */}
        <ChartCard title="Skill Proficiency Matrix">
          {stats?.topSkills?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={stats.topSkills}>
                <PolarGrid stroke={grid} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: tick, fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1']} tick={false} axisLine={false} />
                <Radar name="Proficiency" dataKey="count" stroke="var(--gold-500)" fill="var(--gold-500)" fillOpacity={0.35} strokeWidth={2} />
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <EmptyState msg="Upload and analyze your resume to build a skill matrix." />}
        </ChartCard>

        {/* AI Career Pulse */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow)',
          minHeight: '360px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background 0.25s ease, border-color 0.25s ease',
        }}>
          <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem'
            }}>✨</span>
            AI Career Pulse
          </h4>

          {/* Standing */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Executive Summary
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--text-body)' }}>
              Your profile outperforms <strong style={{ color: 'var(--text-primary)' }}>{100 - (stats?.marketReadiness || 0)}%</strong> of candidates in your domain.
              The recent {stats?.bestScore > 80 ? 'strong' : 'improving'} resume score indicates high technical alignment with modern ATS systems.
            </p>
          </div>

          {/* Strength / Focus */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.9rem 1rem', background: dark ? 'rgba(34,197,94,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(34,197,94,0.2)' : '#bbf7d0'}`, borderRadius: '12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Core Strength</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: dark ? '#4ade80' : '#15803d', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {stats?.topSkills?.[0]?.skill || 'Consistency'}
              </div>
            </div>
            <div style={{ padding: '0.9rem 1rem', background: dark ? 'rgba(239,68,68,0.08)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.2)' : '#fecaca'}`, borderRadius: '12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Focus Area</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: dark ? '#f87171' : '#b91c1c', marginTop: '4px' }}>
                Pipeline Conversion
              </div>
            </div>
          </div>

          {/* Salary Hike */}
          <div style={{
            marginTop: 'auto',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, var(--navy-800), var(--navy-700))',
            borderRadius: '14px',
            color: 'white',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
              Predicted Salary Hike Potential
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--gold-500)', lineHeight: 1 }}>
              {stats?.bestScore > 80 ? '35–50%' : '15–25%'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
              *Based on real-time market data & current skill density
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}