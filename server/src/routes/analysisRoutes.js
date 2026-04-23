const express = require('express')
const auth = require('../middleware/authMiddleware')
const {
  scoreResume, findKeywordGaps, rewriteBullets,
  generateCoverLetter, scoreJobMatch, analyzeSkillGap,
  generateInterviewQuestions, evaluateAnswer, analyzeLinkedIn,
} = require('../controllers/analysisController')

const router = express.Router()

router.post('/score', auth, scoreResume)
router.post('/keywords', auth, findKeywordGaps)
router.post('/rewrite', auth, rewriteBullets)
router.post('/cover-letter', auth, generateCoverLetter)
router.post('/job-match', auth, scoreJobMatch)
router.post('/skill-gap', auth, analyzeSkillGap)
router.post('/interview-questions', auth, generateInterviewQuestions)
router.post('/evaluate-answer', auth, evaluateAnswer)
router.post('/linkedin', auth, analyzeLinkedIn)

module.exports = router