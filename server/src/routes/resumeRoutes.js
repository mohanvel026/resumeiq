const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middleware/authMiddleware')
const {
  uploadResume, getAllResumes, getResumeById, deleteResume,
} = require('../controllers/resumeController')

const router = express.Router()

// Always create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Created uploads directory:', uploadsDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Remove special characters from filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')
    const uniqueName = `${Date.now()}-${safeName}`
    cb(null, uniqueName)
  },
})
const fileFilter = (req, file, cb) => {
  const allowedExt = ['.pdf', '.docx']
  const allowedMime = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExt.includes(ext) || allowedMime.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOCX files allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error: ' + err.message })
    } else if (err) {
      return res.status(400).json({ message: err.message })
    }
    next()
  })
}, uploadResume)

router.get('/all', authMiddleware, getAllResumes)
router.get('/:id', authMiddleware, getResumeById)
router.delete('/:id', authMiddleware, deleteResume)

module.exports = router