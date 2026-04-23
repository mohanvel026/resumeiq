const axios = require('axios')

const searchJobs = async (req, res) => {
  try {
    const { skills } = req.query
    const skillList = skills || 'javascript react node'

    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/in/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        results_per_page: 20,
        what: skillList,
        content_type: 'application/json',
      }
    })

    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'Remote',
      salary: job.salary_min ? `₹${Math.round(job.salary_min/1000)}K – ₹${Math.round(job.salary_max/1000)}K` : null,
      description: job.description,
      jobUrl: job.redirect_url,
      source: 'adzuna',
      postedAt: job.created,
    }))

    res.json(jobs)
  } catch (error) {
    console.error('Job search error:', error.message)
    res.json(getFallbackJobs())
  }
}

const getFallbackJobs = () => [
  { id: 1, title: 'Full Stack Developer', company: 'TCS', location: 'Chennai', salary: '₹8L – ₹12L', description: 'We are looking for a Full Stack Developer with React and Node.js experience. Must have 2+ years experience with MERN stack.', jobUrl: 'https://www.naukri.com', source: 'fallback' },
  { id: 2, title: 'React Frontend Developer', company: 'Infosys', location: 'Bangalore', salary: '₹6L – ₹10L', description: 'Frontend Developer with strong React.js skills. Experience with Redux, REST APIs, and responsive design required.', jobUrl: 'https://www.naukri.com', source: 'fallback' },
  { id: 3, title: 'Node.js Backend Engineer', company: 'Wipro', location: 'Hyderabad', salary: '₹7L – ₹11L', description: 'Backend engineer with Node.js and Express.js experience. Knowledge of MySQL or MongoDB preferred.', jobUrl: 'https://www.naukri.com', source: 'fallback' },
  { id: 4, title: 'MERN Stack Developer', company: 'Zoho', location: 'Chennai', salary: '₹5L – ₹9L', description: 'Looking for a talented MERN stack developer to join our product team. React, Node, MongoDB, Express required.', jobUrl: 'https://www.zoho.com/careers', source: 'fallback' },
  { id: 5, title: 'Software Engineer - Frontend', company: 'Freshworks', location: 'Chennai', salary: '₹8L – ₹14L', description: 'Frontend engineer to build customer-facing products. React, TypeScript, REST APIs experience needed.', jobUrl: 'https://www.freshworks.com/company/careers', source: 'fallback' },
  { id: 6, title: 'Junior Web Developer', company: 'Cognizant', location: 'Pune', salary: '₹3L – ₹6L', description: 'Entry level web developer position. HTML, CSS, JavaScript, React basics required. Fresh graduates welcome.', jobUrl: 'https://www.naukri.com', source: 'fallback' },
]

module.exports = { searchJobs }