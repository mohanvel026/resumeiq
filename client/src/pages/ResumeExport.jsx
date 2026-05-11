import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'
import jsPDF from 'jspdf'

const TEMPLATES = [
  { id: 'iitv', name: 'Academic IITV', desc: 'Section-based with gray boxes — great for freshers', icon: '🎓', preview: 'bg-gray-100' },
  { id: 'harshibar', name: 'Modern Minimal', desc: 'Clean sans-serif with gray dividers — ATS friendly', icon: '⚡', preview: 'bg-white' },
  { id: 'jitin', name: 'Classic Professional', desc: 'Traditional with scshape sections and ruled lines', icon: '👔', preview: 'bg-white' },
  { id: 'twocol', name: 'Two Column Dark', desc: 'Dark header with two-column layout — eye-catching', icon: '🎨', preview: 'bg-navy' },
]

const extractSections = (rawText) => {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
  const sections = { name: '', contact: [], education: [], experience: [], projects: [], skills: [], achievements: [], summary: '' }

  // Extract name (usually first non-empty line)
  sections.name = lines[0] || 'Your Name'

  // Extract contact info (lines with email, phone, linkedin patterns)
  lines.slice(1, 8).forEach(line => {
    if (line.match(/@|linkedin|github|phone|\+91|\d{10}/i)) {
      sections.contact.push(line)
    }
  })

  // Extract sections
  let currentSection = ''
  let currentContent = []

  const sectionKeywords = {
    'education': 'education',
    'experience': 'experience',
    'work': 'experience',
    'projects': 'projects',
    'personal projects': 'projects',
    'skills': 'skills',
    'technical skills': 'skills',
    'achievements': 'achievements',
    'summary': 'summary',
    'objective': 'summary',
    'leadership': 'achievements',
    'extra': 'achievements',
  }

  lines.forEach(line => {
    const lower = line.toLowerCase()
    const matchedSection = Object.keys(sectionKeywords).find(k => lower.includes(k))

    if (matchedSection && line.length < 40) {
      if (currentSection && currentContent.length > 0) {
        sections[sectionKeywords[currentSection]] = [...(sections[sectionKeywords[currentSection]] || []), ...currentContent]
      }
      currentSection = matchedSection
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  })

  // Push last section
  if (currentSection && currentContent.length > 0) {
    const key = sectionKeywords[currentSection]
    if (Array.isArray(sections[key])) {
      sections[key] = [...sections[key], ...currentContent]
    } else {
      sections[key] = currentContent
    }
  }

  return sections
}

const generatePDF = async (template, resume) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const W = 210
  const H = 297
  const margin = 15
  const contentW = W - margin * 2
  const sections = extractSections(resume.rawText || '')

  const addText = (text, x, y, opts = {}) => {
    const { size = 10, bold = false, color = [30, 30, 30], maxW = contentW, align = 'left' } = opts
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(String(text), maxW)
    doc.text(lines, x, y, { align })
    return lines.length * (size * 0.4)
  }

  const drawLine = (x1, y1, x2, y2, color = [200, 200, 200], width = 0.3) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(width)
    doc.line(x1, y1, x2, y2)
  }

  const sectionHeader = (title, y, style = 'default') => {
    if (style === 'box') {
      doc.setFillColor(220, 220, 220)
      doc.rect(margin, y - 4, contentW, 7, 'F')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(title.toUpperCase(), margin + 2, y + 1)
      return y + 7
    } else if (style === 'line') {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(20, 20, 20)
      doc.text(title.toUpperCase(), margin, y)
      drawLine(margin, y + 2, W - margin, y + 2, [150, 150, 150], 0.5)
      return y + 7
    } else if (style === 'scshape') {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(title.toUpperCase(), margin, y)
      drawLine(margin, y + 1.5, W - margin, y + 1.5, [30, 30, 30], 0.3)
      return y + 6
    }
    return y + 6
  }

  // ── TEMPLATE 1: IITV Academic ──
  if (template === 'iitv') {
    // Header with name
    doc.setFillColor(245, 245, 245)
    doc.rect(0, 0, W, 30, 'F')
    addText(sections.name, W / 2, 12, { size: 18, bold: true, color: [10, 10, 10], align: 'center' })
    const contactStr = sections.contact.slice(0, 3).join(' | ')
    addText(contactStr || 'email@example.com | +91-XXXXXXXXXX', W / 2, 20, { size: 9, color: [80, 80, 80], align: 'center' })
    drawLine(margin, 28, W - margin, 28, [100, 100, 100], 0.3)

    let y = 36

    // Education
    if (sections.education.length > 0) {
      y = sectionHeader('Education', y, 'box')
      y += 2
      sections.education.slice(0, 6).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        const isHeading = line.match(/university|college|school|institute|b\.tech|m\.tech|bsc|msc/i)
        addText(line, margin + 2, y, { size: isHeading ? 10 : 9, bold: isHeading, color: isHeading ? [10, 10, 10] : [60, 60, 60] })
        y += isHeading ? 5 : 4
      })
      y += 4
    }

    // Experience
    if (sections.experience.length > 0) {
      y = sectionHeader('Experience', y, 'box')
      y += 2
      sections.experience.slice(0, 12).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
        const isHeading = !isBullet && line.length < 50
        addText((isBullet ? '' : '') + line, margin + (isBullet ? 4 : 2), y, { size: isHeading ? 10 : 9, bold: isHeading, color: isHeading ? [10, 10, 10] : [60, 60, 60], maxW: contentW - 4 })
        y += isHeading ? 5 : 4
      })
      y += 4
    }

    // Projects
    if (sections.projects.length > 0) {
      y = sectionHeader('Personal Projects', y, 'box')
      y += 2
      sections.projects.slice(0, 10).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        const isTitle = line.length < 60 && !line.startsWith('•')
        addText(line, margin + 2, y, { size: isTitle ? 10 : 9, bold: isTitle, color: isTitle ? [10, 10, 10] : [60, 60, 60], maxW: contentW - 4 })
        y += isTitle ? 5 : 4
      })
      y += 4
    }

    // Skills
    if (sections.skills.length > 0) {
      y = sectionHeader('Technical Skills', y, 'box')
      y += 2
      sections.skills.slice(0, 8).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        addText(line, margin + 2, y, { size: 9, color: [50, 50, 50], maxW: contentW - 4 })
        y += 4
      })
    }

    // Achievements
    if (sections.achievements.length > 0) {
      y += 4
      y = sectionHeader('Achievements', y, 'box')
      y += 2
      sections.achievements.slice(0, 5).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        addText(line, margin + 2, y, { size: 9, color: [50, 50, 50], maxW: contentW - 4 })
        y += 4
      })
    }
  }

  // ── TEMPLATE 2: Modern Minimal (Harshibar style) ──
  else if (template === 'harshibar') {
    // Centered header
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 10, 10)
    doc.text(sections.name, W / 2, 18, { align: 'center' })

    const contactStr = sections.contact.join(' | ')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(contactStr || 'email | phone | linkedin', W / 2, 25, { align: 'center' })

    let y = 34

    // Summary
    if (sections.summary) {
      y = sectionHeader('Summary', y, 'line')
      addText(String(sections.summary).slice(0, 200), margin, y, { size: 9, color: [60, 60, 60] })
      y += 10
    }

    // Experience
    if (sections.experience.length > 0) {
      y = sectionHeader('Experience', y, 'line')
      sections.experience.slice(0, 15).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        const isBullet = line.startsWith('•') || line.startsWith('-')
        const isCompany = !isBullet && line.length < 50
        addText(line, margin + (isBullet ? 4 : 0), y, { size: isCompany ? 10.5 : 9, bold: isCompany, color: isCompany ? [10, 10, 10] : [70, 70, 70], maxW: contentW - 4 })
        y += isCompany ? 5.5 : 4.5
      })
      y += 3
    }

    // Projects
    if (sections.projects.length > 0) {
      y = sectionHeader('Projects', y, 'line')
      sections.projects.slice(0, 10).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        const isTitle = line.length < 60
        addText(line, margin, y, { size: isTitle ? 10 : 9, bold: isTitle, color: isTitle ? [10, 10, 10] : [70, 70, 70], maxW: contentW })
        y += isTitle ? 5 : 4.5
      })
      y += 3
    }

    // Education
    if (sections.education.length > 0) {
      y = sectionHeader('Education', y, 'line')
      sections.education.slice(0, 6).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        const isInst = line.match(/university|college|school|institute/i)
        addText(line, margin, y, { size: isInst ? 10 : 9, bold: !!isInst, color: isInst ? [10, 10, 10] : [70, 70, 70] })
        y += isInst ? 5 : 4.5
      })
      y += 3
    }

    // Skills
    if (sections.skills.length > 0) {
      y = sectionHeader('Skills', y, 'line')
      sections.skills.slice(0, 6).forEach(line => {
        if (y > 270) { doc.addPage(); y = 15 }
        addText(line, margin, y, { size: 9, color: [60, 60, 60] })
        y += 4.5
      })
    }
  }

  // ── TEMPLATE 3: Classic Professional (Jitin style) ──
  else if (template === 'jitin') {
    // Simple centered name header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(sections.name, W / 2, 16, { align: 'center' })

    // Contact row
    const contactStr = sections.contact.join('  |  ')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 32, 96)
    doc.text(contactStr || 'email | linkedin | github', W / 2, 23, { align: 'center' })

    drawLine(margin, 26, W - margin, 26, [0, 0, 0], 0.3)

    let y = 33

    // Summary
    if (sections.summary) {
      y = sectionHeader('Summary', y, 'scshape')
      addText(String(sections.summary).slice(0, 300), margin, y, { size: 9.5, color: [40, 40, 40] })
      y += 12
    }

    // Work Experience
    if (sections.experience.length > 0) {
      y = sectionHeader('Work Experience', y, 'scshape')
      sections.experience.slice(0, 15).forEach(line => {
        if (y > 275) { doc.addPage(); y = 15 }
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
        const isRole = !isBullet && line.length < 60
        addText(line, margin + (isBullet ? 5 : 0), y, { size: isRole ? 10 : 9, bold: isRole && !isBullet, color: isRole ? [0, 0, 0] : [60, 60, 60], maxW: contentW - 4 })
        y += isRole ? 5 : 4.5
      })
      y += 4
    }

    // Projects
    if (sections.projects.length > 0) {
      y = sectionHeader('Projects', y, 'scshape')
      sections.projects.slice(0, 10).forEach(line => {
        if (y > 275) { doc.addPage(); y = 15 }
        const isName = line.length < 60
        addText(line, margin, y, { size: isName ? 10 : 9, bold: isName, color: isName ? [0, 0, 0] : [60, 60, 60], maxW: contentW })
        y += isName ? 5 : 4.5
      })
      y += 4
    }

    // Education
    if (sections.education.length > 0) {
      y = sectionHeader('Education', y, 'scshape')
      sections.education.slice(0, 6).forEach(line => {
        if (y > 275) { doc.addPage(); y = 15 }
        addText(line, margin, y, { size: 9.5, color: [40, 40, 40] })
        y += 4.5
      })
      y += 4
    }

    // Skills
    if (sections.skills.length > 0) {
      y = sectionHeader('Skills', y, 'scshape')
      sections.skills.slice(0, 8).forEach(line => {
        if (y > 275) { doc.addPage(); y = 15 }
        addText(line, margin, y, { size: 9.5, color: [40, 40, 40] })
        y += 4.5
      })
    }

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(`Last updated: ${new Date().toLocaleDateString()}`, W - margin, H - 8, { align: 'right' })
  }

  // ── TEMPLATE 4: Two Column Dark (Paracol style) ──
  else if (template === 'twocol') {
    const leftW = 65
    const rightX = leftW + 8
    const rightW = W - rightX - 10

    // Dark header background
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, W, 38, 'F')

    // Name in header
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(248, 250, 252)
    doc.text(sections.name.split(' ')[0] || 'First', 10, 16)

    doc.setTextColor(201, 168, 76)
    doc.text(sections.name.split(' ').slice(1).join(' ') || 'Last', 10 + doc.getTextWidth(sections.name.split(' ')[0] + ' '), 16)

    // Contact in header
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    const contactStr = sections.contact.slice(0, 2).join('  |  ')
    doc.text(contactStr || 'email | phone', 10, 25)

    // Left column background
    doc.setFillColor(30, 41, 59)
    doc.rect(0, 38, leftW + 3, H - 38, 'F')

    let leftY = 48
    let rightY = 48

    // Left column section header
    const leftSection = (title, y) => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(201, 168, 76)
      doc.text(title.toUpperCase(), 6, y)
      doc.setDrawColor(201, 168, 76)
      doc.setLineWidth(0.3)
      doc.line(6, y + 1.5, leftW - 2, y + 1.5)
      return y + 7
    }

    // Left: Education
    if (sections.education.length > 0) {
      leftY = leftSection('Education', leftY)
      sections.education.slice(0, 8).forEach(line => {
        if (leftY > 280) return
        const isInst = line.match(/university|college|school|institute/i)
        doc.setFontSize(isInst ? 8.5 : 7.5)
        doc.setFont('helvetica', isInst ? 'bold' : 'normal')
        doc.setTextColor(isInst ? 240 : 180, isInst ? 240 : 180, isInst ? 240 : 180)
        const wrapped = doc.splitTextToSize(line, leftW - 8)
        doc.text(wrapped, 6, leftY)
        leftY += wrapped.length * 4 + 1
      })
      leftY += 4
    }

    // Left: Skills
    if (sections.skills.length > 0) {
      leftY = leftSection('Skills', leftY)
      sections.skills.slice(0, 10).forEach(line => {
        if (leftY > 280) return
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(200, 200, 200)
        const wrapped = doc.splitTextToSize(line, leftW - 8)
        doc.text(wrapped, 6, leftY)
        leftY += wrapped.length * 4 + 1
      })
      leftY += 4
    }

    // Left: Achievements
    if (sections.achievements.length > 0) {
      leftY = leftSection('Achievements', leftY)
      sections.achievements.slice(0, 5).forEach(line => {
        if (leftY > 280) return
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(200, 200, 200)
        const wrapped = doc.splitTextToSize(line, leftW - 8)
        doc.text(wrapped, 6, leftY)
        leftY += wrapped.length * 4 + 1
      })
    }

    // Right column section header
    const rightSection = (title, y) => {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(title.toUpperCase(), rightX, y)
      doc.setDrawColor(15, 23, 42)
      doc.setLineWidth(0.4)
      doc.line(rightX, y + 1.5, W - 10, y + 1.5)
      return y + 7
    }

    // Right: Experience
    if (sections.experience.length > 0) {
      rightY = rightSection('Experience', rightY)
      sections.experience.slice(0, 15).forEach(line => {
        if (rightY > 280) return
        const isBullet = line.startsWith('•') || line.startsWith('-')
        const isRole = !isBullet && line.length < 60
        doc.setFontSize(isRole ? 9.5 : 8.5)
        doc.setFont('helvetica', isRole ? 'bold' : 'normal')
        doc.setTextColor(isRole ? 15 : 60, isRole ? 23 : 60, isRole ? 42 : 60)
        const wrapped = doc.splitTextToSize(line, rightW - (isBullet ? 4 : 0))
        doc.text(wrapped, rightX + (isBullet ? 4 : 0), rightY)
        rightY += wrapped.length * 4.5 + (isRole ? 1.5 : 0.5)
      })
      rightY += 4
    }

    // Right: Projects
    if (sections.projects.length > 0) {
      rightY = rightSection('Projects', rightY)
      sections.projects.slice(0, 12).forEach(line => {
        if (rightY > 280) return
        const isTitle = line.length < 70
        doc.setFontSize(isTitle ? 9.5 : 8.5)
        doc.setFont('helvetica', isTitle ? 'bold' : 'normal')
        doc.setTextColor(isTitle ? 15 : 60, isTitle ? 23 : 60, isTitle ? 42 : 60)
        const wrapped = doc.splitTextToSize(line, rightW)
        doc.text(wrapped, rightX, rightY)
        rightY += wrapped.length * 4.5 + (isTitle ? 1 : 0.5)
      })
    }
  }

  return doc
}

export default function ResumeExport() {
  const { dark } = useTheme()
  const [resumes, setResumes] = useState([])
  const [selected, setSelected] = useState(null)
  const [resume, setResume] = useState(null)
  const [template, setTemplate] = useState('harshibar')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => {
        setResumes(r.data)
        if (r.data[0]) setSelected(r.data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selected) {
      api.get(`/api/resume/${selected}`)
        .then(r => setResume(r.data))
        .catch(() => {})
    }
  }, [selected])

  const handleGenerate = async () => {
    if (!resume?.rawText) return alert('No resume content found. Make sure the PDF was uploaded and parsed correctly.')
    setGenerating(true)
    try {
      const doc = await generatePDF(template, resume)
      doc.save(`${resume.title || 'resume'}-${template}.pdf`)
      trackActivity('exports')
    } catch (e) {
      alert('PDF generation failed: ' + e.message)
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Export Resume as PDF</h2>
        <p className="page-subtitle">Choose a template — AI extracts your resume content and formats it professionally</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>No resumes found. Upload one first!</p>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>1. Select Resume</h4>
              <select className="form-select" value={selected || ''} onChange={e => setSelected(parseInt(e.target.value))}>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>2. Choose Template</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {TEMPLATES.map(t => (
                  <div key={t.id} onClick={() => setTemplate(t.id)}
                    style={{ padding: '14px', border: `2px solid ${template === t.id ? 'var(--gold-500)' : 'var(--gray-200)'}`, borderRadius: 'var(--border-radius)', cursor: 'pointer', background: template === t.id ? 'rgba(201,168,76,0.06)' : 'white', display: 'flex', gap: '12px', alignItems: 'center', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '1.75rem' }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--navy-800)', fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{t.desc}</div>
                    </div>
                    {template === t.id && <span style={{ color: 'var(--gold-500)', fontSize: '1.2rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleGenerate}
              disabled={generating || !resume}
              style={{ fontSize: '1rem', padding: '14px' }}
            >
              {generating ? '⏳ Generating your PDF...' : '📄 Download PDF'}
            </button>

            <p style={{ color: 'var(--gray-400)', fontSize: '0.8125rem', textAlign: 'center', marginTop: '8px' }}>
              Your resume content is automatically extracted and formatted
            </p>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Resume Content Preview</h4>
            {resume ? (
              <>
                <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['name', 'education', 'experience', 'projects', 'skills'].map(s => {
                    const sections = extractSections(resume.rawText || '')
                    const hasData = Array.isArray(sections[s]) ? sections[s].length > 0 : !!sections[s]
                    return (
                      <span key={s} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: hasData ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.1)', color: hasData ? '#1a7a32' : '#9c1c28', fontWeight: '500' }}>
                        {hasData ? '✓' : '✗'} {s}
                      </span>
                    )
                  })}
                </div>
                <div style={{ background: 'var(--gray-50)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--gray-200)', maxHeight: '450px', overflowY: 'auto', fontSize: '0.8125rem', color: 'var(--gray-700)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {resume.rawText?.slice(0, 2000) || 'No content extracted'}
                  {resume.rawText?.length > 2000 && <span style={{ color: 'var(--gray-400)' }}>{'\n'}... (truncated)</span>}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                Select a resume to preview
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}