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

  const InputCls = "form-input"
  const LabelCls = "form-label"
  
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
      <div className="page-header">
        <h2 className="page-title">AI Resume Studio</h2>
        <p className="page-subtitle">Optimization & Export Engine</p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {STEPS.map((s) => {
          const active = step === s.num;
          const done = step > s.num;
          return (
            <div key={s.num} onClick={() => done && setStep(s.num)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--border-radius)',
                fontSize: '0.875rem', fontWeight: '600', cursor: done ? 'pointer' : 'default', whiteSpace: 'nowrap',
                background: active ? 'var(--gold-500)' : done ? 'var(--bg-hover)' : 'transparent',
                color: active ? '#0A1628' : done ? 'var(--text-primary)' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--gold-500)' : done ? 'var(--border-color)' : 'transparent'}`
              }}>
              {done ? <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--success)' }} /> : <s.icon style={{ width: '16px', height: '16px', animation: active ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }} />}
              {s.label}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative' }}>
        {loading ? (
          <div style={{ padding: '6rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="spinner"></div>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Initializing engine...</span>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            
            {/* ══ STEP 1: SELECT ══ */}
            {step === 1 && (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Select Source Document</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Choose an existing profile to analyze, format, and export.</p>
                </div>
                
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {resumes.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                        <AlertOctagon style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>No profiles found</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '300px' }}>You need to create a resume in the studio before you can export it.</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                      {resumes.map(r => (
                        <div key={r.id} onClick={() => setSelectedId(r.id)}
                          style={{
                            padding: '16px', margin: '8px', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--transition)',
                            background: selectedId === r.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                            border: `1px solid ${selectedId === r.id ? 'var(--gold-500)' : 'transparent'}`,
                          }}
                          onMouseEnter={(e) => { if (selectedId !== r.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                          onMouseLeave={(e) => { if (selectedId !== r.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)',
                              background: selectedId === r.id ? 'var(--gold-500)' : 'var(--bg-hover)',
                              color: selectedId === r.id ? '#0A1628' : 'var(--text-muted)'
                            }}>
                              <FileText style={{ width: '16px', height: '16px' }} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: selectedId === r.id ? 'var(--text-primary)' : 'var(--text-primary)' }}>{r.title}</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <span className="badge badge-navy">{r.fileType || 'PDF'}</span>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)',
                            borderColor: selectedId === r.id ? 'var(--gold-500)' : 'var(--border-color)',
                            background: selectedId === r.id ? 'var(--gold-500)' : 'transparent'
                          }}>
                            {selectedId === r.id && <CheckCircle2 style={{ width: '12px', height: '12px', color: '#0A1628' }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-hover)' }}>
                    <button 
                      className="btn btn-primary btn-full"
                      onClick={parseAndAnalyze} disabled={parsing || !selectedId}>
                      {parsing ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Executing AI Analysis...</> : <><Wand2 style={{ width: '16px', height: '16px' }} /> Run AI Analysis</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 2: AI OPTIMIZATION ══ */}
            {step === 2 && editData && (
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Document Analysis</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Review structural issues identified by our AI before moving to layout.</p>
                </div>

                <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  {/* LEFT PANEL: PROFILE SUMMARY */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                      <div style={{
                        width: '48px', height: '48px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold-500)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', border: '1px solid rgba(201,168,76,0.3)'
                      }}>
                        {editData.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editData.name || 'Unknown'}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editData.email || 'No email'}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                          { k: 'Professional Summary', v: editData.summary?.length > 20 },
                          { k: `Education (${editData.education?.filter(e=>e.institution).length || 0})`, v: editData.education?.some(e=>e.institution) },
                          { k: `Experience (${editData.experience?.length || 0})`, v: editData.experience?.length > 0 },
                          { k: `Projects (${editData.projects?.length || 0})`, v: editData.projects?.length > 0 },
                          { k: 'Technical Skills', v: Object.values(editData.skills || {}).some(v=>v) },
                        ].map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600' }}>
                            <span style={{ color: 'var(--text-body)' }}>{s.k}</span>
                            {s.v ? <CheckCircle2 style={{ width: '20px', height: '20px', color: 'var(--success)' }}/> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(220,53,69,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: '12px', height: '12px', color: 'var(--danger)' }}/></div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT PANEL: AI SUGGESTIONS */}
                  <div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', padding: 0, overflow: 'hidden' }}>
                      <div style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 24px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-500)', border: '1px solid rgba(201,168,76,0.3)' }}>
                          <Lightbulb style={{ width: '16px', height: '16px' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>AI Improvement Suggestions</h3>
                      </div>
                      
                      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        {suggestions.length === 0 ? (
                          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 0' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(40,167,69,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(40,167,69,0.2)' }}>
                              <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--success)' }} />
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Excellent Structure</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>We couldn't find any critical formatting issues. Your resume is well-structured and ready for layout generation.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {suggestions.map((s, i) => {
                              const done = appliedIdx.includes(i);
                              return (
                                <div key={i} style={{
                                  padding: '20px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', transition: 'var(--transition)',
                                  background: done ? 'var(--bg-hover)' : 'var(--bg-card)',
                                  opacity: done ? 0.7 : 1
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{
                                      marginTop: '2px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                      background: done ? 'rgba(40,167,69,0.1)' : 'rgba(255,193,7,0.1)',
                                      color: done ? 'var(--success)' : 'var(--warning)'
                                    }}>
                                      {done ? <CheckCircle2 style={{ width: '16px', height: '16px' }} /> : <AlertCircle style={{ width: '16px', height: '16px' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <h5 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '6px', color: done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>{s.title}</h5>
                                      {!done && (
                                        <>
                                          <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', marginBottom: '16px' }}>{s.detail}</p>
                                          <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-body)', marginBottom: '16px', fontFamily: 'monospace' }}>
                                            <span style={{ color: 'var(--gold-500)', fontWeight: '700', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fix:</span>
                                            {s.fix}
                                          </div>
                                          <button onClick={() => applySuggestion(s, i)} disabled={applyingIdx === i}
                                            className="btn btn-sm" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold-500)', border: '1px solid rgba(201,168,76,0.3)' }}>
                                            {applyingIdx === i ? <><div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div> Applying...</> : 'Apply Recommendation'}
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
                      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                         <button className="btn btn-primary" onClick={() => setStep(3)}>Proceed to Layouts</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3: TEMPLATES ══ */}
            {step === 3 && (
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Architecture Layout</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>Select a foundational structure. You can switch layouts dynamically in the editor.</p>
                </div>

                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                  {TEMPLATES.map(t => (
                    <div key={t.id} onClick={() => setTemplate(t.id)}
                      className="card"
                      style={{
                        padding: '16px', cursor: 'pointer', position: 'relative',
                        borderColor: template === t.id ? 'var(--gold-500)' : 'var(--border-color)',
                        boxShadow: template === t.id ? 'var(--shadow)' : 'none'
                      }}>
                      <div style={{
                        aspectRatio: '1/1.414', width: '100%', background: 'var(--bg-app)', borderRadius: '12px', marginBottom: '16px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: '12px', paddingLeft: '12px', paddingRight: '12px', border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ width: '100%', height: '6px', marginBottom: '10px', borderRadius: '4px', background: t.id === 'modern' ? 'var(--gold-500)' : 'var(--border-color)' }}></div>
                        <div style={{ width: '75%', height: '6px', marginBottom: '16px', borderRadius: '4px', background: 'var(--border-color)' }}></div>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                          {t.id === 'twocol' && <div style={{ width: '33%', height: '100%', background: 'var(--border-color)', borderRadius: '2px 2px 0 0', opacity: 0.5 }}></div>}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[1,2,3,4].map(i => <div key={i} style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'var(--border-color)', opacity: 0.5 }}></div>)}
                          </div>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '700', textAlign: 'center', margin: 0, color: template === t.id ? 'var(--gold-500)' : 'var(--text-primary)' }}>{t.name}</h4>
                      {template === t.id && (
                        <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '24px', height: '24px', background: 'var(--gold-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1628', border: '2px solid var(--bg-card)', boxShadow: 'var(--shadow)' }}>
                          <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="card" style={{ padding: '6px', display: 'flex', gap: '4px', borderRadius: '16px' }}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                    <button className="btn btn-primary" onClick={() => setStep(4)}>Enter Editor</button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 4: EDITOR & PREVIEW ══ */}
            {step === 4 && editData && (
              <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 180px)', minHeight: '600px' }}>
                
                {/* LEFT: EDITOR PANEL */}
                <div className="card" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-hover)', flexShrink: 0 }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Sliders style={{ width: '16px', height: '16px', color: 'var(--gold-500)' }}/> Content Editor</h3>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Personal Info */}
                    <section>
                      <h4 style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Identity</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label className={LabelCls}>Full Name</label><input className={InputCls} value={editData.name||''} onChange={(e)=>updateField('personalInfo', null, 'name', e.target.value)} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div><label className={LabelCls}>Email</label><input className={InputCls} value={editData.email||''} onChange={(e)=>updateField('personalInfo', null, 'email', e.target.value)} /></div>
                          <div><label className={LabelCls}>Phone</label><input className={InputCls} value={editData.phone||''} onChange={(e)=>updateField('personalInfo', null, 'phone', e.target.value)} /></div>
                        </div>
                        <div><label className={LabelCls}>Location</label><input className={InputCls} value={editData.location||''} onChange={(e)=>updateField('personalInfo', null, 'location', e.target.value)} /></div>
                      </div>
                    </section>

                    {/* Summary */}
                    <section>
                      <h4 style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Summary</h4>
                      <textarea className={`${InputCls}`} style={{ height: '112px' }} value={editData.summary||''} onChange={(e)=>updateField('personalInfo', null, 'summary', e.target.value)} />
                    </section>

                    {/* Dynamic Sections */}
                    {['experience', 'education', 'projects', 'skills'].map(sectionKey => {
                      const items = editData[sectionKey] || [];
                      return (
                        <section key={sectionKey}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{sectionKey}</h4>
                            <button onClick={() => addItem(sectionKey)} style={{ color: 'var(--gold-500)', background: 'rgba(201,168,76,0.1)', padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                              <Plus style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item, idx) => (
                              <div key={idx} style={{ background: 'var(--bg-hover)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                                <button onClick={() => removeItem(sectionKey, idx)} style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--danger)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                  <X style={{ width: '12px', height: '12px' }} />
                                </button>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <input className={`${InputCls}`} style={{ padding: '8px 12px', fontSize: '0.875rem', fontWeight: '600' }} placeholder="Title/Name" value={item.title||item.degree||item.name||item.category||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'title':sectionKey==='education'?'degree':sectionKey==='projects'?'name':'category', e.target.value)} />
                                  {sectionKey !== 'skills' && <input className={`${InputCls}`} style={{ padding: '8px 12px', fontSize: '0.75rem' }} placeholder="Organization/Institution" value={item.company||item.school||item.institution||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'company':sectionKey==='education'?'school':'institution', e.target.value)} />}
                                  <textarea className={`${InputCls}`} style={{ padding: '8px 12px', fontSize: '0.75rem', height: '96px' }} placeholder="Details" value={Array.isArray(item.description) ? item.description.map(d=>`- ${d}`).join('\n') : (item.description||item.items?.join(', ')||'')} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='skills'?'items':'description', e.target.value)} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                  
                  <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <button className="btn btn-ghost" onClick={() => setStep(3)}>Layouts</button>
                    <button className="btn btn-primary" onClick={() => setStep(5)}>Finalize PDF</button>
                  </div>
                </div>

                {/* RIGHT: PREVIEW PANEL */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Engine</span>
                  </div>
                  
                  <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {pdfBlob ? (
                      <iframe 
                        src={`${pdfBlob}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                        style={{ width: '100%', height: '100%', maxHeight: '100%', maxWidth: '850px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', borderRadius: '6px', background: 'white', margin: '0 auto' }} 
                        title="PDF Preview"
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '4px' }}></div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '700', letterSpacing: '0.05em' }}>Rendering Layout...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 5: EXPORT ══ */}
            {step === 5 && editData && (
              <div style={{ maxWidth: '440px', margin: '3rem auto 0', textAlign: 'center' }}>
                <div className="card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(201,168,76,0.1)', color: 'var(--gold-500)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Download style={{ width: '32px', height: '32px' }} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Ready to Export</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                    Your resume has been compiled using the <span style={{ fontWeight: '600', color: 'var(--gold-500)' }}>{TEMPLATES.find(t=>t.id===template)?.name}</span> architecture.
                  </p>
                  
                  <button className="btn btn-primary btn-full btn-lg"
                    onClick={() => downloadPDF(false)} disabled={generating}>
                    {generating ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Processing...</> : <><Download style={{ width: '16px', height: '16px' }}/> Download PDF</>}
                  </button>
                  
                  <button style={{ marginTop: '24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setStep(4)}>
                    Back to Editor
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  )
}
