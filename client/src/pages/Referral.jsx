import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Referral() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const referralCode = `RESUMEIQ-${user?.id || '000'}-${user?.name?.replace(/\s/g, '').toUpperCase().slice(0, 4) || 'USER'}`
  const referralLink = `https://resumeiq-three.vercel.app/register?ref=${referralCode}`

  const copy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = (platform) => {
    const msg = `I'm using ResumeIQ to optimize my resume with AI! Get real ATS scores, job matching, and mock interviews. Sign up free: ${referralLink}`
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(msg)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`,
    }
    window.open(urls[platform], '_blank')
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Refer a Friend</h2>
        <p className="page-subtitle">Share ResumeIQ and help your friends land their dream jobs</p>
      </div>

      <div style={{ maxWidth: '700px' }}>
        <div className="card" style={{ background: 'var(--navy-900)', marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
          <h3 style={{ color: 'var(--gold-500)', marginBottom: '0.5rem' }}>Invite Friends, Help Their Career!</h3>
          <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
            Share your unique referral link. Every friend who signs up helps build our community of job seekers.
          </p>
          <div style={{ background: 'var(--navy-800)', borderRadius: 'var(--border-radius)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <code style={{ color: 'var(--gold-500)', fontSize: '0.875rem', wordBreak: 'break-all', textAlign: 'left' }}>{referralLink}</code>
            <button className="btn btn-primary btn-sm" onClick={copy} style={{ flexShrink: 0 }}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => share('whatsapp')} style={{ padding: '8px 16px', borderRadius: '8px', background: '#25D366', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
              📱 WhatsApp
            </button>
            <button onClick={() => share('linkedin')} style={{ padding: '8px 16px', borderRadius: '8px', background: '#0077B5', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
              💼 LinkedIn
            </button>
            <button onClick={() => share('twitter')} style={{ padding: '8px 16px', borderRadius: '8px', background: '#1DA1F2', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
              🐦 Twitter
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Your Referral Code</h4>
          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--border-radius)', padding: '1rem', textAlign: 'center', border: '1px dashed var(--gray-300)' }}>
            <code style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--navy-800)', letterSpacing: '2px' }}>{referralCode}</code>
          </div>
        </div>

        <div className="grid-3">
          {[
            { icon: '📤', title: 'Share', desc: 'Send your link to friends who are job hunting' },
            { icon: '✅', title: 'They Sign Up', desc: 'Friend creates a free account using your link' },
            { icon: '🎉', title: 'Both Win!', desc: 'You help a friend improve their career journey' },
          ].map(s => (
            <div key={s.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '4px', fontSize: '0.9rem' }}>{s.title}</h4>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}