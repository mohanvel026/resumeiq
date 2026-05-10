const prisma = require('../utils/prisma')
const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const askAI = async (prompt, maxTokens = 2048) => {
  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: maxTokens,
  })
  return completion.choices[0].message.content
}

// ══ SCORE RESUME ══
const scoreResume = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })
    if (!resume.rawText || resume.rawText.length < 50) {
      return res.status(400).json({ message: 'Resume text too short. Re-upload your PDF.' })
    }

    const prompt = `You are a strict ATS resume scanner. Analyze this resume and give REALISTIC scores (most resumes score 45-72 overall).

Resume:
"""
${resume.rawText.slice(0, 4000)}
"""

Score each 0-100. Be strict and realistic:
- scoreClarity: Clear writing, no typos, good organization
- scoreImpact: Quantified achievements, strong action verbs
- scoreAts: ATS compatibility, standard sections, keywords
- scoreKeywords: Industry keywords, technical skills density
- scoreFormatting: Professional formatting, consistent style
- scoreReadability: Easy to scan in 6 seconds, good structure

Return ONLY this JSON, no markdown:
{"scoreClarity":72,"scoreImpact":65,"scoreAts":70,"scoreKeywords":68,"scoreFormatting":75,"scoreReadability":71,"improvements":["Add quantified achievements like increased X by Y%","Include more industry keywords from job descriptions","Add a professional summary section"]}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    const scores = JSON.parse(clean.slice(start, end + 1))

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
        aiModel: 'llama-3.3-70b-versatile',
        rawResponse: raw,
      }
    })

    res.json({ ...analysis, improvements: scores.improvements })
  } catch (error) {
    console.error('Score error:', error.message)
    res.status(500).json({ message: error.message || 'Scoring failed' })
  }
}

// ══ KEYWORD GAP ══
const findKeywordGaps = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `Compare this resume to the job description. Find keyword gaps.

Resume:
"""
${resume.rawText.slice(0, 2500)}
"""

Job Description:
"""
${(jobDescription || '').slice(0, 1500)}
"""

Return ONLY this JSON, no markdown:
{"keywordsFound":["React","Node.js","JavaScript","Git"],"keywordsMissing":["TypeScript","Docker","AWS","GraphQL"]}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    const result = JSON.parse(clean.slice(start, end + 1))

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'KEYWORD_GAP',
        keywordsFound: JSON.stringify(result.keywordsFound),
        keywordsMissing: JSON.stringify(result.keywordsMissing),
        aiModel: 'llama-3.3-70b-versatile',
      }
    })

    res.json(analysis)
  } catch (error) {
    console.error('Keywords error:', error.message)
    res.status(500).json({ message: error.message || 'Keyword analysis failed' })
  }
}

// ══ REWRITE BULLETS ══
const rewriteBullets = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `Extract weak bullet points from this resume and rewrite them with strong action verbs and quantified impact.

Resume:
"""
${resume.rawText.slice(0, 3000)}
"""

Rules for rewriting:
- Start with strong action verbs (Developed, Implemented, Optimized, Led, Built)
- Add specific numbers, percentages, or metrics
- Make them concise and impactful
- Keep them relevant to the actual content

Return ONLY this JSON, no markdown, exactly 5-6 bullets:
{"originalBullets":["actual bullet from resume 1","actual bullet from resume 2","actual bullet from resume 3"],"rewrittenBullets":["Rewritten version 1 with metrics","Rewritten version 2 with metrics","Rewritten version 3 with metrics"]}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    const result = JSON.parse(clean.slice(start, end + 1))

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'BULLET_REWRITE',
        originalBullets: JSON.stringify(result.originalBullets),
        rewrittenBullets: JSON.stringify(result.rewrittenBullets),
        aiModel: 'llama-3.3-70b-versatile',
      }
    })

    res.json(analysis)
  } catch (error) {
    console.error('Rewrite error:', error.message)
    res.status(500).json({ message: error.message || 'Rewrite failed' })
  }
}

// ══ COVER LETTER ══
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const jd = jobDescription || ''
    const style = jd.includes('Style:') ? jd.split('Style:')[1]?.split('\n')[0]?.trim() : 'formal'

    const prompt = `Write a professional cover letter based on this resume for the specified job.

Resume:
"""
${resume.rawText.slice(0, 2500)}
"""

Job Details:
"""
${jd.slice(0, 1500)}
"""

Style: ${style}

Requirements:
- Use the candidate's ACTUAL name from the resume
- Reference SPECIFIC skills and projects from their resume
- Mention the specific company and role from the job details
- Write 3-4 paragraphs
- Start with "Dear Hiring Manager,"
- End with "Sincerely," and the candidate's name
- NO markdown, NO asterisks, plain text only
- Make it personal and specific, not generic`

    const coverLetter = await askAI(prompt, 1024)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'COVER_LETTER',
        coverLetter,
        aiModel: 'llama-3.3-70b-versatile',
      }
    })

    res.json({ coverLetter: analysis.coverLetter })
  } catch (error) {
    console.error('Cover letter error:', error.message)
    res.status(500).json({ message: error.message || 'Cover letter failed' })
  }
}

// ══ JOB MATCH ══
const scoreJobMatch = async (req, res) => {
  try {
    const { jobDescription, resumeId } = req.body

    let resume
    if (resumeId) {
      resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: req.user.id }
      })
    }
    if (!resume) {
      resume = await prisma.resume.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      })
    }
    if (!resume) return res.status(404).json({ message: 'No resume found' })

    const prompt = `You are an ATS job matching system. Rate how well this resume matches the job description.

Resume:
"""
${resume.rawText.slice(0, 2500)}
"""

Job Description:
"""
${(jobDescription || '').slice(0, 1500)}
"""

Be REALISTIC. Average match is 40-60%. Only give 80%+ if most requirements are truly met.

Return ONLY this JSON, no markdown:
{"jobMatchScore":62,"jobMatchSummary":"Your React and Node.js experience matches well but you are missing TypeScript and AWS which are required. Your 2 projects demonstrate relevant skills.","matchedSkills":["React","Node.js","JavaScript","Git"],"missingSkills":["TypeScript","AWS","Docker"],"recommendation":"Add TypeScript to your projects and get AWS Cloud Practitioner certification to significantly improve your match."}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    const result = JSON.parse(clean.slice(start, end + 1))

    res.json(result)
  } catch (error) {
    console.error('Job match error:', error.message)
    res.status(500).json({ message: error.message || 'Job match failed' })
  }
}

// ══ SKILL GAP ══
const analyzeSkillGap = async (req, res) => {
  try {
    const { jobDescription } = req.body
    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    if (!resume) return res.status(404).json({ message: 'No resume found' })

    const prompt = `Find skills missing from this resume that are needed for the job.

Resume:
"""
${resume.rawText.slice(0, 2000)}
"""

Job Description:
"""
${(jobDescription || '').slice(0, 1000)}
"""

Return ONLY a JSON array, no markdown, max 6 items:
[{"skill":"TypeScript","description":"Required for type-safe development in this role","resource":"https://www.typescriptlang.org/docs/"},{"skill":"Docker","description":"Used for containerization and deployment","resource":"https://docs.docker.com/get-started/"}]`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('[')
    const end = clean.lastIndexOf(']')
    const skills = JSON.parse(clean.slice(start, end + 1))

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId: resume.id,
        type: 'SKILL_GAP',
        missingSkills: JSON.stringify(skills),
        aiModel: 'llama-3.3-70b-versatile',
      }
    })

    res.json({ missingSkills: analysis.missingSkills })
  } catch (error) {
    console.error('Skill gap error:', error.message)
    res.status(500).json({ message: error.message || 'Skill gap failed' })
  }
}

// ══ INTERVIEW QUESTIONS ══
const generateInterviewQuestions = async (req, res) => {
  try {
    const { targetRole } = req.body
    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    const resumeText = resume ? resume.rawText.slice(0, 2500) : `Candidate applying for ${targetRole}`

    const prompt = `Generate 8 realistic interview questions for a ${targetRole} position based on this resume.

Resume:
"""
${resumeText}
"""

Generate questions that are:
- Specific to their actual projects and experience
- Mix of technical and behavioral
- Realistic for the ${targetRole} role

Return ONLY a JSON array, no markdown:
[{"question":"Tell me about your ResumeIQ project and the technical challenges you faced?","hint":"Use STAR format: describe the challenge, your approach, and the specific results achieved"},{"question":"How did you implement the AI integration in your projects?","hint":"Explain the API integration, error handling, and how you managed rate limits"}]`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('[')
    const end = clean.lastIndexOf(']')
    const questions = JSON.parse(clean.slice(start, end + 1))

    if (resume) {
      await prisma.aiAnalysis.create({
        data: {
          resumeId: resume.id,
          type: 'INTERVIEW_QUESTIONS',
          interviewQuestions: JSON.stringify(questions),
          aiModel: 'llama-3.3-70b-versatile',
        }
      })
    }

    res.json({ interviewQuestions: JSON.stringify(questions) })
  } catch (error) {
    console.error('Interview questions error:', error.message)
    res.status(500).json({ message: error.message || 'Failed to generate questions' })
  }
}

// ══ EVALUATE ANSWER ══
const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, role } = req.body

    const prompt = `You are an experienced interviewer for ${role} positions.

Question asked: "${question}"
Candidate's answer: "${answer}"

Evaluate the answer and provide:
1. What was good about the answer
2. What was missing or could be improved
3. A specific suggestion for improvement

Keep feedback to 3-4 sentences. Be constructive and encouraging. No markdown, plain text only.`

    const feedback = await askAI(prompt, 512)
    res.json({ feedback })
  } catch (error) {
    console.error('Evaluate error:', error.message)
    res.status(500).json({ message: error.message || 'Evaluation failed' })
  }
}

// ══ LINKEDIN ANALYZER ══
const analyzeLinkedIn = async (req, res) => {
  try {
    const { linkedinUrl, resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const prompt = `A candidate's LinkedIn profile URL is: ${linkedinUrl}

Based on their resume, suggest LinkedIn improvements and potential inconsistencies.

Resume:
"""
${resume.rawText.slice(0, 2000)}
"""

Return ONLY this JSON, no markdown:
{"consistent":["Work experience dates likely match","Education credentials should be consistent"],"inconsistencies":["LinkedIn headline may not match resume title","Projects section may be missing on LinkedIn","Skills section order may differ"],"suggestions":"Update your LinkedIn headline to match your resume title exactly. Add all projects from your resume to the Featured section. Request recommendations from your internship managers to strengthen your profile."}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    const result = JSON.parse(clean.slice(start, end + 1))

    res.json(result)
  } catch (error) {
    console.error('LinkedIn error:', error.message)
    res.status(500).json({ message: error.message || 'LinkedIn analysis failed' })
  }
}

// ══ LEADERBOARD ══
const getLeaderboard = async (req, res) => {
  try {
    const analyses = await prisma.aiAnalysis.findMany({
      where: {
        type: 'SCORE',
        scoreTotal: { not: null }
      },
      include: {
        resume: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { scoreTotal: 'desc' }
    })

    const userBestScores = {}
    analyses.forEach(a => {
      const userId = a.resume?.user?.id
      const userName = a.resume?.user?.name
      if (!userId || !userName) return
      if (!userBestScores[userId] || a.scoreTotal > userBestScores[userId].score) {
        userBestScores[userId] = {
          userId,
          name: userName,
          score: a.scoreTotal,
          resumeTitle: a.resume?.title || 'Resume',
        }
      }
    })

    const leaderboard = Object.values(userBestScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.score,
        resumeTitle: entry.resumeTitle,
        isCurrentUser: entry.userId === req.user.id,
        badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
      }))

    res.json(leaderboard)
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ message: 'Failed to fetch leaderboard' })
  }
}

// ══ USER STATS ══
const getUserStats = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      include: { aiAnalyses: true }
    })

    let bestScore = 0
    let analyses = 0
    let coverLetters = 0
    let keywords = 0
    let rewrites = 0
    let interviews = 0

    resumes.forEach(resume => {
      resume.aiAnalyses?.forEach(a => {
        analyses++
        if (a.type === 'SCORE' && a.scoreTotal > bestScore) bestScore = a.scoreTotal
        if (a.type === 'COVER_LETTER') coverLetters++
        if (a.type === 'KEYWORD_GAP') keywords++
        if (a.type === 'BULLET_REWRITE') rewrites++
        if (a.type === 'INTERVIEW_QUESTIONS') interviews++
      })
    })

    res.json({
      resumes: resumes.length,
      analyses,
      bestScore,
      coverLetters,
      keywords,
      rewrites,
      interviews,
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Failed to get stats' })
  }
}

// ══ PARSE RESUME WITH AI ══
const parseResumeWithAI = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const rawText = resume.rawText || ''
    console.log('Parsing resume, length:', rawText.length)

    if (rawText.length < 50) {
      return res.status(400).json({
        message: 'Resume text too short. Delete and re-upload your PDF.'
      })
    }

    const prompt = `Parse this resume and extract all information into structured JSON.

RESUME:
"""
${rawText.slice(0, 5000)}
"""

Extract carefully:
- Name is usually the first line
- Email contains @ symbol
- Phone is a number sequence
- Summary/Objective is a paragraph about the person
- Education has college/school names with years
- Experience has company names, roles, dates and bullet points starting with •
- Projects have project names with dates and bullet points
- Skills section has categories like CAD Software, Programming etc
- Key Achievements has bullet points with accomplishments

Return ONLY this JSON with NO markdown, NO explanation:
{
  "name": "full name from first line",
  "email": "email address with @",
  "phone": "10 digit phone number",
  "linkedin": "",
  "github": "",
  "location": "city and state",
  "summary": "the full summary/objective paragraph",
  "education": [
    {
      "institution": "college or school name",
      "degree": "degree type",
      "year": "year range",
      "gpa": "cgpa or percentage"
    }
  ],
  "experience": [
    {
      "company": "company name",
      "role": "job title like Intern",
      "duration": "month year",
      "location": "city state",
      "bullets": ["bullet 1 text", "bullet 2 text", "bullet 3 text"]
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "brief description",
      "tech": "tools or technologies mentioned",
      "link": "",
      "bullets": ["what was done", "what was achieved"]
    }
  ],
  "skills": {
    "languages": "programming languages if any",
    "frameworks": "frameworks if any",
    "tools": "CAD and other tools",
    "databases": "databases if any",
    "other": "soft skills and other skills"
  },
  "achievements": ["achievement 1", "achievement 2"],
  "certifications": []
}`

    const raw = await askAI(prompt, 3000)
    console.log('AI response length:', raw.length)
    console.log('First 300 chars:', raw.slice(0, 300))

    let clean = raw
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim()

    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')

    if (start === -1 || end === -1) {
      console.error('No JSON in response:', clean.slice(0, 500))
      throw new Error('AI did not return valid JSON. Try again.')
    }

    const jsonStr = clean.slice(start, end + 1)
    const parsed = JSON.parse(jsonStr)

    console.log('Parsed successfully:')
    console.log('  Name:', parsed.name)
    console.log('  Email:', parsed.email)
    console.log('  Education:', parsed.education?.length)
    console.log('  Experience:', parsed.experience?.length)
    console.log('  Projects:', parsed.projects?.length)
    console.log('  Achievements:', parsed.achievements?.length)

    res.json(parsed)
  } catch (error) {
    console.error('Parse error:', error.message)
    res.status(500).json({ message: 'Parsing failed: ' + error.message })
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
  getLeaderboard,
  getUserStats,
  parseResumeWithAI,
}