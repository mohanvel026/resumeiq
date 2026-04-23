const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'ResumeIQ API is running!' })
})

// Routes — only add if file exists and has content
try {
  const authRoutes = require('./src/routes/authRoutes')
  app.use('/api/auth', authRoutes)
} catch(e) { console.log('authRoutes not ready:', e.message) }

try {
  const resumeRoutes = require('./src/routes/resumeRoutes')
  app.use('/api/resume', resumeRoutes)
} catch(e) { console.log('resumeRoutes not ready:', e.message) }

try {
  const analysisRoutes = require('./src/routes/analysisRoutes')
  app.use('/api/analysis', analysisRoutes)
} catch(e) { console.log('analysisRoutes not ready:', e.message) }

try {
  const jobRoutes = require('./src/routes/jobRoutes')
  app.use('/api/jobs', jobRoutes)
} catch(e) { console.log('jobRoutes not ready:', e.message) }

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})