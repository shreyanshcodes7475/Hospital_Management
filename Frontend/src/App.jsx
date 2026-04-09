import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Login from './components/Login'
import Signup from './components/Signup'

function App() {

  return(
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<div>About</div>} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
