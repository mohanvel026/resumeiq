import Layout from '../components/Layout'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../context/ThemeContext'
const scoreHistory = [
  { date: 'Week 1', score: 52 }, { date: 'Week 2', score: 61 },
  { date: 'Week 3', score: 68 }, { date: 'Week 4', score: 74 },
  { date: 'Week 5', score: 79 }, { date: 'Week 6', score: 85 },
]
const appStatus = [
  { name: 'Applied', value: 12, color: '#17A2B8' },
  { name: 'Interviewing', value: 5, color: '#C9A84C' },
  { name: 'Offer', value: 2, color: '#28A745' },
  { name: 'Rejected', value: 3, color: '#DC3545' },
]
const skills = [
  { skill: 'React', count: 8 }, { skill: 'Node.js', count: 7 },
  { skill: 'JavaScript', count: 9 }, { skill: 'MySQL', count: 4 },
  { skill: 'Python', count: 3 }, { skill: 'TypeScript', count: 5 },
]

export default function Analytics() {

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Track your career progress over time</p>
      </div>

      <div className="metric-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Applications', value: '22', sub: '+3 this week' },
          { label: 'Best Resume Score', value: '85', sub: 'Up from 52' },
          { label: 'Interview Rate', value: '32%', sub: '7 of 22 apps' },
          { label: 'Offer Rate', value: '9%', sub: '2 offers received' },
        ].map(m => (
          <div key={m.label} className="metric-card gold-accent">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1.5rem' }}>Resume Score History</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }} />
              <Line type="monotone" dataKey="score" stroke="#C9A84C" strokeWidth={2.5} dot={{ fill: '#C9A84C', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1.5rem' }}>Application Status</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={appStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {appStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h4 style={{ color: 'var(--navy-800)', marginBottom: '1.5rem' }}>Top Skills in Job Listings</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={skills}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="count" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  )
}   