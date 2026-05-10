// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import { AuthProvider } from './context/AuthContext'
// import App from './App'
// import './styles/global.css'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </StrictMode>
// )

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles/global.css'

// Apply saved dark mode before render
const savedTheme = localStorage.getItem('resumeiq-theme')
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.body.style.backgroundColor = '#0F172A'
  document.body.style.color = '#E2E8F0'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)