const prisma = require('../utils/prisma')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const askGemini = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err) {
      if (err.message?.includes('quota') || err.message?.includes('429') || err.status === 429) {
        console.log(`Rate limited, waiting 20s... attempt ${i + 1}/${retries}`)
        await sleep(20000)
      } else {
        throw err
      }
    }
  }
  throw new Error('Gemini quota exceeded. Please wait 1 minute and try again.')
}

const scoreResume = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `You are a professional resume coach. Analyze this resume and score it on 6 dimensions from 0-100.

Resume:
${resume.rawText.slice(0, 3000)}

Return ONLY this JSON, no explanation, no markdown:
{
  "scoreClarity": 75,
  "scoreImpact": 68,
  "scoreAts": 72,
  "scoreKeywords": 65,
  "scoreFormatting": 80,
  "scoreReadability": 78
}`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const scores = JSON.parse(clean)
    const scoreTotal = Math.round(
      (scores.scoreClarity + scores.scoreImpact + scores.scoreAts +
       scores.scoreKeywords + scores.scoreFormatting + scores.scoreReadability) / 6
    )

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'SCORE',
        scoreClarity: scores.scoreClarity,
        scoreImpact: scores.scoreImpact,
        scoreAts: scores.scoreAts,
        scoreKeywords: scores.scoreKeywords,
        scoreFormatting: scores.scoreFormatting,
        scoreReadability: scores.scoreReadability,
        scoreTotal,
        aiModel: 'gemini-1.5-flash',
        rawResponse: raw,
      }
    })

    res.json({ ...analysis })
  } catch (error) {
    console.error('Score error:', error.message)
    res.status(500).json({ message: error.message || 'Scoring failed' })
  }
}

const findKeywordGaps = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `Compare this resume against the job description and find keyword gaps.

Resume:
${resume.rawText.slice(0, 2000)}

Job Description:
${jobDescription.slice(0, 1500)}

Return ONLY this JSON, no markdown:
{
  "keywordsFound": ["React", "Node.js", "JavaScript"],
  "keywordsMissing": ["TypeScript", "Docker", "AWS"]
}`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'KEYWORD_GAP',
        keywordsFound: JSON.stringify(result.keywordsFound),
        keywordsMissing: JSON.stringify(result.keywordsMissing),
        aiModel: 'gemini-1.5-flash',
      }
    })

    res.json(analysis)
  } catch (error) {
    console.error('Keywords error:', error.message)
    res.status(500).json({ message: error.message || 'Keyword analysis failed' })
  }
}

const rewriteBullets = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `Extract bullet points from this resume and rewrite them with action verbs and quantified impact.

Resume:
${resume.rawText.slice(0, 2000)}

Return ONLY this JSON, no markdown:
{
  "originalBullets": ["worked on web apps", "helped with database"],
  "rewrittenBullets": ["Developed 5 full-stack web apps using React and Node.js, improving load time by 30%", "Optimized MySQL queries reducing response time by 40%"]
}
Maximum 6 bullets.`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'BULLET_REWRITE',
        originalBullets: JSON.stringify(result.originalBullets),
        rewrittenBullets: JSON.stringify(result.rewrittenBullets),
        aiModel: 'gemini-1.5-flash',
      }
    })

    res.json(analysis)
  } catch (error) {
    console.error('Rewrite error:', error.message)
    res.status(500).json({ message: error.message || 'Rewrite failed' })
  }
}

const generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `Write a professional 3-paragraph cover letter.

Resume:
${resume.rawText.slice(0, 2000)}

Job Description:
${jobDescription.slice(0, 1000)}

Start with "Dear Hiring Manager," — no preamble, no markdown, just the letter.`

    const coverLetter = await askGemini(prompt)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'COVER_LETTER',
        coverLetter,
        aiModel: 'gemini-1.5-flash',
      }
    })

    res.json({ coverLetter: analysis.coverLetter })
  } catch (error) {
    console.error('Cover letter error:', error.message)
    res.status(500).json({ message: error.message || 'Cover letter failed' })
  }
}

const scoreJobMatch = async (req, res) => {
  try {
    const { jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    if (!resume) return res.status(404).json({ message: 'No resume found. Upload one first.' })

    const prompt = `Rate how well this resume matches the job description from 0-100.

Resume:
${resume.rawText.slice(0, 2000)}

Job Description:
${jobDescription.slice(0, 1000)}

Return ONLY this JSON, no markdown:
{
  "jobMatchScore": 75,
  "jobMatchSummary": "Your resume matches well for React and Node.js but lacks TypeScript and AWS experience."
}`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    res.json(result)
  } catch (error) {
    console.error('Job match error:', error.message)
    res.status(500).json({ message: error.message || 'Job match failed' })
  }
}

const analyzeSkillGap = async (req, res) => {
  try {
    const { jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    if (!resume) return res.status(404).json({ message: 'No resume found' })

    const prompt = `Find skills missing from resume that are required by the job description.

Resume:
${resume.rawText.slice(0, 2000)}

Job Description:
${jobDescription.slice(0, 1000)}

Return ONLY a JSON array, no markdown:
[
  {
    "skill": "TypeScript",
    "description": "Required for type-safe development in this role",
    "resource": "https://www.typescriptlang.org/docs/"
  }
]
Maximum 6 items.`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const skills = JSON.parse(clean)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId: resume.id,
        type: 'SKILL_GAP',
        missingSkills: JSON.stringify(skills),
        aiModel: 'gemini-1.5-flash',
      }
    })

    res.json({ missingSkills: analysis.missingSkills })
  } catch (error) {
    console.error('Skill gap error:', error.message)
    res.status(500).json({ message: error.message || 'Skill gap failed' })
  }
}

const generateInterviewQuestions = async (req, res) => {
  try {
    const { targetRole } = req.body
    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    const resumeText = resume ? resume.rawText.slice(0, 2000) : `Candidate for ${targetRole}`

    const prompt = `Generate 8 interview questions for a ${targetRole} position based on this resume.

Resume:
${resumeText}

Return ONLY a JSON array, no markdown:
[
  {
    "question": "Tell me about your experience with React?",
    "hint": "Describe a specific project using STAR format: Situation, Task, Action, Result"
  }
]`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(clean)

    if (resume) {
      await prisma.aiAnalysis.create({
        data: {
          resumeId: resume.id,
          type: 'INTERVIEW_QUESTIONS',
          interviewQuestions: JSON.stringify(questions),
          aiModel: 'gemini-1.5-flash',
        }
      })
    }

    res.json({ interviewQuestions: JSON.stringify(questions) })
  } catch (error) {
    console.error('Interview questions error:', error.message)
    res.status(500).json({ message: error.message || 'Failed to generate questions' })
  }
}

const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, role } = req.body

    const prompt = `You are interviewing for a ${role} position.
Question: "${question}"
Candidate answer: "${answer}"

Give 2-3 sentences of constructive feedback. Be encouraging but honest. No markdown.`

    const feedback = await askGemini(prompt)
    res.json({ feedback })
  } catch (error) {
    console.error('Evaluate error:', error.message)
    res.status(500).json({ message: error.message || 'Evaluation failed' })
  }
}

const analyzeLinkedIn = async (req, res) => {
  try {
    const { linkedinUrl, resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `A candidate's LinkedIn is: ${linkedinUrl}

Based on this resume, suggest what inconsistencies might exist between LinkedIn and resume, and give improvement tips.

Resume:
${resume.rawText.slice(0, 2000)}

Return ONLY this JSON, no markdown:
{
  "consistent": ["Education background matches", "Work experience timeline aligns"],
  "inconsistencies": ["Skills section may differ from resume", "Recent project may be missing on LinkedIn"],
  "suggestions": "Update your LinkedIn headline to match your resume title. Add your latest projects to the Featured section."
}`

    const raw = await askGemini(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    res.json(result)
  } catch (error) {
    console.error('LinkedIn error:', error.message)
    res.status(500).json({ message: error.message || 'LinkedIn analysis failed' })
  }
}

module.exports = {
  scoreResume,
  findKeywordGaps,
  rewriteBullets,
  generateCoverLetter,
  scoreJobMatch,
  analyzeSkillGap,
  generateInterviewQuestions,
  evaluateAnswer,
  analyzeLinkedIn,
}