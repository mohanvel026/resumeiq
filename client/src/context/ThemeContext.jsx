import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ dark: false, toggle: () => {} })

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('resumeiq-theme') === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('resumeiq-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('resumeiq-theme', 'light')
    }
  }, [dark])

  const toggle = () => setDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeContext