import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Check saved preference on mount
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.style.backgroundColor = '#0F172A'
    }
  }, [])

  const toggle = () => {
    const newDark = !dark
    setDark(newDark)
    if (newDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.style.backgroundColor = '#0F172A'
      document.body.style.color = '#E2E8F0'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button onClick={toggle} style={{ background: dark ? '#334155' : '#1E3A5F', border: 'none', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', color: '#E2E8F0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}