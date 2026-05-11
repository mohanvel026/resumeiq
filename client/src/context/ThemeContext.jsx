import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('resumeiq-theme')
    if (saved === 'dark') {
      setDark(true)
      applyDark(true)
    }
  }, [])

  const applyDark = (isDark) => {
    const r = document.documentElement
    if (isDark) {
      r.style.setProperty('--bg-main', '#0F172A')
      r.style.setProperty('--bg-card', '#1E293B')
      r.style.setProperty('--bg-sidebar', '#020817')
      r.style.setProperty('--bg-navbar', '#020817')
      r.style.setProperty('--bg-input', '#0F172A')
      r.style.setProperty('--text-primary', '#F1F5F9')
      r.style.setProperty('--text-secondary', '#94A3B8')
      r.style.setProperty('--text-muted', '#64748B')
      r.style.setProperty('--text-body', '#CBD5E1')
      r.style.setProperty('--border-color', '#334155')
      r.style.setProperty('--hover-bg', '#334155')
      document.body.style.backgroundColor = '#0F172A'
      document.body.style.color = '#CBD5E1'
    } else {
      r.style.setProperty('--bg-main', '#F8F9FA')
      r.style.setProperty('--bg-card', '#FFFFFF')
      r.style.setProperty('--bg-sidebar', '#0A1628')
      r.style.setProperty('--bg-navbar', '#0A1628')
      r.style.setProperty('--bg-input', '#FFFFFF')
      r.style.setProperty('--text-primary', '#0D1F3C')
      r.style.setProperty('--text-secondary', '#6C757D')
      r.style.setProperty('--text-muted', '#ADB5BD')
      r.style.setProperty('--text-body', '#495057')
      r.style.setProperty('--border-color', '#E9ECEF')
      r.style.setProperty('--hover-bg', '#F1F3F5')
      document.body.style.backgroundColor = '#F8F9FA'
      document.body.style.color = '#495057'
    }
  }

  const toggle = () => {
    const next = !dark
    setDark(next)
    applyDark(next)
    localStorage.setItem('resumeiq-theme', next ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)