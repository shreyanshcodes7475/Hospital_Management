import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import { AuthProvider } from './context/AuthContext'

function App() {

  return(
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Login />} />  
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
