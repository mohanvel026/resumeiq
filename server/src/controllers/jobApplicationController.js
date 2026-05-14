const prisma = require('../utils/prisma')

const getApplications = async (req, res) => {
  try {
    const apps = await prisma.jobApplication.findMany({
      where: { userId: req.user.id },
      orderBy: { appliedAt: 'desc' }
    })
    res.json(apps)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' })
  }
}

const createApplication = async (req, res) => {
  try {
    const { companyName, jobTitle, jobUrl, status, resumeId } = req.body
    
    // Find a resume for this user if resumeId not provided
    let finalResumeId = resumeId
    if (!finalResumeId) {
      const latestResume = await prisma.resume.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      })
      if (!latestResume) return res.status(400).json({ message: 'Upload a resume first' })
      finalResumeId = latestResume.id
    }

    const app = await prisma.jobApplication.create({
      data: {
        userId: req.user.id,
        resumeId: finalResumeId,
        companyName,
        jobTitle,
        jobUrl,
        status: status || 'APPLIED'
      }
    })
    res.json(app)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create application' })
  }
}

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const app = await prisma.jobApplication.update({
      where: { id: parseInt(id), userId: req.user.id },
      data: { status }
    })
    res.json(app)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' })
  }
}

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.jobApplication.delete({
      where: { id: parseInt(id), userId: req.user.id }
    })
    res.json({ message: 'Application deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application' })
  }
}

module.exports = {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
}
