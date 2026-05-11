const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')

// Email routes - uses nodemailer
router.post('/send-analysis', auth, async (req, res) => {
  try {
    const { to, subject, resumeTitle, scoreTotal, improvements } = req.body

    // For now return success - add nodemailer when email credentials available
    console.log('Email request:', { to, subject, resumeTitle, scoreTotal })

    res.json({
      message: 'Email feature coming soon. Add SMTP credentials to enable.',
      sent: false
    })
  } catch (error) {
    res.status(500).json({ message: 'Email failed: ' + error.message })
  }
})

router.post('/job-alert', auth, async (req, res) => {
  try {
    res.json({ message: 'Job alert email feature coming soon.', sent: false })
  } catch (error) {
    res.status(500).json({ message: 'Email failed: ' + error.message })
  }
})

module.exports = router