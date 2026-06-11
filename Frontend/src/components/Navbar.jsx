import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, logout, userType } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const handleDashboard = () => {
    navigate(userType === 'doctor' ? '/doctor-dashboard' : '/dashboard')
    setIsProfileDropdownOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-gray-900 border-b border-teal-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-teal-500 p-2 rounded-lg transform group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white hidden sm:inline">DocLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-teal-200 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-teal-200 transition-colors font-medium"
            >
              About
            </Link>
            <a
              href="#services"
              className="text-white hover:text-teal-200 transition-colors font-medium"
            >
              Services
            </a>
            <a
              href="#contact"
              className="text-white hover:text-teal-200 transition-colors font-medium"
            >
              Contact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user || userType ? (
              <button
                onClick={handleDashboard}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">
                    {(user?.name || userType || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium text-sm">
                  {user?.name || userType || 'User'}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-teal-500/20 border border-teal-500/50 text-teal-300 font-semibold rounded-lg hover:bg-teal-500/30 transition-colors"
              >
                Login/SignUp
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-teal-200 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 space-y-4 animate-in fade-in duration-200">
            <Link
              to="/"
              className="block text-white hover:text-teal-200 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-white hover:text-teal-200 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <a
              href="#services"
              className="block text-white hover:text-teal-200 transition-colors font-medium"
            >
              Services
            </a>
            <a
              href="#contact"
              className="block text-white hover:text-teal-200 transition-colors font-medium"
            >
              Contact
            </a>

            <div className="pt-4 space-y-3 border-t border-teal-500/30">
              {user || userType ? (
                <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-lg border border-teal-500/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      {(user?.name || userType || 'User').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {user?.name || userType || 'User'}
                  </span>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-center px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login/SignUp
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
