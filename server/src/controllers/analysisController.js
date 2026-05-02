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
    const { resumeId } = req.body;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id }
    });

    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    if (!resume.rawText || resume.rawText.length < 50) {
      return res.status(400).json({ message: 'Resume text is too short. Please upload a proper resume PDF.' });
    }

    // UPDATED PROMPT: Added strict point deduction logic and forced variability
    const prompt = `You are a Tier-1 Executive Recruiter and a strict ATS Algorithm. 
Analyze this resume with BRUTAL HONESTY. Do not give generic high scores. 

SCORING BASELINE: 
- 40-55: Average/Poor. Missing metrics and keywords.
- 60-75: Good. Has keywords but lacks impact.
- 80+: Exceptional. Hard to achieve.

Resume text:
"""
${resume.rawText.slice(0, 4000)}
"""

DEDUCT POINTS AGGRESSIVELY FOR:
1. scoreImpact: -20 points if NO percentages (%) or dollar signs ($) are found. -10 for weak verbs like "helped".
2. scoreAts: -15 if "Skills" or "Education" headers are missing.
3. scoreReadability: -15 if sentences are longer than 25 words.
4. scoreKeywords: -5 for every missing core industry skill (e.g., if it's a dev resume and missing 'Git' or 'Agile').

Return ONLY a JSON object with these keys:
{
  "scoreClarity": <0-100>,
  "scoreImpact": <0-100>,
  "scoreAts": <0-100>,
  "scoreKeywords": <0-100>,
  "scoreFormatting": <0-100>,
  "scoreReadability": <0-100>,
  "improvements": ["Specific, non-generic advice 1", "Advice 2", "Advice 3"]
}`;

    const raw = await askAI(prompt);
    
    // Improved JSON parsing to handle AI "chatter"
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return valid JSON scoring data.");
    
    const scores = JSON.parse(jsonMatch[0]);

    // Calculate a weighted total (Impact and ATS carry more weight)
    const scoreTotal = Math.round(
      (scores.scoreImpact * 0.3) + 
      (scores.scoreAts * 0.3) + 
      (scores.scoreKeywords * 0.2) + 
      (scores.scoreClarity * 0.2)
    );

    // Save to Database
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
        scoreTotal: scoreTotal, // This is the final realistic score
        aiModel: 'llama-3.3-70b-versatile',
        rawResponse: raw,
      }
    });

    // Return response including the improvements array for the frontend
    res.json({ ...analysis, improvements: scores.improvements });
    
  } catch (error) {
    console.error('Score error:', error.message);
    res.status(500).json({ message: 'Analysis failed: ' + error.message });
  }
};
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
    // 1. Fetch ALL scores, but order them by the NEWEST date first
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
      orderBy: {
        createdAt: 'desc' // This ensures we see the most recent analysis first
      }
    })

    // 2. Filter to keep only the LATEST score for each unique user
    const userLatestScores = {}
    analyses.forEach(analysis => {
      const userId = analysis.resume?.user?.id
      // If we already added this user, skip (because the first one found is the newest)
      if (!userId || userLatestScores[userId]) return 

      userLatestScores[userId] = {
        userId,
        name: analysis.resume.user.name,
        score: analysis.scoreTotal,
        resumeTitle: analysis.resume.title || 'Resume',
      }
    })

    // 3. Sort the final unique list by the score value for the ranking
    const leaderboard = Object.values(userLatestScores)
      .sort((a, b) => b.score - a.score) // High scores still go to the top
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