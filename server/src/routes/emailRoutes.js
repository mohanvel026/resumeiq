const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const nodemailer = require('nodemailer')

// Create transporter - works with Gmail
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Send resume analysis email
router.post('/send-analysis', auth, async (req, res) => {
  try {
    const { to, resumeTitle, scoreTotal, improvements, strengths } = req.body
    const transporter = createTransporter()

    if (!transporter) {
      return res.json({
        message: 'Email not configured. Add EMAIL_USER and EMAIL_PASS to .env',
        sent: false
      })
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A1628; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 24px;">ResumeIQ Analysis Report</h1>
          <p style="color: #94A3B8; margin: 8px 0 0;">Your AI-powered resume insights</p>
        </div>
        
        <div style="background: #F8F9FA; padding: 24px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0D1F3C;">Resume: ${resumeTitle}</h2>
          
          <div style="background: white; border-radius: 10px; padding: 20px; margin: 16px 0; text-align: center; border: 1px solid #E9ECEF;">
            <div style="font-size: 48px; font-weight: 800; color: ${scoreTotal >= 75 ? '#28A745' : scoreTotal >= 55 ? '#C9A84C' : '#DC3545'};">
              ${scoreTotal}/100
            </div>
            <div style="color: #6C757D; font-size: 14px; margin-top: 4px;">Overall ATS Score</div>
          </div>

          ${strengths && strengths.length > 0 ? `
          <div style="background: rgba(40,167,69,0.08); border-radius: 10px; padding: 16px; margin: 16px 0;">
            <h3 style="color: #1a7a32; margin: 0 0 12px;">✅ What's Good</h3>
            ${strengths.map(s => `<p style="color: #495057; margin: 6px 0;">• ${s}</p>`).join('')}
          </div>
          ` : ''}

          ${improvements && improvements.length > 0 ? `
          <div style="background: rgba(220,53,69,0.06); border-radius: 10px; padding: 16px; margin: 16px 0;">
            <h3 style="color: #9c1c28; margin: 0 0 12px;">🔧 Must Improve</h3>
            ${improvements.map((imp, i) => `<p style="color: #495057; margin: 6px 0;">${i + 1}. ${imp}</p>`).join('')}
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://resumeiq-three.vercel.app" style="background: #C9A84C; color: #0A1628; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Full Analysis →
            </a>
          </div>

          <p style="color: #ADB5BD; font-size: 12px; text-align: center; margin-top: 24px;">
            Sent by ResumeIQ — AI-Powered Career Platform
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"ResumeIQ" <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER,
      subject: `Your Resume ATS Score: ${scoreTotal}/100 — ${resumeTitle}`,
      html,
    })

    res.json({ message: 'Analysis email sent successfully!', sent: true })
  } catch (error) {
    console.error('Email error:', error.message)
    res.status(500).json({ message: 'Email failed: ' + error.message, sent: false })
  }
})

// Send job alert email
router.post('/job-alert', auth, async (req, res) => {
  try {
    const { to, jobs, skills } = req.body
    const transporter = createTransporter()

    if (!transporter) {
      return res.json({ message: 'Email not configured', sent: false })
    }

    const jobsHtml = (jobs || []).slice(0, 5).map(job => `
      <div style="background: white; border-radius: 10px; padding: 16px; margin: 12px 0; border: 1px solid #E9ECEF;">
        <h3 style="color: #0D1F3C; margin: 0 0 6px;">${job.title}</h3>
        <p style="color: #6C757D; margin: 0 0 4px;">🏢 ${job.company} · 📍 ${job.location}</p>
        ${job.salary ? `<p style="color: #6C757D; margin: 0 0 8px;">💰 ${job.salary}</p>` : ''}
        <a href="${job.jobUrl}" style="background: #C9A84C; color: #0A1628; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Apply Now →</a>
      </div>
    `).join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A1628; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #C9A84C; margin: 0;">💼 New Job Matches!</h1>
          <p style="color: #94A3B8; margin: 8px 0 0;">Jobs matching your skills: ${skills}</p>
        </div>
        <div style="background: #F8F9FA; padding: 24px; border-radius: 0 0 12px 12px;">
          ${jobsHtml}
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://resumeiq-three.vercel.app/jobs" style="background: #C9A84C; color: #0A1628; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              See All Jobs →
            </a>
          </div>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"ResumeIQ Jobs" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `${(jobs || []).length} New Jobs Match Your Skills!`,
      html,
    })

    res.json({ message: 'Job alert email sent!', sent: true })
  } catch (error) {
    res.status(500).json({ message: 'Email failed: ' + error.message })
  }
})

module.exports = router