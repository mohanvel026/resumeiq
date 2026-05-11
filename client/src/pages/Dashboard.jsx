import { useTheme } from '../context/ThemeContext'
import { getStyles } from '../utils/theme'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { label: 'Upload Resume', icon: '↑', path: '/upload' },
  { label: 'My Resumes', icon: '📄', path: '/resumes' },
  { label: 'Job Listings', icon: '💼', path: '/jobs' },
  { label: 'Tracker', icon: '📋', path: '/tracker' },
  { label: 'Interview Prep', icon: '🎤', path: '/interview' },
  { label: 'Mock Interview', icon: '🤖', path: '/mock-interview' },
  { label: 'Skill Gap', icon: '📈', path: '/skills' },
  { label: 'LinkedIn Check', icon: '🔗', path: '/linkedin' },
  { label: 'Analytics', icon: '📊', path: '/analytics' },
  { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
  { label: 'Profile', icon: '👤', path: '/profile' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const T = getStyles(dark)
  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="page-subtitle">Here's your career progress at a glance</p>
      </div>

      <div className="metric-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Resumes Uploaded', value: '0', sub: 'Upload your first resume' },
          { label: 'Jobs Applied', value: '0', sub: 'Start applying today' },
          { label: 'Best Resume Score', value: '—', sub: 'Analyze a resume first' },
          { label: 'Interviews Scheduled', value: '0', sub: 'Track your progress' },
        ].map(m => (
          <div key={m.label} className="metric-card gold-accent">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <h3 style={{ color: 'var(--navy-900)', marginBottom: '1rem' }}>Quick Actions</h3>
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card card-gold" style={{ cursor: 'pointer' }} onClick={() => navigate('/upload')}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>↑</div>
          <h4 style={{ color: 'var(--gold-500)', marginBottom: '6px' }}>Upload Resume</h4>
          <p style={{ color: 'var(--gray-300)', fontSize: '0.875rem', margin: 0 }}>Get AI-powered resume analysis instantly</p>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/jobs')}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💼</div>
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '6px' }}>Browse Jobs</h4>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Find real-time jobs matching your skills</p>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mock-interview')}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🤖</div>
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '6px' }}>Mock Interview</h4>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Practice with AI interviewer now</p>
        </div>
      </div>

      <h3 style={{ color: 'var(--navy-900)', marginBottom: '1rem' }}>All Features</h3>
      <div className="grid-4">
        {FEATURES.map(item => (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--navy-800)' }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  )
}