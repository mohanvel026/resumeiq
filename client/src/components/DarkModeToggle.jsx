import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
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