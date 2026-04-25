const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()

// CORS - allow frontend
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

// Create uploads folder if not exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Created uploads directory')
}

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'ResumeIQ API is running!',
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// Routes
try {
  const authRoutes = require('./src/routes/authRoutes')
  app.use('/api/auth', authRoutes)
  console.log('✓ Auth routes loaded')
} catch(e) { console.log('✗ authRoutes error:', e.message) }

try {
  const resumeRoutes = require('./src/routes/resumeRoutes')
  app.use('/api/resume', resumeRoutes)
  console.log('✓ Resume routes loaded')
} catch(e) { console.log('✗ resumeRoutes error:', e.message) }

try {
  const analysisRoutes = require('./src/routes/analysisRoutes')
  app.use('/api/analysis', analysisRoutes)
  console.log('✓ Analysis routes loaded')
} catch(e) { console.log('✗ analysisRoutes error:', e.message) }

try {
  const jobRoutes = require('./src/routes/jobRoutes')
  app.use('/api/jobs', jobRoutes)
  console.log('✓ Job routes loaded')
} catch(e) { console.log('✗ jobRoutes error:', e.message) }

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.message)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ResumeIQ Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})