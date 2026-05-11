import { useTheme } from '../context/ThemeContext'

export default function DarkModeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button onClick={toggle}
      style={{ background: dark ? '#334155' : '#1E3A5F', border: 'none', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', color: '#E2E8F0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}