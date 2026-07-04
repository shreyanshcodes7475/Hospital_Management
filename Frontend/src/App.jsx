import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import Doctors from './components/Doctors'
import { AuthProvider, useAuth } from './context/AuthContext'
import UserDashboard from './components/UserDashboard'
import DoctorLogin from './components/DoctorLogin'
import DoctorHome from './components/DoctorHome'
import DoctorDashboard from './components/DoctorDashboard'
import About from './components/About'
import Services from './components/Services'

function HashScrollHandler() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const sectionId = location.hash.replace('#', '')
    const el = document.getElementById(sectionId)

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.pathname, location.hash])

  return null
}

function AppContent() {
  useAuth()

  return (
    <BrowserRouter>
      <HashScrollHandler />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/services' element={<Services />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/dashboard' element={<UserDashboard />} />
        <Route path='/doctor-login' element={<DoctorLogin />} />
        <Route path='/doctor-home' element={<DoctorHome />} />
        <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          borderRadius: '8px',
          border: '1px solid rgba(20, 184, 166, 0.3)',
        }}
      />
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
