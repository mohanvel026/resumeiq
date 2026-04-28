const prisma = require('../utils/prisma')
const parseFile = require('../utils/parseFile')

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { title } = req.body
    const originalName = req.file.originalname
    const fileType = originalName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx'
    const buffer = req.file.buffer

    console.log('Uploading:', originalName, 'Type:', fileType, 'Size:', buffer.length)

    let rawText = 'Resume uploaded'
    try {
      rawText = await parseFile(buffer, fileType)
      console.log('Parsed text length:', rawText.length)
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message)
      rawText = 'Resume text extraction pending'
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        title: title || originalName.replace(/\.[^/.]+$/, ''),
        fileUrl: `memory://${originalName}`,
        fileType,
        rawText,
      },
    })

    console.log('Resume saved with id:', resume.id)
    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      message: 'Upload failed',
      error: error.message
    })
  }
}

const getAllResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileType: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json(resumes)
  } catch (error) {
    console.error('Get resumes error:', error)
    res.status(500).json({ message: 'Failed to fetch resumes' })
  }
}

const getResumeById = async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.json(resume)
  } catch (error) {
    console.error('Get resume error:', error)
    res.status(500).json({ message: 'Failed to fetch resume' })
  }
}

const deleteResume = async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    await prisma.resume.delete({ where: { id: resume.id } })
    res.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ message: 'Failed to delete resume' })
  }
}

module.exports = {
  uploadResume,
  getAllResumes,
  getResumeById,
  deleteResume
}