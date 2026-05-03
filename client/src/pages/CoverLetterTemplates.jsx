import { useState } from 'react'
import Layout from '../components/Layout'

const TEMPLATES = [
  {
    id: 'formal',
    name: 'Formal Professional',
    desc: 'Traditional format for corporate roles',
    icon: '👔',
    content: (name, role, company) => `Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With my background in software development and passion for building scalable solutions, I believe I would be a valuable addition to your team.

Throughout my career, I have consistently delivered high-quality results while collaborating effectively with cross-functional teams. My technical expertise, combined with my ability to communicate complex concepts clearly, makes me well-suited for this role.

I am particularly drawn to ${company} because of its reputation for innovation and excellence. I am confident that my skills and experience align well with your requirements, and I look forward to the opportunity to contribute to your team's success.

Thank you for considering my application. I welcome the opportunity to discuss how my background and skills would benefit ${company}.

Sincerely,
${name}`
  },
  {
    id: 'creative',
    name: 'Creative Modern',
    desc: 'Bold and engaging for startups',
    icon: '🎨',
    content: (name, role, company) => `Hi there!

I'm ${name}, and I'm excited about the ${role} opportunity at ${company}. When I came across this role, I knew immediately it was a perfect fit.

Here's what I bring to the table:
- A track record of building products users actually love
- The ability to move fast without breaking things
- A collaborative spirit and genuine passion for solving problems

I've been following ${company}'s journey and I'm genuinely impressed by your approach to building products that matter. I'd love nothing more than to bring my skills to your team and help push the mission forward.

Let's chat! I'm ready to hit the ground running.

Best,
${name}`
  },
  {
    id: 'technical',
    name: 'Technical Expert',
    desc: 'Skills-focused for engineering roles',
    icon: '⚡',
    content: (name, role, company) => `Dear ${company} Engineering Team,

I am applying for the ${role} position with 3+ years of hands-on experience in full-stack development, system design, and cloud infrastructure.

Technical Highlights:
- Proficient in React, Node.js, Python, and MySQL/PostgreSQL
- Experience with AWS/GCP, Docker, and CI/CD pipelines  
- Strong background in RESTful API design and microservices
- Proven track record of optimizing performance and scalability

My most relevant projects include building high-traffic web applications, implementing real-time features using WebSockets, and leading technical migrations that improved system reliability.

I am particularly interested in ${company}'s technical challenges and would welcome the opportunity to discuss how my expertise can contribute to your engineering goals.

Best regards,
${name}`
  },
  {
    id: 'entry',
    name: 'Entry Level',
    desc: 'Perfect for fresh graduates',
    icon: '🎓',
    content: (name, role, company) => `Dear Hiring Manager,

I am a recent graduate eager to begin my career as a ${role} at ${company}. While I may be early in my professional journey, I bring strong foundational skills, a passion for learning, and a drive to make meaningful contributions.

During my studies and personal projects, I have:
- Built multiple full-stack web applications using modern technologies
- Contributed to open-source projects and collaborated with development teams
- Consistently taught myself new skills and technologies independently

I am particularly excited about ${company} because it represents the kind of forward-thinking environment where I can grow rapidly while contributing real value from day one.

I would be grateful for the opportunity to prove myself. Thank you for considering my application.

Sincerely,
${name}`
  },
  {
    id: 'career_change',
    name: 'Career Changer',
    desc: 'Transitioning from another field',
    icon: '🔄',
    content: (name, role, company) => `Dear Hiring Manager,

I am writing to apply for the ${role} role at ${company}. After years in a different field, I have made a deliberate and passionate transition into software development, and I am excited to bring a unique perspective to your team.

What makes my background valuable:
- Transferable skills in problem-solving, project management, and communication
- Self-taught programming with real projects deployed in production
- Ability to bridge technical and non-technical stakeholders
- Fresh perspective unconstrained by "that's how we've always done it"

I chose to pivot because I discovered a genuine passion for building technology that solves real problems. I have invested significant time in developing my technical skills, and I am confident in my ability to contribute effectively as a ${role}.

I would love to discuss how my unique background could be an asset to ${company}.

Sincerely,
${name}`
  },
]

export default function CoverLetterTemplates() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  const generated = selected ? selected.content(name || 'Your Name', role || 'Software Developer', company || 'Your Company') : ''

  const copy = () => {
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([generated], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${selected?.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Cover Letter Templates</h2>
        <p className="page-subtitle">5 professional templates — customize and download instantly</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Your Details</h4>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="e.g. Mohan Vel" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input className="form-input" placeholder="e.g. Full Stack Developer" value={role} onChange={e => setRole(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
          </div>

          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Choose Template</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TEMPLATES.map(t => (
              <div key={t.id}
                onClick={() => setSelected(t)}
                style={{ padding: '12px', border: `2px solid ${selected?.id === t.id ? 'var(--gold-500)' : 'var(--gray-200)'}`, borderRadius: 'var(--border-radius)', cursor: 'pointer', background: selected?.id === t.id ? 'rgba(201,168,76,0.05)' : 'white', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--navy-800)', fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ color: 'var(--navy-800)', margin: 0 }}>{selected.icon} {selected.name}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓ Copied!' : 'Copy'}</button>
                  <button className="btn btn-primary btn-sm" onClick={download}>Download</button>
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-700)', lineHeight: '1.8', fontSize: '0.9rem', background: 'var(--gray-50)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--gray-200)', minHeight: '400px' }}>
                {generated}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>Select a Template</h3>
              <p style={{ color: 'var(--gray-500)' }}>Choose a template from the left to preview and customize it</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}