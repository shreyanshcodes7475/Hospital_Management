import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, userType, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Dummy data
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Rajesh Kumar',
      specialty: 'Cardiologist',
      date: '2026-04-15',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      id: 2,
      doctorName: 'Dr. Priya Singh',
      specialty: 'Neurologist',
      date: '2026-04-18',
      time: '02:00 PM',
      status: 'Confirmed',
    },
  ]

  const medicalRecords = [
    { id: 1, type: 'Blood Test', date: '2026-03-20', result: 'Normal' },
    { id: 2, type: 'X-Ray', date: '2026-03-10', result: 'Clear' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-teal-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h2>
            <p className="text-gray-400 text-sm capitalize">{userType} Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'appointments'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'records'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Medical Records
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 border border-teal-500/30 rounded-xl p-6 hover:border-teal-400 transition-all">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center text-2xl mb-4">
                  📅
                </div>
                <p className="text-gray-400 mb-2">Appointments</p>
                <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-2xl mb-4">
                  📋
                </div>
                <p className="text-gray-400 mb-2">Medical Records</p>
                <p className="text-3xl font-bold">{medicalRecords.length}</p>
              </div>

              <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 border border-teal-500/30 rounded-xl p-6 hover:border-teal-400 transition-all">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center text-2xl mb-4">
                  ✅
                </div>
                <p className="text-gray-400 mb-2">Completed</p>
                <p className="text-3xl font-bold">8</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-2xl mb-4">
                  ⏳
                </div>
                <p className="text-gray-400 mb-2">Pending</p>
                <p className="text-3xl font-bold">2</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 border border-teal-500/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105">
                  Book Appointment
                </button>
                <button className="px-6 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all border border-gray-600">
                  View Records
                </button>
                <button className="px-6 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all border border-gray-600">
                  Contact Doctor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Upcoming Appointments</h3>
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="bg-gray-800/50 border border-teal-500/30 rounded-xl p-6 hover:border-teal-400 transition-all">
                <div className="flex justify-between items-start md:items-center md:flex-row flex-col gap-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-teal-300 mb-2">{apt.doctorName}</h4>
                    <p className="text-gray-400 mb-2">{apt.specialty}</p>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>📅 {apt.date}</span>
                      <span>🕐 {apt.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg text-sm font-semibold">
                      {apt.status}
                    </span>
                    <button className="px-4 py-2 bg-teal-500/20 border border-teal-500/50 text-teal-300 rounded-lg text-sm hover:bg-teal-500/30 transition-all">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Medical Records</h3>
            <div className="grid grid-cols-1 gap-4">
              {medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-gray-800/50 border border-teal-500/30 rounded-xl p-6 hover:border-teal-400 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-teal-300 mb-2">{record.type}</h4>
                      <p className="text-gray-400">📅 {record.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg text-sm font-semibold mb-3">
                        {record.result}
                      </span>
                      <br />
                      <button className="text-teal-400 hover:text-teal-300 font-semibold">Download</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-gray-800/50 border border-teal-500/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-8">Profile Information</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-700">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">{user?.name || 'User'}</h4>
                    <p className="text-gray-400 capitalize">{userType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-teal-500 transition-all"
                  ></textarea>
                </div>

                <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}