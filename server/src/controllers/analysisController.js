const prisma = require('../utils/prisma')
const Groq = require('groq-sdk')
const axios = require('axios')

const groqClient1 = new Groq({ apiKey: process.env.GROQ_API_KEY })
const groqClient2 = process.env.GROQ_API_KEY_2
  ? new Groq({ apiKey: process.env.GROQ_API_KEY_2 })
  : null

const askAI = async (prompt, maxTokens = 1500) => {
  const providers = [
    // Groq Key 1 - llama
    async () => {
      const c = await groqClient1.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: maxTokens,
      })
      return c.choices[0].message.content
    },
    // Groq Key 1 - gemma fallback
    async () => {
      const c = await groqClient1.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gemma2-9b-it',
        temperature: 0.2,
        max_tokens: maxTokens,
      })
      return c.choices[0].message.content
    },
    // Groq Key 2 - if available
    async () => {
      if (!groqClient2) throw new Error('No second Groq key')
      const c = await groqClient2.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: maxTokens,
      })
      return c.choices[0].message.content
    },
    // Gemini fallback
    async () => {
      if (!process.env.GEMINI_API_KEY) throw new Error('No Gemini key')
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }]
      }, { timeout: 30000 })
      return response.data.candidates[0].content.parts[0].text
    },
  ]

  let lastError = null
  for (let i = 0; i < providers.length; i++) {
    try {
      console.log(`AI attempt ${i + 1}/${providers.length}`)
      const result = await providers[i]()
      return result
    } catch (err) {
      const msg = err.message || ''
      console.log(`Attempt ${i + 1} failed:`, msg.slice(0, 80))
      lastError = err
      if (i < providers.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }
  throw new Error('All AI providers exhausted. Please try again in a few minutes.')
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

// ══ INDUSTRY-LEVEL ATS SCORE ══
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

    // ── Deterministic pre-checks (mirrors what Taleo/Workday/iCIMS parse) ──
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
    const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(text)
    const hasLinkedIn = /linkedin\.com\/in\//i.test(text)
    const hasGitHub = /github\.com\//i.test(text)
    const hasPortfolio = /portfolio|website|behance\.net|dribbble\.com/i.test(text)
    const wordCount = text.trim().split(/\s+/).length
    const sentenceCount = (text.match(/[.!?]+/g) || []).length
    const bulletCount = (text.match(/^\s*[•\-\*▪◦→✓✔◆■]\s/gm) || []).length
    const lineCount = text.split('\n').filter(l => l.trim().length > 0).length

    // Section detection
    const hasSummary = /\b(summary|professional summary|profile|objective|about me|career objective)\b/i.test(text)
    const hasEducation = /\b(education|academic|university|college|bachelor|master|b\.tech|m\.tech|b\.e\.|cgpa|gpa|graduation)\b/i.test(text)
    const hasExperience = /\b(experience|work experience|employment|internship|professional experience|career history)\b/i.test(text)
    const hasSkills = /\b(skills|technical skills|technologies|tech stack|core competencies|tools|expertise|proficiency)\b/i.test(text)
    const hasProjects = /\b(projects|personal projects|academic projects|key projects|portfolio)\b/i.test(text)
    const hasCerts = /\b(certification|certificate|certified|course|training|license)\b/i.test(text)
    const hasAwards = /\b(awards|achievements|honors|recognition|accomplishments)\b/i.test(text)

    // Impact analysis
    const quantifiedPattern = /\d+\s*(%|percent|x|times|users|clients|projects|members|lakh|crore|million|billion|k\b|hours|days|weeks|months|\+)/i
    const hasQuantified = quantifiedPattern.test(text)
    const quantifiedCount = (text.match(new RegExp(quantifiedPattern.source, 'gi')) || []).length

    // Action verb richness (strong vs weak)
    const strongVerbs = /\b(engineered|architected|spearheaded|orchestrated|pioneered|transformed|accelerated|optimized|automated|integrated|deployed|launched|scaled|generated|secured|negotiated|mentored|led|reduced|increased|delivered|achieved|established|built|designed|implemented|developed|created)\b/gi
    const weakVerbs = /\b(helped|assisted|worked on|participated|involved|supported|contributed to|responsible for|duties include)\b/gi
    const strongVerbCount = (text.match(strongVerbs) || []).length
    const weakVerbCount = (text.match(weakVerbs) || []).length

    // Date consistency
    const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b|\b\d{4}\s*[-–]\s*(\d{4}|present|current)\b/gi
    const dateCount = (text.match(datePattern) || []).length

    // Length penalty
    const pageLengthStatus = wordCount > 900 ? 'over' : wordCount < 250 ? 'under' : 'ideal'

    // Grammar signals (proxy check)
    const consecutiveCaps = (text.match(/[A-Z]{5,}/g) || []).length
    const hasSpecialSymbols = /[|}{<>\\]/.test(text)

    // Count mandatory sections present
    const sectionScore = [hasSummary, hasEducation, hasExperience, hasSkills, hasProjects].filter(Boolean).length

    const prompt = `You are ResumeIQ's senior ATS engine, trained on scoring logic used by enterprise ATS platforms (Taleo, Workday, iCIMS, Greenhouse, Lever, SAP SuccessFactors). Your job is to produce REALISTIC, DIFFERENTIATED scores that match what a real recruiter at a top company would see.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME TEXT (first 4000 chars):
"""
${text.slice(0, 4000)}
"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRE-COMPUTED SIGNALS (use EXACTLY these in your scoring math):

CONTACT SECTION:
  • Email present:         ${hasEmail}      ${!hasEmail ? '→ CRITICAL: -20 pts from scoreAts' : ''}
  • Phone present:         ${hasPhone}      ${!hasPhone ? '→ CRITICAL: -15 pts from scoreAts' : ''}
  • LinkedIn URL:          ${hasLinkedIn}   ${!hasLinkedIn ? '→ Missing: -8 pts from scoreReadability' : ''}
  • GitHub URL:            ${hasGitHub}     ${!hasGitHub ? '→ Missing for tech roles: -5 pts from scoreKeywords' : ''}
  • Portfolio/website:     ${hasPortfolio}

SECTIONS DETECTED (${sectionScore}/5 required):
  • Summary/Objective:     ${hasSummary}    ${!hasSummary ? '→ Missing: -10 pts from scoreFormatting' : ''}
  • Education:             ${hasEducation}
  • Experience/Internship: ${hasExperience} ${!hasExperience ? '→ Missing: -15 pts from scoreAts' : ''}
  • Skills:                ${hasSkills}     ${!hasSkills ? '→ Missing: -18 pts from scoreKeywords' : ''}
  • Projects:              ${hasProjects}   ${!hasProjects ? '→ No projects: -10 pts from scoreImpact' : ''}
  • Certifications:        ${hasCerts}
  • Awards/Achievements:   ${hasAwards}

CONTENT QUALITY:
  • Word count:            ${wordCount}     (ideal 400–700) → ${pageLengthStatus === 'over' ? 'Too long: -12 pts from scoreFormatting' : pageLengthStatus === 'under' ? 'Too short: -10 pts from scoreFormatting' : 'Good length'}
  • Bullet point lines:    ${bulletCount}   ${bulletCount < 4 ? '→ Too few bullets: -12 pts from scoreFormatting' : ''}
  • Quantified results:    ${hasQuantified} (${quantifiedCount} instances) ${!hasQuantified ? '→ ZERO metrics: -25 pts from scoreImpact' : quantifiedCount < 3 ? '→ Too few metrics: -12 pts from scoreImpact' : ''}
  • Strong action verbs:   ${strongVerbCount} (engineered, deployed, optimized…)
  • Weak passive phrases:  ${weakVerbCount}  ${weakVerbCount > 3 ? '→ Heavy weak language: -15 pts from scoreClarity' : ''}
  • Date ranges found:     ${dateCount}     ${dateCount < 2 ? '→ Missing employment dates: -8 pts from scoreAts' : ''}
  • All-caps sequences:    ${consecutiveCaps} ${consecutiveCaps > 2 ? '→ ATS parsing issue: -5 pts from scoreAts' : ''}
  • Table/symbol chars:    ${hasSpecialSymbols} ${hasSpecialSymbols ? '→ ATS unfriendly: -10 pts from scoreAts' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING FRAMEWORK (industry weights):

1. scoreAts (25% weight) — Parse compatibility with Taleo/Workday
   Perfect ATS = plain text, clear sections, standard headers, no tables/columns/images
   Start 100 → apply deductions from signals above → add your assessment of structure clarity

2. scoreKeywords (20% weight) — Keyword density & relevance
   Perfect = rich with job-title-specific terms, tools, frameworks, certifications
   Start 100 → deduct for missing skills, generic descriptions, no tech stack details

3. scoreImpact (20% weight) — Achievement orientation
   Perfect = every bullet has a metric, scope, or business outcome
   Start 100 → deduct based on quantifiedCount and weakVerbCount above

4. scoreFormatting (15% weight) — Structure & visual hierarchy
   Perfect = proper sections in order, consistent dates, right length, no design gimmicks
   Start 100 → deduct based on section gaps, length, bullet count

5. scoreClarity (10% weight) — Language quality & readability
   Perfect = active voice, no jargon soup, clear concise sentences under 25 words
   Start 100 → deduct for passive voice, vague language, grammar signals

6. scoreReadability (10% weight) — 6-second recruiter scan test
   Perfect = name at top, contact visible, sections scannable, reverse-chronological
   Start 100 → deduct if contact buried, no clear hierarchy, wall of text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDUSTRY BENCHMARK DISTRIBUTION (be realistic):

Fresh Graduate (0–1 yr exp):  typical 42–65, good 65–75, exceptional 75–82
Junior Professional (1–3 yr): typical 55–70, good 70–80, exceptional 80–87
Senior Professional (5+ yr):  typical 65–78, good 78–88, exceptional 88–95
Executive (10+ yr):           typical 72–84, good 84–92, exceptional 92–100

CRITICAL RULES:
• ALL 6 scores must be DIFFERENT values — never give the same number twice
• Scores reflect the PRE-COMPUTED signals above — if email is missing, scoreAts cannot be above 60
• If quantifiedCount = 0, scoreImpact must be below 45
• If skills section missing, scoreKeywords must be below 40
• Be STRICT — a score of 80+ means the resume is genuinely impressive

Return ONLY valid JSON (no markdown, no explanation):
{
  "scoreAts": <number 0-100>,
  "scoreKeywords": <number 0-100>,
  "scoreImpact": <number 0-100>,
  "scoreFormatting": <number 0-100>,
  "scoreClarity": <number 0-100>,
  "scoreReadability": <number 0-100>,
  "improvements": [
    "<specific, actionable fix with example — no vague advice>",
    "<specific, actionable fix with example>",
    "<specific, actionable fix with example>",
    "<specific, actionable fix with example>"
  ],
  "strengths": [
    "<specific thing done well in THIS resume>",
    "<specific thing done well in THIS resume>"
  ],
  "assessment": "<2-3 sentence honest assessment of this specific resume. IF THIS IS A NON-TECH RESUME (e.g. Mechanical, Civil), ACKNOWLEDGE THE DOMAIN and score accordingly.>",
  "industryBenchmark": "<detected role/level - e.g. 'Senior Mechanical Engineer' or 'Entry-level VLSI Engineer'>",
  "percentile": <realistic percentile 1-99 matching the score>,
  "topSkills": ["CRITICAL: Extract ONLY skills actually present in the text. For Mechanical, extract things like 'AutoCAD', 'SolidWorks', 'Thermodynamics', 'HVAC'. DO NOT include software terms like 'React' or 'JavaScript' if they are not in the text. List 6-8 core technical skills found."]
}`

    const raw = await askAI(prompt, 1200)
    let scores
    try {
      scores = parseJSON(raw)
    } catch (e) {
      throw new Error('AI returned invalid JSON. Please try again.')
    }

    // Validate scores are in range
    const clamp = (v) => Math.min(100, Math.max(0, parseInt(v) || 50))
    scores.scoreAts = clamp(scores.scoreAts)
    scores.scoreKeywords = clamp(scores.scoreKeywords)
    scores.scoreImpact = clamp(scores.scoreImpact)
    scores.scoreFormatting = clamp(scores.scoreFormatting)
    scores.scoreClarity = clamp(scores.scoreClarity)
    scores.scoreReadability = clamp(scores.scoreReadability)

    // Weighted total (ATS industry standard weights)
    const scoreTotal = Math.round(
      scores.scoreAts * 0.25 +
      scores.scoreKeywords * 0.20 +
      scores.scoreImpact * 0.20 +
      scores.scoreFormatting * 0.15 +
      scores.scoreClarity * 0.10 +
      scores.scoreReadability * 0.10
    )

    // Update resume with extracted skills
    if (scores.topSkills) {
      await prisma.resume.update({
        where: { id: resumeId },
        data: { extractedSkills: JSON.stringify(scores.topSkills) }
      })
    }

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
      improvements: scores.improvements || [],
      strengths: scores.strengths || [],
      assessment: scores.assessment || '',
      industryBenchmark: scores.industryBenchmark || '',
      percentile: scores.percentile || 50,
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

// ══ SALARY CAREER TIPS ══
const getSalaryCareerTips = async (req, res) => {
  try {
    const { role, domain, experience, city, tier, targetSalary, resumeId } = req.body

    let resumeText = 'No resume provided.'
    if (resumeId) {
      const rid = parseInt(resumeId)
      if (isNaN(rid)) {
        console.error('Invalid resumeId:', resumeId)
      } else {
        const resume = await prisma.resume.findFirst({
          where: { id: rid, userId: req.user.id }
        })
        if (resume) resumeText = resume.rawText
      }
    }

    const prompt = `You are a high-level executive career coach and compensation expert for the Indian tech and engineering market.

CANDIDATE PROFILE:
- Current Resume Content: """${resumeText.slice(0, 3000)}"""
- Target Role: ${role} (${domain} domain)
- Target Experience Level: ${experience} years
- Target Location: ${city}
- Target Company Tier: ${tier}
- High-end Salary Target: ₹${targetSalary}LPA

TASK:
1. Analyze the candidate's current resume against the target role and salary bracket.
2. Identify specific technical skills or certifications they are MISSING to qualify for a ₹${targetSalary}LPA package.
3. Do NOT just suggest "Leadership" or "Communication" unless they are senior (8+ yrs). Focus on HARD technical gaps first.
4. Provide a roadmap to bridge these gaps.

Return ONLY this JSON format:
{
  "strategy": "A 2-3 sentence personalized strategy based on their SPECIFIC resume content (e.g. 'Your React skills are strong, but to hit ₹${targetSalary}L as a Full Stack dev, you need to master distributed systems...').",
  "marketRange": {
    "min": "Current realistic min LPA for this role/tier",
    "avg": "Current realistic avg LPA",
    "max": "Current realistic max LPA for top performers"
  },
  "topSkills": ["Specific Skill 1 they lack", "Specific Skill 2 they lack", "Specific Skill 3 they lack"],
  "targetCompanies": ["Company A", "Company B", "Company C"],
  "certifications": ["Specific Cert 1", "Specific Cert 2"],
  "leverageTip": "A specific tip on how to use their EXISTING experience from their resume to negotiate a ₹${targetSalary}L+ package."
}`

    const raw = await askAI(prompt, 1200)
    const result = parseJSON(raw)
    res.json(result)
  } catch (error) {
    console.error('Salary tips error:', error.message)
    res.status(500).json({ message: 'Failed to get salary tips: ' + error.message })
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

// ══ LEADERBOARD — shows LATEST score per user (most recent analysis) ══
const getLeaderboard = async (req, res) => {
  try {
    // Get all SCORE analyses ordered by newest first
    const analyses = await prisma.aiAnalysis.findMany({
      where: { type: 'SCORE', scoreTotal: { not: null } },
      include: {
        resume: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }   // newest first → first match per user = latest
    })

    // Keep only the LATEST analysis per user (first occurrence since sorted desc)
    const userLatestScores = {}
    analyses.forEach(a => {
      const userId = a.resume?.user?.id
      const userName = a.resume?.user?.name
      if (!userId || !userName) return
      if (!userLatestScores[userId]) {   // first = latest because of desc sort
        userLatestScores[userId] = {
          userId,
          name: userName,
          score: a.scoreTotal,
          resumeTitle: a.resume?.title || 'Resume',
          analyzedAt: a.createdAt,
        }
      }
    })

    const leaderboard = Object.values(userLatestScores)
      .sort((a, b) => b.score - a.score)   // rank by score descending
      .slice(0, 20)
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.score,
        resumeTitle: entry.resumeTitle,
        analyzedAt: entry.analyzedAt,
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
      include: { 
        analyses: {
          orderBy: { createdAt: 'asc' }
        },
        jobApplications: true
      }
    })

    // 1. Core Metrics
    let bestScore = 0
    let totalAnalyses = 0
    let coverLetters = 0
    
    // 2. Score History (Trends)
    const scoreHistoryMap = {}
    
    // 3. Skills Analysis
    const skillCounts = {}

    resumes.forEach(resume => {
      // Process extracted skills
      if (resume.extractedSkills) {
        try {
          const skills = JSON.parse(resume.extractedSkills)
          if (Array.isArray(skills)) {
            skills.forEach(s => {
              skillCounts[s] = (skillCounts[s] || 0) + 1
            })
          }
        } catch (e) {}
      }

      resume.analyses?.forEach(a => {
        totalAnalyses++
        if (a.type === 'SCORE') {
          if (a.scoreTotal > bestScore) bestScore = a.scoreTotal
          const date = a.createdAt.toISOString().slice(0, 10)
          scoreHistoryMap[date] = a.scoreTotal
        }
        if (a.type === 'COVER_LETTER') coverLetters++
      })
    })

    const scoreHistory = Object.entries(scoreHistoryMap)
      .map(([date, score]) => ({ date, score }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10) // last 10 data points

    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // 4. Job Application Stats
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user.id }
    })

    const appStatusCounts = {
      APPLIED: 0,
      INTERVIEWING: 0,
      OFFER: 0,
      REJECTED: 0
    }
    applications.forEach(app => {
      if (appStatusCounts[app.status] !== undefined) {
        appStatusCounts[app.status]++
      }
    })

    const appStatus = Object.entries(appStatusCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'APPLIED' ? '#17A2B8' : name === 'INTERVIEWING' ? '#C9A84C' : name === 'OFFER' ? '#22c55e' : '#ef4444'
    }))

    // 5. Market Readiness Calculation
    const marketReadiness = Math.round((bestScore * 0.7) + (applications.length * 2))

    res.json({
      resumes: resumes.length,
      totalAnalyses,
      bestScore,
      coverLetters,
      scoreHistory,
      topSkills,
      appStatus,
      totalApplications: applications.length,
      marketReadiness: Math.min(100, marketReadiness)
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
    "core_technical": "primary professional skills (e.g. thermodynamics, circuit design, or programming languages)",
    "frameworks_or_methodologies": "frameworks, methodologies, or specialized workflows",
    "software_tools": "specific software tools (e.g. AutoCAD, SolidWorks, VS Code, Excel)",
    "soft_skills": "communication, leadership, etc.",
    "other": "any other relevant skills"
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

// ══ SUGGEST RESUME IMPROVEMENTS ══
const suggestResumeImprovements = async (req, res) => {
  try {
    const { resumeId } = req.body
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: req.user.id } })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })
    if (!resume.rawText || resume.rawText.length < 50) return res.status(400).json({ message: 'Resume text too short' })

    const prompt = `You are an expert resume coach. Analyze this resume and return SPECIFIC, ACTIONABLE improvement suggestions.

RESUME:
"""
${resume.rawText.slice(0, 3500)}
"""

Return ONLY valid JSON with this exact structure:
{
  "overallScore": <number 0-100>,
  "targetRole": "<detected role e.g. Software Engineer, Mechanical Engineer>",
  "suggestions": [
    {
      "id": "s1",
      "category": "Summary",
      "priority": "high",
      "issue": "<what's wrong>",
      "current": "<exact current text or 'Missing'>",
      "improved": "<the improved version ready to use>",
      "impact": "<why this helps ATS/recruiters>"
    },
    {
      "id": "s2",
      "category": "Bullet Points",
      "priority": "high",
      "issue": "<what's wrong>",
      "current": "<exact current bullet>",
      "improved": "<quantified improved bullet>",
      "impact": "<why this helps>"
    }
  ],
  "missingKeywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "quickWins": ["<one-line quick fix>", "<one-line quick fix>"]
}

Generate 5-8 suggestions across categories: Summary, Bullet Points, Skills, Contact, Formatting, Keywords.
Priority must be: high, medium, or low.`

    const raw = await askAI(prompt, 1500)
    const result = parseJSON(raw)
    res.json(result)
  } catch (error) {
    console.error('Suggest improvements error:', error.message)
    res.status(500).json({ message: 'AI suggestion failed: ' + error.message })
  }
}

// ══ ENHANCE RESUME CONTENT (apply selected suggestions) ══
const enhanceResumeContent = async (req, res) => {
  try {
    const { resumeId, selectedIds, suggestions, template } = req.body
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: req.user.id } })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const selected = suggestions.filter(s => selectedIds.includes(s.id))
    const changes = selected.map(s => `• [${s.category}] ${s.issue} → Apply: "${s.improved}"`).join('\n')

    const prompt = `You are a professional resume writer. Rewrite this resume applying EXACTLY the selected improvements listed below.

ORIGINAL RESUME:
"""
${resume.rawText.slice(0, 3000)}
"""

APPLY THESE SPECIFIC IMPROVEMENTS:
${changes}

Return ONLY valid JSON:
{
  "name": "<full name from resume>",
  "contact": ["<email>", "<phone>", "<linkedin if present>", "<github if present>"],
  "summary": "<2-3 sentence professional summary with keywords>",
  "experience": [
    { "title": "<job title>", "company": "<company>", "date": "<dates>", "bullets": ["<bullet 1>", "<bullet 2>"] }
  ],
  "education": [
    { "degree": "<degree>", "institution": "<university>", "date": "<year>", "details": "<GPA or relevant details>" }
  ],
  "skills": ["<skill category>: <skills>"],
  "projects": [
    { "name": "<project name>", "tech": "<tech stack>", "bullets": ["<bullet 1>"] }
  ],
  "achievements": ["<achievement 1>", "<achievement 2>"]
}`

    const raw = await askAI(prompt, 1800)
    const enhanced = parseJSON(raw)
    res.json({ enhanced, template })
  } catch (error) {
    console.error('Enhance resume error:', error.message)
    res.status(500).json({ message: 'Enhancement failed: ' + error.message })
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
  suggestResumeImprovements,
  enhanceResumeContent,
  getSalaryCareerTips,
}
