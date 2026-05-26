import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Doctors from './components/Doctors'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './components/Dashboard'
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
        <Route path='/dashboard/*' element={<Dashboard />} />
      </Routes>
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
