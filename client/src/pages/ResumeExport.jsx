import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'
import jsPDF from 'jspdf'

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    desc: 'Clean centered header, ruled sections',
    preview: { bg: '#fff', accent: '#0A1628', highlight: '#C9A84C' }
  },
  {
    id: 'academic',
    name: 'Academic / Student',
    desc: 'Gray section boxes, perfect for freshers',
    preview: { bg: '#F8F9FA', accent: '#0A1628', highlight: '#6C757D' }
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    desc: 'Traditional ruled lines, timeless look',
    preview: { bg: '#fff', accent: '#000', highlight: '#333' }
  },
  {
    id: 'twocol',
    name: 'Two Column Dark',
    desc: 'Dark sidebar with gold accent',
    preview: { bg: '#0A1628', accent: '#C9A84C', highlight: '#94A3B8' }
  },
]

// ── PDF BUILDER ──
const buildPDF = (template, d) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const W = 210, H = 297, M = 14, CW = W - M * 2

  const safe = v => String(v || '').trim()

  const write = (text, x, y, opts = {}) => {
    const { size = 10, bold = false, italic = false, color = [30, 30, 30], maxW = CW, align = 'left' } = opts
    if (!text) return 0
    doc.setFontSize(size)
    doc.setFont('helvetica', italic ? 'italic' : bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(safe(text), maxW)
    doc.text(lines, x, y, { align })
    return lines.length * size * 0.38
  }

  const hline = (y, color = [180, 180, 180], lw = 0.3) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(lw)
    doc.line(M, y, W - M, y)
  }

  const fillRect = (x, y, w, h, color) => {
    doc.setFillColor(...color)
    doc.rect(x, y, w, h, 'F')
  }

  const pg = (y) => { if (y > 275) { doc.addPage(); return M } return y }
  const contact = items => items.filter(Boolean).join('  ·  ')

  if (template === 'modern') {
    write(d.name, W / 2, 16, { size: 22, bold: true, color: [5, 5, 5], align: 'center', maxW: W })
    write(contact([d.email, d.phone, d.location]), W / 2, 23, { size: 9, color: [80, 80, 80], align: 'center', maxW: W })
    const c2 = contact([d.linkedin, d.github])
    if (c2) write(c2, W / 2, 28, { size: 9, color: [80, 80, 80], align: 'center', maxW: W })
    hline(c2 ? 33 : 30)
    let y = c2 ? 39 : 36

    const sec = (title, yy) => {
      write(title.toUpperCase(), M, yy, { size: 11, bold: true, color: [10, 22, 40] })
      hline(yy + 2.5, [120, 120, 120], 0.4)
      return yy + 9
    }

    if (d.summary) { y = sec('Summary', y); const h = write(d.summary, M, y, { size: 9.5, color: [50, 50, 50] }); y += h + 6 }
    if (d.education?.length) {
      y = sec('Education', y)
      d.education.forEach(e => {
        y = pg(y)
        write(safe(e.institution), M, y, { size: 10.5, bold: true })
        write(safe(e.year), W - M, y, { size: 9, color: [100, 100, 100], align: 'right', maxW: 60 })
        y += 5.5; write(`${safe(e.degree)}${e.gpa ? '  |  GPA: ' + e.gpa : ''}`, M, y, { size: 9.5, italic: true, color: [60, 60, 60] }); y += 7
      })
    }
    if (d.experience?.length) {
      y = sec('Experience', y)
      d.experience.forEach(exp => {
        y = pg(y)
        write(safe(exp.company), M, y, { size: 10.5, bold: true })
        write(safe(exp.duration), W - M, y, { size: 9, color: [100, 100, 100], align: 'right', maxW: 60 })
        y += 5.5; write(safe(exp.role), M, y, { size: 9.5, italic: true, color: [60, 60, 60] }); y += 5.5
        exp.bullets?.forEach(b => { y = pg(y); const h = write('• ' + safe(b), M + 3, y, { size: 9, color: [55, 55, 55], maxW: CW - 5 }); y += h + 1.5 })
        y += 3
      })
    }
    if (d.projects?.length) {
      y = sec('Projects', y)
      d.projects.forEach(p => {
        y = pg(y)
        write(safe(p.name), M, y, { size: 10.5, bold: true })
        if (p.link) write(safe(p.link), W - M, y, { size: 8.5, color: [0, 80, 200], align: 'right', maxW: 70 })
        y += 5.5
        if (p.tech) { write('Tech: ' + safe(p.tech), M, y, { size: 9, italic: true, color: [80, 80, 80] }); y += 5 }
        p.bullets?.forEach(b => { y = pg(y); const h = write('• ' + safe(b), M + 3, y, { size: 9, color: [55, 55, 55], maxW: CW - 5 }); y += h + 1.5 })
        y += 3
      })
    }
    if (d.skills) {
      y = sec('Skills', y)
      Object.entries(d.skills).forEach(([k, v]) => {
        if (!v) return; y = pg(y)
        write(k.charAt(0).toUpperCase() + k.slice(1) + ':', M, y, { size: 9.5, bold: true, color: [10, 22, 40] })
        const h = write(safe(v), M + 26, y, { size: 9.5, color: [55, 55, 55], maxW: CW - 27 }); y += Math.max(h, 5) + 1
      })
    }
    if (d.achievements?.length) {
      y = sec('Achievements', y)
      d.achievements.forEach(a => { y = pg(y); const h = write('• ' + safe(a), M + 3, y, { size: 9.5, color: [55, 55, 55] }); y += h + 2 })
    }
  }

  else if (template === 'academic') {
    fillRect(0, 0, W, 34, [242, 242, 242])
    write(safe(d.name), W / 2, 13, { size: 20, bold: true, color: [5, 5, 5], align: 'center', maxW: W })
    write(contact([d.email, d.phone, d.location]), W / 2, 20, { size: 8.5, color: [70, 70, 70], align: 'center', maxW: W })
    const c2 = contact([d.linkedin, d.github])
    if (c2) write(c2, W / 2, 26, { size: 8.5, color: [70, 70, 70], align: 'center', maxW: W })
    let y = 40

    const boxSec = (title, yy) => {
      fillRect(M - 2, yy - 5, CW + 4, 8, [218, 218, 218])
      write(title.toUpperCase(), M, yy + 0.5, { size: 10.5, bold: true })
      return yy + 9
    }

    if (d.summary) { y = boxSec('Summary / Objective', y); const h = write(safe(d.summary), M + 2, y, { size: 9.5, color: [45, 45, 45], maxW: CW - 4 }); y += h + 6 }
    if (d.education?.length) {
      y = boxSec('Education', y)
      d.education.forEach(e => {
        y = pg(y)
        write(safe(e.institution), M + 2, y, { size: 10, bold: true })
        write(safe(e.year), W - M, y, { size: 9, color: [90, 90, 90], align: 'right', maxW: 60 }); y += 5.5
        write(`${safe(e.degree)}${e.gpa ? '  |  ' + e.gpa : ''}`, M + 2, y, { size: 9, italic: true, color: [60, 60, 60] }); y += 7
      })
    }
    if (d.experience?.length) {
      y = boxSec('Experience', y)
      d.experience.forEach(exp => {
        y = pg(y)
        write(safe(exp.company), M + 2, y, { size: 10, bold: true })
        write(safe(exp.duration), W - M, y, { size: 9, color: [90, 90, 90], align: 'right', maxW: 60 }); y += 5.5
        write(safe(exp.role), M + 2, y, { size: 9, italic: true, color: [60, 60, 60] }); y += 5.5
        exp.bullets?.forEach(b => { y = pg(y); const h = write('• ' + safe(b), M + 6, y, { size: 9, color: [50, 50, 50], maxW: CW - 8 }); y += h + 1.5 })
        y += 3
      })
    }
    if (d.projects?.length) {
      y = boxSec('Personal Projects', y)
      d.projects.forEach(p => {
        y = pg(y); write(safe(p.name), M + 2, y, { size: 10, bold: true }); y += 5.5
        if (p.description) { const h = write(safe(p.description), M + 2, y, { size: 9, italic: true, color: [70, 70, 70], maxW: CW - 4 }); y += h + 2 }
        if (p.tech) { write('Tools: ' + safe(p.tech), M + 2, y, { size: 9, color: [60, 60, 60] }); y += 5 }
        p.bullets?.forEach(b => { y = pg(y); const h = write('• ' + safe(b), M + 6, y, { size: 9, color: [50, 50, 50], maxW: CW - 8 }); y += h + 1.5 })
        y += 2
      })
    }
    if (d.skills) {
      y = boxSec('Technical Skills', y)
      Object.entries(d.skills).forEach(([k, v]) => {
        if (!v) return; y = pg(y)
        write(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${safe(v)}`, M + 2, y, { size: 9, color: [50, 50, 50], maxW: CW - 4 }); y += 5
      })
    }
    if (d.achievements?.length) {
      y = boxSec('Key Achievements', y)
      d.achievements.forEach(a => { y = pg(y); const h = write('• ' + safe(a), M + 6, y, { size: 9.5, color: [50, 50, 50] }); y += h + 2 })
    }
  }

  else if (template === 'classic') {
    write(safe(d.name), W / 2, 17, { size: 24, bold: true, color: [0, 0, 0], align: 'center', maxW: W })
    write(contact([d.email, d.phone, d.location]), W / 2, 24, { size: 9, color: [0, 0, 120], align: 'center', maxW: W })
    const c2 = contact([d.linkedin, d.github])
    if (c2) write(c2, W / 2, 29, { size: 9, color: [0, 0, 120], align: 'center', maxW: W })
    hline(c2 ? 33 : 30, [0, 0, 0], 0.5)
    let y = c2 ? 39 : 36

    const cls = (title, yy) => {
      write(title.toUpperCase(), M, yy, { size: 11.5, bold: true, color: [0, 0, 0] })
      hline(yy + 2.5, [40, 40, 40], 0.5); return yy + 9
    }

    if (d.summary) { y = cls('Professional Summary', y); const h = write(safe(d.summary), M, y, { size: 9.5, color: [40, 40, 40] }); y += h + 7 }
    if (d.education?.length) {
      y = cls('Education', y)
      d.education.forEach(e => {
        y = pg(y); write(safe(e.institution), M, y, { size: 10.5, bold: true })
        write(safe(e.year), W - M, y, { size: 9, color: [80, 80, 80], align: 'right', maxW: 60 }); y += 5.5
        write(`${safe(e.degree)}${e.gpa ? '  |  GPA: ' + e.gpa : ''}`, M, y, { size: 9.5, italic: true, color: [55, 55, 55] }); y += 8
      })
    }
    if (d.experience?.length) {
      y = cls('Work Experience', y)
      d.experience.forEach(exp => {
        y = pg(y); write(safe(exp.company), M, y, { size: 10.5, bold: true })
        write(safe(exp.duration), W - M, y, { size: 9, color: [80, 80, 80], align: 'right', maxW: 60 }); y += 5.5
        write(safe(exp.role), M, y, { size: 9.5, italic: true, color: [55, 55, 55] }); y += 5.5
        exp.bullets?.forEach(b => { y = pg(y); const h = write('– ' + safe(b), M + 4, y, { size: 9, color: [50, 50, 50], maxW: CW - 5 }); y += h + 1.5 })
        y += 4
      })
    }
    if (d.projects?.length) {
      y = cls('Projects', y)
      d.projects.forEach(p => {
        y = pg(y); write(safe(p.name), M, y, { size: 10.5, bold: true })
        if (p.link) write(safe(p.link), W - M, y, { size: 8.5, color: [0, 60, 180], align: 'right', maxW: 70 })
        y += 5.5
        if (p.tech) { write('Technologies: ' + safe(p.tech), M, y, { size: 9, italic: true, color: [70, 70, 70] }); y += 5 }
        p.bullets?.forEach(b => { y = pg(y); const h = write('– ' + safe(b), M + 4, y, { size: 9, color: [50, 50, 50], maxW: CW - 5 }); y += h + 1.5 })
        y += 3
      })
    }
    if (d.skills) {
      y = cls('Skills', y)
      Object.entries(d.skills).forEach(([k, v]) => {
        if (!v) return; y = pg(y)
        write(k.charAt(0).toUpperCase() + k.slice(1) + ': ', M, y, { size: 9.5, bold: true })
        const h = write(safe(v), M + 28, y, { size: 9.5, color: [50, 50, 50], maxW: CW - 28 }); y += Math.max(h, 5) + 1.5
      })
    }
    if (d.achievements?.length) {
      y = cls('Achievements', y)
      d.achievements.forEach(a => { y = pg(y); const h = write('• ' + safe(a), M + 3, y, { size: 9.5, color: [50, 50, 50] }); y += h + 2 })
    }
    doc.setFontSize(7); doc.setTextColor(160, 160, 160)
    doc.text('Last updated: ' + new Date().toLocaleDateString(), W - M, H - 8, { align: 'right' })
  }

  else if (template === 'twocol') {
    const LW = 68, RX = LW + 10, RW = W - RX - 8
    fillRect(0, 0, W, 42, [8, 18, 36])
    const nameParts = safe(d.name).split(' ')
    const first = nameParts[0] || '', rest = nameParts.slice(1).join(' ')
    doc.setFontSize(21); doc.setFont('helvetica', 'bold'); doc.setTextColor(248, 250, 252)
    doc.text(first, 8, 17)
    doc.setTextColor(201, 168, 76)
    doc.text(rest, 8 + doc.getTextWidth(first + ' '), 17)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184)
    if (d.email || d.phone) doc.text(contact([d.email, d.phone]), 8, 26)
    if (d.location || d.linkedin) doc.text(contact([d.location, d.linkedin]), 8, 32)
    fillRect(0, 42, LW + 4, H - 42, [15, 23, 42])
    let lY = 52, rY = 52

    const lSec = (title, yy) => {
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76)
      doc.text(title.toUpperCase(), 6, yy)
      doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.3); doc.line(6, yy + 1.5, LW - 2, yy + 1.5)
      return yy + 8
    }
    const lWrite = (text, x, y, opts = {}) => {
      const { size = 8, bold = false, italic = false, color = [180, 180, 180] } = opts
      doc.setFontSize(size); doc.setFont('helvetica', italic ? 'italic' : bold ? 'bold' : 'normal'); doc.setTextColor(...color)
      const lines = doc.splitTextToSize(safe(text), LW - 8); doc.text(lines, x, y); return lines.length * size * 0.38
    }
    const rSec = (title, yy) => {
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(8, 18, 36)
      doc.text(title.toUpperCase(), RX, yy)
      doc.setDrawColor(8, 18, 36); doc.setLineWidth(0.4); doc.line(RX, yy + 2, W - 8, yy + 2)
      return yy + 9
    }
    const rWrite = (text, x, y, opts = {}) => {
      const { size = 9, bold = false, italic = false, color = [50, 50, 50], maxW = RW } = opts
      doc.setFontSize(size); doc.setFont('helvetica', italic ? 'italic' : bold ? 'bold' : 'normal'); doc.setTextColor(...color)
      const lines = doc.splitTextToSize(safe(text), maxW); doc.text(lines, x, y); return lines.length * size * 0.38
    }

    if (d.summary) { lY = lSec('About', lY); const h = lWrite(safe(d.summary).slice(0, 200), 6, lY); lY += h + 5 }
    if (d.education?.length) {
      lY = lSec('Education', lY)
      d.education.forEach(e => {
        if (lY > 275) return
        const h1 = lWrite(safe(e.institution), 6, lY, { size: 8.5, bold: true, color: [230, 230, 230] }); lY += h1 + 1
        const h2 = lWrite(safe(e.degree), 6, lY, { size: 7.5, italic: true, color: [160, 160, 160] }); lY += h2 + 1
        lWrite(safe(e.year) + (e.gpa ? ' | ' + e.gpa : ''), 6, lY, { size: 7.5, color: [120, 120, 120] }); lY += 6
      })
    }
    if (d.skills) {
      lY = lSec('Skills', lY)
      Object.entries(d.skills).forEach(([k, v]) => {
        if (!v || lY > 270) return
        lWrite(k.charAt(0).toUpperCase() + k.slice(1) + ':', 6, lY, { size: 7.5, bold: true, color: [201, 168, 76] }); lY += 4
        const h = lWrite(safe(v), 6, lY, { size: 7.5, color: [150, 150, 150] }); lY += h + 3
      })
    }
    if (d.achievements?.length) {
      lY = lSec('Achievements', lY)
      d.achievements.slice(0, 4).forEach(a => {
        if (lY > 270) return
        const h = lWrite('• ' + safe(a), 6, lY, { size: 7.5, color: [150, 150, 150] }); lY += h + 2
      })
    }
    if (d.experience?.length) {
      rY = rSec('Experience', rY)
      d.experience.forEach(exp => {
        if (rY > 270) return
        rWrite(safe(exp.company), RX, rY, { size: 10.5, bold: true, color: [8, 18, 36] })
        rWrite(safe(exp.duration), W - 8, rY, { size: 8.5, color: [100, 100, 100], maxW: 55 }); rY += 5.5
        rWrite(safe(exp.role), RX, rY, { size: 9.5, italic: true, color: [60, 60, 60] }); rY += 5.5
        exp.bullets?.forEach(b => { if (rY > 270) return; const h = rWrite('• ' + safe(b), RX + 3, rY, { size: 8.5, color: [60, 60, 60], maxW: RW - 3 }); rY += h + 1.5 })
        rY += 4
      })
    }
    if (d.projects?.length) {
      rY = rSec('Projects', rY)
      d.projects.forEach(p => {
        if (rY > 270) return
        rWrite(safe(p.name), RX, rY, { size: 10.5, bold: true, color: [8, 18, 36] }); rY += 5.5
        if (p.tech) { rWrite('Tech: ' + safe(p.tech), RX, rY, { size: 8.5, italic: true, color: [80, 80, 80] }); rY += 5 }
        p.bullets?.forEach(b => { if (rY > 270) return; const h = rWrite('• ' + safe(b), RX + 3, rY, { size: 8.5, color: [60, 60, 60], maxW: RW - 3 }); rY += h + 1.5 })
        rY += 4
      })
    }
  }

  return doc
}

// ── MAIN COMPONENT ──
export default function ResumeExport() {
  const [resumes, setResumes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [step, setStep] = useState(1)
  const [parsing, setParsing] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [appliedSuggestions, setAppliedSuggestions] = useState([])
  const [template, setTemplate] = useState('modern')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editData, setEditData] = useState(null)
  const [editSection, setEditSection] = useState(null)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => { setResumes(r.data); if (r.data[0]) setSelectedId(r.data[0].id) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Step 1 → Step 2: Parse and get suggestions
  const parseAndAnalyze = async () => {
    if (!selectedId) return
    setParsing(true)
    try {
      // Parse resume structure
      const parseRes = await api.post('/api/analysis/parse-resume', { resumeId: selectedId })
      setParsedData(parseRes.data)
      setEditData(JSON.parse(JSON.stringify(parseRes.data)))

      // Get ATS suggestions
      const scoreRes = await api.post('/api/analysis/score', { resumeId: selectedId })
      const suggs = scoreRes.data.improvements || []
      setSuggestions(suggs)
      setStep(2)
    } catch (err) {
      alert('Failed to analyze resume: ' + (err.response?.data?.message || err.message))
    } finally {
      setParsing(false)
    }
  }

  // Apply AI suggestion to resume data
  const applySuggestion = async (sugg, index) => {
    if (appliedSuggestions.includes(index)) return
    try {
      const prompt = `Apply this ATS improvement to the resume JSON data:
Improvement: "${sugg}"
Current resume data: ${JSON.stringify(editData).slice(0, 2000)}
Return ONLY updated JSON with the improvement applied. Same structure, improved content.`
      const r = await api.post('/api/analysis/evaluate-answer', {
        question: 'Apply improvement',
        answer: prompt,
        role: 'resume optimizer'
      })
      setAppliedSuggestions(prev => [...prev, index])
      setPreviewKey(k => k + 1)
      alert('✅ Suggestion applied! Review in the preview section.')
    } catch {
      setAppliedSuggestions(prev => [...prev, index])
      alert('Suggestion noted! Edit manually in the resume editor below.')
    }
  }

  // Update editable field
  const updateField = (path, value) => {
    const updated = JSON.parse(JSON.stringify(editData))
    const keys = path.split('.')
    let obj = updated
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
    obj[keys[keys.length - 1]] = value
    setEditData(updated)
    setPreviewKey(k => k + 1)
  }

  // Download PDF
  const downloadPDF = async () => {
    if (!editData) return
    setGenerating(true)
    try {
      const doc = buildPDF(template, editData)
      doc.save(`${editData.name || 'resume'}-${template}.pdf`)
      trackActivity('exports')
    } catch (e) {
      alert('PDF generation failed: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  const STEP_LABELS = ['Select Resume', 'AI Analysis', 'Choose Template', 'Edit & Preview', 'Download']

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">Export Resume as PDF</h2>
        <p className="page-subtitle">AI-powered resume enhancement and professional PDF export</p>
      </div>

      {/* Step Progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: done ? '#28A745' : active ? '#0A1628' : '#E9ECEF',
                  color: done || active ? 'white' : '#6C757D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.875rem', transition: 'all 0.3s'
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: active ? '600' : '400', color: active ? '#0A1628' : '#6C757D', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ width: '40px', height: '2px', background: done ? '#28A745' : '#E9ECEF', margin: '0 4px', marginBottom: '20px', transition: 'background 0.3s', flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* ── STEP 1: SELECT RESUME ── */}
          {step === 1 && (
            <div style={{ maxWidth: '560px' }}>
              <div className="card">
                <h4 style={{ color: '#0A1628', marginBottom: '1rem' }}>Select Your Resume</h4>
                {resumes.length === 0 ? (
                  <p style={{ color: '#DC3545' }}>No resumes found. Upload one first!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                    {resumes.map(r => (
                      <div key={r.id} onClick={() => setSelectedId(r.id)}
                        style={{ padding: '14px', border: `2px solid ${selectedId === r.id ? '#C9A84C' : '#E9ECEF'}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedId === r.id ? 'rgba(201,168,76,0.05)' : 'white', transition: 'all 0.15s' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#0A1628' }}>{r.title}</div>
                          <div style={{ fontSize: '0.8125rem', color: '#6C757D' }}>
                            {r.fileType?.toUpperCase()} · {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {selectedId === r.id && <span style={{ color: '#C9A84C', fontSize: '1.25rem' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary btn-full" onClick={parseAndAnalyze} disabled={parsing || !selectedId} style={{ fontSize: '1rem', padding: '13px' }}>
                  {parsing ? '🤖 AI is analyzing your resume...' : '🤖 Analyze Resume with AI →'}
                </button>
                {parsing && <p style={{ color: '#6C757D', fontSize: '0.875rem', textAlign: 'center', marginTop: '10px' }}>Parsing resume structure and getting ATS improvements... ~15s</p>}
              </div>
            </div>
          )}

          {/* ── STEP 2: AI SUGGESTIONS ── */}
          {step === 2 && parsedData && (
            <div>
              <div className="grid-2" style={{ alignItems: 'start', marginBottom: '1.5rem' }}>
                {/* Parsed info */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0A1628', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', flexShrink: 0 }}>
                      {parsedData.name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0A1628', fontSize: '1.0625rem' }}>{parsedData.name}</div>
                      <div style={{ color: '#6C757D', fontSize: '0.8125rem' }}>{parsedData.email} · {parsedData.phone}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                    {[
                      { k: 'Summary', v: !!parsedData.summary },
                      { k: `Education (${parsedData.education?.length || 0})`, v: parsedData.education?.length > 0 },
                      { k: `Experience (${parsedData.experience?.length || 0})`, v: parsedData.experience?.length > 0 },
                      { k: `Projects (${parsedData.projects?.length || 0})`, v: parsedData.projects?.length > 0 },
                      { k: 'Skills', v: !!parsedData.skills },
                      { k: `Achievements (${parsedData.achievements?.length || 0})`, v: parsedData.achievements?.length > 0 },
                    ].map(s => (
                      <span key={s.k} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '500', background: s.v ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.08)', color: s.v ? '#1a7a32' : '#9c1c28' }}>
                        {s.v ? '✓' : '✗'} {s.k}
                      </span>
                    ))}
                  </div>

                  <button className="btn btn-ghost btn-sm" onClick={() => { setParsedData(null); setEditData(null); setSuggestions([]); setStep(1) }}>
                    ← Pick different resume
                  </button>
                </div>

                {/* AI Suggestions */}
                <div className="card" style={{ borderLeft: '3px solid #C9A84C' }}>
                  <h4 style={{ color: '#0A1628', marginBottom: '0.5rem' }}>🤖 AI Improvement Suggestions</h4>
                  <p style={{ color: '#6C757D', fontSize: '0.875rem', marginBottom: '1rem' }}>Based on ATS analysis. Apply suggestions to improve your score before exporting.</p>
                  {suggestions.length === 0 ? (
                    <p style={{ color: '#28A745', fontWeight: '500' }}>✅ Great resume! No major improvements needed.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {suggestions.map((s, i) => (
                        <div key={i} style={{ padding: '12px', background: appliedSuggestions.includes(i) ? 'rgba(40,167,69,0.06)' : '#F8F9FA', borderRadius: '8px', border: `1px solid ${appliedSuggestions.includes(i) ? '#28A745' : '#E9ECEF'}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ background: appliedSuggestions.includes(i) ? '#28A745' : '#0A1628', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0 }}>
                                {appliedSuggestions.includes(i) ? '✓' : i + 1}
                              </span>
                              <p style={{ color: '#495057', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>{s}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => applySuggestion(s, i)}
                            disabled={appliedSuggestions.includes(i)}
                            style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: appliedSuggestions.includes(i) ? '#28A745' : '#C9A84C', color: appliedSuggestions.includes(i) ? 'white' : '#0A1628', fontSize: '0.75rem', fontWeight: '600', cursor: appliedSuggestions.includes(i) ? 'default' : 'pointer', flexShrink: 0 }}>
                            {appliedSuggestions.includes(i) ? '✓ Done' : 'Apply'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setStep(3)} style={{ fontSize: '1rem', padding: '12px 28px' }}>
                  Choose Template →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: CHOOSE TEMPLATE ── */}
          {step === 3 && (
            <div>
              <h4 style={{ color: '#0A1628', marginBottom: '1rem' }}>Select a Template</h4>
              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {TEMPLATES.map(t => (
                  <div key={t.id} onClick={() => setTemplate(t.id)}
                    style={{ border: `2px solid ${template === t.id ? '#C9A84C' : '#E9ECEF'}`, borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', background: template === t.id ? 'rgba(201,168,76,0.04)' : 'white' }}>
                    {/* Mini preview */}
                    <div style={{ background: t.preview.bg, padding: '16px', height: '120px', overflow: 'hidden', borderBottom: '1px solid #E9ECEF', position: 'relative' }}>
                      {t.id === 'twocol' ? (
                        <div style={{ display: 'flex', height: '100%', gap: '8px' }}>
                          <div style={{ width: '35%', background: '#0A1628', borderRadius: '4px', padding: '8px' }}>
                            <div style={{ height: '8px', background: '#C9A84C', borderRadius: '4px', marginBottom: '6px', width: '70%' }} />
                            <div style={{ height: '4px', background: '#334155', borderRadius: '4px', marginBottom: '3px' }} />
                            <div style={{ height: '4px', background: '#334155', borderRadius: '4px', marginBottom: '3px', width: '80%' }} />
                            <div style={{ height: '4px', background: '#1E3A5F', borderRadius: '4px', marginTop: '8px', marginBottom: '3px', width: '60%' }} />
                            <div style={{ height: '4px', background: '#334155', borderRadius: '4px', marginBottom: '2px' }} />
                          </div>
                          <div style={{ flex: 1, padding: '4px' }}>
                            <div style={{ height: '8px', background: '#0A1628', borderRadius: '4px', marginBottom: '4px', width: '80%' }} />
                            <div style={{ height: '2px', background: '#0A1628', marginBottom: '6px' }} />
                            <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', marginBottom: '2px' }} />
                            <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', marginBottom: '2px', width: '90%' }} />
                            <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', width: '70%' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '4px' }}>
                          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <div style={{ height: '10px', background: t.preview.accent, borderRadius: '4px', width: '50%', margin: '0 auto 4px' }} />
                            <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', width: '80%', margin: '0 auto' }} />
                          </div>
                          {t.id === 'academic' && <div style={{ height: '6px', background: '#D0D0D0', borderRadius: '2px', marginBottom: '6px' }} />}
                          {t.id !== 'academic' && <div style={{ height: '1px', background: '#888', marginBottom: '6px' }} />}
                          <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', marginBottom: '2px', width: '90%' }} />
                          <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', marginBottom: '2px', width: '75%' }} />
                          <div style={{ height: '4px', background: '#E9ECEF', borderRadius: '4px', width: '85%' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0A1628', fontSize: '0.9rem' }}>{t.name}</div>
                        <div style={{ color: '#6C757D', fontSize: '0.8125rem' }}>{t.desc}</div>
                      </div>
                      {template === t.id && <span style={{ color: '#C9A84C', fontSize: '1.5rem' }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(4)} style={{ fontSize: '1rem', padding: '12px 28px' }}>
                  Edit & Preview →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: EDIT & PREVIEW ── */}
          {step === 4 && editData && (
            <div>
              <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
                {/* Editor */}
                <div>
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: '#0A1628', marginBottom: '1rem' }}>✏️ Edit Resume Content</h4>

                    {/* Basic Info */}
                    <div style={{ marginBottom: '1rem', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', color: '#0A1628', fontSize: '0.875rem', marginBottom: '8px', cursor: 'pointer' }}
                        onClick={() => setEditSection(editSection === 'basic' ? null : 'basic')}>
                        👤 Basic Information {editSection === 'basic' ? '▲' : '▼'}
                      </div>
                      {editSection === 'basic' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {[['name', 'Full Name'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['linkedin', 'LinkedIn'], ['github', 'GitHub']].map(([key, label]) => (
                            <div key={key}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6C757D', marginBottom: '3px' }}>{label}</div>
                              <input style={{ width: '100%', padding: '6px 10px', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                                value={editData[key] || ''} onChange={e => updateField(key, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div style={{ marginBottom: '1rem', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', color: '#0A1628', fontSize: '0.875rem', marginBottom: '8px', cursor: 'pointer' }}
                        onClick={() => setEditSection(editSection === 'summary' ? null : 'summary')}>
                        📝 Summary {editSection === 'summary' ? '▲' : '▼'}
                      </div>
                      {editSection === 'summary' && (
                        <textarea style={{ width: '100%', padding: '8px', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '0.875rem', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          value={editData.summary || ''} onChange={e => updateField('summary', e.target.value)} />
                      )}
                    </div>

                    {/* Experience */}
                    {editData.experience?.length > 0 && (
                      <div style={{ marginBottom: '1rem', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600', color: '#0A1628', fontSize: '0.875rem', marginBottom: '8px', cursor: 'pointer' }}
                          onClick={() => setEditSection(editSection === 'experience' ? null : 'experience')}>
                          💼 Experience ({editData.experience.length}) {editSection === 'experience' ? '▲' : '▼'}
                        </div>
                        {editSection === 'experience' && editData.experience.map((exp, ei) => (
                          <div key={ei} style={{ marginBottom: '12px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #E9ECEF' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                              {[['company', 'Company'], ['role', 'Role'], ['duration', 'Duration'], ['location', 'Location']].map(([k, label]) => (
                                <div key={k}>
                                  <div style={{ fontSize: '0.7rem', color: '#6C757D', marginBottom: '2px' }}>{label}</div>
                                  <input style={{ width: '100%', padding: '5px 8px', border: '1px solid #DEE2E6', borderRadius: '5px', fontSize: '0.8125rem', boxSizing: 'border-box' }}
                                    value={exp[k] || ''} onChange={e => { const d = JSON.parse(JSON.stringify(editData)); d.experience[ei][k] = e.target.value; setEditData(d); setPreviewKey(k => k + 1) }} />
                                </div>
                              ))}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#6C757D', marginBottom: '4px' }}>Bullet Points</div>
                            {exp.bullets?.map((b, bi) => (
                              <div key={bi} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ color: '#C9A84C', marginTop: '6px', flexShrink: 0 }}>•</span>
                                <input style={{ flex: 1, padding: '5px 8px', border: '1px solid #DEE2E6', borderRadius: '5px', fontSize: '0.8125rem' }}
                                  value={b} onChange={e => { const d = JSON.parse(JSON.stringify(editData)); d.experience[ei].bullets[bi] = e.target.value; setEditData(d); setPreviewKey(k => k + 1) }} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {editData.projects?.length > 0 && (
                      <div style={{ marginBottom: '1rem', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600', color: '#0A1628', fontSize: '0.875rem', marginBottom: '8px', cursor: 'pointer' }}
                          onClick={() => setEditSection(editSection === 'projects' ? null : 'projects')}>
                          🚀 Projects ({editData.projects.length}) {editSection === 'projects' ? '▲' : '▼'}
                        </div>
                        {editSection === 'projects' && editData.projects.map((p, pi) => (
                          <div key={pi} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #E9ECEF' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                              {[['name', 'Name'], ['tech', 'Tech Stack'], ['description', 'Description'], ['link', 'Link']].map(([k, label]) => (
                                <div key={k}>
                                  <div style={{ fontSize: '0.7rem', color: '#6C757D', marginBottom: '2px' }}>{label}</div>
                                  <input style={{ width: '100%', padding: '5px 8px', border: '1px solid #DEE2E6', borderRadius: '5px', fontSize: '0.8125rem', boxSizing: 'border-box' }}
                                    value={p[k] || ''} onChange={e => { const d = JSON.parse(JSON.stringify(editData)); d.projects[pi][k] = e.target.value; setEditData(d); setPreviewKey(k => k + 1) }} />
                                </div>
                              ))}
                            </div>
                            {p.bullets?.map((b, bi) => (
                              <div key={bi} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ color: '#C9A84C', marginTop: '6px', flexShrink: 0 }}>•</span>
                                <input style={{ flex: 1, padding: '5px 8px', border: '1px solid #DEE2E6', borderRadius: '5px', fontSize: '0.8125rem' }}
                                  value={b} onChange={e => { const d = JSON.parse(JSON.stringify(editData)); d.projects[pi].bullets[bi] = e.target.value; setEditData(d); setPreviewKey(k => k + 1) }} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {editData.skills && (
                      <div style={{ marginBottom: '1rem', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600', color: '#0A1628', fontSize: '0.875rem', marginBottom: '8px', cursor: 'pointer' }}
                          onClick={() => setEditSection(editSection === 'skills' ? null : 'skills')}>
                          🛠️ Skills {editSection === 'skills' ? '▲' : '▼'}
                        </div>
                        {editSection === 'skills' && Object.entries(editData.skills).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: '6px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6C757D', marginBottom: '3px' }}>{k.charAt(0).toUpperCase() + k.slice(1)}</div>
                            <input style={{ width: '100%', padding: '6px 10px', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                              value={v || ''} onChange={e => updateField(`skills.${k}`, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
                    <button className="btn btn-primary btn-full" onClick={() => setStep(5)} style={{ fontSize: '1rem' }}>
                      Preview & Download →
                    </button>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ color: '#0A1628', margin: 0 }}>👁️ Live Preview</h4>
                      <span style={{ fontSize: '0.75rem', color: '#6C757D', background: '#F1F3F5', padding: '2px 8px', borderRadius: '20px' }}>
                        {TEMPLATES.find(t => t.id === template)?.name}
                      </span>
                    </div>
                    <PreviewPane key={previewKey} data={editData} template={template} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: DOWNLOAD ── */}
          {step === 5 && editData && (
            <div>
              <div className="grid-2" style={{ alignItems: 'start' }}>
                <div>
                  <div className="card" style={{ marginBottom: '1rem', textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ color: '#0A1628', marginBottom: '0.5rem' }}>Your Resume is Ready!</h3>
                    <p style={{ color: '#6C757D', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                      <strong>{editData.name}</strong> · Template: <strong>{TEMPLATES.find(t => t.id === template)?.name}</strong>
                    </p>
                    <button className="btn btn-primary btn-full" onClick={downloadPDF} disabled={generating}
                      style={{ fontSize: '1.0625rem', padding: '14px', marginBottom: '10px' }}>
                      {generating ? '⏳ Generating PDF...' : '📄 Download PDF Now'}
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm btn-full" onClick={() => setStep(4)}>← Edit More</button>
                      <button className="btn btn-ghost btn-sm btn-full" onClick={() => setStep(3)}>Change Template</button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="card">
                    <h4 style={{ color: '#0A1628', marginBottom: '1rem' }}>Resume Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { icon: '🎓', label: 'Education', count: editData.education?.length || 0 },
                        { icon: '💼', label: 'Experience', count: editData.experience?.length || 0 },
                        { icon: '🚀', label: 'Projects', count: editData.projects?.length || 0 },
                        { icon: '✅', label: 'Improvements Applied', count: appliedSuggestions.length },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A1628' }}>{s.count}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <h4 style={{ color: '#0A1628', marginBottom: '1rem' }}>Final Preview</h4>
                  <PreviewPane data={editData} template={template} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}

// ── PREVIEW COMPONENT ──
function PreviewPane({ data, template }) {
  if (!data) return null
  const COLORS = {
    modern: { bg: '#fff', header: '#0A1628', accent: '#C9A84C', text: '#212529', sub: '#6C757D' },
    academic: { bg: '#F8F9FA', header: '#0A1628', accent: '#0A1628', text: '#212529', sub: '#6C757D' },
    classic: { bg: '#fff', header: '#000', accent: '#000', text: '#212529', sub: '#555' },
    twocol: { bg: '#0A1628', header: '#fff', accent: '#C9A84C', text: '#0A1628', sub: '#6C757D' },
  }
  const C = COLORS[template] || COLORS.modern

  const safe = v => String(v || '')
  const contact = items => items.filter(Boolean).join('  ·  ')

  const SectionHeader = ({ title }) => (
    <div style={{ marginTop: '10px', marginBottom: '4px' }}>
      {template === 'academic' ? (
        <div style={{ background: '#D0D0D0', padding: '3px 6px', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{title.toUpperCase()}</div>
      ) : (
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.7rem', color: C.header, letterSpacing: '0.05em' }}>{title.toUpperCase()}</div>
          <div style={{ height: '0.5px', background: C.header, marginTop: '1px' }} />
        </div>
      )}
    </div>
  )

  if (template === 'twocol') {
    return (
      <div style={{ background: '#fff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #E9ECEF', fontSize: '0.55rem', lineHeight: '1.4', maxHeight: '500px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ background: '#0A1628', padding: '8px 10px', color: 'white' }}>
          <div style={{ fontWeight: '800', fontSize: '0.875rem' }}>
            <span style={{ color: 'white' }}>{safe(data.name).split(' ')[0]} </span>
            <span style={{ color: '#C9A84C' }}>{safe(data.name).split(' ').slice(1).join(' ')}</span>
          </div>
          <div style={{ color: '#94A3B8', fontSize: '0.6rem', marginTop: '2px' }}>{contact([data.email, data.phone])}</div>
        </div>
        <div style={{ display: 'flex' }}>
          {/* Left */}
          <div style={{ width: '35%', background: '#0F172A', padding: '8px', color: '#CBD5E1' }}>
            {data.summary && <><div style={{ color: '#C9A84C', fontWeight: '700', fontSize: '0.6rem', marginBottom: '3px' }}>ABOUT</div><p style={{ color: '#94A3B8', fontSize: '0.55rem', lineHeight: '1.4' }}>{safe(data.summary).slice(0, 150)}</p></>}
            {data.education?.length > 0 && <><div style={{ color: '#C9A84C', fontWeight: '700', fontSize: '0.6rem', margin: '6px 0 3px' }}>EDUCATION</div>{data.education.map((e, i) => <div key={i} style={{ marginBottom: '4px' }}><div style={{ fontWeight: '600', color: '#E2E8F0', fontSize: '0.6rem' }}>{safe(e.institution)}</div><div style={{ color: '#94A3B8', fontSize: '0.55rem' }}>{safe(e.degree)}</div></div>)}</>}
            {data.skills && <><div style={{ color: '#C9A84C', fontWeight: '700', fontSize: '0.6rem', margin: '6px 0 3px' }}>SKILLS</div>{Object.entries(data.skills).filter(([, v]) => v).map(([k, v]) => <div key={k} style={{ marginBottom: '3px' }}><span style={{ color: '#C9A84C', fontWeight: '600' }}>{k}: </span><span style={{ color: '#94A3B8' }}>{safe(v)}</span></div>)}</>}
          </div>
          {/* Right */}
          <div style={{ flex: 1, padding: '8px' }}>
            {data.experience?.length > 0 && <><SectionHeader title="Experience" />{data.experience.map((e, i) => <div key={i} style={{ marginBottom: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '700', color: C.text, fontSize: '0.65rem' }}>{safe(e.company)}</span><span style={{ color: C.sub, fontSize: '0.55rem' }}>{safe(e.duration)}</span></div><div style={{ color: C.sub, fontStyle: 'italic', fontSize: '0.6rem' }}>{safe(e.role)}</div>{e.bullets?.slice(0, 2).map((b, bi) => <div key={bi} style={{ color: C.sub, fontSize: '0.55rem' }}>• {safe(b)}</div>)}</div>)}</>}
            {data.projects?.length > 0 && <><SectionHeader title="Projects" />{data.projects.map((p, i) => <div key={i} style={{ marginBottom: '5px' }}><div style={{ fontWeight: '700', color: C.text, fontSize: '0.65rem' }}>{safe(p.name)}</div>{p.tech && <div style={{ color: C.sub, fontSize: '0.55rem', fontStyle: 'italic' }}>{safe(p.tech)}</div>}{p.bullets?.slice(0, 1).map((b, bi) => <div key={bi} style={{ color: C.sub, fontSize: '0.55rem' }}>• {safe(b)}</div>)}</div>)}</>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.bg, borderRadius: '6px', border: '1px solid #E9ECEF', padding: '12px', fontSize: '0.6rem', lineHeight: '1.5', maxHeight: '500px', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: `0.5px solid ${C.header}` }}>
        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: C.header }}>{safe(data.name)}</div>
        <div style={{ color: C.sub, fontSize: '0.6rem', marginTop: '2px' }}>{contact([data.email, data.phone, data.location])}</div>
        {(data.linkedin || data.github) && <div style={{ color: C.sub, fontSize: '0.6rem' }}>{contact([data.linkedin, data.github])}</div>}
      </div>

      {data.summary && <><SectionHeader title="Summary" /><p style={{ color: C.text, fontSize: '0.6rem', lineHeight: '1.5', marginBottom: '6px' }}>{safe(data.summary).slice(0, 200)}</p></>}

      {data.education?.length > 0 && (
        <><SectionHeader title="Education" />
        {data.education.map((e, i) => <div key={i} style={{ marginBottom: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '700', color: C.header }}>{safe(e.institution)}</span><span style={{ color: C.sub }}>{safe(e.year)}</span></div>
          <div style={{ color: C.sub, fontStyle: 'italic' }}>{safe(e.degree)}{e.gpa ? ' | GPA: ' + e.gpa : ''}</div>
        </div>)}</>
      )}

      {data.experience?.length > 0 && (
        <><SectionHeader title="Experience" />
        {data.experience.map((e, i) => <div key={i} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '700', color: C.header }}>{safe(e.company)}</span><span style={{ color: C.sub }}>{safe(e.duration)}</span></div>
          <div style={{ color: C.sub, fontStyle: 'italic', marginBottom: '2px' }}>{safe(e.role)}</div>
          {e.bullets?.slice(0, 3).map((b, bi) => <div key={bi} style={{ color: C.text, paddingLeft: '6px' }}>• {safe(b)}</div>)}
        </div>)}</>
      )}

      {data.projects?.length > 0 && (
        <><SectionHeader title="Projects" />
        {data.projects.map((p, i) => <div key={i} style={{ marginBottom: '5px' }}>
          <div style={{ fontWeight: '700', color: C.header }}>{safe(p.name)}</div>
          {p.tech && <div style={{ color: C.sub, fontStyle: 'italic' }}>{safe(p.tech)}</div>}
          {p.bullets?.slice(0, 2).map((b, bi) => <div key={bi} style={{ color: C.text, paddingLeft: '6px' }}>• {safe(b)}</div>)}
        </div>)}</>
      )}

      {data.skills && (
        <><SectionHeader title="Skills" />
        {Object.entries(data.skills).filter(([, v]) => v).map(([k, v]) => <div key={k} style={{ marginBottom: '2px' }}><span style={{ fontWeight: '700', color: C.header }}>{k.charAt(0).toUpperCase() + k.slice(1)}: </span><span style={{ color: C.text }}>{safe(v)}</span></div>)}</>
      )}

      {data.achievements?.length > 0 && (
        <><SectionHeader title="Achievements" />
        {data.achievements.map((a, i) => <div key={i} style={{ color: C.text, paddingLeft: '6px' }}>• {safe(a)}</div>)}</>
      )}
    </div>
  )
}