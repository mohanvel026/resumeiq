import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useTheme } from '../context/ThemeContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { dark } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0F172A' : '#F8F9FA', color: dark ? '#CBD5E1' : '#495057', transition: 'background 0.3s, color 0.3s' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ display: 'flex', paddingTop: '64px' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{ flex: 1, marginLeft: '240px', padding: '2rem', minHeight: 'calc(100vh - 64px)', background: dark ? '#0F172A' : '#F8F9FA', transition: 'background 0.3s' }}>
          {children}
        </main>
      </div>
    </div>
  )
}