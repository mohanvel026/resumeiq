const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middleware/authMiddleware')
const {
  uploadResume,
  getAllResumes,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController')

const router = express.Router()

// Make sure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Created uploads directory')
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const allowedExt = ['.pdf', '.docx']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExt.includes(ext) || allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err)
      return res.status(400).json({ message: 'File upload error: ' + err.message })
    } else if (err) {
      console.error('Upload middleware error:', err)
      return res.status(400).json({ message: err.message })
    }
    next()
  })
}, uploadResume)

router.get('/all', authMiddleware, getAllResumes)
router.get('/:id', authMiddleware, getResumeById)
router.delete('/:id', authMiddleware, deleteResume)

module.exports = router