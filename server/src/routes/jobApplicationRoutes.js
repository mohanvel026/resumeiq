const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/jobApplicationController')

router.get('/', auth, getApplications)
router.post('/', auth, createApplication)
router.patch('/:id/status', auth, updateApplicationStatus)
router.delete('/:id', auth, deleteApplication)

module.exports = router
