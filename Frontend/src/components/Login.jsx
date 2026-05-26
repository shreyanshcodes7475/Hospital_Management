import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BASE_URL from '../constants/BASE_URL'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userType, setUserType] = useState('patient')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUserTypeChange = (type) => {
    setUserType(type)
    setFormData({ email: '', password: '' })
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/users/google-login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: credentialResponse.credential }),
      })
      const data = await response.json()
      console.log('Google login response:', data);
      
      if(!response.ok) {
        setError(data.message || 'Google login failed')
        setLoading(false)
        return
      }
      
      login(data.user, userType)
      navigate('/home')
    } catch (err) {
      console.error('Google login error:', err)
      setError('Google login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
        const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      login(data.user, userType)
      navigate('/home')
    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-cyan-600/10 to-gray-900 pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-4">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">DocLink</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-8 bg-gray-700/50 p-1 rounded-lg border border-gray-600">
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                userType === 'patient'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 bg-transparent'
              }`}
              onClick={() => handleUserTypeChange('patient')}
            >
              Patient
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                userType === 'doctor'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 bg-transparent'
              }`}
              onClick={() => handleUserTypeChange('doctor')}
            >
              Doctor
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:bg-gray-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:bg-gray-700 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Google Login - Only for Patients */}
          {userType === 'patient' && (
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Google login failed')}
                text="signin_with"
              />
            </div>
          )}

          {/* Footer Links */}
          <div className="space-y-3 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                Sign up here
              </Link>
            </p>
            <a href="#" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  )
}
