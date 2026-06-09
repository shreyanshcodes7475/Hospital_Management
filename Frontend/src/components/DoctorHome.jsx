import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import BASE_URL from '../constants/BASE_URL'

export default function DoctorHome() {
  const navigate = useNavigate()
  const { user, userType } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    completedAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userType !== 'doctor') {
      navigate('/doctor-login')
      return
    }
    fetchDoctorStats()
  }, [userType, navigate])

  const fetchDoctorStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/doctors/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: '📅',
      title: 'Appointments',
      description: 'View and manage appointments',
      link: '/doctor-dashboard',
    },
    {
      icon: '👥',
      title: 'My Patients',
      description: 'View patient list and records',
      link: '/doctor-dashboard',
    },
    {
      icon: '📋',
      title: 'Prescriptions',
      description: 'Create and manage prescriptions',
      link: '/doctor-dashboard',
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Update profile and preferences',
      link: '/doctor-dashboard',
    },
  ]

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-cyan-600/5 to-transparent pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {user?.name || 'Doctor'}!
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Manage your appointments, patients, and medical records all in one place.
              </p>
              <Link
                to="/doctor-dashboard"
                className="inline-block px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition"
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-3xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <h2 className="text-2xl font-bold mb-2">{user?.name || 'Doctor'}</h2>
                  <p className="text-gray-400 mb-4">{user?.specialization || 'Medical Professional'}</p>
                  {user?.licenseNumber && (
                    <p className="text-sm text-teal-400">License: {user.licenseNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Your Statistics</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 transition">
                <div className="text-gray-400 text-sm mb-2">Total Appointments</div>
                <div className="text-4xl font-bold text-teal-400">{stats.totalAppointments}</div>
                <div className="text-gray-500 text-xs mt-2">All time</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition">
                <div className="text-gray-400 text-sm mb-2">Today's Appointments</div>
                <div className="text-4xl font-bold text-cyan-400">{stats.todayAppointments}</div>
                <div className="text-gray-500 text-xs mt-2">Scheduled</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition">
                <div className="text-gray-400 text-sm mb-2">Total Patients</div>
                <div className="text-4xl font-bold text-emerald-400">{stats.totalPatients}</div>
                <div className="text-gray-500 text-xs mt-2">Active</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-amber-500/30 rounded-xl p-6 hover:border-amber-400/50 transition">
                <div className="text-gray-400 text-sm mb-2">Completed</div>
                <div className="text-4xl font-bold text-amber-400">{stats.completedAppointments}</div>
                <div className="text-gray-500 text-xs mt-2">Sessions</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 hover:bg-gray-800/70 transition group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{action.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm">{action.description}</p>
                <div className="mt-4 text-teal-400 text-sm font-medium flex items-center">
                  Learn more
                  <span className="ml-2 group-hover:translate-x-1 transition">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Manage Your Practice Efficiently</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-teal-400 mr-3">✓</span>
                  <span className="text-gray-300">Schedule and manage patient appointments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-3">✓</span>
                  <span className="text-gray-300">Maintain comprehensive patient records</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-3">✓</span>
                  <span className="text-gray-300">Create and manage prescriptions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-3">✓</span>
                  <span className="text-gray-300">Track patient medical history</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">⏰</div>
                <h3 className="text-xl font-bold mb-2">Save Time</h3>
                <p className="text-gray-400">
                  Automate scheduling and administrative tasks so you can focus on patient care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
