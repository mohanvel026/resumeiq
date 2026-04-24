# ResumeIQ — AI-Powered Resume & Career Platform

> Land your dream job with AI precision. Upload your resume, get instant AI analysis, match with real jobs, and prepare for interviews — all in one platform.

![ResumeIQ Landing](screenshots/landing.png)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ResumeIQ-gold?style=for-the-badge)](https://resumeiq.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-mohanvel026-navy?style=for-the-badge&logo=github)](https://github.com/mohanvel026/resumeiq)

---

## What is ResumeIQ?

ResumeIQ is a full-stack AI-powered career platform built for job seekers. It analyzes your resume using AI, finds real job matches, rewrites weak bullet points, generates tailored cover letters, and even conducts AI mock interviews — all for free.

**Built with:** MySQL + Express + React + Node.js (MERS Stack) + Groq AI (LLaMA 3)

---

## Screenshots

| Landing Page | Dashboard | Resume Analysis |
|---|---|---|
| ![Landing](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) | ![Analysis](screenshots/analysis.png) |

| Job Listings | Interview Prep | Mock Interview |
|---|---|---|
| ![Jobs](screenshots/jobs.png) | ![Interview](screenshots/interview.png) | ![Mock](screenshots/mock.png) |

---

## Features (25 Total)

### Core Features
- **PDF/DOCX Upload** — Upload resume in any format, AI parses every detail
- **AI Resume Scorer** — Get scored on 6 dimensions: ATS, Clarity, Impact, Keywords, Formatting, Readability
- **ATS Keyword Gap Finder** — Paste a job description, find missing keywords instantly
- **AI Bullet Rewriter** — Weak experience bullets rewritten with action verbs and quantified impact
- **Cover Letter Generator** — Tailored cover letters generated for each specific job
- **Real-time Job Scraping** — Live jobs from Adzuna API matched to your skills
- **AI Job Match %** — AI scores each job against your resume with explanation
- **Skill Gap Analyzer** — Missing skills with free learning resource links
- **Application Tracker** — Kanban board: Applied → Interviewing → Offer → Rejected
- **Multi-version Resume Manager** — Save and compare multiple resume versions

### AI Features
- **AI Mock Interview** — Practice with AI interviewer, get real-time answer feedback
- **Interview Question Predictor** — 10 likely questions with STAR format hints
- **LinkedIn Profile Analyzer** — Compare LinkedIn vs resume, fix inconsistencies
- **Score History Timeline** — Track resume improvement over time

### Insights
- **Analytics Dashboard** — Charts for score trends, application success rate, skill frequency
- **Global Leaderboard** — See how your resume ranks globally (anonymous, opt-in)
- **Profile Completion Tracker** — Progress bar to complete all career sections
- **Email Job Alerts** — Daily digest of new job matches
- **Resume PDF Export** — Export any version as polished PDF

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | Frontend framework |
| React Router DOM | Client-side routing |
| Axios | API calls |
| Recharts | Analytics charts |
| Tailwind CSS | Styling |
| Custom CSS Variables | Corporate navy/gold theme |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database management |
| MySQL (Railway) | Relational database |
| Multer | File upload handling |
| pdf-parse + mammoth | PDF/DOCX text extraction |
| JWT | Authentication |
| bcryptjs | Password hashing |

### AI & APIs
| Service | Purpose |
|---|---|
| Groq (LLaMA 3.3 70B) | Resume scoring, rewriting, cover letters, interview |
| Adzuna API | Real-time job listings |
| Google Gemini API | Backup AI model |

### Deployment
| Service | Purpose |
|---|---|
| Railway | Backend + MySQL hosting |
| Vercel | Frontend hosting |
| GitHub | Version control |

---

## Database Schema

6 MySQL tables managed with Prisma ORM:

Users ──→ Resumes ──→ AiAnalyses
│
├──→ ResumeVersions
│
JobListings ──→ JobApplications ←── Users

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database (Railway recommended)
- Groq API key (free at console.groq.com)
- Adzuna API key (free at developer.adzuna.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/mohanvel026/resumeiq.git
cd resumeiq

# Setup Backend
cd server
npm install
cp .env.example .env
# Fill in your .env values
npx prisma migrate dev
npm run dev

# Setup Frontend (new terminal)
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

### Environment Variables

**server/.env**
```env
DATABASE_URL="mysql://user:password@host:port/railway"
JWT_SECRET="your_secret_key"
GROQ_API_KEY="gsk_your_groq_key"
ADZUNA_APP_ID="your_adzuna_id"
ADZUNA_APP_KEY="your_adzuna_key"
PORT=5000
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000
```

---

## API Endpoints

### Auth 

POST /api/auth/register    — Register new user
POST /api/auth/login       — Login user
GET  /api/auth/me          — Get current user

### Resume
POST /api/resume/upload    — Upload PDF/DOCX resume
GET  /api/resume/all       — Get all user resumes
GET  /api/resume/:id       — Get resume by ID
DELETE /api/resume/:id     — Delete resume

### AI Analysis
POST /api/analysis/score              — Score resume (6 dimensions)
POST /api/analysis/keywords           — Find keyword gaps
POST /api/analysis/rewrite            — Rewrite bullet points
POST /api/analysis/cover-letter       — Generate cover letter
POST /api/analysis/job-match          — Score job match %
POST /api/analysis/skill-gap          — Find missing skills
POST /api/analysis/interview-questions — Generate interview questions
POST /api/analysis/evaluate-answer    — Evaluate mock interview answer
POST /api/analysis/linkedin           — Analyze LinkedIn vs resume

### Jobs
GET /api/jobs/search?skills=react,node — Search real job listings

---

## Key Technical Decisions

1. **MySQL over MongoDB** — Resume data is highly relational (users → resumes → analyses → applications). MySQL with Prisma gives clean foreign key relationships and better analytics queries.

2. **Groq (LLaMA 3) over OpenAI** — Groq provides 14,400 free requests/day with millisecond response times. No credit card required, making the app truly free to run.

3. **Single AiAnalysis table** — Instead of 7 separate analysis tables, one table with an `AnalysisType` enum keeps queries simple and lets you fetch all analyses for a resume in one call.

4. **pdf-parse@1.1.1** — Specific version pinned to avoid CommonJS import breaking changes in newer versions.

---

## What I Learned

- Designing relational database schemas for complex real-world applications
- Integrating multiple AI APIs (Groq, Gemini) with retry logic and fallbacks
- Building responsive UIs with CSS custom properties and mobile-first design
- File upload handling with Multer and PDF text extraction with pdf-parse
- JWT authentication with protected routes on both frontend and backend
- Deploying full-stack applications with Railway + Vercel

---

## Author

**Mohan Vel**
- GitHub: [@mohanvel026](https://github.com/mohanvel026)
- Email: mohanvel026@gmail.com
- LinkedIn: [linkedin.com/in/mohanvel026](https://linkedin.com/in/mohanvel026)

---

## License

MIT License — free to use for personal and commercial projects.

---

*Built with ❤️ during NxtWave Full Stack Development Program*
