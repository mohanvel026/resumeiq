import React, { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'
import jsPDF from 'jspdf'
import { 
  FileText, Wand2, LayoutTemplate, Sliders, Download,
  CheckCircle2, AlertOctagon, Info, Zap, X, ChevronDown, ChevronRight, Plus, AlertCircle, FileSearch, Sparkles, Lightbulb
} from 'lucide-react'

// ─────────────────────────────────────────
// PDF ENGINE — TRUE MULTI-PAGE SUPPORT
// ─────────────────────────────────────────
class PDFEngine {
  constructor(template, settings = {}) {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.template = template
    this.settings = {
      fontSize: 'medium', // small, medium, large
      accentColor: '#0A1628',
      ...settings
    }
    this.W = 210
    this.H = 297
    this.M = 15 // Margin
    this.CW = this.W - this.M * 2
    this.y = 15
    this.pageNum = 1
    
    // Scale all fonts based on settings
    this.fScale = this.settings.fontSize === 'small' ? 0.9 : this.settings.fontSize === 'large' ? 1.1 : 1
    this.accentRgb = this.hexToRgb(this.settings.accentColor)
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#0A1628')
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [10, 22, 40]
  }

  safe(v) { return String(v || '').trim() }

  // Draw text, handle internal page breaking if necessary line-by-line
  text(str, x, yParam, opts = {}) {
    if (!str || !this.safe(str)) return 0
    let { size = 10, bold = false, italic = false, color = [30,30,30], maxW, align = 'left' } = opts
    size *= this.fScale
    const w = maxW !== undefined ? maxW : (this.W - x - this.M)
    this.doc.setFontSize(size)
    this.doc.setFont('helvetica', italic ? 'italic' : bold ? 'bold' : 'normal')
    this.doc.setTextColor(...color)
    
    const lines = this.doc.splitTextToSize(this.safe(str), w)
    const lineHeight = size * 0.38
    
    // If yParam is provided, we use it (legacy support for two-col). 
    // If not, we use this.y and auto-page break
    let useInternalY = yParam === undefined || yParam === null
    let currentY = useInternalY ? this.y : yParam
    let startY = currentY

    lines.forEach(line => {
      if (useInternalY && this.need(lineHeight)) {
        currentY = this.y // updated by need()
      } else if (!useInternalY && currentY + lineHeight > 283) {
        // If passing y, we might not want auto page breaks, but let's do a basic one
        this.doc.addPage()
        this.pageNum++
        currentY = 15
      }
      this.doc.text(line, x, currentY, { align })
      currentY += lineHeight
    })
    
    if (useInternalY) {
      this.y = currentY
      return currentY - startY
    } else {
      return currentY - startY
    }
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

  need(space, bgDrawFn = null) {
    if (this.y + space > 280) {
      this.doc.addPage()
      this.pageNum++
      this.y = 15
      if (bgDrawFn) bgDrawFn() // For two-column bg fill on new pages
      return true
    }
    return false
  }

  contact(items) { return items.filter(Boolean).join('  ·  ') }

  // Fallback section names
  st(d, key, defaultName) {
    return d.sectionTitles?.[key] || defaultName
  }

  build(d) {
    if (this.template === 'modern') this.buildModern(d)
    else if (this.template === 'academic') this.buildAcademic(d)
    else if (this.template === 'classic') this.buildClassic(d)
    else if (this.template === 'minimal') this.buildMinimal(d)
    else if (this.template === 'twocol') this.buildTwoCol(d)
    return this.doc
  }

  buildModern(d) {
    this.y = 15
    this.text(d.name, this.W/2, null, { size:24, bold:true, color:this.accentRgb, align:'center', maxW:this.W })
    this.y += 3
    const c1 = this.contact([d.email, d.phone, d.location])
    this.text(c1, this.W/2, null, { size:9, color:[80,80,80], align:'center', maxW:this.W })
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) { this.text(c2, this.W/2, null, { size:9, color:[80,80,80], align:'center', maxW:this.W }) }
    this.y += 3; this.hline(this.y, [200,200,200], 0.3); this.y += 6

    const sec = (title) => {
      this.need(12)
      this.text(title.toUpperCase(), this.M, null, { size:11.5, bold:true, color:this.accentRgb })
      this.y += 1
      this.hline(this.y, [220,220,220], 0.4)
      this.y += 4
    }
    this._sections(d, sec, { bc:'• ', bi:3, hs:10.5, ss:9.5, bs:9, ind:0, accent:this.accentRgb })
  }

  buildAcademic(d) {
    this.y = 0
    this.rect(0, 0, this.W, 36, [245,245,245])
    this.y = 14
    this.text(this.safe(d.name), this.W/2, null, { size:22, bold:true, color:[20,20,20], align:'center', maxW:this.W })
    this.y += 2
    this.text(this.contact([d.email, d.phone, d.location]), this.W/2, null, { size:9, color:[70,70,70], align:'center', maxW:this.W })
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) this.text(c2, this.W/2, null, { size:9, color:[70,70,70], align:'center', maxW:this.W })
    this.y = 42

    const sec = (title) => {
      this.need(14)
      this.rect(this.M-2, this.y-4.5, this.CW+4, 7.5, [230,230,230])
      this.text(title.toUpperCase(), this.M, null, { size:10.5, bold:true, color:[30,30,30] })
      this.y += 3
    }
    this._sections(d, sec, { bc:'• ', bi:6, hs:10, ss:9, bs:9, ind:2, accent:[30,30,30] })
  }

  buildClassic(d) {
    this.y = 16
    this.text(this.safe(d.name), this.W/2, null, { size:24, bold:true, color:[0,0,0], align:'center', maxW:this.W })
    this.y += 3
    this.text(this.contact([d.email, d.phone, d.location]), this.W/2, null, { size:9.5, color:[50,50,50], align:'center', maxW:this.W })
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) { this.text(c2, this.W/2, null, { size:9.5, color:[50,50,50], align:'center', maxW:this.W }) }
    this.y += 4; this.hline(this.y, [0,0,0], 0.6); this.y += 6

    const sec = (title) => {
      this.need(12)
      this.text(title.toUpperCase(), this.M, null, { size:12, bold:true, color:[0,0,0] })
      this.y += 1; this.hline(this.y, [0,0,0], 0.6); this.y += 4
    }
    this._sections(d, sec, { bc:'– ', bi:4, hs:10.5, ss:9.5, bs:9.5, ind:0, accent:[0,0,0] })
  }

  buildMinimal(d) {
    this.y = 18
    this.text(d.name, this.M, null, { size:22, bold:true, color:[0,0,0] })
    this.y += 2
    this.text(this.contact([d.email, d.phone, d.location]), this.M, null, { size:9, color:[100,100,100] })
    const c2 = this.contact([d.linkedin, d.github])
    if (c2) { this.text(c2, this.M, null, { size:9, color:[100,100,100] }) }
    this.y += 4; this.hline(this.y, this.accentRgb, 1.0); this.y += 6

    const sec = (title) => {
      this.need(12)
      this.text(title, this.M, null, { size:11, bold:true, color:this.accentRgb })
      this.y += 2
    }
    this._sections(d, sec, { bc:'  ', bi:0, hs:10, ss:9.5, bs:9.5, ind:0, accent:[0,0,0] })
  }

  buildTwoCol(d) {
    const LW = 68, RX = LW + 10, RW = this.W - RX - 8
    const darkBg = [15,23,42], headerBg = [8,18,36], gold = [201,168,76], lightTxt = [148,163,184]
    
    // Draw bg on new pages
    const drawBg = () => this.rect(0, 0, LW+4, this.H, darkBg)

    this.rect(0, 0, this.W, 40, headerBg)
    const parts = this.safe(d.name).split(' ')
    const first = parts[0] || '', rest = parts.slice(1).join(' ')
    this.doc.setFontSize(22 * this.fScale); this.doc.setFont('helvetica','bold')
    this.doc.setTextColor(248,250,252); this.doc.text(first, 8, 18)
    this.doc.setTextColor(...gold); this.doc.text(rest, 8 + this.doc.getTextWidth(first + ' '), 18)
    this.doc.setFontSize(8.5 * this.fScale); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(...lightTxt)
    if (d.email || d.phone) this.doc.text(this.contact([d.email, d.phone]), 8, 27)
    if (d.location || d.linkedin || d.github) this.doc.text(this.contact([d.location, d.linkedin, d.github]), 8, 33)

    this.rect(0, 40, LW+4, this.H-40, darkBg)
    let lY = 48
    this.y = 48 // rY uses this.y natively

    const lSec = (title) => {
      if (lY > 275) return // Too complex to paginate left col, just crop for now
      this.doc.setFontSize(9 * this.fScale); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(...gold)
      this.doc.text(title.toUpperCase(), 6, lY)
      this.doc.setDrawColor(...gold); this.doc.setLineWidth(0.3); this.doc.line(6, lY+1.5, LW-2, lY+1.5)
      lY += 7
    }

    const lText = (str, opts = {}) => {
      if (lY > 278 || !str) return 0
      const { size=8, bold=false, italic=false, color=[180,180,180] } = opts
      this.doc.setFontSize(size * this.fScale); this.doc.setFont('helvetica', italic?'italic':bold?'bold':'normal')
      this.doc.setTextColor(...color)
      const lines = this.doc.splitTextToSize(this.safe(str), LW-8)
      this.doc.text(lines, 6, lY); 
      const h = lines.length * (size * this.fScale * 0.38)
      lY += h; return h
    }

    const rSec = (title) => {
      this.need(14, drawBg)
      this.text(title.toUpperCase(), RX, null, { size:12, bold:true, color:[8,18,36], maxW: RW })
      this.doc.setDrawColor(8,18,36); this.doc.setLineWidth(0.4)
      this.doc.line(RX, this.y - (12*this.fScale*0.38) + 2, this.W-8, this.y - (12*this.fScale*0.38) + 2)
      this.y += 3
    }

    const rText = (str, opts = {}) => {
      opts.maxW = opts.maxW || RW
      return this.text(str, opts.x || RX, null, opts)
    }

    // LEFT COLUMN
    if (d.summary) { lSec(this.st(d,'summary','About')); lText(this.safe(d.summary).slice(0,350)); lY += 4 }
    if (d.education?.length) {
      lSec(this.st(d,'education','Education'))
      d.education.forEach(e => {
        if (lY > 274) return
        lText(this.safe(e.institution), { size:8.5, bold:true, color:[240,240,240] }); lY += 1
        lText(this.safe(e.degree), { size:7.5, italic:true, color:[160,160,160] }); lY += 1
        lText((e.year||'')+(e.gpa?' | '+e.gpa:''), { size:7.5, color:[120,120,120] }); lY += 4
      })
    }
    if (d.skills && Object.values(d.skills).some(v=>v)) {
      lSec(this.st(d,'skills','Skills'))
      Object.entries(d.skills).forEach(([k,v]) => {
        if (!v || lY > 272) return
        lText(k.charAt(0).toUpperCase()+k.slice(1)+':', { size:8, bold:true, color:gold }); lY += 2
        lText(this.safe(v), { size:7.5, color:[160,160,160] }); lY += 4
      })
    }
    d.customSections?.filter(s=>s.placement==='left').forEach(cs => {
      if (!cs.title || (!cs.items?.filter(i=>i.trim()).length && !cs.body?.trim())) return
      lSec(cs.title)
      if (cs.body) { lText(this.safe(cs.body), { size:7.5, color:[160,160,160] }); lY += 2 }
      cs.items?.filter(i=>i.trim()).forEach(item => { lText('• '+item, { size:7.5, color:[160,160,160] }); lY += 1 })
      lY += 3
    })
    if (d.achievements?.filter(a=>a.trim()).length) {
      lSec(this.st(d,'achievements','Achievements'))
      d.achievements.filter(a=>a.trim()).forEach(a => {
        if (lY > 274) return
        lText('• '+this.safe(a), { size:7.5, color:[160,160,160] }); lY += 2
      })
    }
    if (d.certifications?.filter(c=>c.trim()).length) {
      lSec(this.st(d,'certifications','Certifications'))
      d.certifications.filter(c=>c.trim()).forEach(c => {
        if (lY > 274) return
        lText('• '+this.safe(c), { size:7.5, color:[160,160,160] }); lY += 2
      })
    }

    // RIGHT COLUMN (Handled by this.y + need())
    if (d.experience?.length) {
      rSec(this.st(d,'experience','Experience'))
      d.experience.forEach(exp => {
        this.need(12, drawBg)
        // Manual draw for Company + Duration inline
        this.doc.setFontSize(10.5 * this.fScale); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(8,18,36)
        this.doc.text(this.safe(exp.company), RX, this.y)
        this.doc.setFontSize(8.5 * this.fScale); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(100,100,100)
        this.doc.text(this.safe(exp.duration), this.W-9, this.y, { align:'right' })
        this.y += (10.5 * this.fScale * 0.38) + 1
        
        rText(this.safe(exp.role), { size:9.5, italic:true, color:[70,70,70] }); this.y += 1
        exp.bullets?.filter(b=>b.trim()).forEach(b => {
          this.need(6, drawBg)
          rText('• '+this.safe(b), { size:9, color:[60,60,60], x:RX+3, maxW:RW-3 }); this.y += 1
        })
        this.y += 3
      })
    }
    if (d.projects?.length) {
      rSec(this.st(d,'projects','Projects'))
      d.projects.forEach(p => {
        this.need(12, drawBg)
        this.doc.setFontSize(10.5 * this.fScale); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(8,18,36)
        this.doc.text(this.safe(p.name), RX, this.y)
        if (p.link) {
          this.doc.setFontSize(8 * this.fScale); this.doc.setTextColor(100,140,220)
          this.doc.text(this.safe(p.link), this.W-9, this.y, { align:'right' })
        }
        this.y += (10.5 * this.fScale * 0.38) + 1
        if (p.tech) { rText('Tech: '+this.safe(p.tech), { size:8.5, italic:true, color:[90,90,90] }); this.y += 1 }
        p.bullets?.filter(b=>b.trim()).forEach(b => {
          this.need(6, drawBg)
          rText('• '+this.safe(b), { size:9, color:[60,60,60], x:RX+3, maxW:RW-3 }); this.y += 1
        })
        this.y += 3
      })
    }
    d.customSections?.filter(s=>s.placement!=='left').forEach(cs => {
      if (!cs.title || (!cs.items?.filter(i=>i.trim()).length && !cs.body?.trim())) return
      rSec(cs.title)
      if (cs.body) { this.need(8, drawBg); rText(this.safe(cs.body), { size:9, color:[60,60,60] }); this.y += 2 }
      cs.items?.filter(i=>i.trim()).forEach(item => { 
        this.need(6, drawBg); rText('• '+item, { size:9, color:[60,60,60], x:RX+3, maxW:RW-3 }); this.y += 1 
      })
      this.y += 3
    })
  }

  _sections(d, sec, opts) {
    const { bc, bi, hs, ss, bs, ind, accent } = opts
    const x = this.M + ind

    if (d.summary) {
      sec(this.st(d, 'summary', 'Professional Summary'))
      this.text(d.summary, x, null, { size:bs, color:[50,50,50], maxW:this.CW-ind })
      this.y += 4
    }

    if (d.education?.filter(e=>e.institution).length) {
      sec(this.st(d, 'education', 'Education'))
      d.education.filter(e=>e.institution).forEach(e => {
        this.need(14)
        this.doc.setFontSize(hs * this.fScale); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(...accent)
        this.doc.text(this.safe(e.institution), x, this.y)
        this.doc.setFontSize(8.5 * this.fScale); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(100,100,100)
        this.doc.text(this.safe(e.year), this.W-this.M, this.y, { align:'right' })
        this.y += (hs * this.fScale * 0.38) + 1
        
        this.text(`${this.safe(e.degree)}${e.gpa ? '  |  GPA: '+e.gpa : ''}`, x, null, { size:ss, italic:true, color:[60,60,60] })
        this.y += 3
      })
    }

    if (d.experience?.length) {
      sec(this.st(d, 'experience', 'Experience'))
      d.experience.forEach(exp => {
        this.need(14)
        this.doc.setFontSize(hs * this.fScale); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(...accent)
        this.doc.text(this.safe(exp.company), x, this.y)
        this.doc.setFontSize(8.5 * this.fScale); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(100,100,100)
        this.doc.text(this.safe(exp.duration), this.W-this.M, this.y, { align:'right' })
        this.y += (hs * this.fScale * 0.38) + 1

        this.doc.setFontSize(ss * this.fScale); this.doc.setFont('helvetica','italic'); this.doc.setTextColor(60,60,60)
        this.doc.text(this.safe(exp.role), x, this.y)
        if (exp.location) {
          this.doc.setFontSize(8.5 * this.fScale); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(120,120,120)
          this.doc.text(this.safe(exp.location), this.W-this.M, this.y, { align:'right' })
        }
        this.y += (ss * this.fScale * 0.38) + 1.5

        exp.bullets?.filter(b=>b.trim()).forEach(b => {
          this.need(6)
          this.text(bc+this.safe(b), x+bi, null, { size:bs, color:[50,50,50], maxW:this.CW-ind-bi })
          this.y += 1.5
        })
        this.y += 3
      })
    }

    if (d.projects?.length) {
      sec(this.st(d, 'projects', 'Projects'))
      d.projects.forEach(p => {
        this.need(14)
        this.doc.setFontSize(hs * this.fScale); this.doc.setFont('helvetica','bold'); this.doc.setTextColor(...accent)
        this.doc.text(this.safe(p.name), x, this.y)
        if (p.link) {
          this.doc.setFontSize(8 * this.fScale); this.doc.setFont('helvetica','normal'); this.doc.setTextColor(0,80,200)
          this.doc.text(this.safe(p.link), this.W-this.M, this.y, { align:'right' })
        }
        this.y += (hs * this.fScale * 0.38) + 1

        if (p.tech) { 
          this.text('Tech Stack: '+this.safe(p.tech), x, null, { size:bs, italic:true, color:[80,80,80], maxW:this.CW-ind })
          this.y += 1.5 
        }
        p.bullets?.filter(b=>b.trim()).forEach(b => {
          this.need(6)
          this.text(bc+this.safe(b), x+bi, null, { size:bs, color:[50,50,50], maxW:this.CW-ind-bi })
          this.y += 1.5
        })
        this.y += 3
      })
    }

    d.customSections?.filter(s=>s.placement!=='left').forEach(cs => {
      if (!cs.title || (!cs.items?.filter(i=>i.trim()).length && !cs.body?.trim())) return
      sec(cs.title)
      if (cs.body) {
        this.need(8)
        this.text(this.safe(cs.body), x, null, { size:bs, color:[50,50,50], maxW:this.CW-ind })
        this.y += 2
      }
      cs.items?.filter(i=>i.trim()).forEach(item => {
        this.need(6)
        this.text(bc+this.safe(item), x+bi, null, { size:bs, color:[50,50,50], maxW:this.CW-ind-bi })
        this.y += 1.5
      })
      this.y += 3
    })

    if (d.skills && Object.values(d.skills).some(v=>v)) {
      sec(this.st(d, 'skills', 'Skills'))
      Object.entries(d.skills).forEach(([k,v]) => {
        if (!v) return
        this.need(7)
        this.text(k.charAt(0).toUpperCase()+k.slice(1)+':', x, null, { size:bs+0.5, bold:true, color:accent })
        this.y -= (bs+0.5) * this.fScale * 0.38 // back up to draw inline
        this.text(this.safe(v), x+28, null, { size:bs, color:[50,50,50], maxW:this.CW-ind-28 })
        this.y += 1.5
      })
      this.y += 2
    }

    if (d.achievements?.filter(a=>a.trim()).length) {
      sec(this.st(d, 'achievements', 'Achievements'))
      d.achievements.filter(a=>a.trim()).forEach(a => {
        this.need(6)
        this.text(bc+this.safe(a), x+bi, null, { size:bs, color:[50,50,50], maxW:this.CW-ind-bi })
        this.y += 2
      })
    }

    if (d.certifications?.filter(c=>c.trim()).length) {
      sec(this.st(d, 'certifications', 'Certifications'))
      d.certifications.filter(c=>c.trim()).forEach(c => {
        this.need(6)
        this.text(bc+this.safe(c), x+bi, null, { size:bs, color:[50,50,50], maxW:this.CW-ind-bi })
        this.y += 2
      })
    }
  }
}

// ─────────────────────────────────────────
// INDUSTRY-LEVEL SUGGESTION ENGINE
// ─────────────────────────────────────────
const analyzeResume = (data) => {
  const s = []
  
  // Basic Info
  if (!data.email) s.push({ type:'critical', section:'basic', title:'Missing Email', detail:'ATS systems require an email address to parse candidate profiles.', fix:'Add your professional email.' })
  if (!data.phone) s.push({ type:'critical', section:'basic', title:'Missing Phone Number', detail:'Recruiters need a phone number to schedule interviews.', fix:'Add a 10-digit mobile number.' })
  if (!data.linkedin) s.push({ type:'high', section:'basic', title:'No LinkedIn URL', detail:'87% of recruiters verify candidates on LinkedIn before calling.', fix:'Add linkedin.com/in/yourname.' })
  
  // Summary
  if (!data.summary || data.summary.length < 50) s.push({ type:'high', section:'summary', title:'No/Weak Professional Summary', detail:'Resumes with summaries get 40% more callbacks. ATS extracts keywords from it.', fix:'Write 2-3 sentences outlining your core role, top 3 skills, and career goal.' })
  else if (data.summary.length > 500) s.push({ type:'medium', section:'summary', title:'Summary Too Long', detail:'Recruiters spend 6 seconds scanning. Long summaries are ignored.', fix:'Trim to 3-5 concise lines.' })

  // Experience
  data.experience?.forEach((exp, i) => {
    const bullets = exp.bullets?.filter(b=>b.trim()) || []
    if (!bullets.length) {
      s.push({ type:'critical', section:`experience.${i}`, title:`No Bullets — "${exp.company}"`, detail:'Experience entries without bullets score 0 on ATS impact metrics.', fix:'Add 3-5 bullet points: what you did, what tools you used, and outcomes.' })
    } else {
      let metricCount = 0
      let passiveCount = 0
      const txt = bullets.join(' ').toLowerCase()
      
      const passiveVerbs = ['helped','assisted','worked on','responsible for','part of','did','made','tasked with','handled']
      const _strongVerbs = ['developed','implemented','led','optimized','built','delivered','designed','reduced','increased','engineered','orchestrated']
      
      passiveVerbs.forEach(v => { if(txt.includes(v)) passiveCount++ })
      if (/\d+%|\d+x|\d+ (users|clients|hours|days|months|projects|members|records|tests|queries|requests|dollars)/i.test(txt)) metricCount++
      if (/\$[0-9]+|[0-9]+M|[0-9]+K/.test(txt)) metricCount++

      if (passiveCount > 0)
        s.push({ type:'high', section:`experience.${i}`, title:`Passive Language — "${exp.company}"`, detail:'Words like "helped" or "responsible for" score poorly in ATS.', fix:'Start bullets with strong action verbs: Developed, Built, Managed, Optimized, Led.' })
      if (metricCount === 0)
        s.push({ type:'high', section:`experience.${i}`, title:`No Metrics — "${exp.company}"`, detail:'Quantified bullets score 60% higher. Numbers prove real impact.', fix:'Add metrics: "Reduced load time by 30%", "Handled 500+ requests/min", "Saved 8 hours/week".' })
    }
  })

  // Skills
  const skillsText = Object.values(data.skills||{}).join(' ')
  if (!skillsText || skillsText.trim().length < 20) s.push({ type:'critical', section:'skills', title:'Skills Section Empty', detail:'25% of ATS score is keyword matching. Empty skills = very low ATS score.', fix:'Add all tools, languages, frameworks, and soft skills you know.' })

  // Projects
  if (!data.projects?.length) s.push({ type:'medium', section:'projects', title:'No Projects', detail:'For junior/mid roles, projects prove hands-on capability.', fix:'Add 2-3 projects with tech stack and 2-3 impact bullets each.' })
  else data.projects.forEach((p,i) => {
    if (!p.tech) s.push({ type:'medium', section:`projects.${i}`, title:`No Tech Stack — "${p.name}"`, detail:'Missing tech stack loses keyword matches.', fix:'Add technologies used (e.g., React, Node.js, Python).' })
    if (!p.bullets?.filter(b=>b.trim()).length) s.push({ type:'high', section:`projects.${i}`, title:`No Description — "${p.name}"`, detail:'Projects without description are ignored.', fix:'Describe what you built and why.' })
  })

  // Education
  if (!data.education?.filter(e=>e.institution).length) s.push({ type:'critical', section:'education', title:'No Education', detail:'Education is mandatory for most ATS parsers.', fix:'Add institution, degree, and graduation year.' })

  const order = { critical:0, high:1, medium:2, low:3 }
  return s.sort((a,b) => order[a.type]-order[b.type])
}

// ─────────────────────────────────────────
// BLANK DATA TEMPLATE
// ─────────────────────────────────────────
const blankData = () => ({
  name:'', email:'', phone:'', linkedin:'', github:'', location:'',
  summary:'',
  sectionTitles: {
    summary: 'Professional Summary',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    skills: 'Technical Skills',
    achievements: 'Achievements',
    certifications: 'Certifications'
  },
  settings: {
    fontSize: 'medium', // small, medium, large
    accentColor: '#0A1628',
  },
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
  
  const [pdfBlob, setPdfBlob] = useState(null)

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
        api.post('/api/analysis/score', { resumeId: selectedId }).catch(()=>({data:{improvements:[]}}))
      ])
      const parsed = { ...blankData(), ...parseRes.data }
      
      if (!parsed.sectionTitles) parsed.sectionTitles = blankData().sectionTitles
      if (!parsed.settings) parsed.settings = blankData().settings
      if (!parsed.certifications) parsed.certifications = []
      if (!parsed.customSections) parsed.customSections = []
      if (!parsed.skills) parsed.skills = blankData().skills
      
      setEditData(parsed)
      const localSuggs = analyzeResume(parsed)
      const aiSuggs = (scoreRes.data.improvements||[]).slice(0,2).map(s=>({
        type:'medium', section:'general', title:'AI Suggestion', detail:'AI-detected improvement.', fix:s
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
        } else if (updated.summary.length > 500) {
          updated.summary = updated.summary.slice(0, 300) + '... (Trimmed for ATS optimization)'
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
              const weak = ['helped','assisted','worked','was','did','made','got','took','had','tried','started','handled','responsible']
              if (weak.some(w=>words[0].toLowerCase().startsWith(w)))
                return strongVerbs[bi%strongVerbs.length]+' '+words.slice(1).join(' ')
              if (!/\d/.test(b) && bi<3)
                return b.trimEnd()+' (Add metric e.g., "by 30%" or "for 500+ users")'
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
          if (!p.tech) updated.projects[pi].tech = 'React, Node.js, Next.js, TypeScript'
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

  const upd = fn => setEditData(prev=>fn(JSON.parse(JSON.stringify(prev))))
  const setField = (k,v) => setEditData(prev=>({...prev,[k]:v}))
  const setSTitle = (k,v) => setEditData(prev=>({...prev,sectionTitles:{...prev.sectionTitles,[k]:v}}))
  const setSetting = (k,v) => setEditData(prev=>({...prev,settings:{...prev.settings,[k]:v}}))
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
  
  const addCustom = () => upd(d=>{d.customSections=[...(d.customSections||[]),{title:'New Section', body:'', items:[''], placement:'right'}];return d})
  const setCSF = (ci,k,v) => upd(d=>{d.customSections[ci][k]=v;return d})
  const setCSItem = (ci,ii,v) => upd(d=>{d.customSections[ci].items[ii]=v;return d})
  const addCSItem = (ci) => upd(d=>{d.customSections[ci].items.push('');return d})
  const remCSItem = (ci,ii) => upd(d=>{d.customSections[ci].items.splice(ii,1);return d})
  const remCS = (ci) => upd(d=>{d.customSections.splice(ci,1);return d})

  const downloadPDF = async (previewOnly = false) => {
    if (!previewOnly) setGenerating(true)
    try {
      const engine = new PDFEngine(template, editData.settings)
      const doc = engine.build(editData)
      if (previewOnly) {
        return doc.output('bloburl')
      } else {
        doc.save(`${editData.name?.replace(/\s+/g,'_')||'resume'}-${template}.pdf`)
        trackActivity('exports')
      }
    } catch(e) { alert('PDF error: '+e.message); console.error(e) }
    finally { if(!previewOnly) setGenerating(false) }
  }

  useEffect(() => {
    if (step >= 4 && editData) {
      const timer = setTimeout(async () => {
        const blobUrl = await downloadPDF(true)
        setPdfBlob(blobUrl)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [editData, template, step])

  const STEPS = [
    { num: 1, label: 'Select', icon: FileText },
    { num: 2, label: 'Optimization', icon: Wand2 },
    { num: 3, label: 'Template', icon: LayoutTemplate },
    { num: 4, label: 'Editor & Preview', icon: Sliders },
    { num: 5, label: 'Export', icon: Download }
  ]

  const InputCls = "w-full border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 px-4 py-3 border bg-white dark:bg-slate-900 disabled:opacity-60 transition-all text-[14px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
  const LabelCls = "text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-2 mt-4 block"
  
  const addItem = (section) => {
    setEditData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), {}]
    }))
  }

  const removeItem = (section, idx) => {
    setEditData(prev => {
      const arr = [...(prev[section] || [])]
      arr.splice(idx, 1)
      return { ...prev, [section]: arr }
    })
  }

  const updateField = (section, idx, field, val) => {
    setEditData(prev => {
      if (idx === null) {
        if (section === 'personalInfo') {
          return { ...prev, [field]: val }
        }
        return { ...prev, [section]: { ...(prev[section] || {}), [field]: val } }
      }
      const arr = [...(prev[section] || [])]
      if (!arr[idx]) arr[idx] = {}
      
      if (field === 'items' || field === 'description') {
        arr[idx][field] = val.split('\n').map(v => v.replace(/^- /, '')).filter(Boolean)
      } else {
        arr[idx][field] = val
      }
      return { ...prev, [section]: arr }
    })
  }

  return (
    <Layout>
      <div className="w-full h-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* PREMIUM ENTERPRISE TOP NAVBAR */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:px-6 mb-8 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">AI Resume Studio</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Optimization & Export Engine</p>
            </div>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 w-full xl:w-auto overflow-x-auto">
            {STEPS.map((s) => {
              const active = step === s.num;
              const done = step > s.num;
              return (
                <div key={s.num} onClick={() => done && setStep(s.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${done ? 'cursor-pointer' : 'cursor-default'} ${
                    active 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                      : done
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        : 'text-slate-400 dark:text-slate-600'
                  }`}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <s.icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />}
                  {s.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* MAIN WORKSPACE AREA */}
        <div className="flex flex-col w-full h-full relative">
          {loading ? (
            <div className="py-32 flex items-center justify-center flex-col gap-5">
              <div className="w-8 h-8 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Initializing engine...</span>
            </div>
          ) : (
            <div className="w-full">
              
              {/* ══ STEP 1: SELECT ══ */}
              {step === 1 && (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Select Source Document</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Choose an existing profile to analyze, format, and export.</p>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    {resumes.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                          <AlertOctagon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No profiles found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">You need to create a resume in the studio before you can export it.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {resumes.map(r => (
                          <div key={r.id} onClick={() => setSelectedId(r.id)}
                            className={`p-4 m-2 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                              selectedId === r.id 
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30' 
                                : 'bg-transparent border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                selectedId === r.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}><FileText className="w-4 h-4" /></div>
                              <div>
                                <h4 className={`text-sm font-bold ${selectedId === r.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{r.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold uppercase">{r.fileType || 'PDF'}</span>
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedId === r.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {selectedId === r.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={parseAndAnalyze} disabled={parsing || !selectedId}>
                        {parsing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Executing AI Analysis...</> : <><Wand2 className="w-4 h-4" /> Run AI Analysis</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2: AI OPTIMIZATION ══ */}
              {step === 2 && editData && (
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Document Analysis</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review structural issues identified by our AI before moving to layout.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
                    {/* LEFT PANEL: PROFILE SUMMARY */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl flex items-center justify-center font-bold text-xl mb-4 border border-indigo-200/50 dark:border-indigo-700/30">
                          {editData.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate mb-1">{editData.name || 'Unknown'}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-6">{editData.email || 'No email'}</p>
                        
                        <div className="space-y-4">
                          {[
                            { k: 'Professional Summary', v: editData.summary?.length > 20 },
                            { k: `Education (${editData.education?.filter(e=>e.institution).length || 0})`, v: editData.education?.some(e=>e.institution) },
                            { k: `Experience (${editData.experience?.length || 0})`, v: editData.experience?.length > 0 },
                            { k: `Projects (${editData.projects?.length || 0})`, v: editData.projects?.length > 0 },
                            { k: 'Technical Skills', v: Object.values(editData.skills || {}).some(v=>v) },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-sm font-semibold group">
                              <span className="text-slate-600 dark:text-slate-300">{s.k}</span>
                              {s.v ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center"><X className="w-3 h-3 text-rose-500"/></div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: AI SUGGESTIONS */}
                    <div className="lg:col-span-8">
                      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-full min-h-[500px]">
                        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3 rounded-t-2xl">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/30">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Improvement Suggestions</h3>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                          {suggestions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                              </div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Excellent Structure</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">We couldn't find any critical formatting issues. Your resume is well-structured and ready for layout generation.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {suggestions.map((s, i) => {
                                const done = appliedIdx.includes(i);
                                return (
                                  <div key={i} className={`p-5 rounded-xl border transition-all duration-300 ${
                                    done 
                                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 opacity-70' 
                                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm'
                                  }`}>
                                    <div className="flex items-start gap-4">
                                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        done 
                                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                      }`}>
                                        {done ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className={`text-sm font-bold mb-1.5 ${done ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{s.title}</h5>
                                        {!done && (
                                          <>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{s.detail}</p>
                                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 mb-4 font-mono">
                                              <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-2 uppercase tracking-wider">Fix:</span>
                                              {s.fix}
                                            </div>
                                            <button onClick={() => applySuggestion(s, i)} disabled={applyingIdx === i}
                                              className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-indigo-200 dark:border-indigo-500/30">
                                              {applyingIdx === i ? <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> Applying...</> : 'Apply Recommendation'}
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-2xl flex justify-between items-center">
                           <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-4 py-2" onClick={() => setStep(1)}>Back</button>
                           <button className="bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors" onClick={() => setStep(3)}>Proceed to Layouts</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 3: TEMPLATES ══ */}
              {step === 3 && (
                <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Architecture Layout</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Select a foundational structure. You can switch layouts dynamically in the editor.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {TEMPLATES.map(t => (
                      <div key={t.id} onClick={() => setTemplate(t.id)}
                        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 group relative ${
                          template === t.id 
                            ? 'border-indigo-500 shadow-md' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                        }`}>
                        <div className="aspect-[1/1.414] w-full bg-slate-50 dark:bg-[#09090b] rounded-xl mb-4 relative overflow-hidden flex flex-col pt-3 px-3 border border-slate-100 dark:border-slate-800/80 transition-colors">
                          <div className={`w-full h-1.5 mb-2.5 rounded-full ${t.id === 'modern' ? 'bg-indigo-400 dark:bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                          <div className="w-3/4 h-1.5 mb-4 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                          <div className="flex gap-2 flex-1">
                            {t.id === 'twocol' && <div className="w-1/3 h-full bg-slate-200 dark:bg-slate-800 rounded-t-sm opacity-50"></div>}
                            <div className="flex-1 flex flex-col gap-2">
                              {[1,2,3,4].map(i => <div key={i} className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 opacity-50"></div>)}
                            </div>
                          </div>
                        </div>
                        <h4 className={`text-sm font-bold text-center ${template === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{t.name}</h4>
                        {template === t.id && (
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 flex gap-1">
                      <button className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2.5 rounded-lg transition-colors" onClick={() => setStep(2)}>Back</button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm" onClick={() => setStep(4)}>Enter Editor</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 4: EDITOR & PREVIEW ══ */}
              {step === 4 && editData && (
                <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
                  
                  {/* LEFT: EDITOR PANEL */}
                  <div className="w-full lg:w-[420px] flex flex-col h-[calc(100vh-180px)] min-h-[600px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider"><Sliders className="w-4 h-4 text-indigo-500"/> Content Editor</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
                      {/* Personal Info */}
                      <section>
                        <h4 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Identity</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div><label className={LabelCls}>Full Name</label><input className={InputCls} value={editData.name||''} onChange={(e)=>updateField('personalInfo', null, 'name', e.target.value)} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className={LabelCls}>Email</label><input className={InputCls} value={editData.email||''} onChange={(e)=>updateField('personalInfo', null, 'email', e.target.value)} /></div>
                            <div><label className={LabelCls}>Phone</label><input className={InputCls} value={editData.phone||''} onChange={(e)=>updateField('personalInfo', null, 'phone', e.target.value)} /></div>
                          </div>
                          <div><label className={LabelCls}>Location</label><input className={InputCls} value={editData.location||''} onChange={(e)=>updateField('personalInfo', null, 'location', e.target.value)} /></div>
                        </div>
                      </section>

                      {/* Summary */}
                      <section>
                        <h4 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Summary</h4>
                        <textarea className={`${InputCls} h-28 py-3`} value={editData.summary||''} onChange={(e)=>updateField('personalInfo', null, 'summary', e.target.value)} />
                      </section>

                      {/* Dynamic Sections */}
                      {['experience', 'education', 'projects', 'skills'].map(sectionKey => {
                        const items = editData[sectionKey] || [];
                        return (
                          <section key={sectionKey}>
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                              <h4 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{sectionKey}</h4>
                              <button onClick={() => addItem(sectionKey)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-1 bg-indigo-50 dark:bg-indigo-500/10 rounded">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="space-y-4">
                              {items.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                                  <button onClick={() => removeItem(sectionKey, idx)} className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-800 rounded-md text-rose-500 opacity-0 group-hover:opacity-100 shadow-sm border border-slate-200 dark:border-slate-700 transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <div className="flex flex-col gap-3">
                                    <input className={`${InputCls} py-2 text-sm font-semibold bg-white dark:bg-slate-900`} placeholder="Title/Name" value={item.title||item.degree||item.name||item.category||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'title':sectionKey==='education'?'degree':sectionKey==='projects'?'name':'category', e.target.value)} />
                                    {sectionKey !== 'skills' && <input className={`${InputCls} py-2 text-xs bg-white dark:bg-slate-900`} placeholder="Organization/Institution" value={item.company||item.school||item.institution||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'company':sectionKey==='education'?'school':'institution', e.target.value)} />}
                                    <textarea className={`${InputCls} py-2 text-xs h-24 bg-white dark:bg-slate-900`} placeholder="Details" value={Array.isArray(item.description) ? item.description.map(d=>'- ${d}').join('\n') : (item.description||item.items?.join(', ')||'')} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='skills'?'items':'description', e.target.value)} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )
                      })}
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                      <button className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={() => setStep(3)}>Layouts</button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2 rounded-xl transition-colors shadow-sm" onClick={() => setStep(5)}>Finalize PDF</button>
                    </div>
                  </div>

                  {/* RIGHT: PREVIEW PANEL */}
                  <div className="flex-1 flex flex-col h-[calc(100vh-180px)] min-h-[600px] bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden relative transition-colors duration-300">
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Live Engine</span>
                    </div>
                    
                    <div className="flex-1 p-4 sm:p-6 flex items-center justify-center relative">
                      {pdfBlob ? (
                        <iframe 
                          src={`${pdfBlob}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                          className="w-full h-full max-h-[100%] max-w-[850px] border border-slate-300 dark:border-slate-700 shadow-xl rounded-md bg-white mx-auto" 
                          title="PDF Preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <div className="w-8 h-8 border-4 border-indigo-100 dark:border-indigo-900/50 border-t-indigo-600 rounded-full animate-spin"></div>
                          <span className="text-sm font-bold tracking-wide">Rendering Layout...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 5: EXPORT ══ */}
              {step === 5 && editData && (
                <div className="max-w-md mx-auto mt-12 sm:mt-24 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-10 rounded-3xl shadow-lg relative overflow-hidden transition-colors duration-300">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Download className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Ready to Export</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                      Your resume has been compiled using the <span className="font-semibold text-indigo-600 dark:text-indigo-400">{TEMPLATES.find(t=>t.id===template)?.name}</span> architecture.
                    </p>
                    
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                      onClick={() => downloadPDF(false)} disabled={generating}>
                      {generating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</> : <><Download className="w-4 h-4"/> Download PDF</>}
                    </button>
                    
                    <button className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider" onClick={() => setStep(4)}>
                      Back to Editor
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}  )
}
