const prisma = require('../utils/prisma')
const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const askAI = async (prompt, maxTokens = 2048) => {
  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    max_tokens: maxTokens,
  })
  return completion.choices[0].message.content
}

const parseJSON = (raw) => {
  let clean = raw.replace(/```json/gi, '').replace(/```/gi, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response')
  return JSON.parse(clean.slice(start, end + 1))
}

const parseJSONArray = (raw) => {
  let clean = raw.replace(/```json/gi, '').replace(/```/gi, '').trim()
  const start = clean.indexOf('[')
  const end = clean.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found in AI response')
  return JSON.parse(clean.slice(start, end + 1))
}

// ══ REAL ATS SCORE ══
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

    const text = resume.rawText

    // Step 1: Extract actual content metrics
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
    const hasPhone = /(\+?\d[\d\s\-().]{8,}\d)/.test(text)
    const hasLinkedIn = /linkedin/i.test(text)
    const hasGitHub = /github/i.test(text)
    const wordCount = text.split(/\s+/).length
    const bulletCount = (text.match(/[•\-\*▪◦]/g) || []).length
    const hasQuantifiedAchievements = /\d+%|\d+x|\$\d+|\d+ (years|months|users|clients|projects|teams|members)/i.test(text)
    const hasSummary = /summary|objective|profile|about/i.test(text)
    const hasEducation = /education|university|college|bachelor|master|degree|cgpa|gpa/i.test(text)
    const hasExperience = /experience|internship|work|employment|job/i.test(text)
    const hasSkills = /skills|technologies|tools|languages|frameworks/i.test(text)
    const hasProjects = /project|built|developed|created|implemented/i.test(text)
    const hasActionVerbs = /developed|implemented|designed|led|managed|created|built|improved|optimized|analyzed|increased|decreased|achieved|delivered/i.test(text)

    // Step 2: AI detailed analysis
    const prompt = `You are a professional ATS (Applicant Tracking System) analyzer used by Fortune 500 companies. Analyze this resume with strict realistic scoring.

RESUME TEXT:
"""
${text.slice(0, 4000)}
"""

CONTEXT ABOUT THIS RESUME:
- Word count: ${wordCount}
- Has email: ${hasEmail}
- Has phone: ${hasPhone}
- Has LinkedIn: ${hasLinkedIn}
- Has GitHub: ${hasGitHub}
- Bullet points count: ${bulletCount}
- Has quantified achievements: ${hasQuantifiedAchievements}
- Has summary section: ${hasSummary}
- Has education section: ${hasEducation}
- Has experience section: ${hasExperience}
- Has skills section: ${hasSkills}
- Has projects section: ${hasProjects}
- Uses action verbs: ${hasActionVerbs}

Score each dimension REALISTICALLY (average resume scores 55-65 overall):

1. scoreAts (0-100): Pure ATS parsing compatibility
   - Standard section headings (+20)
   - No tables/columns/graphics (+15)
   - Contact info present (+20)
   - Standard file format (+10)
   - No special characters breaking parsing (+15)
   - Machine readable font (+10)
   - Proper date formatting (+10)
   DEDUCTIONS: Missing contact info (-20), special chars (-10), tables (-15)

2. scoreKeywords (0-100): Keyword optimization
   - Industry-specific technical skills present
   - Job title keywords matching common roles
   - Action verbs used
   - Relevant certifications
   - Tools and technologies mentioned
   DEDUCTIONS: Generic descriptions (-10 each), missing industry terms (-5 each)

3. scoreFormatting (0-100): Professional formatting
   - Consistent structure
   - Appropriate length (1-2 pages)
   - Proper sections
   - Clear hierarchy
   - White space usage
   DEDUCTIONS: Too long/short (-15), inconsistent dates (-10), missing sections (-10)

4. scoreImpact (0-100): Achievement impact
   - Quantified results (%, $, numbers)
   - Strong action verbs
   - Specific accomplishments
   - Business impact shown
   DEDUCTIONS: No numbers (-20), weak verbs like "helped" (-5 each), vague statements (-10)

5. scoreClarity (0-100): Writing clarity
   - Clear concise language
   - No typos or grammar errors
   - Easy to read bullets
   - Professional tone
   DEDUCTIONS: Vague language (-10), run-on sentences (-5), unprofessional tone (-15)

6. scoreReadability (0-100): Recruiter scan test (6 second test)
   - Key info visible immediately
   - Clear visual hierarchy
   - Scannable bullet points
   - Name and contact prominent
   - Most recent experience first
   DEDUCTIONS: Buried contact info (-15), no bullets (-15), unclear sections (-10)

Be STRICT. Most fresh graduate resumes score 45-65. Only excellent resumes score 75+.

Also provide:
- 3 specific improvements they MUST make
- 2 things that are good about this resume
- Overall assessment in 2 sentences

Return ONLY this exact JSON:
{
  "scoreAts": 68,
  "scoreKeywords": 62,
  "scoreFormatting": 71,
  "scoreImpact": 55,
  "scoreClarity": 70,
  "scoreReadability": 65,
  "improvements": [
    "Add quantified achievements: instead of 'worked on X' write 'improved X by 30%'",
    "Include a professional summary of 2-3 sentences at the top",
    "Add more industry-specific keywords matching job descriptions you are targeting"
  ],
  "strengths": [
    "Good use of bullet points for experience section",
    "Clear education section with CGPA mentioned"
  ],
  "assessment": "This resume shows good foundational structure but lacks quantified achievements. Adding specific metrics and stronger keywords will significantly improve ATS ranking."
}`

    const raw = await askAI(prompt, 1500)
    const scores = parseJSON(raw)

    // Calculate weighted total (ATS and Keywords weighted higher)
    const scoreTotal = Math.round(
      scores.scoreAts * 0.25 +
      scores.scoreKeywords * 0.20 +
      scores.scoreFormatting * 0.15 +
      scores.scoreImpact * 0.20 +
      scores.scoreClarity * 0.10 +
      scores.scoreReadability * 0.10
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

    res.json({
      ...analysis,
      improvements: scores.improvements,
      strengths: scores.strengths,
      assessment: scores.assessment,
    })
  } catch (error) {
    console.error('Score error:', error.message)
    res.status(500).json({ message: 'Scoring failed: ' + error.message })
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

    const prompt = `Compare this resume against the job description. Find which keywords are present and which are missing.

Resume:
"""
${resume.rawText.slice(0, 2500)}
"""

Job Description:
"""
${(jobDescription || 'General software developer role requiring React, Node.js, JavaScript, TypeScript, Git, REST API, Agile').slice(0, 1500)}
"""

Extract all important keywords from the JD (technical skills, tools, certifications, soft skills, domain terms).
Check each one against the resume.

Return ONLY this JSON:
{
  "keywordsFound": ["React", "Node.js", "JavaScript"],
  "keywordsMissing": ["TypeScript", "Docker", "AWS", "Agile"],
  "matchPercentage": 45,
  "topMissingKeywords": ["TypeScript", "Docker"],
  "suggestion": "Add TypeScript and Docker to your skills section and mention them in project descriptions"
}`

    const raw = await askAI(prompt)
    const result = parseJSON(raw)

    const analysis = await prisma.aiAnalysis.create({
      data: {
        resumeId,
        type: 'KEYWORD_GAP',
        keywordsFound: JSON.stringify(result.keywordsFound),
        keywordsMissing: JSON.stringify(result.keywordsMissing),
        aiModel: 'llama-3.3-70b-versatile',
      }
    })

    res.json({ ...analysis, matchPercentage: result.matchPercentage, suggestion: result.suggestion, topMissingKeywords: result.topMissingKeywords })
  } catch (error) {
    console.error('Keywords error:', error.message)
    res.status(500).json({ message: 'Keyword analysis failed: ' + error.message })
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

    const prompt = `You are a professional resume writer. Extract ACTUAL bullet points from this resume and rewrite them to be more impactful.

Resume:
"""
${resume.rawText.slice(0, 3000)}
"""

Rules:
1. Extract real bullet points from the resume text (lines starting with • or -)
2. Rewrite each one with: strong action verb + specific task + quantified result
3. Keep the same meaning but make it more powerful
4. Add realistic metrics if the context supports it
5. Maximum 6 bullet pairs

Return ONLY this JSON:
{
  "originalBullets": [
    "actual text from resume bullet 1",
    "actual text from resume bullet 2",
    "actual text from resume bullet 3"
  ],
  "rewrittenBullets": [
    "Engineered automated system that reduced manual effort by 40% using [technology from resume]",
    "Implemented [specific feature] resulting in improved [metric] across [scope]",
    "Optimized [process] achieving [specific outcome] within [timeframe]"
  ]
}`

    const raw = await askAI(prompt)
    const result = parseJSON(raw)

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
    res.status(500).json({ message: 'Rewrite failed: ' + error.message })
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
    const styleMatch = jd.match(/Style:\s*(\w+)/i)
    const style = styleMatch ? styleMatch[1] : 'formal'
    const companyMatch = jd.match(/Company:\s*(.+?)(\n|$)/i)
    const company = companyMatch ? companyMatch[1].trim() : 'the company'
    const roleMatch = jd.match(/Job Title:\s*(.+?)(\n|$)/i)
    const role = roleMatch ? roleMatch[1].trim() : 'this position'

    const prompt = `Write a ${style} cover letter for ${role} at ${company}.

Candidate Resume:
"""
${resume.rawText.slice(0, 2500)}
"""

Job Requirements:
"""
${jd.slice(0, 1500)}
"""

Requirements:
- Use the candidate's ACTUAL name from the resume
- Reference 2-3 SPECIFIC projects or experiences from their resume
- Mention specific skills that match the job
- Write exactly 3 paragraphs
- Paragraph 1: Introduction and why this role/company
- Paragraph 2: Specific experiences and achievements from resume
- Paragraph 3: Call to action and closing
- Start with "Dear Hiring Manager,"
- End with "Sincerely," and the candidate's full name
- NO markdown, NO asterisks, plain text only
- Tone should be ${style}`

    const coverLetter = await askAI(prompt, 1000)

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
    res.status(500).json({ message: 'Cover letter failed: ' + error.message })
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
    if (!resume) return res.status(404).json({ message: 'No resume found. Upload one first.' })

    const prompt = `You are a strict ATS job matching system. Calculate match percentage between resume and job.

Resume:
"""
${resume.rawText.slice(0, 2500)}
"""

Job Description:
"""
${(jobDescription || '').slice(0, 1500)}
"""

Calculate match based on:
1. Required skills present in resume (40% weight)
2. Experience level match (20% weight)  
3. Education requirements met (15% weight)
4. Keywords overlap (15% weight)
5. Job title relevance (10% weight)

Be realistic: 90%+ = near perfect, 70-89% = strong, 50-69% = moderate, 30-49% = weak, <30% = poor

Return ONLY this JSON:
{
  "jobMatchScore": 58,
  "jobMatchSummary": "Your mechanical engineering background partially matches this role. You have relevant CAD and CNC skills but lack the required 2 years of industry experience and specific certifications mentioned.",
  "matchedSkills": ["CAD", "AutoCAD", "Problem-solving", "Teamwork"],
  "missingSkills": ["SolidWorks", "2+ years experience", "ISO certification", "Project Management"],
  "recommendation": "Highlight your internship at NLC India Limited more prominently. Get certified in SolidWorks which is a key requirement. Your projects show good hands-on experience."
}`

    const raw = await askAI(prompt)
    const result = parseJSON(raw)

    res.json(result)
  } catch (error) {
    console.error('Job match error:', error.message)
    res.status(500).json({ message: 'Job match failed: ' + error.message })
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
    if (!resume) return res.status(404).json({ message: 'No resume found. Upload one first.' })

    const prompt = `Identify skill gaps between this resume and the target job.

Resume:
"""
${resume.rawText.slice(0, 2000)}
"""

Job Description:
"""
${(jobDescription || 'General engineering or software developer role').slice(0, 1000)}
"""

Identify the most critical missing skills with learning resources.
Return ONLY a JSON array with max 6 items:
[
  {
    "skill": "SolidWorks",
    "description": "Required CAD software for mechanical design - not found in resume",
    "priority": "High",
    "resource": "https://www.solidworks.com/sw/education/free-solidworks-downloads.htm",
    "timeToLearn": "2-3 months"
  }
]`

    const raw = await askAI(prompt)
    const skills = parseJSONArray(raw)

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
    res.status(500).json({ message: 'Skill gap analysis failed: ' + error.message })
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

    const resumeText = resume ? resume.rawText.slice(0, 2500) : `Candidate for ${targetRole}`

    const prompt = `Generate 8 realistic interview questions for ${targetRole} based on this resume.

Resume:
"""
${resumeText}
"""

Mix of:
- 3 technical questions specific to their skills/projects
- 2 behavioral questions (STAR format)
- 2 situational questions for the role
- 1 career goals question

Return ONLY a JSON array:
[
  {
    "question": "Walk me through your internship at NLC India Limited and what you learned about boiler maintenance.",
    "type": "Technical",
    "hint": "Use STAR format. Mention specific equipment like pumps, blowers, and rotating machinery. Quantify your learning outcomes."
  }
]`

    const raw = await askAI(prompt)
    const questions = parseJSONArray(raw)

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
    res.status(500).json({ message: 'Failed to generate questions: ' + error.message })
  }
}

// ══ EVALUATE ANSWER ══
const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, role } = req.body

    const prompt = `You are an experienced interviewer for ${role} positions.

Question: "${question}"
Candidate's answer: "${answer}"

Evaluate the answer quality (1-10) and provide specific feedback.
Be encouraging but honest. Point out what was good and what was missing.
Keep response to 3-4 sentences. No markdown, plain text only.`

    const feedback = await askAI(prompt, 400)
    res.json({ feedback })
  } catch (error) {
    console.error('Evaluate error:', error.message)
    res.status(500).json({ message: 'Evaluation failed: ' + error.message })
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

    const prompt = `Analyze potential inconsistencies between this LinkedIn profile and resume.

LinkedIn URL: ${linkedinUrl}

Resume Content:
"""
${resume.rawText.slice(0, 2000)}
"""

Based on the resume, provide LinkedIn optimization advice.

Return ONLY this JSON:
{
  "consistent": [
    "Education section should match resume dates",
    "Work experience timeline should be consistent"
  ],
  "inconsistencies": [
    "LinkedIn headline may not reflect current resume title",
    "Projects section likely missing on LinkedIn",
    "Skills endorsements may not match resume skills"
  ],
  "suggestions": "Update your LinkedIn headline to match your resume. Add all 3 projects to the Featured section. Request recommendations from your NLC internship supervisor. Complete all LinkedIn profile sections to reach All-Star status.",
  "profileScore": 65,
  "tips": [
    "Add a professional headshot",
    "Write a compelling About section using your resume summary",
    "Enable Open to Work for internship/job opportunities"
  ]
}`

    const raw = await askAI(prompt)
    const result = parseJSON(raw)

    res.json(result)
  } catch (error) {
    console.error('LinkedIn error:', error.message)
    res.status(500).json({ message: 'LinkedIn analysis failed: ' + error.message })
  }
}

// ══ LEADERBOARD ══
const getLeaderboard = async (req, res) => {
  try {
    const analyses = await prisma.aiAnalysis.findMany({
      where: { type: 'SCORE', scoreTotal: { not: null } },
      include: {
        resume: {
          include: {
            user: { select: { id: true, name: true } }
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

    let bestScore = 0, analyses = 0, coverLetters = 0
    let keywords = 0, rewrites = 0, interviews = 0

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

    res.json({ resumes: resumes.length, analyses, bestScore, coverLetters, keywords, rewrites, interviews })
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
    if (rawText.length < 50) {
      return res.status(400).json({ message: 'Resume text too short. Delete and re-upload your PDF.' })
    }

    console.log('Parsing resume ID:', resumeId, 'Length:', rawText.length)

    const prompt = `Parse this resume and extract all information into structured JSON.

RESUME TEXT:
"""
${rawText.slice(0, 5000)}
"""

Extract carefully. Return ONLY valid JSON, no markdown:
{
  "name": "full name from first line",
  "email": "email with @ symbol",
  "phone": "phone number",
  "linkedin": "linkedin url or empty string",
  "github": "github url or empty string",
  "location": "city and state",
  "summary": "objective or summary paragraph text",
  "education": [
    {
      "institution": "college or school name",
      "degree": "degree type and field",
      "year": "year range like Aug 2023 - Present",
      "gpa": "cgpa or percentage"
    }
  ],
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "date range",
      "location": "city or remote",
      "bullets": ["bullet 1 text without the bullet character", "bullet 2 text"]
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "one line description",
      "tech": "tools and technologies used",
      "link": "github or demo link or empty",
      "bullets": ["what was done", "what was achieved or built"]
    }
  ],
  "skills": {
    "languages": "programming languages or empty",
    "frameworks": "frameworks or empty",
    "tools": "tools and software",
    "databases": "databases or empty",
    "other": "soft skills and other skills"
  },
  "achievements": ["achievement 1", "achievement 2"],
  "certifications": ["certification 1"]
}`

    const raw = await askAI(prompt, 3000)
    console.log('AI response length:', raw.length)

    const parsed = parseJSON(raw)

    console.log('Parsed:', {
      name: parsed.name,
      education: parsed.education?.length,
      experience: parsed.experience?.length,
      projects: parsed.projects?.length,
    })

    res.json(parsed)
  } catch (error) {
    console.error('Parse resume error:', error.message)
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