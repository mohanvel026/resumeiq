import { useEffect, useState } from 'react'

const applyTheme = (isDark) => {
  const html = document.documentElement
  if (isDark) {
    html.setAttribute('data-theme', 'dark')
    document.body.style.backgroundColor = '#0F172A'
    document.body.style.color = '#E2E8F0'
  } else {
    html.removeAttribute('data-theme')
    document.body.style.backgroundColor = ''
    document.body.style.color = ''
  }
  localStorage.setItem('resumeiq-theme', isDark ? 'dark' : 'light')
}

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('resumeiq-theme') === 'dark')

  useEffect(() => {
    applyTheme(dark)
  }, [dark])

  return (
    <button onClick={() => setDark(d => !d)}
      style={{ background: dark ? '#334155' : '#1E3A5F', border: 'none', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', color: '#E2E8F0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}