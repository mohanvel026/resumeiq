const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')

const {
  scoreResume,
  findKeywordGaps,
  rewriteBullets,
  generateCoverLetter,
  scoreJobMatch,
  analyzeSkillGap,
  generateInterviewQuestions,
  evaluateAnswer,
  analyzeLinkedIn,
  getLeaderboard,
  getUserStats,
  parseResumeWithAI,
  suggestResumeImprovements,
  enhanceResumeContent,
  getSalaryCareerTips,
} = require('../controllers/analysisController')

router.post('/score', auth, scoreResume)
router.post('/keywords', auth, findKeywordGaps)
router.post('/rewrite', auth, rewriteBullets)
router.post('/cover-letter', auth, generateCoverLetter)
router.post('/job-match', auth, scoreJobMatch)
router.post('/skill-gap', auth, analyzeSkillGap)
router.post('/interview-questions', auth, generateInterviewQuestions)
router.post('/evaluate-answer', auth, evaluateAnswer)
router.post('/linkedin', auth, analyzeLinkedIn)
router.get('/leaderboard', auth, getLeaderboard)
router.get('/user-stats', auth, getUserStats)
router.post('/parse-resume', auth, parseResumeWithAI)
router.post('/suggest-improvements', auth, suggestResumeImprovements)
router.post('/enhance-resume', auth, enhanceResumeContent)
router.post('/salary-tips', auth, getSalaryCareerTips)

module.exports = router