const prisma = require('../utils/prisma')
const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const askAI = async (prompt) => {
  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
  })
  return completion.choices[0].message.content
}

const scoreResume = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    if (!resume.rawText || resume.rawText.length < 50) {
      return res.status(400).json({ message: 'Resume text is too short. Please upload a proper resume PDF.' })
    }

    const prompt = `You are a strict professional ATS (Applicant Tracking System) scanner used by Fortune 500 companies. Analyze this resume CRITICALLY and give REALISTIC scores. Most resumes score between 40-75. Only exceptional resumes score above 85.

Resume text to analyze:
"""
${resume.rawText.slice(0, 4000)}
"""

Score each dimension from 0-100 based on these STRICT criteria:

1. scoreClarity (0-100): How clear and readable is the content? Deduct points for:
   - Typos, grammar errors (-10 each)
   - Vague statements without specifics (-5 each)
   - Missing contact info (-15)
   - Poor section organization (-10)

2. scoreImpact (0-100): How impactful are the achievements? Deduct points for:
   - No quantified achievements (numbers, percentages) (-20)
   - Weak action verbs like "helped", "worked on" (-5 each)
   - No measurable results (-15)
   - Generic descriptions (-10)

3. scoreAts (0-100): ATS compatibility score. Deduct points for:
   - Missing standard sections (Education, Experience, Skills) (-15 each)
   - No keywords from common job postings (-20)
   - Special characters or tables that ATS can't read (-10)
   - Missing job titles (-10)

4. scoreKeywords (0-100): Industry keyword density. Deduct points for:
   - Missing technical skills relevant to their field (-5 each)
   - No certifications mentioned (-10)
   - Missing soft skills (-5)
   - No industry-specific terminology (-15)

5. scoreFormatting (0-100): Professional formatting. Deduct points for:
   - Inconsistent formatting (-10)
   - Too long (more than 2 pages) (-10)
   - Missing dates on experience (-10)
   - No bullet points (-10)

6. scoreReadability (0-100): How easy to read in 6 seconds (recruiter scan time). Deduct points for:
   - Dense paragraphs instead of bullets (-15)
   - No summary/objective section (-10)
   - Buried important information (-10)
   - Font/spacing issues (-5)

Be STRICT and REALISTIC. The average resume scores 55/100 overall.

Return ONLY valid JSON, absolutely no markdown or explanation:
{
  "scoreClarity": <number 0-100>,
  "scoreImpact": <number 0-100>,
  "scoreAts": <number 0-100>,
  "scoreKeywords": <number 0-100>,
  "scoreFormatting": <number 0-100>,
  "scoreReadability": <number 0-100>,
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"]
}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    const scores = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

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

Return ONLY this exact JSON, no explanation, no markdown:
{"keywordsFound": ["React", "Node.js", "JavaScript"], "keywordsMissing": ["TypeScript", "Docker", "AWS"]}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'KEYWORD_GAP',
        keywordsFound: JSON.stringify(result.keywordsFound),
        keywordsMissing: JSON.stringify(result.keywordsMissing),
        aiModel: 'llama3-8b-8192',
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

Return ONLY this exact JSON, no explanation, no markdown:
{"originalBullets": ["worked on web apps", "helped with database"], "rewrittenBullets": ["Developed 5 full-stack web applications using React and Node.js, improving load time by 30%", "Optimized MySQL database queries reducing response time by 40%"]}
Maximum 6 bullets.`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'BULLET_REWRITE',
        originalBullets: JSON.stringify(result.originalBullets),
        rewrittenBullets: JSON.stringify(result.rewrittenBullets),
        aiModel: 'llama3-8b-8192',
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

Start directly with "Dear Hiring Manager," - no preamble, no markdown, just the letter text.`

    const coverLetter = await askAI(prompt)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'COVER_LETTER',
        coverLetter,
        aiModel: 'llama3-8b-8192',
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

    if (!resume) return res.status(404).json({ message: 'No resume found. Upload one first.' })

    if (!resume.rawText || resume.rawText.length < 50) {
      return res.status(400).json({ message: 'Resume text too short for analysis.' })
    }

    const prompt = `You are a strict ATS job matching system used by real recruiters. Analyze how well this resume matches the job description. Be REALISTIC - average match is 40-60%.

RESUME:
"""
${resume.rawText.slice(0, 3000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 2000)}
"""

Analyze these specific areas:

1. REQUIRED SKILLS MATCH: List every required skill from the JD. Check if resume has each one.
2. EXPERIENCE LEVEL: Does the resume meet the years of experience required?
3. EDUCATION: Does education match requirements?
4. KEYWORDS: What percentage of important JD keywords appear in the resume?
5. JOB TITLE RELEVANCE: How relevant is their experience to this specific role?

Scoring rules:
- 90-100: Perfect match, almost all requirements met
- 75-89: Strong match, most requirements met  
- 60-74: Good match, many requirements met but some gaps
- 45-59: Partial match, several important gaps
- 30-44: Weak match, many missing requirements
- Below 30: Poor match, major skills/experience gaps

Return ONLY valid JSON:
{
  "jobMatchScore": <realistic number 0-100>,
  "jobMatchSummary": "<2-3 sentences explaining the match score with specific details about what matches and what's missing>",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "recommendation": "<specific actionable advice to improve match>"
}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

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

Return ONLY a JSON array, no explanation, no markdown:
[{"skill": "TypeScript", "description": "Required for type-safe development", "resource": "https://www.typescriptlang.org/docs/"}]
Maximum 6 items.`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\[[\s\S]*\]/)
    const skills = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId: resume.id,
        type: 'SKILL_GAP',
        missingSkills: JSON.stringify(skills),
        aiModel: 'llama3-8b-8192',
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

Return ONLY a JSON array, no explanation, no markdown:
[{"question": "Tell me about your experience with React?", "hint": "Describe a specific project using STAR format: Situation, Task, Action, Result"}]`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\[[\s\S]*\]/)
    const questions = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

    if (resume) {
      await prisma.aiAnalysis.create({
        data: {
          resumeId: resume.id,
          type: 'INTERVIEW_QUESTIONS',
          interviewQuestions: JSON.stringify(questions),
          aiModel: 'llama3-8b-8192',
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

Give 2-3 sentences of constructive feedback. Be encouraging but honest. No markdown, plain text only.`

    const feedback = await askAI(prompt)
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

Based on this resume, suggest what inconsistencies might exist and give improvement tips.

Resume:
${resume.rawText.slice(0, 2000)}

Return ONLY this exact JSON, no explanation, no markdown:
{"consistent": ["Education background matches", "Work experience timeline aligns"], "inconsistencies": ["Skills section may differ", "Recent project missing on LinkedIn"], "suggestions": "Update your LinkedIn headline to match your resume title and add your latest projects to the Featured section."}`

    const raw = await askAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : clean)

    res.json(result)
  } catch (error) {
    console.error('LinkedIn error:', error.message)
    res.status(500).json({ message: error.message || 'LinkedIn analysis failed' })
  }
}
const getLeaderboard = async (req, res) => {
  try {
    // Get all users with their best resume score
    const analyses = await prisma.aiAnalysis.findMany({
      where: {
        type: 'SCORE',
        scoreTotal: { not: null }
      },
      include: {
        resume: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        scoreTotal: 'desc'
      }
    })

    // Get best score per user
    const userBestScores = {}
    analyses.forEach(analysis => {
      const userId = analysis.resume?.user?.id
      const userName = analysis.resume?.user?.name
      if (!userId || !userName) return

      if (!userBestScores[userId] || analysis.scoreTotal > userBestScores[userId].score) {
        userBestScores[userId] = {
          userId,
          name: userName,
          score: analysis.scoreTotal,
          resumeTitle: analysis.resume?.title || 'Resume',
        }
      }
    })

    // Convert to sorted array
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
}