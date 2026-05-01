import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import MyResumes from './pages/MyResumes'
import ResumeDetail from './pages/ResumeDetail'
import JobListings from './pages/JobListings'
import Tracker from './pages/Tracker'
import InterviewPrep from './pages/InterviewPrep'
import MockInterview from './pages/MockInterview'
import SkillGap from './pages/SkillGap'
import LinkedInAnalyzer from './pages/LinkedInAnalyzer'
import Analytics from './pages/Analytics'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="text-muted">Loading...</p>
    </div>
  )

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><UploadResume /></PrivateRoute>} />
      <Route path="/resumes" element={<PrivateRoute><MyResumes /></PrivateRoute>} />
      <Route path="/resume/:id" element={<PrivateRoute><ResumeDetail /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><JobListings /></PrivateRoute>} />
      <Route path="/tracker" element={<PrivateRoute><Tracker /></PrivateRoute>} />
      <Route path="/interview" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
      <Route path="/mock-interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />
      <Route path="/skills" element={<PrivateRoute><SkillGap /></PrivateRoute>} />
      <Route path="/linkedin" element={<PrivateRoute><LinkedInAnalyzer /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


