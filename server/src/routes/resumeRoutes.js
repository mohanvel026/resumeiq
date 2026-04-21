const express = require('express')
const multer = require('multer')
const path = require('path')
const authMiddleware = require('../middleware/authMiddleware')
const {
  uploadResume,
  getAllResumes,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'))
  }
}

const upload = multer({ storage, fileFilter })

router.post('/upload', authMiddleware, upload.single('resume'), uploadResume)
router.get('/all', authMiddleware, getAllResumes)
router.get('/:id', authMiddleware, getResumeById)
router.delete('/:id', authMiddleware, deleteResume)

module.exports = router