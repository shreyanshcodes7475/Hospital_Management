import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import BASE_URL from '../constants/BASE_URL'
import { INDIAN_CITIES } from '../constants/INDIAN_CITIES'

// Specializations list
const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Gynecologist',
  'Medicine',
  'Pediatrician',
  'Surgeon',
  'Orthopedist',
  'Neurologist',
  'Psychiatrist',
  'Oncologist',
  'Nephrologist',
  'Pulmonologist'
]

// Indian States list
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { userType, logout, user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // View Doctors state
  const [doctors, setDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [doctorsError, setDoctorsError] = useState('')
  const [doctorFilters, setDoctorFilters] = useState({
    specialization: '',
    location: '',
    email: ''
  })
  const [doctorPage, setDoctorPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0)

  // Add Doctor state
  const [addDoctorForm, setAddDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    fees: '',
    experience: '',
    specialization: '',
    degree: '',
    gender: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: ''
    }
  })
  const [addingDoctor, setAddingDoctor] = useState(false)
  const [addDoctorError, setAddDoctorError] = useState('')

  useEffect(() => {
    // Check if admin is logged in
    if (userType !== 'admin') {
      navigate('/admin-login')
      return
    }

    // Prevent back button
    const handlePopState = () => {
      navigate('/admin-dashboard')
    }
    window.addEventListener('popstate', handlePopState)
    
    // Push a new history state to prevent going back
    window.history.pushState(null, null, window.location.href)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [userType, navigate])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Fetch doctors when tab becomes active or filters change
    if (activeTab === 'view-doctors') {
      fetchDoctors(1)
    }
  }, [activeTab])

  useEffect(() => {
    // Fetch doctors when filters or page changes
    if (activeTab === 'view-doctors' && doctorPage > 0) {
      fetchDoctors(doctorPage)
    }
  }, [doctorFilters, doctorPage, activeTab])

  const fetchDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        navigate('/admin-login')
        return
      }

      const response = await fetch(`${BASE_URL}/admin/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to load dashboard')
        toast.error('Failed to load dashboard data')
        setLoading(false)
        return
      }

      setDashboardData(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load dashboard')
      toast.error('Error loading dashboard')
      setLoading(false)
    }
  }

  const fetchDoctors = async (page = 1) => {
    try {
      setDoctorsLoading(true)
      setDoctorsError('')
      
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setDoctorsError('Admin token not found. Please login again.')
        navigate('/admin-login')
        setDoctorsLoading(false)
        return
      }

      // Build query string with filters and pagination
      const queryParams = new URLSearchParams()
      if (doctorFilters.specialization) {
        queryParams.append('specialization', doctorFilters.specialization)
      }
      if (doctorFilters.location) {
        queryParams.append('location', doctorFilters.location)
      }
      if (doctorFilters.email) {
        queryParams.append('email', doctorFilters.email)
      }
      queryParams.append('page', page)

      const url = `${BASE_URL}/admin/doctors?${queryParams.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.message || `Failed to load doctors (Status: ${response.status})`
        setDoctorsError(errorMsg)
        toast.error(errorMsg)
        setDoctorsLoading(false)
        return
      }

      setDoctors(data.doctors || [])
      setTotalDoctorsCount(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setDoctorsLoading(false)
    } catch (err) {
      const errorMsg = `Error: ${err.message}`
      setDoctorsError(errorMsg)
      toast.error(errorMsg)
      setDoctorsLoading(false)
    }
  }

  const handleFilterChange = (filterName, value) => {
    setDoctorFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    setDoctorPage(1) // Reset to first page when filter changes
  }

  const clearFilters = () => {
    setDoctorFilters({
      specialization: '',
      location: '',
      email: ''
    })
    setDoctorPage(1)
  }

  const handleAddDoctorChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setAddDoctorForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else if (name === 'gender') {
      // Ensure gender is sent with proper capitalization
      const genderValue = value === '' ? '' : value
      setAddDoctorForm(prev => ({
        ...prev,
        [name]: genderValue
      }))
    } else {
      setAddDoctorForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateAddDoctorForm = () => {
    const required = ['name', 'email', 'password', 'confirmPassword', 'fees', 'experience', 'specialization', 'degree']
    
    for (let field of required) {
      if (!addDoctorForm[field]) {
        setAddDoctorError(`${field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        return false
      }
    }

    // Gender validation - must be one of the valid enum values
    const validGenders = ['Male', 'Female', 'Other', 'Not selected']
    if (!addDoctorForm.gender || !validGenders.includes(addDoctorForm.gender)) {
      setAddDoctorError('Please select a valid gender')
      return false
    }

    if (!addDoctorForm.address.city || !addDoctorForm.address.line1) {
      setAddDoctorError('Address (line1 and city) is required')
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(addDoctorForm.email)) {
      setAddDoctorError('Invalid email address')
      return false
    }

    // Password match validation
    if (addDoctorForm.password !== addDoctorForm.confirmPassword) {
      setAddDoctorError('Passwords do not match')
      return false
    }

    // Password length validation
    if (addDoctorForm.password.length < 6) {
      setAddDoctorError('Password must be at least 6 characters long')
      return false
    }

    // Fees and experience should be numbers
    if (isNaN(addDoctorForm.fees) || addDoctorForm.fees <= 0) {
      setAddDoctorError('Fees must be a positive number')
      return false
    }

    if (isNaN(addDoctorForm.experience) || addDoctorForm.experience < 0) {
      setAddDoctorError('Experience must be a non-negative number')
      return false
    }

    return true
  }

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault()
    setAddDoctorError('')

    if (!validateAddDoctorForm()) {
      return
    }

    try {
      setAddingDoctor(true)
      const adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        setAddDoctorError('Admin token not found. Please login again.')
        navigate('/admin-login')
        setAddingDoctor(false)
        return
      }

      const payload = {
        name: addDoctorForm.name,
        email: addDoctorForm.email,
        password: addDoctorForm.password,
        fees: parseInt(addDoctorForm.fees),
        experience: parseInt(addDoctorForm.experience),
        specialization: addDoctorForm.specialization,
        degree: addDoctorForm.degree,
        gender: addDoctorForm.gender.trim(),
        address: addDoctorForm.address
      }

      const response = await fetch(`${BASE_URL}/admin/add-doctor`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        setAddDoctorError(data.message || 'Failed to add doctor')
        toast.error(data.message || 'Failed to add doctor')
        setAddingDoctor(false)
        return
      }

      toast.success('Doctor added successfully!')
      
      // Reset form
      setAddDoctorForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        fees: '',
        experience: '',
        specialization: '',
        degree: '',
        gender: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: ''
        }
      })

      // Switch to view doctors tab and refresh
      setDoctorPage(1)
      setActiveTab('view-doctors')
      setAddingDoctor(false)
    } catch (err) {
      const errorMsg = `Error: ${err.message}`
      setAddDoctorError(errorMsg)
      toast.error(errorMsg)
      setAddingDoctor(false)
    }
  }

  const { 
    totalDoctors = 0, 
    totalAppointments = 0, 
    totalPatients = 0,
    cancelledAppointments = 0,
    completedAppointments = 0
  } = dashboardData || {}

  // Calculate appointment statistics
  const pendingAppointments = totalAppointments - cancelledAppointments - completedAppointments
  
  const completedPercentage = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0
  const cancelledPercentage = totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0
  const pendingPercentage = totalAppointments > 0 ? ((pendingAppointments / totalAppointments) * 100).toFixed(1) : 0

  // Calculate distribution percentages - handle division by zero
  const totalRecords = totalDoctors + totalPatients + totalAppointments
  const doctorPercentage = totalRecords > 0 ? ((totalDoctors / totalRecords) * 100).toFixed(1) : 0
  const appointmentPercentage = totalRecords > 0 ? ((totalAppointments / totalRecords) * 100).toFixed(1) : 0
  const patientPercentage = totalRecords > 0 ? ((totalPatients / totalRecords) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="flex">
        <div className="w-64 bg-gray-800 border-r border-purple-500/30 min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              DocLink
            </h2>
            <p className="text-gray-400 text-sm">Admin Portal</p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('add-doctor')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'add-doctor'
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              ➕ Add Doctor
            </button>
            <button
              onClick={() => setActiveTab('view-doctors')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'view-doctors'
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              👨‍⚕️ View Doctors
            </button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={async () => {
                await logout();
                navigate('/');
                toast.success('Logged out successfully');
              }}
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
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'add-doctor' && 'Add Doctor'}
              {activeTab === 'view-doctors' && 'View Doctors'}
            </h1>
            <p className="text-gray-400">Welcome back, {user?.name || 'Admin'}</p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-300 text-lg font-semibold">Loading Dashboard...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-400 text-xl font-semibold mb-4">{error}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && (
                <div className="space-y-8">
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Doctors Card */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/60 transition backdrop-blur">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-semibold text-lg">Total Doctors</h3>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👨‍⚕️</span>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-blue-300 mb-2">{totalDoctors}</div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${Math.min(totalDoctors * 20, 100)}%` }}></div>
                      </div>
                      <p className="text-gray-400 text-sm mt-3">Active medical professionals</p>
                    </div>

                    {/* Appointments Card */}
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition backdrop-blur">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-semibold text-lg">Total Appointments</h3>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📅</span>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-purple-300 mb-2">{totalAppointments}</div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min(totalAppointments * 10, 100)}%` }}></div>
                      </div>
                      <p className="text-gray-400 text-sm mt-3">Bookings in the system</p>
                    </div>

                    {/* Patients Card */}
                    <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 border border-green-500/30 rounded-2xl p-8 hover:border-green-500/60 transition backdrop-blur">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-semibold text-lg">Total Patients</h3>
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👥</span>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-green-300 mb-2">{totalPatients}</div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full" style={{ width: `${Math.min(totalPatients * 25, 100)}%` }}></div>
                      </div>
                      <p className="text-gray-400 text-sm mt-3">Registered users</p>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Distribution Chart */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur">
                      <h3 className="text-white font-semibold text-lg mb-6">System Distribution</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 text-sm">Doctors</span>
                            <span className="text-blue-300 font-semibold">{doctorPercentage}%</span>
                          </div>
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${doctorPercentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 text-sm">Appointments</span>
                            <span className="text-purple-300 font-semibold">{appointmentPercentage}%</span>
                          </div>
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${appointmentPercentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 text-sm">Patients</span>
                            <span className="text-green-300 font-semibold">{patientPercentage}%</span>
                          </div>
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${patientPercentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur">
                      <h3 className="text-white font-semibold text-lg mb-6">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <span className="text-gray-300">Avg Appointments/Doctor</span>
                          <span className="text-blue-300 font-bold text-lg">{totalDoctors > 0 ? (totalAppointments / totalDoctors).toFixed(1) : 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <span className="text-gray-300">Avg Appointments/Patient</span>
                          <span className="text-purple-300 font-bold text-lg">{totalPatients > 0 ? (totalAppointments / totalPatients).toFixed(1) : 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <span className="text-gray-300">Total Records</span>
                          <span className="text-green-300 font-bold text-lg">{totalDoctors + totalAppointments + totalPatients}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Status Breakdown */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur">
                      <h3 className="text-white font-semibold text-lg mb-6">Appointment Status</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-300 text-sm font-semibold flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>Completed</span>
                            </span>
                            <span className="text-green-400 font-bold">{completedPercentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-red-300 text-sm font-semibold flex items-center space-x-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span>Cancelled</span>
                            </span>
                            <span className="text-red-400 font-bold">{cancelledPercentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${cancelledPercentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-yellow-300 text-sm font-semibold flex items-center space-x-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <span>Pending</span>
                            </span>
                            <span className="text-yellow-400 font-bold">{pendingPercentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pendingPercentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Doctor Tab */}
          {activeTab === 'add-doctor' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur">
                <h3 className="text-white font-semibold text-lg mb-6">Register New Doctor</h3>

                {addDoctorError && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg">
                    {addDoctorError}
                  </div>
                )}

                <form onSubmit={handleAddDoctorSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={addDoctorForm.name}
                        onChange={handleAddDoctorChange}
                        placeholder="Dr. John Doe"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={addDoctorForm.email}
                        onChange={handleAddDoctorChange}
                        placeholder="doctor@example.com"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={addDoctorForm.password}
                        onChange={handleAddDoctorChange}
                        placeholder="Enter secure password"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={addDoctorForm.confirmPassword}
                        onChange={handleAddDoctorChange}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={addDoctorForm.gender}
                        onChange={handleAddDoctorChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Not selected">Not selected</option>
                      </select>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Specialization *
                      </label>
                      <select
                        name="specialization"
                        value={addDoctorForm.specialization}
                        onChange={handleAddDoctorChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Degree *
                      </label>
                      <input
                        type="text"
                        name="degree"
                        value={addDoctorForm.degree}
                        onChange={handleAddDoctorChange}
                        placeholder="e.g., MBBS, MD, BDS"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Experience (Years) *
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={addDoctorForm.experience}
                        onChange={handleAddDoctorChange}
                        placeholder="e.g., 5"
                        min="0"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Consultation Fees (₹) *
                      </label>
                      <input
                        type="number"
                        name="fees"
                        value={addDoctorForm.fees}
                        onChange={handleAddDoctorChange}
                        placeholder="e.g., 500"
                        min="1"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-white font-semibold mb-4">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          name="address.line1"
                          value={addDoctorForm.address.line1}
                          onChange={handleAddDoctorChange}
                          placeholder="e.g., 123 Main Street"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="address.line2"
                          value={addDoctorForm.address.line2}
                          onChange={handleAddDoctorChange}
                          placeholder="e.g., Apt 4B"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City *
                        </label>
                        <select
                          name="address.city"
                          value={addDoctorForm.address.city}
                          onChange={handleAddDoctorChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="">Select City</option>
                          {INDIAN_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State
                        </label>
                        <select
                          name="address.state"
                          value={addDoctorForm.address.state}
                          onChange={handleAddDoctorChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-6 border-t border-gray-700">
                    <button
                      type="submit"
                      disabled={addingDoctor}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                        addingDoctor
                          ? 'bg-purple-600/50 text-gray-300 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {addingDoctor ? 'Adding Doctor...' : 'Add Doctor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddDoctorForm({
                          name: '',
                          email: '',
                          password: '',
                          confirmPassword: '',
                          fees: '',
                          experience: '',
                          specialization: '',
                          degree: '',
                          gender: '',
                          address: {
                            line1: '',
                            line2: '',
                            city: '',
                            state: ''
                          }
                        })
                        setAddDoctorError('')
                      }}
                      className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Doctors Tab */}
          {activeTab === 'view-doctors' && (
            <div className="space-y-6">
              {/* Filters Section */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur">
                <h3 className="text-white font-semibold text-lg mb-4">Filter Doctors</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Specialization Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Specialization
                    </label>
                    <select
                      value={doctorFilters.specialization}
                      onChange={(e) => handleFilterChange('specialization', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Specializations</option>
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location (City)
                    </label>
                    <select
                      value={doctorFilters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Locations</option>
                      {INDIAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={doctorFilters.email}
                      onChange={(e) => handleFilterChange('email', e.target.value)}
                      placeholder="Search by email..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Doctors Count and Status */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-300 text-sm">Total Doctors Found</p>
                    <p className="text-3xl font-bold text-purple-300">{totalDoctorsCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">Page {doctorPage} of {totalPages}</p>
                    <p className="text-lg text-gray-400">
                      Showing {doctors.length} doctors
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctors Table/List */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur">
                {doctorsLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg font-semibold">Loading doctors...</p>
                  </div>
                )}

                {doctorsError && (
                  <div className="text-center py-12">
                    <p className="text-red-400 text-xl font-semibold mb-4">{doctorsError}</p>
                    <button
                      onClick={() => fetchDoctors(doctorPage)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!doctorsLoading && !doctorsError && doctors.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No doctors found. Try adjusting your filters.</p>
                  </div>
                )}

                {!doctorsLoading && !doctorsError && doctors.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Name</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Email</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Specialization</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Location</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Experience</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Fees</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doctor) => (
                          <tr
                            key={doctor._id}
                            className="border-b border-gray-700 hover:bg-gray-700/30 transition"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                {doctor.image && (
                                  <img
                                    src={doctor.image}
                                    alt={doctor.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="text-white font-medium">{doctor.name}</p>
                                  <p className="text-gray-400 text-sm">{doctor.gender}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-300">{doctor.email}</td>
                            <td className="px-4 py-4">
                              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-full text-sm">
                                {doctor.specialization}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-300">
                              {doctor.address?.city || 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-gray-300">
                              {doctor.experience} years
                            </td>
                            <td className="px-4 py-4 text-purple-300 font-semibold">
                              ₹{doctor.fees}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  doctor.available
                                    ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                                    : 'bg-red-500/20 border border-red-500/50 text-red-300'
                                }`}
                              >
                                {doctor.available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!doctorsLoading && !doctorsError && doctors.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setDoctorPage(prev => Math.max(1, prev - 1))}
                    disabled={doctorPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      doctorPage === 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setDoctorPage(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition ${
                          doctorPage === page
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setDoctorPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={doctorPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      doctorPage === totalPages
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
