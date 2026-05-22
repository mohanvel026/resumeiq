import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'
import jsPDF from 'jspdf'

// ─────────────────────────────────────────
// PDF ENGINE — TRUE MULTI-PAGE SUPPORT
// ─────────────────────────────────────────
class PDFEngine {
  constructor(template) {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.template = template
    this.W = 210
    this.H = 297
    this.M = 14
    this.CW = 210 - 14 * 2
    this.y = 0
    this.pageNum = 1
  }

  safe(v) { return String(v || '').trim() }

  text(str, x, y, opts = {}) {
    const { size = 10, bold = false, italic = false, color = [30,30,30], maxW, align = 'left' } = opts
    if (!str || !this.safe(str)) return 0
    const w = maxW !== undefined ? maxW : (this.W - x - this.M + 14)
    this.doc.setFontSize(size)
    this.doc.setFont('helvetica', italic ? 'italic' : bold ? 'bold' : 'normal')
    this.doc.setTextColor(...color)
    const lines = this.doc.splitTextToSize(this.safe(str), w)
    this.doc.text(lines, x, y, { align })
    return lines.length * size * 0.38
  }

  hline(y, color = [180,180,180], lw = 0.3) {
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(lw)
    this.doc.line(this.M, y, this.W - this.M, y)
  }

  rect(x, y, w, h, color) {
    this.doc.setFillColor(...color)
    this.doc.rect(x, y, w, h, 'F')
  }

  need(space) {
    if (this.y + space > 283) {
      this.doc.addPage()
      this.pageNum++
      this.y = 16
      return true
    }
    return false
  }

  contact(items) { return items.filter(Boolean).join('  ·  ') }

  build(d) {
    if (this.template === 'modern') this.buildModern(d)
    else if (this.template === 'academic') this.buildAcademic(d)
    else if (this.template === 'classic') this.buildClassic(d)
    else if (this.template === 'minimal') this.buildMinimal(d)
    else if (this.template === 'twocol') this.buildTwoCol(d)
    return this.doc
  }

  buildModern(d) {
    this.y = 16
    this.text(d.name, this.W/2, this.y, { size:22, bold:true, color:[5,5,5], align:'center', maxW:this.W })
    this.y += 8
    const c1 = this.contact([d.email, d.phone, d.location])
    this.text(c1, this.W/2, this.y, { size:9, color:[80,80,80], align:'center', maxW:this.W })
    this.y += 5
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) { this.text(c2, this.W/2, this.y, { size:9, color:[80,80,80], align:'center', maxW:this.W }); this.y += 5 }
    this.hline(this.y); this.y += 7

    const sec = (title) => {
      this.need(16)
      this.text(title.toUpperCase(), this.M, this.y, { size:11, bold:true, color:[10,22,40] })
      this.hline(this.y + 2.5, [120,120,120], 0.4)
      this.y += 9
    }
    this._sections(d, sec, { bc:'• ', bi:3, hs:10.5, ss:9.5, bs:9, ind:0 })
  }

  buildAcademic(d) {
    this.rect(0, 0, this.W, 34, [240,240,240])
    this.text(this.safe(d.name), this.W/2, 13, { size:20, bold:true, color:[5,5,5], align:'center', maxW:this.W })
    this.text(this.contact([d.email, d.phone, d.location]), this.W/2, 20, { size:8.5, color:[70,70,70], align:'center', maxW:this.W })
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) this.text(c2, this.W/2, 26, { size:8.5, color:[70,70,70], align:'center', maxW:this.W })
    this.y = 40

    const sec = (title) => {
      this.need(14)
      this.rect(this.M-2, this.y-5, this.CW+4, 8, [215,215,215])
      this.text(title.toUpperCase(), this.M, this.y+0.5, { size:10.5, bold:true, color:[5,5,5] })
      this.y += 9
    }
    this._sections(d, sec, { bc:'• ', bi:6, hs:10, ss:9, bs:9, ind:2 })
  }

  buildClassic(d) {
    this.y = 17
    this.text(this.safe(d.name), this.W/2, this.y, { size:24, bold:true, color:[0,0,0], align:'center', maxW:this.W })
    this.y += 9
    this.text(this.contact([d.email, d.phone, d.location]), this.W/2, this.y, { size:9, color:[0,0,120], align:'center', maxW:this.W })
    this.y += 5
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) { this.text(c2, this.W/2, this.y, { size:9, color:[0,0,120], align:'center', maxW:this.W }); this.y += 5 }
    this.hline(this.y, [0,0,0], 0.5); this.y += 8

    const sec = (title) => {
      this.need(14)
      this.text(title.toUpperCase(), this.M, this.y, { size:11.5, bold:true, color:[0,0,0] })
      this.hline(this.y + 2.5, [40,40,40], 0.5); this.y += 9
    }
    this._sections(d, sec, { bc:'– ', bi:4, hs:10.5, ss:9.5, bs:9, ind:0 })
    this.doc.setFontSize(7); this.doc.setTextColor(160,160,160)
    this.doc.text('Updated: ' + new Date().toLocaleDateString(), this.W - this.M, 292, { align:'right' })
  }

  buildMinimal(d) {
    this.y = 18
    this.text(d.name, this.M, this.y, { size:20, bold:true, color:[0,0,0] })
    this.y += 7
    this.text(this.contact([d.email, d.phone, d.location]), this.M, this.y, { size:9, color:[100,100,100] })
    this.y += 5
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) { this.text(c2, this.M, this.y, { size:9, color:[100,100,100] }); this.y += 5 }
    this.hline(this.y, [0,0,0], 0.8); this.y += 8

    const sec = (title) => {
      this.need(14)
      this.text(title, this.M, this.y, { size:10, bold:true, color:[0,0,0] })
      this.y += 6
    }
    this._sections(d, sec, { bc:'  ', bi:0, hs:10, ss:9, bs:9, ind:0 })
  }

  buildTwoCol(d) {
    const LW = 68, RX = LW + 10, RW = this.W - RX - 8

    this.rect(0, 0, this.W, 40, [8,18,36])
    const parts = this.safe(d.name).split(' ')
    const first = parts[0] || '', rest = parts.slice(1).join(' ')
    this.doc.setFontSize(21); this.doc.setFont('helvetica','bold')
    this.doc.setTextColor(248,250,252); this.doc.text(first, 8, 17)
    this.doc.setTextColor(201,168,76); this.doc.text(rest, 8 + this.doc.getTextWidth(first + ' '), 17)
    this.doc.setFontSize(8); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(148,163,184)
    if (d.email || d.phone) this.doc.text(this.contact([d.email, d.phone]), 8, 26)
    if (d.location || d.linkedin || d.github) this.doc.text(this.contact([d.location, d.linkedin, d.github]), 8, 32)

    this.rect(0, 40, LW+4, this.H-40, [15,23,42])
    let lY = 50, rY = 50

    const lSec = (title) => {
      if (lY > 276) return
      this.doc.setFontSize(8.5); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(201,168,76)
      this.doc.text(title.toUpperCase(), 6, lY)
      this.doc.setDrawColor(201,168,76); this.doc.setLineWidth(0.3); this.doc.line(6, lY+1.5, LW-2, lY+1.5)
      lY += 8
    }

    const lText = (str, opts = {}) => {
      if (lY > 278 || !str) return 0
      const { size=7.5, bold=false, italic=false, color=[170,170,170] } = opts
      this.doc.setFontSize(size); this.doc.setFont('helvetica', italic?'italic':bold?'bold':'normal')
      this.doc.setTextColor(...color)
      const lines = this.doc.splitTextToSize(this.safe(str), LW-10)
      this.doc.text(lines, 6, lY); const h = lines.length * size * 0.38; lY += h; return h
    }

    const addRightPage = () => {
      this.doc.addPage(); this.pageNum++
      this.rect(0, 0, LW+4, this.H, [15,23,42])
      rY = 15
    }

    const rSec = (title) => {
      if (rY > 276) addRightPage()
      this.doc.setFontSize(11.5); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(8,18,36)
      this.doc.text(title.toUpperCase(), RX, rY)
      this.doc.setDrawColor(8,18,36); this.doc.setLineWidth(0.4); this.doc.line(RX, rY+2, this.W-8, rY+2)
      rY += 9
    }

    const rText = (str, opts = {}) => {
      if (rY > 276 || !str) return 0
      const { size=9, bold=false, italic=false, color=[50,50,50], x=RX, maxW=RW, align='left' } = opts
      this.doc.setFontSize(size); this.doc.setFont('helvetica', italic?'italic':bold?'bold':'normal')
      this.doc.setTextColor(...color)
      const lines = this.doc.splitTextToSize(this.safe(str), maxW)
      this.doc.text(lines, x, rY, { align }); const h = lines.length * size * 0.38; rY += h; return h
    }

    // LEFT COLUMN
    if (d.summary) { lSec('About'); lText(this.safe(d.summary).slice(0,280)); lY += 4 }
    if (d.education?.length) {
      lSec('Education')
      d.education.forEach(e => {
        if (lY > 274) return
        lText(this.safe(e.institution), { size:8, bold:true, color:[230,230,230] }); lY += 1
        lText(this.safe(e.degree), { size:7, italic:true, color:[150,150,150] }); lY += 1
        lText((e.year||'')+(e.gpa?' | '+e.gpa:''), { size:7, color:[110,110,110] }); lY += 4
      })
    }
    if (d.skills && Object.values(d.skills).some(v=>v)) {
      lSec('Skills')
      Object.entries(d.skills).forEach(([k,v]) => {
        if (!v || lY > 272) return
        lText(k.charAt(0).toUpperCase()+k.slice(1)+':', { size:7.5, bold:true, color:[201,168,76] }); lY += 3
        lText(this.safe(v), { size:7, color:[140,140,140] }); lY += 3
      })
    }
    d.customSections?.filter(s=>s.placement==='left').forEach(cs => {
      if (!cs.title || !cs.items?.filter(i=>i.trim()).length) return
      lSec(cs.title)
      cs.items.filter(i=>i.trim()).forEach(item => { lText('• '+item, { size:7, color:[140,140,140] }); lY += 1 })
      lY += 3
    })
    if (d.achievements?.filter(a=>a.trim()).length) {
      lSec('Achievements')
      d.achievements.filter(a=>a.trim()).forEach(a => {
        if (lY > 274) return
        lText('• '+this.safe(a), { size:7, color:[140,140,140] }); lY += 2
      })
    }
    if (d.certifications?.filter(c=>c.trim()).length) {
      lSec('Certifications')
      d.certifications.filter(c=>c.trim()).forEach(c => {
        if (lY > 274) return
        lText('• '+this.safe(c), { size:7, color:[140,140,140] }); lY += 2
      })
    }

    // RIGHT COLUMN
    if (d.experience?.length) {
      rSec('Experience')
      d.experience.forEach(exp => {
        if (rY > 268) { addRightPage(); rSec('Experience (cont.)') }
        rText(this.safe(exp.company), { size:10.5, bold:true, color:[8,18,36] })
        this.doc.setFontSize(8.5); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(100,100,100)
        this.doc.text(this.safe(exp.duration), this.W-9, rY - this.doc.getFontSize()*0.38, { align:'right' })
        rY += 1
        rText(this.safe(exp.role), { size:9, italic:true, color:[70,70,70] }); rY += 1
        exp.bullets?.filter(b=>b.trim()).forEach(b => {
          if (rY > 274) { addRightPage() }
          const h = rText('• '+this.safe(b), { size:8.5, color:[60,60,60], x:RX+3, maxW:RW-3 }); rY += 1
        })
        rY += 3
      })
    }
    if (d.projects?.length) {
      rSec('Projects')
      d.projects.forEach(p => {
        if (rY > 268) { addRightPage(); rSec('Projects (cont.)') }
        rText(this.safe(p.name), { size:10.5, bold:true, color:[8,18,36] })
        if (p.link) {
          this.doc.setFontSize(7.5); this.doc.setTextColor(100,140,220)
          this.doc.text(this.safe(p.link), this.W-9, rY-4, { align:'right' })
        }
        rY += 1
        if (p.tech) { rText('Tech: '+this.safe(p.tech), { size:8, italic:true, color:[90,90,90] }); rY += 1 }
        p.bullets?.filter(b=>b.trim()).forEach(b => {
          if (rY > 274) { addRightPage() }
          rText('• '+this.safe(b), { size:8.5, color:[60,60,60], x:RX+3, maxW:RW-3 }); rY += 1
        })
        rY += 3
      })
    }
    d.customSections?.filter(s=>s.placement!=='left').forEach(cs => {
      if (!cs.title || !cs.items?.filter(i=>i.trim()).length) return
      rSec(cs.title)
      cs.items.filter(i=>i.trim()).forEach(item => { rText('• '+item, { size:9, color:[60,60,60] }); rY += 1 })
      rY += 3
    })
  }

  _sections(d, sec, opts) {
    const { bc, bi, hs, ss, bs, ind } = opts
    const x = this.M + ind

    if (d.summary) {
      sec('Summary')
      const h = this.text(d.summary, x, this.y, { size:bs+0.5, color:[50,50,50], maxW:this.CW-ind })
      this.y += h + 5
    }

    if (d.education?.filter(e=>e.institution).length) {
      sec('Education')
      d.education.filter(e=>e.institution).forEach(e => {
        this.need(16)
        this.text(this.safe(e.institution), x, this.y, { size:hs, bold:true })
        this.text(this.safe(e.year), this.W-this.M, this.y, { size:8.5, color:[100,100,100], align:'right', maxW:65 })
        this.y += 5.5
        this.text(`${this.safe(e.degree)}${e.gpa ? '  |  GPA: '+e.gpa : ''}`, x, this.y, { size:ss, italic:true, color:[60,60,60] })
        this.y += 7
      })
    }

    if (d.experience?.length) {
      sec('Experience')
      d.experience.forEach(exp => {
        this.need(20)
        this.text(this.safe(exp.company), x, this.y, { size:hs, bold:true })
        this.text(this.safe(exp.duration), this.W-this.M, this.y, { size:8.5, color:[100,100,100], align:'right', maxW:65 })
        this.y += 5.5
        this.text(this.safe(exp.role), x, this.y, { size:ss, italic:true, color:[60,60,60] })
        if (exp.location) this.text(this.safe(exp.location), this.W-this.M, this.y, { size:8.5, color:[120,120,120], align:'right', maxW:65 })
        this.y += 5.5
        exp.bullets?.filter(b=>b.trim()).forEach(b => {
          this.need(8)
          const h = this.text(bc+this.safe(b), x+bi, this.y, { size:bs, color:[55,55,55], maxW:this.CW-ind-bi })
          this.y += h + 1.5
        })
        this.y += 3
      })
    }

    if (d.projects?.length) {
      sec('Projects')
      d.projects.forEach(p => {
        this.need(20)
        this.text(this.safe(p.name), x, this.y, { size:hs, bold:true })
        if (p.link) this.text(this.safe(p.link), this.W-this.M, this.y, { size:8, color:[0,80,200], align:'right', maxW:70 })
        this.y += 5.5
        if (p.tech) { this.text('Tech: '+this.safe(p.tech), x, this.y, { size:bs, italic:true, color:[80,80,80], maxW:this.CW-ind }); this.y += 5 }
        p.bullets?.filter(b=>b.trim()).forEach(b => {
          this.need(8)
          const h = this.text(bc+this.safe(b), x+bi, this.y, { size:bs, color:[55,55,55], maxW:this.CW-ind-bi })
          this.y += h + 1.5
        })
        this.y += 3
      })
    }

    d.customSections?.filter(s=>s.placement!=='left').forEach(cs => {
      if (!cs.title || !cs.items?.filter(i=>i.trim()).length) return
      sec(cs.title)
      cs.items.filter(i=>i.trim()).forEach(item => {
        this.need(8)
        const h = this.text(bc+this.safe(item), x+bi, this.y, { size:bs, color:[55,55,55], maxW:this.CW-ind-bi })
        this.y += h + 1.5
      })
      this.y += 3
    })

    if (d.skills && Object.values(d.skills).some(v=>v)) {
      sec('Skills')
      Object.entries(d.skills).forEach(([k,v]) => {
        if (!v) return
        this.need(7)
        this.text(k.charAt(0).toUpperCase()+k.slice(1)+':', x, this.y, { size:bs+0.5, bold:true, color:[10,22,40] })
        const h = this.text(this.safe(v), x+28, this.y, { size:bs+0.5, color:[55,55,55], maxW:this.CW-ind-28 })
        this.y += Math.max(h,5) + 1.5
      })
      this.y += 2
    }

    if (d.achievements?.filter(a=>a.trim()).length) {
      sec('Achievements')
      d.achievements.filter(a=>a.trim()).forEach(a => {
        this.need(8)
        const h = this.text(bc+this.safe(a), x+bi, this.y, { size:bs+0.5, color:[55,55,55], maxW:this.CW-ind-bi })
        this.y += h + 2
      })
    }

    if (d.certifications?.filter(c=>c.trim()).length) {
      sec('Certifications')
      d.certifications.filter(c=>c.trim()).forEach(c => {
        this.need(7)
        const h = this.text(bc+this.safe(c), x+bi, this.y, { size:bs+0.5, color:[55,55,55] })
        this.y += h + 2
      })
    }
  }
}

// ─────────────────────────────────────────
// INDUSTRY-LEVEL SUGGESTION ENGINE
// ─────────────────────────────────────────
const analyzeResume = (data) => {
  const s = []
  if (!data.email) s.push({ type:'critical', section:'basic', title:'Missing Email', detail:'ATS systems require an email address. Without it your resume is rejected automatically.', fix:'Add your professional email (yourname@gmail.com).' })
  if (!data.phone) s.push({ type:'critical', section:'basic', title:'Missing Phone Number', detail:'Recruiters need a phone number to schedule interviews.', fix:'Add a 10-digit mobile number.' })
  if (!data.linkedin) s.push({ type:'high', section:'basic', title:'No LinkedIn URL', detail:'87% of recruiters verify candidates on LinkedIn before calling.', fix:'Add linkedin.com/in/yourname to your resume.' })
  if (!data.summary || data.summary.length < 50) s.push({ type:'high', section:'summary', title:'No Professional Summary', detail:'Resumes with summaries get 40% more callbacks. ATS extracts keywords from it.', fix:'Write 2-3 sentences: your role, top 3 skills, and career goal. 50-80 words.' })
  else if (data.summary.length < 100) s.push({ type:'medium', section:'summary', title:'Summary Too Short', detail:'Your summary needs more keywords to score well on ATS.', fix:'Expand to 60-100 words. Add specific technologies, experience level, and what you deliver.' })

  data.experience?.forEach((exp, i) => {
    const bullets = exp.bullets?.filter(b=>b.trim()) || []
    if (!bullets.length) {
      s.push({ type:'critical', section:`experience.${i}`, title:`No Bullets — "${exp.company}"`, detail:'Experience entries without bullets score 0 on ATS impact metrics.', fix:'Add 3-5 bullet points: what you did, what tools you used, what was the outcome.' })
    } else {
      const txt = bullets.join(' ').toLowerCase()
      if (['helped','assisted','worked on','was responsible','was part of','did','made'].some(w=>txt.includes(w)))
        s.push({ type:'high', section:`experience.${i}`, title:`Weak Verbs — "${exp.company}"`, detail:'"helped", "assisted", "worked on" score poorly in ATS. Recruiters skip them.', fix:'Start with: Developed, Implemented, Led, Optimized, Built, Delivered, Designed, Reduced, Increased.' })
      if (!/\d+%|\d+x|\d+ (users|clients|hours|days|months|projects|members|records|tests|queries|requests)/i.test(txt))
        s.push({ type:'high', section:`experience.${i}`, title:`No Metrics — "${exp.company}"`, detail:'Quantified bullets score 60% higher. Numbers prove real impact to both ATS and humans.', fix:'Add: "Reduced X by 30%", "Handled 500+ requests/min", "Saved 8 hours/week", "Served 200 users".' })
    }
  })

  const skillsText = Object.values(data.skills||{}).join(' ')
  if (!skillsText || skillsText.trim().length < 20) s.push({ type:'critical', section:'skills', title:'Skills Section Empty', detail:'25% of ATS score is keyword matching. Empty skills = very low ATS score.', fix:'Add all tools, languages, frameworks, and soft skills you know.' })

  if (!data.projects?.length) s.push({ type:'medium', section:'projects', title:'No Projects', detail:'For students/freshers, projects replace work experience. ATS looks for them.', fix:'Add 2-3 projects with tech stack, GitHub link, and 2-3 impact bullets each.' })
  else data.projects.forEach((p,i) => {
    if (!p.tech) s.push({ type:'medium', section:`projects.${i}`, title:`No Tech Stack — "${p.name}"`, detail:'Recruiters scan for specific technologies. Missing tech stack loses keyword matches.', fix:'Add: React, Node.js, Python, TensorFlow, MySQL, or whatever you used.' })
    if (!p.bullets?.filter(b=>b.trim()).length) s.push({ type:'high', section:`projects.${i}`, title:`No Description — "${p.name}"`, detail:'Projects without description are ignored by ATS and recruiters alike.', fix:'Add what you built, the tech used, and what problem it solved or what result it achieved.' })
  })

  if (!data.education?.filter(e=>e.institution).length) s.push({ type:'critical', section:'education', title:'No Education', detail:'Education is mandatory. ATS auto-rejects if the education field is empty.', fix:'Add institution, degree, and graduation year.' })
  else data.education.filter(e=>e.institution).forEach((e,i) => {
    if (!e.gpa && i===0) s.push({ type:'low', section:`education.${i}`, title:'Add GPA', detail:'GPA above 7.5/10 should always be mentioned — it differentiates you.', fix:'Add "CGPA: 7.5/10" or "Percentage: 86%" if it\'s 7.5+ or 75%+.' })
  })

  if (!data.achievements?.filter(a=>a.trim()).length) s.push({ type:'medium', section:'achievements', title:'No Achievements', detail:'Achievements separate you from candidates with similar qualifications.', fix:'Add: hackathon wins, NPTEL courses, competitions, awards, event roles, or any recognition.' })

  const order = { critical:0, high:1, medium:2, low:3 }
  return s.sort((a,b) => order[a.type]-order[b.type])
}

// ─────────────────────────────────────────
// BLANK DATA TEMPLATE
// ─────────────────────────────────────────
const blankData = () => ({
  name:'', email:'', phone:'', linkedin:'', github:'', location:'',
  summary:'',
  education:[{ institution:'', degree:'', year:'', gpa:'' }],
  experience:[],
  projects:[],
  skills:{ languages:'', frameworks:'', tools:'', databases:'', other:'' },
  achievements:[], certifications:[], customSections:[],
})

const TEMPLATES = [
  { id:'modern',   name:'Modern Minimal',   desc:'Clean header, ruled sections — ATS friendly' },
  { id:'academic', name:'Academic',          desc:'Gray section boxes — great for freshers' },
  { id:'classic',  name:'Classic Pro',       desc:'Bold ruled lines — timeless look' },
  { id:'minimal',  name:'Ultra Minimal',     desc:'Left-aligned, max readability' },
  { id:'twocol',   name:'Two Column',        desc:'Dark sidebar with gold — eye-catching' },
]

// ─────────────────────────────────────────
// LIVE PREVIEW
// ─────────────────────────────────────────
function LivePreview({ data, template, isThumbnail=false }) {
  if (!data) return null
  const safe = v => String(v||'').trim()
  const ct = items => items.filter(Boolean).join('  ·  ')
  const getArr = arr => Array.isArray(arr) ? arr : []
  const C = { modern:{h:'#0A1628',sub:'#6C757D',txt:'#212529'}, academic:{h:'#0A1628',sub:'#555',txt:'#212529'}, classic:{h:'#000',sub:'#555',txt:'#212529'}, minimal:{h:'#111',sub:'#666',txt:'#333'}, twocol:{h:'#0A1628',sub:'#6C757D',txt:'#212529'} }[template]||{h:'#0A1628',sub:'#6C757D',txt:'#212529'}
  
  // Base font sizes for A4 are around 10-14px. When scaling for thumbnail, we use fixed sizes for clarity.
  const sz = isThumbnail ? { nm:'1.5rem', hd:'1.2rem', sb:'1.1rem', bd:'0.9rem', sm:'0.85rem' } : { nm:'0.85rem', hd:'0.63rem', sb:'0.58rem', bd:'0.55rem', sm:'0.52rem' }
  const wrap = { 
    background:'white', borderRadius:isThumbnail?'0':'4px', border:isThumbnail?'none':'1px solid #DEE2E6', 
    overflow:'hidden', fontFamily:'Arial,sans-serif', 
    maxHeight:isThumbnail?'none':'580px', overflowY:isThumbnail?'hidden':'auto',
    width:isThumbnail?'800px':'100%', height:isThumbnail?'1131px':'auto',
    pointerEvents:isThumbnail?'none':'auto',
    boxSizing: 'border-box'
  }

  const SH = ({ t }) => (
    <div style={{ marginTop:'7px', marginBottom:'3px' }}>
      {template==='academic'
        ? <div style={{ background:'#D0D0D0', padding:'2px 5px', fontWeight:'700', fontSize:sz.sm, letterSpacing:'0.06em' }}>{(t||'').toUpperCase()}</div>
        : template==='minimal'
        ? <div style={{ fontWeight:'700', fontSize:sz.hd, color:C.h }}>{t}</div>
        : <div><div style={{ fontWeight:'700', fontSize:sz.sm, color:C.h, letterSpacing:'0.05em' }}>{(t||'').toUpperCase()}</div><div style={{ height:'0.5px', background:C.h, marginTop:'1px' }}/></div>
      }
    </div>
  )

  const edArr = getArr(data.education)
  const expArr = getArr(data.experience)
  const projArr = getArr(data.projects)
  const achArr = getArr(data.achievements)
  const certArr = getArr(data.certifications)
  const csArr = getArr(data.customSections)
  const sk = data.skills || {}

  if (template==='twocol') return (
    <div style={wrap}>
      <div style={{ background:'#0A1628', padding:'12px 14px' }}>
        <div style={{ fontSize:sz.nm, fontWeight:'800' }}>
          <span style={{ color:'white' }}>{safe(data.name).split(' ')[0]} </span>
          <span style={{ color:'#C9A84C' }}>{safe(data.name).split(' ').slice(1).join(' ')}</span>
        </div>
        <div style={{ color:'#94A3B8', fontSize:sz.sm, marginTop:'4px' }}>{ct([data.email,data.phone])}</div>
        {(data.location||data.linkedin||data.github) && <div style={{ color:'#94A3B8', fontSize:sz.sm }}>{ct([data.location,data.linkedin,data.github])}</div>}
      </div>
      <div style={{ display:'flex', minHeight:isThumbnail?'1050px':'auto' }}>
        <div style={{ width:'35%', background:'#0F172A', padding:'10px 8px', flexShrink:0 }}>
          {data.summary&&<><div style={{ color:'#C9A84C', fontWeight:'700', fontSize:sz.sm, marginBottom:'3px' }}>ABOUT</div><p style={{ color:'#94A3B8', fontSize:sz.bd, lineHeight:'1.4', marginBottom:'8px' }}>{safe(data.summary).slice(0,250)}</p></>}
          {edArr.filter(e=>e.institution).length>0&&(
            <><div style={{ color:'#C9A84C', fontWeight:'700', fontSize:sz.sm, marginBottom:'3px', borderBottom:'0.5px solid #C9A84C' }}>EDUCATION</div>
            {edArr.filter(e=>e.institution).map((e,i)=><div key={i} style={{ marginBottom:'6px', marginTop:'3px' }}><div style={{ fontWeight:'600', color:'#E2E8F0', fontSize:sz.bd }}>{safe(e.institution)}</div><div style={{ color:'#94A3B8', fontSize:sz.sm }}>{safe(e.degree)}</div><div style={{ color:'#64748B', fontSize:sz.sm }}>{safe(e.year)}{e.gpa?' | '+e.gpa:''}</div></div>)}</>
          )}
          {Object.values(sk).some(v=>v)&&(
            <><div style={{ color:'#C9A84C', fontWeight:'700', fontSize:sz.sm, margin:'8px 0 3px', borderBottom:'0.5px solid #C9A84C' }}>SKILLS</div>
            {Object.entries(sk).filter(([,v])=>v).map(([k,v])=><div key={k} style={{ marginBottom:'4px' }}><span style={{ color:'#C9A84C', fontWeight:'600', fontSize:sz.sm }}>{k.charAt(0).toUpperCase()+k.slice(1)}: </span><span style={{ color:'#94A3B8', fontSize:sz.sm }}>{safe(v)}</span></div>)}</>
          )}
          {achArr.filter(a=>a.trim()).length>0&&(
            <><div style={{ color:'#C9A84C', fontWeight:'700', fontSize:sz.sm, margin:'8px 0 3px', borderBottom:'0.5px solid #C9A84C' }}>ACHIEVEMENTS</div>
            {achArr.filter(a=>a.trim()).map((a,i)=><div key={i} style={{ color:'#94A3B8', fontSize:sz.sm, marginBottom:'3px' }}>• {safe(a)}</div>)}</>
          )}
          {certArr.filter(c=>c.trim()).length>0&&(
            <><div style={{ color:'#C9A84C', fontWeight:'700', fontSize:sz.sm, margin:'8px 0 3px', borderBottom:'0.5px solid #C9A84C' }}>CERTIFICATIONS</div>
            {certArr.filter(c=>c.trim()).map((c,i)=><div key={i} style={{ color:'#94A3B8', fontSize:sz.sm, marginBottom:'3px' }}>• {safe(c)}</div>)}</>
          )}
          {csArr.filter(cs=>cs.placement==='left'&&getArr(cs.items).filter(i=>i.trim()).length>0).map((cs,i)=>(
            <div key={i}><div style={{ color:'#C9A84C', fontWeight:'700', fontSize:sz.sm, margin:'8px 0 3px', borderBottom:'0.5px solid #C9A84C' }}>{(cs.title||'').toUpperCase()}</div>{getArr(cs.items).filter(x=>x.trim()).map((item,ii)=><div key={ii} style={{ color:'#94A3B8', fontSize:sz.sm, marginBottom:'3px' }}>• {safe(item)}</div>)}</div>
          ))}
        </div>
        <div style={{ flex:1, padding:'10px' }}>
          {expArr.length>0&&<><SH t="Experience"/>{expArr.map((e,i)=><div key={i} style={{ marginBottom:'8px' }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:'700', color:'#0A1628', fontSize:sz.sb }}>{safe(e.company)}</span><span style={{ color:C.sub, fontSize:sz.sm }}>{safe(e.duration)}</span></div><div style={{ color:C.sub, fontStyle:'italic', fontSize:sz.bd }}>{safe(e.role)}</div>{getArr(e.bullets).filter(b=>b.trim()).map((b,bi)=><div key={bi} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'5px', marginTop:'2px' }}>• {safe(b)}</div>)}</div>)}</>}
          {projArr.length>0&&<><SH t="Projects"/>{projArr.map((p,i)=><div key={i} style={{ marginBottom:'6px' }}><div style={{ fontWeight:'700', color:'#0A1628', fontSize:sz.sb }}>{safe(p.name)}</div>{p.tech&&<div style={{ color:C.sub, fontStyle:'italic', fontSize:sz.bd }}>{safe(p.tech)}</div>}{getArr(p.bullets).filter(b=>b.trim()).map((b,bi)=><div key={bi} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'5px', marginTop:'2px' }}>• {safe(b)}</div>)}</div>)}</>}
          {csArr.filter(cs=>cs.placement!=='left'&&getArr(cs.items).filter(i=>i.trim()).length>0).map((cs,i)=>(
            <div key={i}><SH t={cs.title||''}/>{getArr(cs.items).filter(x=>x.trim()).map((item,ii)=><div key={ii} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'5px', marginTop:'2px' }}>• {safe(item)}</div>)}</div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ ...wrap, padding:'16px' }}>
      <div style={{ textAlign:'center', paddingBottom:'8px', borderBottom:`1px solid ${C.h}`, marginBottom:'8px' }}>
        <div style={{ fontWeight:'900', fontSize:sz.nm, color:C.h }}>{safe(data.name)||'Your Name'}</div>
        <div style={{ color:C.sub, fontSize:sz.sm, marginTop:'4px' }}>{ct([data.email,data.phone,data.location])}</div>
        {(data.linkedin||data.github)&&<div style={{ color:C.sub, fontSize:sz.sm }}>{ct([data.linkedin,data.github])}</div>}
      </div>
      {data.summary&&<><SH t="Summary"/><p style={{ color:C.txt, fontSize:sz.bd, lineHeight:'1.5' }}>{safe(data.summary)}</p></>}
      {edArr.filter(e=>e.institution).length>0&&<><SH t="Education"/>{edArr.filter(e=>e.institution).map((e,i)=><div key={i} style={{ marginBottom:'6px' }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:'700', color:C.h, fontSize:sz.sb }}>{safe(e.institution)}</span><span style={{ color:C.sub, fontSize:sz.sm }}>{safe(e.year)}</span></div><div style={{ color:C.sub, fontStyle:'italic', fontSize:sz.bd }}>{safe(e.degree)}{e.gpa?' | GPA: '+e.gpa:''}</div></div>)}</>}
      {expArr.length>0&&<><SH t="Experience"/>{expArr.map((e,i)=><div key={i} style={{ marginBottom:'8px' }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:'700', color:C.h, fontSize:sz.sb }}>{safe(e.company)}</span><span style={{ color:C.sub, fontSize:sz.sm }}>{safe(e.duration)}</span></div><div style={{ color:C.sub, fontStyle:'italic', fontSize:sz.bd }}>{safe(e.role)}</div>{getArr(e.bullets).filter(b=>b.trim()).map((b,bi)=><div key={bi} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'6px', marginTop:'2px' }}>• {safe(b)}</div>)}</div>)}</>}
      {projArr.length>0&&<><SH t="Projects"/>{projArr.map((p,i)=><div key={i} style={{ marginBottom:'6px' }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:'700', color:C.h, fontSize:sz.sb }}>{safe(p.name)}</span>{p.link&&<span style={{ color:'#0056b3', fontSize:sz.sm }}>{safe(p.link)}</span>}</div>{p.tech&&<div style={{ color:C.sub, fontStyle:'italic', fontSize:sz.bd }}>Tech: {safe(p.tech)}</div>}{getArr(p.bullets).filter(b=>b.trim()).map((b,bi)=><div key={bi} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'6px', marginTop:'2px' }}>• {safe(b)}</div>)}</div>)}</>}
      {csArr.filter(cs=>getArr(cs.items).filter(i=>i.trim()).length>0).map((cs,i)=><div key={i}><SH t={cs.title||''}/>{getArr(cs.items).filter(x=>x.trim()).map((item,ii)=><div key={ii} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'6px', marginTop:'2px' }}>• {safe(item)}</div>)}</div>)}
      {Object.values(sk).some(v=>v)&&<><SH t="Skills"/>{Object.entries(sk).filter(([,v])=>v).map(([k,v])=><div key={k} style={{ fontSize:sz.bd, marginBottom:'2px' }}><span style={{ fontWeight:'700', color:C.h }}>{k.charAt(0).toUpperCase()+k.slice(1)}: </span><span style={{ color:C.txt }}>{safe(v)}</span></div>)}</>}
      {achArr.filter(a=>a.trim()).length>0&&<><SH t="Achievements"/>{achArr.filter(a=>a.trim()).map((a,i)=><div key={i} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'6px', marginTop:'2px' }}>• {safe(a)}</div>)}</>}
      {certArr.filter(c=>c.trim()).length>0&&<><SH t="Certifications"/>{certArr.filter(c=>c.trim()).map((c,i)=><div key={i} style={{ color:C.txt, fontSize:sz.bd, paddingLeft:'6px', marginTop:'2px' }}>• {safe(c)}</div>)}</>}
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN EXPORT PAGE
// ─────────────────────────────────────────
export default function ResumeExport() {
  const [resumes, setResumes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [step, setStep] = useState(1)
  const [parsing, setParsing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [appliedIdx, setAppliedIdx] = useState([])
  const [applyingIdx, setApplyingIdx] = useState(null)
  const [template, setTemplate] = useState('modern')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openSec, setOpenSec] = useState('basic')
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => { setResumes(r.data); if (r.data[0]) setSelectedId(r.data[0].id) })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [])

  const parseAndAnalyze = async () => {
    if (!selectedId) return
    setParsing(true)
    try {
      const [parseRes, scoreRes] = await Promise.all([
        api.post('/api/analysis/parse-resume', { resumeId: selectedId }),
        api.post('/api/analysis/score', { resumeId: selectedId })
      ])
      const parsed = { ...blankData(), ...parseRes.data }
      if (!parsed.certifications) parsed.certifications = []
      if (!parsed.customSections) parsed.customSections = []
      setEditData(parsed)
      const localSuggs = analyzeResume(parsed)
      const aiSuggs = (scoreRes.data.improvements||[]).slice(0,3).map(s=>({
        type:'medium', section:'general', title:s, detail:'AI-detected improvement.', fix:s
      }))
      setSuggestions([...localSuggs, ...aiSuggs])
      setStep(2)
    } catch(err) {
      alert('Analysis failed: '+(err.response?.data?.message||err.message))
    } finally { setParsing(false) }
  }

  const applySuggestion = useCallback(async (sugg, idx) => {
    if (appliedIdx.includes(idx)) return
    setApplyingIdx(idx)
    const updated = JSON.parse(JSON.stringify(editData))
    try {
      if (sugg.section==='summary' || sugg.title.toLowerCase().includes('summary')) {
        if (!updated.summary || updated.summary.length < 50) {
          const exp = updated.experience?.[0]
          const skills = Object.values(updated.skills||{}).filter(v=>v).join(', ').slice(0,60)
          updated.summary = `${exp?`${exp.role} at ${exp.company} with`:'Motivated professional with'} hands-on experience in ${skills||'technical problem-solving and engineering'}. Proven ability to deliver quality results through analytical thinking and team collaboration. Seeking to leverage technical expertise to drive meaningful impact.`
        }
      }

      if (sugg.section?.startsWith('experience.')) {
        const ei = parseInt(sugg.section.split('.')[1])
        if (!isNaN(ei) && updated.experience[ei]) {
          const exp = updated.experience[ei]
          const strongVerbs = ['Developed','Implemented','Designed','Built','Led','Optimized','Delivered','Engineered','Analyzed','Executed','Managed','Achieved']
          if (!exp.bullets?.filter(b=>b.trim()).length) {
            updated.experience[ei].bullets = [
              `Performed ${exp.role?.toLowerCase()||'engineering'} responsibilities at ${exp.company}, contributing to core operations and team goals`,
              'Collaborated with cross-functional teams to complete deliverables within deadlines',
              'Applied domain knowledge to analyze problems and implement effective technical solutions',
            ]
          } else {
            updated.experience[ei].bullets = exp.bullets.map((b,bi) => {
              if (!b.trim()) return b
              const words = b.trim().split(' ')
              const weak = ['helped','assisted','worked','was','did','made','got','took','had','tried','started']
              if (weak.some(w=>words[0].toLowerCase().startsWith(w)))
                return strongVerbs[bi%strongVerbs.length]+' '+words.slice(1).join(' ')
              if (!/\d/.test(b) && bi<3)
                return b.trimEnd()+' — contributing to measurable improvement in team productivity'
              return b
            })
          }
        }
      }

      if (sugg.section?.startsWith('projects.')) {
        const pi = parseInt(sugg.section.split('.')[1])
        if (!isNaN(pi) && updated.projects[pi]) {
          const p = updated.projects[pi]
          if (!p.bullets?.filter(b=>b.trim()).length) {
            updated.projects[pi].bullets = [
              `Designed and developed ${p.name||'the project'} using ${p.tech||'modern web technologies'}`,
              'Implemented core features including user authentication, data processing, and responsive UI',
              'Deployed and tested the application ensuring reliability, performance, and maintainability',
            ]
          }
          if (!p.tech) updated.projects[pi].tech = 'Add: React, Node.js, Python, or your actual stack'
        }
      }

      if (sugg.section==='achievements') {
        if (!updated.achievements?.filter(a=>a.trim()).length) {
          updated.achievements = [
            'Add: Hackathon wins, competition results, or rankings',
            'Add: NPTEL / Coursera / Udemy course completions with certificate',
            'Add: Event organizing, leadership, or volunteer roles',
          ]
        }
      }

      if (sugg.section==='skills') {
        if (!updated.skills.other) updated.skills.other = 'Problem-solving, Teamwork, Communication, Time Management, Adaptability'
      }

      setEditData(updated)
      setAppliedIdx(prev=>[...prev,idx])
    } catch { setAppliedIdx(prev=>[...prev,idx]) }
    finally { setApplyingIdx(null) }
  }, [editData, appliedIdx])

  // Edit helpers
  const upd = fn => setEditData(prev=>fn(JSON.parse(JSON.stringify(prev))))
  const setField = (k,v) => setEditData(prev=>({...prev,[k]:v}))
  const setSkill = (k,v) => setEditData(prev=>({...prev,skills:{...prev.skills,[k]:v}}))
  const setEduF = (ei,k,v) => upd(d=>{d.education[ei][k]=v;return d})
  const addEdu = () => upd(d=>{d.education.push({institution:'',degree:'',year:'',gpa:''});return d})
  const remEdu = (ei) => upd(d=>{d.education.splice(ei,1);return d})
  const setExpF = (ei,k,v) => upd(d=>{d.experience[ei][k]=v;return d})
  const setExpB = (ei,bi,v) => upd(d=>{d.experience[ei].bullets[bi]=v;return d})
  const addExpB = (ei) => upd(d=>{d.experience[ei].bullets=[...(d.experience[ei].bullets||[]),''];return d})
  const remExpB = (ei,bi) => upd(d=>{d.experience[ei].bullets.splice(bi,1);return d})
  const addExp = () => upd(d=>{d.experience.push({company:'',role:'',duration:'',location:'',bullets:['']});return d})
  const remExp = (ei) => upd(d=>{d.experience.splice(ei,1);return d})
  const setProjF = (pi,k,v) => upd(d=>{d.projects[pi][k]=v;return d})
  const setProjB = (pi,bi,v) => upd(d=>{d.projects[pi].bullets[bi]=v;return d})
  const addProjB = (pi) => upd(d=>{d.projects[pi].bullets=[...(d.projects[pi].bullets||[]),''];return d})
  const remProjB = (pi,bi) => upd(d=>{d.projects[pi].bullets.splice(bi,1);return d})
  const addProj = () => upd(d=>{d.projects.push({name:'',tech:'',description:'',link:'',bullets:['']});return d})
  const remProj = (pi) => upd(d=>{d.projects.splice(pi,1);return d})
  const setListI = (k,i,v) => upd(d=>{d[k][i]=v;return d})
  const addListI = (k) => upd(d=>{d[k]=[...(d[k]||[]),''];return d})
  const remListI = (k,i) => upd(d=>{d[k].splice(i,1);return d})
  const addCustom = () => upd(d=>{d.customSections=[...(d.customSections||[]),{title:'New Section',items:[''],placement:'right'}];return d})
  const setCSTitle = (ci,v) => upd(d=>{d.customSections[ci].title=v;return d})
  const setCSItem = (ci,ii,v) => upd(d=>{d.customSections[ci].items[ii]=v;return d})
  const addCSItem = (ci) => upd(d=>{d.customSections[ci].items.push('');return d})
  const remCSItem = (ci,ii) => upd(d=>{d.customSections[ci].items.splice(ii,1);return d})
  const remCS = (ci) => upd(d=>{d.customSections.splice(ci,1);return d})
  const setCSPlace = (ci,v) => upd(d=>{d.customSections[ci].placement=v;return d})
  const getArr = arr => Array.isArray(arr) ? arr : []

  const downloadPDF = async () => {
    setGenerating(true)
    try {
      const engine = new PDFEngine(template)
      const doc = engine.build(editData)
      doc.save(`${editData.name?.replace(/\s+/g,'_')||'resume'}-${template}.pdf`)
      trackActivity('exports')
    } catch(e) { alert('PDF error: '+e.message); console.error(e) }
    finally { setGenerating(false) }
  }

  // Shared styles
  const INP = { width:'100%', padding:'7px 10px', border:'1px solid #DEE2E6', borderRadius:'6px', fontSize:'0.875rem', boxSizing:'border-box', fontFamily:'inherit', outline:'none' }
  const TA = { ...INP, minHeight:'75px', resize:'vertical' }
  const LBL = { fontSize:'0.72rem', fontWeight:'600', color:'#6C757D', marginBottom:'3px', display:'block' }
  const SECWRAP = { marginBottom:'8px', border:'1px solid #E9ECEF', borderRadius:'8px', overflow:'hidden' }
  const secBtn = id => ({ padding:'9px 14px', background:openSec===id?'#0A1628':'#F8F9FA', color:openSec===id?'white':'#0A1628', cursor:'pointer', fontWeight:'600', fontSize:'0.875rem', display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', width:'100%', textAlign:'left', fontFamily:'inherit' })
  const ADDBTN = { padding:'5px 12px', border:'1px dashed #C9A84C', borderRadius:'6px', background:'rgba(201,168,76,0.05)', color:'#C9A84C', fontSize:'0.8rem', cursor:'pointer', fontWeight:'500', fontFamily:'inherit' }
  const DELBTN = { background:'#DC3545', color:'white', border:'none', borderRadius:'4px', width:'22px', height:'22px', cursor:'pointer', flexShrink:0, fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center' }
  const STEPS = ['Select','AI Analysis','Template','Edit & Preview','Export']

  return (
    <Layout>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h2 className="page-title">Export Resume as PDF</h2>
          <p className="page-subtitle">AI-powered · True multi-page · Add any section · 5 templates</p>
        </div>
        {step>=4&&<label style={{ fontSize:'0.875rem', color:'#6C757D', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}><input type="checkbox" checked={showPreview} onChange={e=>setShowPreview(e.target.checked)}/>Live Preview</label>}
      </div>

      {/* Steps */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:'2rem', overflowX:'auto', paddingBottom:'4px' }}>
        {STEPS.map((lbl,i)=>{
          const n=i+1, done=step>n, active=step===n
          return (
            <div key={n} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                <div onClick={()=>done&&setStep(n)} style={{ width:'30px', height:'30px', borderRadius:'50%', background:done?'#28A745':active?'#0A1628':'#E9ECEF', color:done||active?'white':'#6C757D', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'0.8rem', cursor:done?'pointer':'default', transition:'all 0.2s' }}>
                  {done?'✓':n}
                </div>
                <span style={{ fontSize:'0.68rem', fontWeight:active?'700':'400', color:active?'#0A1628':'#888', whiteSpace:'nowrap' }}>{lbl}</span>
              </div>
              {i<STEPS.length-1&&<div style={{ width:'28px', height:'2px', background:done?'#28A745':'#E9ECEF', margin:'0 3px 14px', flexShrink:0 }}/>}
            </div>
          )
        })}
      </div>

      {loading?<div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>:<>

        {/* ══ STEP 1 ══ */}
        {step===1&&(
          <div style={{ maxWidth:'500px' }}>
            <div className="card">
              <h4 style={{ color:'#0A1628', marginBottom:'1rem' }}>Select Resume to Export</h4>
              {resumes.length===0?<div className="alert alert-danger">No resumes. Upload one first!</div>:(
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'1.5rem' }}>
                  {resumes.map(r=>(
                    <div key={r.id} onClick={()=>setSelectedId(r.id)} style={{ padding:'12px 14px', border:`2px solid ${selectedId===r.id?'#C9A84C':'#E9ECEF'}`, borderRadius:'10px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', background:selectedId===r.id?'rgba(201,168,76,0.04)':'white', transition:'all 0.15s' }}>
                      <div><div style={{ fontWeight:'600', color:'#0A1628' }}>{r.title}</div><div style={{ fontSize:'0.8rem', color:'#6C757D' }}>{r.fileType?.toUpperCase()} · {new Date(r.createdAt).toLocaleDateString()}</div></div>
                      {selectedId===r.id&&<span style={{ color:'#C9A84C', fontSize:'1.4rem' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-primary btn-full" onClick={parseAndAnalyze} disabled={parsing||!selectedId} style={{ fontSize:'1rem', padding:'13px' }}>
                {parsing?'🤖 Analyzing resume...':'🤖 Analyze & Continue →'}
              </button>
              {parsing&&<p style={{ color:'#6C757D', fontSize:'0.8rem', textAlign:'center', marginTop:'8px' }}>Parsing structure + generating ATS improvements... ~15s</p>}
            </div>
          </div>
        )}

        {/* ══ STEP 2 ══ */}
        {step===2&&editData&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:'1.5rem', marginBottom:'1.5rem' }}>
              <div className="card">
                <h4 style={{ color:'#0A1628', marginBottom:'1rem' }}>✅ Resume Parsed</h4>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', background:'#F8F9FA', borderRadius:'8px', marginBottom:'1rem' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#0A1628', color:'#C9A84C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'1rem', flexShrink:0 }}>{editData.name?.[0]?.toUpperCase()||'?'}</div>
                  <div><div style={{ fontWeight:'700', color:'#0A1628' }}>{editData.name||'Unknown'}</div><div style={{ fontSize:'0.8rem', color:'#6C757D' }}>{editData.email||'No email'}</div></div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {[
                    {k:'Summary',v:editData.summary?.length>20},
                    {k:`Education (${getArr(editData.education).filter(e=>e.institution).length})`,v:getArr(editData.education).some(e=>e.institution)},
                    {k:`Experience (${getArr(editData.experience).length})`,v:getArr(editData.experience).length>0},
                    {k:`Projects (${getArr(editData.projects).length})`,v:getArr(editData.projects).length>0},
                    {k:'Skills',v:Object.values(editData.skills||{}).some(v=>v)},
                    {k:`Achievements (${getArr(editData.achievements).filter(a=>a.trim()).length})`,v:getArr(editData.achievements).some(a=>a.trim())},
                  ].map(s=><span key={s.k} style={{ padding:'3px 8px', borderRadius:'20px', fontSize:'0.72rem', fontWeight:'500', background:s.v?'rgba(40,167,69,0.1)':'rgba(220,53,69,0.08)', color:s.v?'#1a7a32':'#9c1c28' }}>{s.v?'✓':'✗'} {s.k}</span>)}
                </div>
                <p style={{ fontSize:'0.8rem', color:'#6C757D', marginTop:'1rem', marginBottom:0 }}>
                  {suggestions.filter(s=>s.type==='critical').length>0&&`⚠️ ${suggestions.filter(s=>s.type==='critical').length} critical issues. `}
                  Apply suggestions before exporting for a higher ATS score.
                </p>
              </div>

              <div className="card" style={{ borderLeft:'3px solid #C9A84C' }}>
                <h4 style={{ color:'#0A1628', marginBottom:'4px' }}>🎯 ATS Improvement Analysis</h4>
                <p style={{ color:'#6C757D', fontSize:'0.8rem', marginBottom:'1rem' }}>Each issue is pinpointed with the exact reason and fix. Industry-standard ATS scoring logic.</p>
                {suggestions.length===0?(
                  <div style={{ padding:'12px', background:'rgba(40,167,69,0.08)', borderRadius:'8px', color:'#1a7a32', fontWeight:'500', fontSize:'0.875rem' }}>✅ Excellent resume! No critical issues found.</div>
                ):(
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'460px', overflowY:'auto', paddingRight:'4px' }}>
                    {suggestions.map((s,i)=>{
                      const tc = { critical:{bg:'#FFF5F5',br:'#FFC5C5',badge:'#DC3545',lbl:'Critical'}, high:{bg:'#FFFBEB',br:'#FDE68A',badge:'#D97706',lbl:'High'}, medium:{bg:'#F0F9FF',br:'#BAE6FD',badge:'#0284C7',lbl:'Medium'}, low:{bg:'#F0FDF4',br:'#BBF7D0',badge:'#16A34A',lbl:'Low'} }[s.type]||{bg:'#F8F9FA',br:'#E9ECEF',badge:'#6C757D',lbl:'Info'}
                      const done = appliedIdx.includes(i)
                      return (
                        <div key={i} style={{ background:done?'rgba(40,167,69,0.05)':tc.bg, border:`1px solid ${done?'rgba(40,167,69,0.3)':tc.br}`, borderRadius:'8px', padding:'10px 12px' }}>
                          <div style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'4px' }}>
                            <span style={{ background:done?'#28A745':tc.badge, color:'white', borderRadius:'3px', padding:'1px 6px', fontSize:'0.65rem', fontWeight:'700', flexShrink:0, marginTop:'1px' }}>{done?'✓ DONE':tc.lbl.toUpperCase()}</span>
                            <div style={{ fontWeight:'600', color:'#0A1628', fontSize:'0.875rem' }}>{s.title}</div>
                          </div>
                          {!done&&<>
                            <p style={{ color:'#6C757D', fontSize:'0.8rem', marginBottom:'4px', paddingLeft:'36px' }}>{s.detail}</p>
                            <div style={{ paddingLeft:'36px', fontSize:'0.8rem', color:'#0A1628', fontWeight:'500', marginBottom:'6px' }}>💡 {s.fix}</div>
                            <div style={{ display:'flex', gap:'6px', paddingLeft:'36px' }}>
                              <button onClick={()=>applySuggestion(s,i)} disabled={applyingIdx===i} style={{ padding:'4px 12px', borderRadius:'5px', border:'none', background:'#C9A84C', color:'#0A1628', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer', fontFamily:'inherit' }}>
                                {applyingIdx===i?'⏳...':'⚡ Auto-Apply'}
                              </button>
                              <button onClick={()=>{setAppliedIdx(p=>[...p,i]);setStep(4);setOpenSec(s.section?.split('.')[0]||'basic')}} style={{ padding:'4px 10px', borderRadius:'5px', border:'1px solid #DEE2E6', background:'white', color:'#6C757D', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' }}>
                                Edit Manually
                              </button>
                            </div>
                          </>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={()=>setStep(3)} style={{ padding:'10px 24px' }}>Choose Template →</button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 ══ */}
        {step===3&&(
          <div>
            <h4 style={{ color:'#0A1628', marginBottom:'1rem' }}>Choose Your Template</h4>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              {TEMPLATES.map(t=>(
                <div key={t.id} onClick={()=>setTemplate(t.id)} style={{ border:`2px solid ${template===t.id?'#C9A84C':'#E9ECEF'}`, borderRadius:'12px', overflow:'hidden', cursor:'pointer', transition:'all 0.2s', background:template===t.id?'rgba(201,168,76,0.04)':'white' }}>
                  <div style={{ height:'200px', width:'100%', background:'#F8F9FA', borderBottom:'1px solid #E9ECEF', overflow:'hidden', position:'relative', display:'flex', justifyContent:'center', paddingTop: '10px' }}>
                     <div style={{ transform: 'scale(0.17)', transformOrigin: 'top center', pointerEvents: 'none' }}>
                        <LivePreview data={editData || blankData()} template={t.id} isThumbnail={true} />
                     </div>
                  </div>
                  <div style={{ padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:'600', color:'#0A1628', fontSize:'0.875rem' }}>{t.name}</div>
                      <div style={{ color:'#6C757D', fontSize:'0.75rem' }}>{t.desc}</div>
                    </div>
                    {template===t.id&&<span style={{ color:'#C9A84C', fontSize:'1.4rem' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn btn-primary" onClick={()=>setStep(4)} style={{ padding:'10px 24px' }}>Edit & Preview →</button>
            </div>
          </div>
        )}

        {/* ══ STEP 4: EDIT & PREVIEW ══ */}
        {step===4&&editData&&(
          <div style={{ display:'grid', gridTemplateColumns:showPreview?'1fr 1fr':'1fr', gap:'1.5rem', alignItems:'start' }}>
            {/* EDITOR */}
            <div>
              <div className="card" style={{ marginBottom:'1rem', padding:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <h4 style={{ color:'#0A1628', margin:0 }}>✏️ Edit All Sections</h4>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setStep(2)}>📋 Suggestions</button>
                </div>

                {/* Basic */}
                <div style={SECWRAP}>
                  <button style={secBtn('basic')} onClick={()=>setOpenSec(openSec==='basic'?null:'basic')}><span>👤 Basic Info</span><span>{openSec==='basic'?'▲':'▼'}</span></button>
                  {openSec==='basic'&&<div style={{ padding:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    {[['name','Full Name'],['email','Email'],['phone','Phone'],['location','City, State'],['linkedin','LinkedIn URL'],['github','GitHub URL']].map(([k,l])=>(
                      <div key={k}><span style={LBL}>{l}</span><input style={INP} value={editData[k]||''} onChange={e=>setField(k,e.target.value)} placeholder={l}/></div>
                    ))}
                  </div>}
                </div>

                {/* Summary */}
                <div style={SECWRAP}>
                  <button style={secBtn('summary')} onClick={()=>setOpenSec(openSec==='summary'?null:'summary')}><span>📝 Professional Summary</span><span>{openSec==='summary'?'▲':'▼'}</span></button>
                  {openSec==='summary'&&<div style={{ padding:'12px' }}>
                    <textarea style={TA} value={editData.summary||''} onChange={e=>setField('summary',e.target.value)} placeholder="2-3 sentences: your role, top skills, career goal. Include keywords from job descriptions."/>
                    <p style={{ fontSize:'0.72rem', color:'#6C757D', marginTop:'4px' }}>💡 Target 60-100 words. Include your job title, 2-3 key skills, and what you bring to the table.</p>
                  </div>}
                </div>

                {/* Education */}
                <div style={SECWRAP}>
                  <button style={secBtn('education')} onClick={()=>setOpenSec(openSec==='education'?null:'education')}><span>🎓 Education ({getArr(editData.education).filter(e=>e.institution).length})</span><span>{openSec==='education'?'▲':'▼'}</span></button>
                  {openSec==='education'&&<div style={{ padding:'12px' }}>
                    {getArr(editData.education).map((e,ei)=>(
                      <div key={ei} style={{ marginBottom:'12px', padding:'10px', background:'#F8F9FA', borderRadius:'6px', border:'1px solid #E9ECEF' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                          <span style={{ fontWeight:'600', color:'#0A1628', fontSize:'0.875rem' }}>Entry {ei+1}</span>
                          {getArr(editData.education).length>1&&<button style={DELBTN} onClick={()=>remEdu(ei)}>×</button>}
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                          {[['institution','University / School'],['degree','Degree & Field'],['year','Year Range'],['gpa','GPA / CGPA']].map(([k,l])=>(
                            <div key={k}><span style={LBL}>{l}</span><input style={INP} value={e[k]||''} onChange={ev=>setEduF(ei,k,ev.target.value)} placeholder={l}/></div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button style={ADDBTN} onClick={addEdu}>+ Add Education</button>
                  </div>}
                </div>

                {/* Experience entries */}
                {getArr(editData.experience).map((exp,ei)=>(
                  <div key={ei} style={SECWRAP}>
                    <button style={secBtn(`exp${ei}`)} onClick={()=>setOpenSec(openSec===`exp${ei}`?null:`exp${ei}`)}>
                      <span>💼 {exp.role||'Experience'} @ {exp.company||'...'}</span>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <button onClick={e=>{e.stopPropagation();remExp(ei)}} style={{ ...DELBTN, background:'transparent', color:'#DC3545', border:'1px solid #DC3545' }}>×</button>
                        <span>{openSec===`exp${ei}`?'▲':'▼'}</span>
                      </div>
                    </button>
                    {openSec===`exp${ei}`&&<div style={{ padding:'12px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                        {[['company','Company'],['role','Job Title'],['duration','Duration'],['location','Location']].map(([k,l])=>(
                          <div key={k}><span style={LBL}>{l}</span><input style={INP} value={exp[k]||''} onChange={e=>setExpF(ei,k,e.target.value)} placeholder={l}/></div>
                        ))}
                      </div>
                      <span style={LBL}>Bullet Points — Start with action verbs, include metrics</span>
                      {getArr(exp.bullets).map((b,bi)=>(
                        <div key={bi} style={{ display:'flex', gap:'5px', alignItems:'center', marginBottom:'5px' }}>
                          <span style={{ color:'#C9A84C', flexShrink:0 }}>•</span>
                          <input style={{ ...INP, flex:1 }} value={b} onChange={e=>setExpB(ei,bi,e.target.value)} placeholder={`Bullet ${bi+1}: e.g. Developed X that improved Y by Z%`}/>
                          <button style={DELBTN} onClick={()=>remExpB(ei,bi)}>×</button>
                        </div>
                      ))}
                      <button style={ADDBTN} onClick={()=>addExpB(ei)}>+ Add Bullet</button>
                    </div>}
                  </div>
                ))}
                <div style={{ padding:'4px 0 8px' }}>
                  <button style={{ ...ADDBTN, width:'100%', textAlign:'center' }} onClick={addExp}>+ Add Work Experience / Internship</button>
                </div>

                {/* Project entries */}
                {getArr(editData.projects).map((p,pi)=>(
                  <div key={pi} style={SECWRAP}>
                    <button style={secBtn(`proj${pi}`)} onClick={()=>setOpenSec(openSec===`proj${pi}`?null:`proj${pi}`)}>
                      <span>🚀 {p.name||`Project ${pi+1}`}</span>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <button onClick={e=>{e.stopPropagation();remProj(pi)}} style={{ ...DELBTN, background:'transparent', color:'#DC3545', border:'1px solid #DC3545' }}>×</button>
                        <span>{openSec===`proj${pi}`?'▲':'▼'}</span>
                      </div>
                    </button>
                    {openSec===`proj${pi}`&&<div style={{ padding:'12px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                        {[['name','Project Name'],['tech','Tech Stack'],['description','Description'],['link','GitHub / Demo Link']].map(([k,l])=>(
                          <div key={k}><span style={LBL}>{l}</span><input style={INP} value={p[k]||''} onChange={e=>setProjF(pi,k,e.target.value)} placeholder={l}/></div>
                        ))}
                      </div>
                      <span style={LBL}>Bullet Points</span>
                      {getArr(p.bullets).map((b,bi)=>(
                        <div key={bi} style={{ display:'flex', gap:'5px', alignItems:'center', marginBottom:'5px' }}>
                          <span style={{ color:'#C9A84C', flexShrink:0 }}>•</span>
                          <input style={{ ...INP, flex:1 }} value={b} onChange={e=>setProjB(pi,bi,e.target.value)} placeholder="What was built, what problem solved, what tech used"/>
                          <button style={DELBTN} onClick={()=>remProjB(pi,bi)}>×</button>
                        </div>
                      ))}
                      <button style={ADDBTN} onClick={()=>addProjB(pi)}>+ Add Bullet</button>
                    </div>}
                  </div>
                ))}
                <div style={{ padding:'4px 0 8px' }}>
                  <button style={{ ...ADDBTN, width:'100%', textAlign:'center' }} onClick={addProj}>+ Add Project</button>
                </div>

                {/* Skills */}
                <div style={SECWRAP}>
                  <button style={secBtn('skills')} onClick={()=>setOpenSec(openSec==='skills'?null:'skills')}><span>🛠️ Skills</span><span>{openSec==='skills'?'▲':'▼'}</span></button>
                  {openSec==='skills'&&<div style={{ padding:'12px' }}>
                    {Object.entries(editData.skills||{}).map(([k,v])=>(
                      <div key={k} style={{ marginBottom:'8px' }}>
                        <span style={LBL}>{k.charAt(0).toUpperCase()+k.slice(1)}</span>
                        <input style={INP} value={v||''} onChange={e=>setSkill(k,e.target.value)} placeholder={k==='languages'?'Python, JavaScript, Java, C++':k==='frameworks'?'React, Node.js, Django':k==='tools'?'Git, VS Code, AutoCAD, Docker':k==='databases'?'MySQL, MongoDB, PostgreSQL':'Problem-solving, Teamwork, Communication'}/>
                      </div>
                    ))}
                  </div>}
                </div>

                {/* Achievements */}
                <div style={SECWRAP}>
                  <button style={secBtn('achievements')} onClick={()=>setOpenSec(openSec==='achievements'?null:'achievements')}><span>🏆 Achievements ({getArr(editData.achievements).filter(a=>a.trim()).length})</span><span>{openSec==='achievements'?'▲':'▼'}</span></button>
                  {openSec==='achievements'&&<div style={{ padding:'12px' }}>
                    {getArr(editData.achievements).map((a,ai)=>(
                      <div key={ai} style={{ display:'flex', gap:'5px', alignItems:'center', marginBottom:'5px' }}>
                        <input style={{ ...INP, flex:1 }} value={a} onChange={e=>setListI('achievements',ai,e.target.value)} placeholder="Won 1st place in Hackathon"/>
                        <button style={DELBTN} onClick={()=>remListI('achievements',ai)}>×</button>
                      </div>
                    ))}
                    <button style={ADDBTN} onClick={()=>addListI('achievements')}>+ Add Achievement</button>
                  </div>}
                </div>

                {/* Certifications */}
                <div style={SECWRAP}>
                  <button style={secBtn('certifications')} onClick={()=>setOpenSec(openSec==='certifications'?null:'certifications')}><span>📜 Certifications ({getArr(editData.certifications).filter(c=>c.trim()).length})</span><span>{openSec==='certifications'?'▲':'▼'}</span></button>
                  {openSec==='certifications'&&<div style={{ padding:'12px' }}>
                    {getArr(editData.certifications).map((c,ci)=>(
                      <div key={ci} style={{ display:'flex', gap:'5px', alignItems:'center', marginBottom:'5px' }}>
                        <input style={{ ...INP, flex:1 }} value={c} onChange={e=>setListI('certifications',ci,e.target.value)} placeholder="AWS Certified Solutions Architect"/>
                        <button style={DELBTN} onClick={()=>remListI('certifications',ci)}>×</button>
                      </div>
                    ))}
                    <button style={ADDBTN} onClick={()=>addListI('certifications')}>+ Add Certification</button>
                  </div>}
                </div>

                {/* Custom Sections */}
                <div style={SECWRAP}>
                  <button style={secBtn('custom')} onClick={()=>setOpenSec(openSec==='custom'?null:'custom')}><span>➕ Custom Sections ({getArr(editData.customSections).length})</span><span>{openSec==='custom'?'▲':'▼'}</span></button>
                  {openSec==='custom'&&<div style={{ padding:'12px' }}>
                    {getArr(editData.customSections).map((cs,ci)=>(
                      <div key={ci} style={{ marginBottom:'12px', padding:'10px', background:'#F8F9FA', borderRadius:'6px', border:'1px solid #E9ECEF' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                          <input style={{ ...INP, width:'auto', fontWeight:'700' }} value={cs.title||''} onChange={e=>setCSTitle(ci,e.target.value)} placeholder="Section Title"/>
                          <button style={DELBTN} onClick={()=>remCS(ci)}>×</button>
                        </div>
                        {getArr(cs.items).map((item,ii)=>(
                          <div key={ii} style={{ display:'flex', gap:'5px', alignItems:'center', marginBottom:'5px' }}>
                            <input style={{ ...INP, flex:1 }} value={item} onChange={e=>setCSItem(ci,ii,e.target.value)} placeholder="Item detail"/>
                            <button style={DELBTN} onClick={()=>remCSItem(ci,ii)}>×</button>
                          </div>
                        ))}
                        <button style={ADDBTN} onClick={()=>addCSItem(ci)}>+ Add Item</button>
                      </div>
                    ))}
                    <button style={{ ...ADDBTN, width:'100%' }} onClick={addCustom}>+ Create New Section</button>
                  </div>}
                </div>

              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <button className="btn btn-ghost" onClick={()=>setStep(3)}>← Layouts</button>
                <button className="btn btn-primary" onClick={()=>setStep(5)} style={{ padding:'10px 24px' }}>Finalize PDF →</button>
              </div>
            </div>

            {/* PREVIEW */}
            {showPreview && (
              <div style={{ position: 'sticky', top: '20px' }}>
                <LivePreview data={editData} template={template} />
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 5: EXPORT ══ */}
        {step===5&&editData&&(
          <div style={{ maxWidth:'500px', margin:'0 auto', textAlign:'center', padding:'3rem 0' }}>
            <div className="card">
              <h2 style={{ color:'#0A1628', marginBottom:'1rem' }}>🎉 Ready to Export</h2>
              <p style={{ color:'#6C757D', marginBottom:'2rem' }}>Your resume has been optimized and mapped to the <b>{TEMPLATES.find(t=>t.id===template)?.name}</b> template.</p>
              <button className="btn btn-primary btn-full btn-lg" onClick={downloadPDF} disabled={generating}>
                {generating ? 'Generating PDF...' : 'Download PDF'}
              </button>
              <button className="btn btn-ghost" onClick={()=>setStep(4)} style={{ marginTop:'1rem' }}>← Back to Editor</button>
            </div>
          </div>
        )}

      </>}
    </div>
  )
}
