const axios = require('axios')

const searchJobs = async (req, res) => {
  try {
    const { skills } = req.query
    const query = skills || 'software developer'

    console.log('Searching jobs for:', query)
    console.log('RAPIDAPI_KEY exists:', !!process.env.RAPIDAPI_KEY)

    // JSearch API
    try {
      const response = await axios.get(
        'https://jsearch.p.rapidapi.com/search',
        {
          params: {
            query: `${query} jobs`,
            page: '1',
            num_pages: '2',
            date_posted: 'all',
            remote_jobs_only: 'false',
          },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
          timeout: 15000,
        }
      )

      console.log('JSearch status:', response.data?.status)
      console.log('JSearch jobs count:', response.data?.data?.length)

      if (response.data?.data?.length > 0) {
        const jobs = response.data.data.map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city
            ? `${job.job_city}, ${job.job_country}`
            : job.job_is_remote ? 'Remote' : job.job_country || 'Remote',
          salary: job.job_min_salary
            ? `$${Math.round(job.job_min_salary / 1000)}K – $${Math.round(job.job_max_salary / 1000)}K`
            : 'Salary not disclosed',
          description: job.job_description?.slice(0, 400) || '',
          jobUrl: job.job_apply_link || job.job_google_link || '#',
          source: job.job_publisher || 'JSearch',
          logo: job.employer_logo || null,
          remote: job.job_is_remote || false,
          employment_type: job.job_employment_type || '',
          postedAt: job.job_posted_at_datetime_utc || null,
          highlights: job.job_highlights || {},
        }))

        console.log('✅ JSearch returning', jobs.length, 'jobs')
        return res.json(jobs)
      }

      console.log('⚠️ JSearch returned 0 jobs')
    } catch (jsearchErr) {
      console.log('❌ JSearch error:', jsearchErr.response?.status, jsearchErr.response?.data?.message || jsearchErr.message)
    }

    // Adzuna fallback
    try {
      const adzunaRes = await axios.get(
        'https://api.adzuna.com/v1/api/jobs/gb/search/1',
        {
          params: {
            app_id: process.env.ADZUNA_APP_ID,
            app_key: process.env.ADZUNA_APP_KEY,
            results_per_page: 20,
            what: query,
            content_type: 'application/json',
          },
          timeout: 10000,
        }
      )

      if (adzunaRes.data?.results?.length > 0) {
        const jobs = adzunaRes.data.results.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.display_name || 'Unknown Company',
          location: job.location?.display_name || 'Remote',
          salary: job.salary_min
            ? `£${Math.round(job.salary_min / 1000)}K – £${Math.round(job.salary_max / 1000)}K`
            : 'Salary not disclosed',
          description: job.description?.slice(0, 400) || '',
          jobUrl: job.redirect_url,
          source: 'Adzuna',
          logo: null,
          remote: false,
          employment_type: job.contract_time || '',
          postedAt: job.created || null,
        }))

        console.log('✅ Adzuna returning', jobs.length, 'jobs')
        return res.json(jobs)
      }
    } catch (adzunaErr) {
      console.log('❌ Adzuna error:', adzunaErr.message)
    }

    // Final fallback
    console.log('⚠️ Using fallback jobs')
    return res.json(getFallbackJobs())

  } catch (error) {
    console.error('Job search error:', error.message)
    res.status(500).json({ message: 'Job search failed', error: error.message })
  }
}

const getFallbackJobs = () => [
  {
    id: 1,
    title: 'Full Stack Developer',
    company: 'TCS',
    location: 'Chennai, India',
    salary: '₹8L – ₹12L',
    description: 'Looking for Full Stack Developer with React and Node.js experience. Must have 2+ years with MERN stack.',
    jobUrl: 'https://www.naukri.com',
    source: 'Naukri',
    logo: null,
    remote: false,
  },
  {
    id: 2,
    title: 'React Frontend Developer',
    company: 'Infosys',
    location: 'Bangalore, India',
    salary: '₹6L – ₹10L',
    description: 'Frontend Developer with strong React.js skills. Redux, REST APIs experience required.',
    jobUrl: 'https://www.naukri.com',
    source: 'Naukri',
    logo: null,
    remote: false,
  },
  {
    id: 3,
    title: 'Node.js Backend Engineer',
    company: 'Wipro',
    location: 'Hyderabad, India',
    salary: '₹7L – ₹11L',
    description: 'Backend engineer with Node.js and Express.js. MySQL knowledge preferred.',
    jobUrl: 'https://www.naukri.com',
    source: 'Naukri',
    logo: null,
    remote: false,
  },
]

module.exports = { searchJobs }