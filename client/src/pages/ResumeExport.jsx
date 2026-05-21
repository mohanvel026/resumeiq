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

  const InputCls = "w-full border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 p-3 border bg-white dark:bg-slate-900 disabled:opacity-60 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
  const LabelCls = "flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase mb-2 mt-3"
  
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D10] pb-16 transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-[#111318] border-b border-slate-200 dark:border-slate-800 pt-10 pb-14 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"></div>
          <div className="max-w-6xl mx-auto relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">
                Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Studio</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl font-medium transition-colors">
                True multi-page PDF generation. Dynamic pagination, smart AI optimization, and custom sections.
              </p>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2 w-full sm:w-auto mt-4 sm:mt-0">
              {STEPS.map((s, i) => {
                const active = step === s.num
                const done = step > s.num
                return (
                  <div key={s.num} className="flex items-center">
                    <div className="flex flex-col items-center group cursor-pointer" onClick={() => done && setStep(s.num)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                        ${active ? 'bg-slate-900 text-white shadow-slate-900/30 ring-4 ring-slate-900/10' : 
                          done ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                        {done ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className={`w-5 h-5 ${active?'animate-pulse':''}`} />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 whitespace-nowrap 
                        ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-6 sm:w-10 h-1 mx-2 sm:mx-3 rounded-full mb-5 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-20 transition-colors duration-300">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {/* ══ STEP 1: SELECT ══ */}
              {step === 1 && (
                <div className="bg-white dark:bg-[#111318] backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-500 transition-colors">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-6 transition-colors">
                    <FileSearch className="w-6 h-6 text-blue-500" />
                    Select Target Resume
                  </h3>
                  {resumes.length === 0 ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 font-medium">
                      <AlertOctagon className="w-5 h-5" /> No resumes found. Please create one first.
                    </div>
                  ) : (
                    <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {resumes.map(r => (
                        <div key={r.id} onClick={() => setSelectedId(r.id)}
                          className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between
                          ${selectedId === r.id ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'}`}>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-lg transition-colors">{r.title}</div>
                             <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">{r.fileType?.toUpperCase()} • {new Date(r.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                            ${selectedId === r.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                            {selectedId === r.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
                    onClick={parseAndAnalyze} disabled={parsing || !selectedId}>
                    {parsing ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Processing Document...</> : <><Wand2 className="w-5 h-5" /> Analyze & Continue</>}
                  </button>
                </div>
              )}

              {/* ══ STEP 2: AI OPTIMIZATION ══ */}
              {step === 2 && editData && (
                <div className="animate-in slide-in-from-right-8 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                    
                    {/* Parse Results */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#111318] rounded-3xl shadow-lg dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 h-fit transition-colors duration-300">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 transition-colors"><CheckCircle2 className="text-emerald-500 w-6 h-6"/> Parse Success</h4>
                      <div className="bg-slate-50 dark:bg-[#0B0D10] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 mb-6 transition-colors">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner shrink-0">
                          {editData.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="overflow-hidden">
                           <div className="font-bold text-slate-900 dark:text-white text-lg truncate transition-colors">{editData.name || 'Unknown'}</div>
                           <div className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate transition-colors">{editData.email || 'No email detected'}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { k: 'Summary', v: editData.summary?.length > 20 },
                          { k: `Education (${editData.education?.filter(e=>e.institution).length || 0})`, v: editData.education?.some(e=>e.institution) },
                          { k: `Experience (${editData.experience?.length || 0})`, v: editData.experience?.length > 0 },
                          { k: `Projects (${editData.projects?.length || 0})`, v: editData.projects?.length > 0 },
                          { k: 'Skills', v: Object.values(editData.skills || {}).some(v=>v) },
                        ].map(s => (
                          <div key={s.k} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2
                            ${s.v ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {s.v ? <CheckCircle2 className="w-3 h-3"/> : <X className="w-3 h-3"/>} {s.k}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-3xl shadow-lg border border-indigo-100 p-8 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 opacity-10"><Zap className="w-48 h-48 text-indigo-500" /></div>
                      <h4 className="text-xl font-black text-indigo-950 mb-2 relative z-10 flex items-center gap-2">
                        <Sparkles className="text-indigo-500 w-6 h-6" /> ATS Optimization
                      </h4>
                      <p className="text-slate-600 text-sm font-medium mb-6 relative z-10">Industry-standard logic detects weaknesses holding back your callback rate.</p>
                      
                      {suggestions.length === 0 ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-6 font-bold flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6" /> Perfect structure! No critical issues found.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                          {suggestions.map((s, i) => {
                            const tc = {
                              critical: { bg: 'bg-rose-50', br: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-500', icon: AlertOctagon, lbl: 'Critical' },
                              high: { bg: 'bg-amber-50', br: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-500', icon: AlertCircle, lbl: 'High' },
                              medium: { bg: 'bg-blue-50', br: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-500', icon: Info, lbl: 'Medium' }
                            }[s.type] || { bg: 'bg-slate-50', br: 'border-slate-200', text: 'text-slate-900', badge: 'bg-slate-500', icon: Info, lbl: 'Info' }
                            
                            const done = appliedIdx.includes(i)
                            
                            return (
                              <div key={i} className={`p-5 rounded-2xl border transition-all duration-300
                                ${done ? 'bg-emerald-50/60 border-emerald-200 opacity-70' : `${tc.bg} ${tc.br} shadow-sm hover:shadow-md`}`}>
                                <div className="flex items-start gap-4">
                                  <div className={`mt-1 p-2 rounded-xl ${done ? 'bg-emerald-100 text-emerald-600' : `${tc.badge} text-white shadow-sm`}`}>
                                    {done ? <CheckCircle2 className="w-5 h-5"/> : <tc.icon className="w-5 h-5"/>}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h5 className={`font-bold text-[15px] ${done ? 'text-emerald-900 line-through decoration-emerald-300' : tc.text}`}>{s.title}</h5>
                                    </div>
                                    {!done && (
                                      <>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">{s.detail}</p>
                                        <div className="bg-white/70 p-3 rounded-xl border border-white/50 text-sm font-semibold text-slate-700 flex gap-2 items-start mb-4 shadow-sm">
                                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                          <span>{s.fix}</span>
                                        </div>
                                        <button onClick={() => applySuggestion(s, i)} disabled={applyingIdx === i}
                                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
                                          {applyingIdx === i ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Applying...</> : <><Wand2 className="w-4 h-4" /> Auto-Fix</>}
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
                  </div>
                  <div className="flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all" onClick={() => setStep(1)}>Back</button>
                    <button className="bg-slate-900 hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all" onClick={() => setStep(3)}>Continue to Templates</button>
                  </div>
                </div>
              )}

              {/* ══ STEP 3: TEMPLATES ══ */}
              {step === 3 && (
                <div className="animate-in slide-in-from-right-8 duration-500">
                  <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 mb-8 transition-colors duration-300">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 transition-colors"><LayoutTemplate className="w-7 h-7 text-indigo-500"/> Select Architecture</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {TEMPLATES.map(t => (
                        <div key={t.id} onClick={() => setTemplate(t.id)}
                          className={`group cursor-pointer rounded-2xl border-2 transition-all duration-300 relative overflow-hidden
                          ${template === t.id ? 'border-blue-500 ring-4 ring-blue-500/10 scale-[1.02] shadow-xl shadow-blue-500/10' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                          <div className={`p-6 border-b ${template === t.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-50 group-hover:bg-slate-100'} transition-colors`}>
                            <h4 className={`text-lg font-black ${template === t.id ? 'text-white' : 'text-slate-800'}`}>{t.name}</h4>
                            {template === t.id && <CheckCircle2 className="absolute top-6 right-6 w-6 h-6 text-white" />}
                          </div>
                          <div className="p-6 bg-white dark:bg-[#111318] transition-colors">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{t.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between gap-4">
                    <button className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all" onClick={() => setStep(2)}>Back</button>
                    <button className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all" onClick={() => setStep(4)}>Enter Editor</button>
                  </div>
                </div>
              )}

              {/* ══ STEP 4: EDITOR & PREVIEW ══ */}
              {step === 4 && editData && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-500 relative">
                  
                  {/* EDITOR */}
                  <div className="xl:col-span-5 flex flex-col gap-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                    
                    {/* Settings Panel */}
                    <div className="bg-slate-900 dark:bg-[#0B0D10] rounded-3xl p-6 shadow-xl text-white border border-transparent dark:border-slate-800 transition-colors">
                      <h4 className="font-bold flex items-center gap-2 mb-5 text-slate-100"><Sliders className="w-5 h-5"/> Design Settings</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Font Size</label>
                          <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                            value={editData.settings.fontSize} onChange={e=>setSetting('fontSize', e.target.value)}>
                            <option value="small">Compact</option>
                            <option value="medium">Standard</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Accent Color</label>
                          <div className="flex flex-wrap gap-2">
                            {['#0A1628', '#C9A84C', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'].map(c => (
                              <div key={c} onClick={() => setSetting('accentColor', c)} 
                                className={`w-8 h-8 rounded-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center
                                ${editData.settings.accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                                style={{ backgroundColor: c }}>
                                {editData.settings.accentColor === c && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md"/>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accordions */}
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                        <FileText className="text-blue-500 w-6 h-6"/>
                        <h4 className="font-black text-slate-800 text-lg">Content Editor</h4>
                      </div>

                      {[
                        { id: 'basic', title: 'Basic Info', icon: '👤', fields: [['name','Full Name'],['email','Email'],['phone','Phone'],['location','City, State'],['linkedin','LinkedIn'],['github','GitHub']] },
                        { id: 'summary', title: editData.sectionTitles.summary, icon: '📝' },
                        { id: 'experience', title: `${editData.sectionTitles.experience} (${editData.experience?.length||0})`, icon: '💼' },
                        { id: 'education', title: `${editData.sectionTitles.education} (${editData.education?.length||0})`, icon: '🎓' },
                        { id: 'projects', title: `${editData.sectionTitles.projects} (${editData.projects?.length||0})`, icon: '🚀' },
                        { id: 'skills', title: editData.sectionTitles.skills, icon: '🛠️' },
                      ].map(sec => (
                        <div key={sec.id} className="border-b border-slate-100 last:border-0">
                          <button onClick={() => setOpenSec(openSec === sec.id ? null : sec.id)}
                            className={`w-full p-5 flex items-center justify-between font-bold transition-colors
                            ${openSec === sec.id ? 'bg-blue-50/50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <span className="flex items-center gap-3 text-[15px]"><span className="text-xl">{sec.icon}</span> {sec.title}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSec === sec.id ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
                          </button>
                          
                          {openSec === sec.id && (
                            <div className="p-6 bg-white border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                              
                              {sec.id === 'basic' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  {sec.fields.map(([k,l])=>(
                                    <div key={k}><label className={LabelCls}>{l}</label><input className={InputCls} value={editData[k]||''} onChange={e=>setField(k,e.target.value)} /></div>
                                  ))}
                                </div>
                              )}

                              {sec.id === 'summary' && (
                                <div>
                                  <label className={LabelCls}>Section Heading</label><input className={`${InputCls} mb-5`} value={editData.sectionTitles.summary} onChange={e=>setSTitle('summary', e.target.value)}/>
                                  <label className={LabelCls}>Summary Body</label><textarea className={`${InputCls} min-h-[140px] resize-y`} value={editData.summary||''} onChange={e=>setField('summary',e.target.value)} />
                                </div>
                              )}

                              {sec.id === 'experience' && (
                                <div>
                                  <label className={LabelCls}>Section Heading</label><input className={`${InputCls} mb-6`} value={editData.sectionTitles.experience} onChange={e=>setSTitle('experience', e.target.value)}/>
                                  {editData.experience?.map((exp,ei)=>(
                                    <div key={ei} className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 relative group">
                                      <button onClick={()=>remExp(ei)} className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 bg-white rounded-lg p-1.5 shadow-sm border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                      <h5 className="font-bold text-slate-800 mb-4">Job {ei+1}</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        {[['company','Company'],['role','Job Title'],['duration','Duration'],['location','Location']].map(([k,l])=>(
                                          <div key={k}><label className={LabelCls}>{l}</label><input className={InputCls} value={exp[k]||''} onChange={e=>setExpF(ei,k,e.target.value)}/></div>
                                        ))}
                                      </div>
                                      <label className={LabelCls}>Bullet Points</label>
                                      {exp.bullets?.map((b,bi)=>(
                                        <div key={bi} className="flex gap-3 items-start mb-3">
                                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-4 shrink-0 shadow-sm"></div>
                                          <textarea className={`${InputCls} min-h-[65px] text-sm`} value={b} onChange={e=>setExpB(ei,bi,e.target.value)}/>
                                          <button onClick={()=>remExpB(ei,bi)} className="mt-2 text-slate-300 hover:text-rose-500 p-2 transition-colors"><X className="w-4 h-4"/></button>
                                        </div>
                                      ))}
                                      <button onClick={()=>addExpB(ei)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 mt-3 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"><Plus className="w-4 h-4"/> Add Bullet</button>
                                    </div>
                                  ))}
                                  <button onClick={addExp} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Add Experience Entry</button>
                                </div>
                              )}
                              
                              {sec.id === 'education' && (
                                <div>
                                  <label className={LabelCls}>Section Heading</label><input className={`${InputCls} mb-6`} value={editData.sectionTitles.education} onChange={e=>setSTitle('education', e.target.value)}/>
                                  {editData.education?.map((e,ei)=>(
                                    <div key={ei} className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative group">
                                      <button onClick={()=>remEdu(ei)} className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 bg-white rounded-lg p-1.5 shadow-sm border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                      <h5 className="font-bold text-slate-800 mb-4">Degree {ei+1}</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[['institution','Institution'],['degree','Degree'],['year','Year'],['gpa','GPA/Score']].map(([k,l])=>(
                                          <div key={k}><label className={LabelCls}>{l}</label><input className={InputCls} value={e[k]||''} onChange={ev=>setEduF(ei,k,ev.target.value)}/></div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={addEdu} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Add Education</button>
                                </div>
                              )}

                              {sec.id === 'projects' && (
                                <div>
                                  <label className={LabelCls}>Section Heading</label><input className={`${InputCls} mb-6`} value={editData.sectionTitles.projects} onChange={e=>setSTitle('projects', e.target.value)}/>
                                  {editData.projects?.map((p,pi)=>(
                                    <div key={pi} className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative group">
                                      <button onClick={()=>remProj(pi)} className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 bg-white rounded-lg p-1.5 shadow-sm border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                      <h5 className="font-bold text-slate-800 mb-4">Project {pi+1}</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        {[['name','Name'],['tech','Tech Stack'],['link','Link']].map(([k,l])=>(
                                          <div key={k}><label className={LabelCls}>{l}</label><input className={InputCls} value={p[k]||''} onChange={e=>setProjF(pi,k,e.target.value)}/></div>
                                        ))}
                                      </div>
                                      <label className={LabelCls}>Bullet Points</label>
                                      {p.bullets?.map((b,bi)=>(
                                        <div key={bi} className="flex gap-3 items-start mb-3">
                                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-4 shrink-0 shadow-sm"></div>
                                          <textarea className={`${InputCls} min-h-[65px] text-sm`} value={b} onChange={e=>setProjB(pi,bi,e.target.value)}/>
                                          <button onClick={()=>remProjB(pi,bi)} className="mt-2 text-slate-300 hover:text-rose-500 p-2 transition-colors"><X className="w-4 h-4"/></button>
                                        </div>
                                      ))}
                                      <button onClick={()=>addProjB(pi)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 mt-3 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"><Plus className="w-4 h-4"/> Add Bullet</button>
                                    </div>
                                  ))}
                                  <button onClick={addProj} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Add Project</button>
                                </div>
                              )}

                              {sec.id === 'skills' && (
                                <div>
                                  <label className={LabelCls}>Section Heading</label><input className={`${InputCls} mb-6`} value={editData.sectionTitles.skills} onChange={e=>setSTitle('skills', e.target.value)}/>
                                  {Object.entries(editData.skills||{}).map(([k,v])=>(
                                    <div key={k} className="mb-5">
                                      <label className={LabelCls}>{k}</label>
                                      <input className={InputCls} value={v||''} onChange={e=>setSkill(k,e.target.value)} placeholder="Comma separated..."/>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Custom Sections rendered dynamically */}
                      {editData.customSections?.map((cs,ci) => (
                        <div key={ci} className="border-b border-slate-100 last:border-0">
                          <button onClick={() => setOpenSec(openSec === `custom${ci}` ? null : `custom${ci}`)}
                            className={`w-full p-5 flex items-center justify-between font-bold transition-colors
                            ${openSec === `custom${ci}` ? 'bg-indigo-50/50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <span className="flex items-center gap-3 text-[15px]"><span className="text-xl">📌</span> {cs.title||'Custom Section'}</span>
                            <div className="flex items-center gap-2">
                              <div onClick={(e)=>{e.stopPropagation();remCS(ci)}} className="p-1 text-rose-400 hover:bg-rose-100 rounded-lg transition-colors"><X className="w-4 h-4"/></div>
                              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSec === `custom${ci}` ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
                            </div>
                          </button>
                          {openSec === `custom${ci}` && (
                            <div className="p-6 bg-white border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                 <div><label className={LabelCls}>Heading</label><input className={InputCls} value={cs.title} onChange={e=>setCSF(ci,'title',e.target.value)}/></div>
                                 <div><label className={LabelCls}>Position</label><select className={InputCls} value={cs.placement||'right'} onChange={e=>setCSF(ci,'placement',e.target.value)}><option value="right">Main / Right</option><option value="left">Sidebar / Left</option></select></div>
                               </div>
                               <label className={LabelCls}>Paragraph Text</label>
                               <textarea className={`${InputCls} min-h-[90px] mb-5`} value={cs.body||''} onChange={e=>setCSF(ci,'body',e.target.value)}/>
                               <label className={LabelCls}>Bullet Items</label>
                               {cs.items?.map((item,ii)=>(
                                <div key={ii} className="flex gap-3 items-center mb-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
                                  <input className={InputCls} value={item} onChange={e=>setCSItem(ci,ii,e.target.value)}/>
                                  <button onClick={()=>remCSItem(ci,ii)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><X className="w-4 h-4"/></button>
                                </div>
                               ))}
                               <button onClick={()=>addCSItem(ci)} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 mt-3 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit"><Plus className="w-4 h-4"/> Add Item</button>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="p-5 bg-slate-50 dark:bg-[#0B0D10] border-t border-slate-100 dark:border-slate-800 transition-colors">
                        <button onClick={addCustom} className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Create Custom Section</button>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-2">
                      <button className="px-6 py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm transition-all hidden sm:block" onClick={() => setStep(3)}>Back</button>
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all text-lg flex items-center justify-center gap-2" onClick={() => setStep(5)}> Looks Great! Finalize <ChevronRight className="w-5 h-5"/></button>
                    </div>

                  </div>

                  {/* PREVIEW */}
                  <div className="xl:col-span-7 relative">
                    <div className="sticky top-24 bg-white dark:bg-[#111318] rounded-3xl shadow-2xl dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] transition-colors duration-300">
                      <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-2 font-bold"><LayoutTemplate className="w-5 h-5 text-blue-400"/> Live PDF Preview</div>
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Auto-sync</div>
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-[#0B0D10] flex items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 transition-colors">
                        {pdfBlob ? (
                          <iframe 
                            src={`${pdfBlob}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                            className="w-full h-full border-0 rounded-xl shadow-xl bg-white" 
                            title="PDF Preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4">
                            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="font-bold tracking-wide">Rendering PDF Engine...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 5: EXPORT ══ */}
              {step === 5 && editData && (
                <div className="max-w-xl mx-auto text-center animate-in zoom-in-95 duration-500 mt-10">
                  <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-2xl shadow-emerald-500/10 dark:shadow-none border border-slate-200 dark:border-slate-800 p-10 sm:p-14 relative overflow-hidden transition-colors duration-300">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                    
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-500/30 relative z-10">
                      <Download className="w-10 h-10" />
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 relative z-10 transition-colors">Your Resume is Ready!</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 relative z-10 font-medium transition-colors">
                      Multi-page <span className="text-slate-800 dark:text-slate-200 font-bold">{TEMPLATES.find(t=>t.id===template)?.name}</span> template successfully generated and formatted for maximum ATS readability.
                    </p>
                    
                    <button className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xl py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 relative z-10 disabled:opacity-50"
                      onClick={() => downloadPDF(false)} disabled={generating}>
                      {generating ? <><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/> Processing...</> : <><Download className="w-6 h-6"/> Download Final PDF</>}
                    </button>
                    
                    <div className="mt-8 relative z-10">
                      <button className="font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" onClick={() => setStep(4)}>Return to Editor</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}