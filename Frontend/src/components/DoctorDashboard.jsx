import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import BASE_URL from '../constants/BASE_URL'
import { doctorService } from '../services/doctorService'
import ProfilePhotoModal from './ProfilePhotoModal'

export default function DoctorDashboard() {
  const { user, userType, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [editData, setEditData] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const itemsPerPage = 10

  // Appointment filters
  const [filterIsCompleted, setFilterIsCompleted] = useState('not-completed')
  const [filterCancelled, setFilterCancelled] = useState('not-cancelled')
  const [filterPhoneNumber, setFilterPhoneNumber] = useState('')

  useEffect(() => {
    // Give localStorage a moment to restore auth state
    const timer = setTimeout(() => {
      setAuthChecked(true)
      if (userType !== 'doctor') {
        navigate('/login?mode=doctor')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [userType, navigate])

  // Fetch profile on mount to get full doctor data including name for navbar
  useEffect(() => {
    if (userType === 'doctor' && authChecked) {
      fetchProfile()
    }
  }, [authChecked, userType])

  useEffect(() => {
    if (!authChecked) return

    if (userType === 'doctor') {
      fetchDashboardData()
    }
  }, [authChecked, activeTab])

  // Apply filters whenever they change
  useEffect(() => {
    if (activeTab === 'appointments' && authChecked) {
      fetchAppointments(1)
    }
  }, [filterIsCompleted, filterCancelled, filterPhoneNumber])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      if (activeTab === 'appointments') {
        await fetchAppointments(1)
      } else if (activeTab === 'profile') {
        await fetchProfile()
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
        isCompleted: filterIsCompleted === 'completed',
        cancelled: filterCancelled === 'cancelled',
        ...(filterPhoneNumber && { phoneNumber: filterPhoneNumber })
      })

      const response = await fetch(`${BASE_URL}/doctors/appointments?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        const doctorData = data.doctor || data
        setProfile(doctorData)
        // Update auth context with full doctor data so navbar shows the correct name
        setUser(doctorData)
        setEditData({
          name: doctorData?.name || '',
          gender: doctorData?.gender || '',
          address: doctorData?.address || { line1: '', line2: '', city: '', state: '' },
          fees: doctorData?.fees || '',
          about: doctorData?.about || '',
          dob: doctorData?.dob || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/appointments/${appointmentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(`Appointment ${status} successfully`)
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/appointments/${appointmentId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        toast.success('Appointment marked as completed')
        fetchAppointments()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to complete appointment')
      }
    } catch (error) {
      console.error('Error completing appointment:', error)
      toast.error('Failed to complete appointment')
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        toast.success('Appointment cancelled successfully')
        fetchAppointments()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/edit`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
        setShowProfileEdit(false)
        fetchProfile()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const handleUploadProfilePicture = async (file) => {
    try {
      setUploading(true)
      const response = await doctorService.uploadProfilePicture(file)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Update profile with new picture
        const updatedProfile = {
          ...profile,
          image: data.imageUrl || data.doctor?.image,
          iamge: data.imageUrl || data.doctor?.iamge,
        }
        setProfile(updatedProfile)
        setShowPhotoModal(false)
        toast.success('Profile picture updated successfully!')
      } else {
        toast.error(data.message || 'Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Error uploading profile picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    try {
      setUploading(true)
      const response = await doctorService.removeProfilePicture()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Update profile
        const updatedProfile = {
          ...profile,
          image: null,
          iamge: null,
        }
        setProfile(updatedProfile)
        setShowPhotoModal(false)
        toast.success('Profile picture removed successfully!')
      } else {
        toast.error(data.message || 'Failed to remove profile picture')
      }
    } catch (error) {
      console.error('Error removing profile picture:', error)
      toast.error('Error: ' + (error.message || 'Failed to remove profile picture'))
    } finally {
      setUploading(false)
    }
  }

  // Pagination
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage)
  }

  // Wait for auth to be checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not doctor
  if (userType !== 'doctor') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="flex">
        <div className="w-64 bg-gray-800 border-r border-teal-500/30 min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              DocLink
            </h2>
            <p className="text-gray-400 text-sm">Doctor Portal</p>
          </div>

          <div className="space-y-4 mb-8">
            {['appointments', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg capitalize font-medium transition ${
                  activeTab === tab
                    ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {tab === 'appointments' && '📅 '}
                {tab === 'profile' && '👤 '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {activeTab === 'appointments' && 'Appointments'}
              {activeTab === 'profile' && 'Profile Settings'}
            </h1>
            <p className="text-gray-400">Welcome back, {user?.name || 'Doctor'}</p>
          </div>

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {/* Filters */}
              <div className="mb-6 bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-teal-300">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Completion Status</label>
                    <select
                      value={filterIsCompleted}
                      onChange={(e) => {
                        setFilterIsCompleted(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full px-4 py-2 bg-gray-700 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="completed">Completed</option>
                      <option value="not-completed">Not Completed</option>
                    </select>
                  </div>

                  {/* Cancelled Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cancelled Status</label>
                    <select
                      value={filterCancelled}
                      onChange={(e) => {
                        setFilterCancelled(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full px-4 py-2 bg-gray-700 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="cancelled">Cancelled</option>
                      <option value="not-cancelled">Not Cancelled</option>
                    </select>
                  </div>

                  {/* Phone Number Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search by Phone</label>
                    <input
                      type="text"
                      placeholder="Enter patient phone number"
                      value={filterPhoneNumber}
                      onChange={(e) => setFilterPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-teal-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-xl p-12 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold mb-2">No Appointments Found</h3>
                  <p className="text-gray-400">No appointments match your filters.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                          {/* Patient Info */}
                          <div className="flex items-start gap-4 mb-4 md:mb-0 flex-1">
                            <img
                              src={appointment.userData?.image || 'https://media.istockphoto.com/id/1478688327/vector/user-symbol-account-symbol-vector.jpg?s=612x612&w=0&k=20&c=N1Wxw0XjkUoXT9_Vaxa4SNIj1IvdJ2L2GQfEVVMTaFM='}
                              alt="Patient"
                              className="w-16 h-16 rounded-full border-2 border-teal-500/30 object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-teal-300 mb-1">
                                {appointment.userData?.name || 'Patient'}
                              </h3>
                              <p className="text-gray-400 text-sm mb-1">
                                📧 {appointment.userData?.email || 'N/A'}
                              </p>
                              <p className="text-gray-400 text-sm mb-1">
                                📱 {appointment.userData?.phone || 'N/A'}
                              </p>
                              <p className="text-gray-400 text-sm mb-1">
                                📍 {appointment.userData?.address?.line1 || 'N/A'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                💰 ₹{appointment.amount || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="text-right">
                            <span
                              className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-2 ${
                                appointment.isCompleted
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : appointment.cancelled
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {appointment.isCompleted ? '✓ Completed' : appointment.cancelled ? '✕ Cancelled' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Date</p>
                            <p className="text-white font-semibold">
                              {new Date(appointment.slotDate).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Time</p>
                            <p className="text-white font-semibold">{appointment.slotTime}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Status</p>
                            <p className="text-white font-semibold">
                              {appointment.payment ? '💳 Paid' : '⏳ Pending'}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {!appointment.isCompleted && !appointment.cancelled && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => handleCompleteAppointment(appointment._id)}
                              className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-500/30 transition font-medium flex items-center justify-center gap-2"
                            >
                              <span>✓</span> Mark as Completed
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition font-medium flex items-center justify-center gap-2"
                            >
                              <span>✕</span> Cancel Appointment
                            </button>
                          </div>
                        )}

                        {appointment.isCompleted && (
                          <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm text-center font-medium">
                            ✓ This appointment has been completed
                          </div>
                        )}

                        {appointment.cancelled && (
                          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm text-center font-medium">
                            ✕ This appointment has been cancelled
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          fetchAppointments(currentPage - 1)
                        }
                      }}
                      disabled={currentPage === 1}
                      className="px-6 py-2 bg-gray-800 border border-teal-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-teal-400 transition"
                    >
                      ← Previous
                    </button>
                    <span className="text-gray-400">
                      Page <span className="text-teal-300 font-semibold">{currentPage}</span>
                    </span>
                    <button
                      onClick={() => fetchAppointments(currentPage + 1)}
                      className="px-6 py-2 bg-gray-800 border border-teal-500/30 rounded-lg hover:border-teal-400 transition"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              {loading ? (
                <div className="bg-gray-800/50 rounded-lg p-6 animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur border border-teal-500/30 rounded-xl p-8">
                  {!showProfileEdit ? (
                    <div>
                      {/* Profile Picture Section */}
                      <div className="mb-8 pb-8 border-b border-teal-500/20">
                        <div className="flex items-center gap-6">
                          {/* Clickable Profile Photo */}
                          <div
                            onClick={() => setShowPhotoModal(true)}
                            className="relative w-24 h-24 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-5xl border-2 border-teal-400 shadow-lg cursor-pointer hover:opacity-80 hover:border-cyan-300 transition-all group"
                          >
                            {profile?.iamge || profile?.image ? (
                              <img
                                src={profile?.iamge || profile?.image}
                                alt="Profile"
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              '👨‍⚕️'
                            )}

                            {/* Hover overlay with camera icon */}
                            <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-2xl">📷</span>
                            </div>
                          </div>

                          <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{profile?.name || 'N/A'}</h2>
                            <p className="text-teal-400 text-lg font-medium">{profile?.specialization || 'Medical Professional'}</p>
                            <p className="text-gray-400 text-sm mt-2">Experience: {profile?.experience || 0} years</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Information */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-6 text-teal-300">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Email</label>
                            <p className="text-white text-lg">{profile?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                            <p className="text-white text-lg">{profile?.gender || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Date of Birth</label>
                            <p className="text-white text-lg">
                              {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                            <p className="text-white text-lg">{profile?.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-6 text-teal-300">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Address Line 1</label>
                            <p className="text-white text-lg">{profile?.address?.line1 || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Address Line 2</label>
                            <p className="text-white text-lg">{profile?.address?.line2 || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">City</label>
                            <p className="text-white text-lg">{profile?.address?.city || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">State</label>
                            <p className="text-white text-lg">{profile?.address?.state || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-6 text-teal-300">Professional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Consultation Fees</label>
                            <p className="text-white text-lg">₹{profile?.fees || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm mb-2 block">Total Earnings</label>
                            <p className="text-white text-lg">₹{profile?.earning || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* About Section */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-teal-300">About</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/30 p-4 rounded-lg">
                          {profile?.about || 'No information provided'}
                        </p>
                      </div>

                      <button
                        onClick={() => setShowProfileEdit(true)}
                        className="px-6 py-3 bg-teal-500/20 border border-teal-500/50 text-teal-300 rounded-lg hover:bg-teal-500/30 transition font-medium"
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-semibold mb-8">Edit Profile</h2>
                      
                      <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-medium">Name *</label>
                          <input
                            type="text"
                            value={editData?.name || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                          />
                        </div>

                        {/* Gender Field */}
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-medium">Gender</label>
                          <select
                            value={editData?.gender || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, gender: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Date of Birth Field */}
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-medium">Date of Birth</label>
                          <input
                            type="date"
                            value={
                              editData?.dob
                                ? editData.dob.split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              setEditData({ ...editData, dob: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                          />
                        </div>

                        {/* Address Fields */}
                        <div className="border-t border-teal-500/20 pt-6">
                          <h3 className="text-lg font-semibold mb-4 text-teal-300">Address</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-medium">Address Line 1</label>
                              <input
                                type="text"
                                value={editData?.address?.line1 || ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    address: { ...editData.address, line1: e.target.value },
                                  })
                                }
                                placeholder="Street address"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-medium">Address Line 2</label>
                              <input
                                type="text"
                                value={editData?.address?.line2 || ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    address: { ...editData.address, line2: e.target.value },
                                  })
                                }
                                placeholder="Apartment, suite, etc."
                                className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gray-300 text-sm mb-2 font-medium">City</label>
                                <input
                                  type="text"
                                  value={editData?.address?.city || ''}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      address: { ...editData.address, city: e.target.value },
                                    })
                                  }
                                  placeholder="City"
                                  className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-300 text-sm mb-2 font-medium">State</label>
                                <input
                                  type="text"
                                  value={editData?.address?.state || ''}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      address: { ...editData.address, state: e.target.value },
                                    })
                                  }
                                  placeholder="State"
                                  className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Professional Fields */}
                        <div className="border-t border-teal-500/20 pt-6">
                          <h3 className="text-lg font-semibold mb-4 text-teal-300">Professional Details</h3>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-medium">Consultation Fees (₹)</label>
                            <input
                              type="number"
                              value={editData?.fees || ''}
                              onChange={(e) =>
                                setEditData({ ...editData, fees: e.target.value })
                              }
                              placeholder="Enter consultation fees"
                              className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                            />
                          </div>
                        </div>

                        {/* About Field */}
                        <div className="border-t border-teal-500/20 pt-6">
                          <label className="block text-gray-300 text-sm mb-2 font-medium">About</label>
                          <textarea
                            value={editData?.about || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, about: e.target.value })
                            }
                            placeholder="Write a brief description about yourself, your experience, and specializations"
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-teal-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition resize-none"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex gap-3">
                        <button
                          onClick={handleProfileUpdate}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setShowProfileEdit(false)}
                          className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Photo Modal */}
      {showPhotoModal && (
        <ProfilePhotoModal
          currentImage={profile?.iamge || profile?.image}
          userName={profile?.name || 'Doctor'}
          uploading={uploading}
          onUpload={handleUploadProfilePicture}
          onRemove={handleRemoveProfilePicture}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </div>
  )
}
