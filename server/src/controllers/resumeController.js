const prisma = require('../utils/prisma')
const parseFile = require('../utils/parseFile')
const fs = require('fs')
const path = require('path')

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { title } = req.body
    const filePath = req.file.path
    const originalName = req.file.originalname
    const fileType = originalName.endsWith('.pdf') ? 'pdf' : 'docx'

    const rawText = await parseFile(filePath, fileType)

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        title: title || originalName,
        fileUrl: filePath,
        fileType,
        rawText,
      },
    })

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Upload failed', error: error.message })
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

    if (resume.fileUrl && fs.existsSync(resume.fileUrl)) {
      fs.unlinkSync(resume.fileUrl)
    }

    await prisma.resume.delete({ where: { id: resume.id } })

    res.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resume' })
  }
}

module.exports = { uploadResume, getAllResumes, getResumeById, deleteResume }