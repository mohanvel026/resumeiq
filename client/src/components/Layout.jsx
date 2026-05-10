import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--gray-50)',
      color: 'var(--gray-900)',
    }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{
          flex: 1,
          marginLeft: '240px',
          padding: '2rem',
          minHeight: 'calc(100vh - 64px)',
          background: 'var(--gray-50)',
          color: 'var(--gray-900)',
          transition: 'all 0.3s',
        }}
          className="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  )
}