const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const prisma = require('../utils/prisma')

// Get resume data for export
router.get('/resume/:id', auth, async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: {
        aiAnalyses: {
          where: { type: 'SCORE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    res.json({
      id: resume.id,
      title: resume.title,
      fileType: resume.fileType,
      rawText: resume.rawText,
      createdAt: resume.createdAt,
      latestScore: resume.aiAnalyses[0]?.scoreTotal || null,
    })
  } catch (error) {
    res.status(500).json({ message: 'Export failed: ' + error.message })
  }
})

// Get all analyses for a resume
router.get('/analyses/:resumeId', auth, async (req, res) => {
  try {
    const analyses = await prisma.aiAnalysis.findMany({
      where: {
        resumeId: parseInt(req.params.resumeId),
        resume: { userId: req.user.id }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(analyses)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get analyses: ' + error.message })
  }
})

module.exports = router