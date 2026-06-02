import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Doctors from './components/Doctors'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './components/Dashboard'
import UserDashboard from './components/UserDashboard'
import BASE_URL from './constants/BASE_URL'

function AppContent() {
  const { setUser } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/auth`, {
          method: 'GET',
          credentials: 'include'
        })
        const data = await response.json()
        if (data.authenticated) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.log('Auth check error:', err)
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/dashboard' element={<UserDashboard />} />
        <Route path='/admin-dashboard/*' element={<Dashboard />} />
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
