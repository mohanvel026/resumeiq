import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import { trackActivity } from '../utils/activity'

const STYLES = [
  { id: 'formal', name: '👔 Formal', desc: 'Corporate & professional' },
  { id: 'creative', name: '🎨 Creative', desc: 'Startups & modern companies' },
  { id: 'technical', name: '⚡ Technical', desc: 'Engineering & developer roles' },
  { id: 'entry', name: '🎓 Entry Level', desc: 'Fresh graduates' },
  { id: 'career_change', name: '🔄 Career Change', desc: 'Switching industries' },
]

export default function CoverLetterTemplates() {

  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [style, setStyle] = useState('formal')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [letter, setLetter] = useState('')
  const [suggestions, setSuggestions] = useState('') 
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('generate')

  useEffect(() => {
    api.get('/api/resume/all')
      .then(r => {
        setResumes(r.data)
        if (r.data[0]) setSelectedResume(r.data[0].id)
      })
      .catch(() => {})
  }, [])

  const getStyleInstructions = (styleId) => {
    const instructions = {
      formal: `
        FORMAT REQUIREMENT: Write EXACTLY 3 paragraphs.
        - Para 1: Direct opening stating the role, company, and top metric.
        - Para 2: Core technical achievements matching the job description.
        - Para 3: Brief closing and call to action.`,
      creative: `
        FORMAT REQUIREMENT: Write EXACTLY 3 paragraphs.
        - Para 1: Start with a story/hook about a past project win.
        - Para 2: Connect that passion to the company's tech stack.
        - Para 3: Confident sign-off.`,
      technical: `
        FORMAT REQUIREMENT: Write EXACTLY 3 sections.
        - Section 1: A 2-sentence intro about engineering focus.
        - Section 2: A bulleted list of 3 specific technical implementations.
        - Section 3: A 1-sentence wrap-up.`,
      entry: `
        FORMAT REQUIREMENT: Write EXACTLY 2 paragraphs.
        - Para 1: Connect academic foundations and personal projects to the job.
        - Para 2: Highlight learning velocity using past internships/hackathons.`,
      career_change: `
        FORMAT REQUIREMENT: Write EXACTLY 3 paragraphs.
        - Para 1: Frame the diverse background as a massive asset.
        - Para 2: Focus on transferable problem-solving skills.
        - Para 3: Call to action.`
    };
    return instructions[styleId] || instructions.formal;
  }

  const generate = async () => {
    if (!jobTitle || !company) return alert('Please fill in Job Title and Company name')
    
    setLoading(true)
    try {
      const specificStyleRules = getStyleInstructions(style);
      
      // NEW: Strict JSON format prompting
      const systemInstruction = `You are a strict data-parser and executive copywriter. 
      CRITICAL INSTRUCTION: You MUST return ONLY a valid, raw JSON object. Do NOT include ANY conversational text before or after the JSON. Do NOT use markdown code blocks (like \`\`\`json).
      
      You MUST use this EXACT structure:
      {
        "coverLetter": "Dear Hiring Manager,\\n\\n[Write the full cover letter here]\\n\\nSincerely,\\n[Name]",
        "suggestions": "• [First suggestion]\\n• [Second suggestion]\\n• [Third suggestion]"
      }`;
      
      const context = `
      TARGET ROLE:
      - Title: ${jobTitle}
      - Company: ${company}
      - Job Description: ${jobDesc ? jobDesc : 'Focus on standard industry expectations for this role.'}
      `;

      const constraints = `
      CRITICAL INSTRUCTIONS:
      ${specificStyleRules}
      
      GLOBAL RULES (FAILING THESE CAUSES A SYSTEM ERROR):
      1. BANNED WORDS: "In conclusion", "delve", "testament". NEVER use these.
      2. SPELLING OVERRIDE: The Flipkart automation tool is spelled "Automa". DO NOT change it to "Automato".
      3. OUTPUT ONLY JSON: If you output anything other than curly braces {} starting and ending your response, the system will crash.
      `;

      const enhancedPrompt = `${systemInstruction}\n\n${context}\n\n${constraints}`;

      const r = await api.post('/api/analysis/cover-letter', {
        resumeId: parseInt(selectedResume),
        jobDescription: enhancedPrompt, 
      })
      
      const responseText = r.data.coverLetter || '';
      
      // NEW: Bulletproof JSON Parsing
      try {
        // 1. Strip markdown formatting just in case the AI disobeys and adds ```json
        const cleanJsonString = responseText.replace(/```json\n?|```/gi, '').trim();
        
        // 2. Parse the JSON natively
        const parsedData = JSON.parse(cleanJsonString);
        
        setLetter(parsedData.coverLetter.trim());
        setSuggestions(parsedData.suggestions.trim());
        
      } catch (parseError) {
        console.error("JSON Parsing failed. AI Output was:", responseText);
        // Ultimate Fallback if the AI completely hallucinates
        setLetter(responseText.replace(/\{|"coverLetter":|"/g, '').substring(0, 1500).trim());
        setSuggestions("Formatting error. The AI failed to separate the suggestions properly. Please click Generate again.");
      }

      setTab('result')
      trackActivity('coverLetters')
    } catch (err) {
      console.error("AI Generation Error:", err);
      alert(`Failed to generate: ${err.response?.data?.message || 'Make sure you have uploaded and analyzed a resume first.'}`)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${company.replace(/\s+/g, '-').toLowerCase()}-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="page-header">
        <h2 className="page-title">AI Cover Letter Generator</h2>
        <p className="page-subtitle">Generate personalized cover letters and get actionable profile suggestions</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {['generate', 'result'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'generate' ? '⚙️ Generate' : '📄 Result'}
          </button>
        ))}
      </div>

      {tab === 'generate' ? (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Job Details</h4>

              <div className="form-group">
                <label className="form-label">Select Your Resume</label>
                <select className="form-select" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  {resumes.length === 0 && <option disabled>No resumes — upload one first</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" placeholder="e.g. Full Stack Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description (optional but recommended)</label>
                <textarea className="form-textarea" rows={4} placeholder="Paste the job description here for a more tailored cover letter..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem' }}>Cover Letter Style</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {STYLES.map(s => (
                  <div key={s.id} onClick={() => setStyle(s.id)}
                    style={{ padding: '12px', border: `2px solid ${style === s.id ? 'var(--gold-500)' : 'var(--gray-200)'}`, borderRadius: 'var(--border-radius)', cursor: 'pointer', background: style === s.id ? 'rgba(201,168,76,0.05)' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--navy-800)', fontSize: '0.9rem' }}>{s.name}</div>
                      <div style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{s.desc}</div>
                    </div>
                    {style === s.id && <span style={{ color: 'var(--gold-500)', fontSize: '1.2rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={generate} disabled={loading || resumes.length === 0}>
              {loading ? '🤖 Analyzing profile & writing letter...' : '✨ Generate AI Cover Letter & Suggestions'}
            </button>

            {resumes.length === 0 && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginTop: '8px', textAlign: 'center' }}>
                Upload a resume first to generate a personalized cover letter
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {letter ? (
            <div className="grid-2" style={{ alignItems: 'start', gridTemplateColumns: '2fr 1fr' }}>
              
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ color: 'var(--navy-800)', margin: '0 0 4px' }}>
                      Cover Letter — {jobTitle} at {company}
                    </h4>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      Style: {STYLES.find(s => s.id === style)?.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                    <button className="btn btn-primary btn-sm" onClick={download}>⬇️ Download</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('generate')}>✏️ Edit Details</button>
                  </div>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-700)', lineHeight: '1.9', fontSize: '0.9375rem', background: 'var(--gray-50)', padding: '2rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--gray-200)', minHeight: '400px' }}>
                  {letter}
                </div>
              </div>

              <div className="card" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid var(--gold-500)' }}>
                <h4 style={{ color: 'var(--navy-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💡</span> AI Coach Suggestions
                </h4>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-700)', fontSize: '0.9375rem', lineHeight: '1.7' }}>
                  {suggestions}
                </div>
              </div>

            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: 'var(--navy-800)', marginBottom: '0.5rem' }}>No cover letter yet</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Go to the Generate tab and fill in the details</p>
              <button className="btn btn-primary" onClick={() => setTab('generate')}>Generate Cover Letter</button>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}