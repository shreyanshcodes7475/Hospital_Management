import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const handleDashboard = () => {
    navigate('/dashboard')
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
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                >
                  <img
                    src={user.iamge || user.image || "https://media.istockphoto.com/id/1478688327/vector/user-symbol-account-symbol-vector.jpg?s=612x612&w=0&k=20&c=N1Wxw0XjkUoXT9_Vaxa4SNIj1IvdJ2L2GQfEVVMTaFM="}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-white font-medium">
                    {user.name || 'User'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white transition-transform duration-300 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-teal-500/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-teal-500/20">
                      <p className="text-white font-semibold text-sm">{user.name || 'User'}</p>
                      <p className="text-teal-300 text-xs">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleDashboard}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-teal-300 transition-colors flex items-center space-x-3 group"
                      >
                        <svg
                          className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4m0-11l-7-4-7 4"
                          />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center space-x-3 group"
                      >
                        <svg
                          className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-white font-semibold hover:text-blue-100 transition-colors"
                >
                  Login/SignUp
                </Link>

              </>
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
              {user ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className="w-full px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4m0-11l-7-4-7 4"
                      />
                    </svg>
                    <span>Dashboard</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-center px-6 py-2 text-white font-semibold border-2 border-teal-500 rounded-lg hover:bg-teal-600/20 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
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
