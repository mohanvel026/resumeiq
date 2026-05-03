import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.style.setProperty('--gray-50', '#0f172a')
      document.documentElement.style.setProperty('--white', '#1e293b')
      document.documentElement.style.setProperty('--gray-100', '#1e293b')
      document.documentElement.style.setProperty('--gray-200', '#334155')
      document.documentElement.style.setProperty('--gray-700', '#cbd5e1')
      document.documentElement.style.setProperty('--gray-800', '#e2e8f0')
      document.documentElement.style.setProperty('--gray-900', '#f8fafc')
      document.documentElement.style.setProperty('--gray-600', '#94a3b8')
      document.documentElement.style.setProperty('--gray-500', '#64748b')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.style.setProperty('--gray-50', '#F8F9FA')
      document.documentElement.style.setProperty('--white', '#FFFFFF')
      document.documentElement.style.setProperty('--gray-100', '#F1F3F5')
      document.documentElement.style.setProperty('--gray-200', '#E9ECEF')
      document.documentElement.style.setProperty('--gray-700', '#495057')
      document.documentElement.style.setProperty('--gray-800', '#343A40')
      document.documentElement.style.setProperty('--gray-900', '#212529')
      document.documentElement.style.setProperty('--gray-600', '#6C757D')
      document.documentElement.style.setProperty('--gray-500', '#ADB5BD')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: 'var(--navy-700)',
        border: '1px solid var(--navy-600)',
        borderRadius: '20px',
        padding: '6px 12px',
        cursor: 'pointer',
        color: 'var(--gray-300)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}