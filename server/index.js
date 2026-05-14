const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://resumeiq-three.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Create uploads folder
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.get('/', (req, res) => {
  res.json({ message: 'ResumeIQ API running!', status: 'ok', version: '2.0' })
})

// Routes
try {
  app.use('/api/auth', require('./src/routes/authRoutes'))
  console.log('✓ Auth routes')
} catch(e) { console.log('✗ authRoutes:', e.message) }

try {
  app.use('/api/resume', require('./src/routes/resumeRoutes'))
  console.log('✓ Resume routes')
} catch(e) { console.log('✗ resumeRoutes:', e.message) }

try {
  app.use('/api/analysis', require('./src/routes/analysisRoutes'))
  console.log('✓ Analysis routes')
} catch(e) { console.log('✗ analysisRoutes:', e.message) }

try {
  app.use('/api/jobs', require('./src/routes/jobRoutes'))
  console.log('✓ Job routes')
} catch(e) { console.log('✗ jobRoutes:', e.message) }

try {
  app.use('/api/email', require('./src/routes/emailRoutes'))
  console.log('✓ Email routes')
} catch(e) { console.log('✗ emailRoutes:', e.message) }

try {
  app.use('/api/export', require('./src/routes/exportRoutes'))
  console.log('✓ Export routes')
} catch(e) { console.log('✗ exportRoutes:', e.message) }

try {
  app.use('/api/applications', require('./src/routes/jobApplicationRoutes'))
  console.log('✓ Application routes')
} catch(e) { console.log('✗ jobApplicationRoutes:', e.message) }

app.use((err, req, res, next) => {
  console.error('Global error:', err.message)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nResumeIQ Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`)
})