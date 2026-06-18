import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LocationSelector from './LocationSelector'
import BASE_URL from '../constants/BASE_URL'

// Generate time slots from 9:00 AM to 5:00 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minutes of [0, 30]) {
      if (hour === 17 && minutes === 30) break // Stop after 5:00 PM
      const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

const TimeSlots = generateTimeSlots()

export default function Doctors() {
  const location = useLocation()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
  })
  const [selectedLocation, setSelectedLocation] = useState('')
  const [expandedDoctorId, setExpandedDoctorId] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slotAvailability, setSlotAvailability] = useState({})
  const [checkingAvailability, setCheckingAvailability] = useState({})
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Get data from navigation state or sessionStorage
    if (location.state?.doctors) {
      // Handle both { doctors: [...] } and [...] formats
      const doctorsList = location.state.doctors.doctors || location.state.doctors
      setDoctors(Array.isArray(doctorsList) ? doctorsList : [])
      const newFilters = location.state.filters
      setFilters(newFilters)
      setSelectedLocation(newFilters?.location || '')
    } else {
      const storedResults = sessionStorage.getItem('doctorSearchResults')
      const storedFilters = sessionStorage.getItem('searchFilters')
      
      if (storedResults && storedFilters) {
        const parsed = JSON.parse(storedResults)
        // Handle both { doctors: [...] } and [...] formats
        const doctorsList = parsed.doctors || parsed
        setDoctors(Array.isArray(doctorsList) ? doctorsList : [])
        const newFilters = JSON.parse(storedFilters)
        setFilters(newFilters)
        setSelectedLocation(newFilters?.location || '')
      } else {
        navigate('/')
      }
    }
  }, [location, navigate])

  const handleLocationChange = async (newLocation) => {
    setSelectedLocation(newLocation)
    sessionStorage.setItem('userLocation', newLocation)
    
    // Refresh doctor search with new location
    setIsSearching(true)
    try {
      const url = `${BASE_URL}/users/doctors?specialization=${encodeURIComponent(filters.specialization)}&location=${encodeURIComponent(newLocation)}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status}`)
      }

      const data = await response.json()
      
      // Update doctors and filters
      const doctorsList = data.doctors || data
      setDoctors(Array.isArray(doctorsList) ? doctorsList : [])
      
      const newFilters = {
        ...filters,
        location: newLocation,
      }
      setFilters(newFilters)
      
      // Store in sessionStorage
      sessionStorage.setItem('doctorSearchResults', JSON.stringify(data))
      sessionStorage.setItem('searchFilters', JSON.stringify(newFilters))
      
      // Clear previous selections
      setSlotAvailability({})
      setSelectedDate('')
      setSelectedTime('')
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Error fetching doctors. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleNewSearch = () => {
    sessionStorage.removeItem('doctorSearchResults')
    sessionStorage.removeItem('searchFilters')
    navigate('/')
  }

  const getMinDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const checkSlotAvailability = async (doctor, date, time) => {
    const key = `${doctor._id}-${date}-${time}`
    setCheckingAvailability(prev => ({ ...prev, [key]: true }))

    try {
      const response = await fetch(`${BASE_URL}/users/check-slot-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          docId: doctor._id,
          slotDate: date,
          slotTime: time,
        }),
      })

      const data = await response.json()
      // Check if available is explicitly true (don't rely on success)
      const isAvailable = data.available === true
      setSlotAvailability(prev => ({
        ...prev,
        [key]: isAvailable,
      }))
    } catch (error) {
      console.error('Error checking availability:', error)
      setSlotAvailability(prev => ({
        ...prev,
        [key]: false,
      }))
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleTimeSelect = (doctor, date, time) => {
    setSelectedTime(time)
    // Always check availability when a time is selected
    checkSlotAvailability(doctor, date, time)
  }

  const [bookingInProgress, setBookingInProgress] = useState(false)

  const isSlotAvailable = (docId, date, time) => {
    const key = `${docId}-${date}-${time}`
    return slotAvailability[key] === true
  }

  const isSlotChecking = (docId, date, time) => {
    const key = `${docId}-${date}-${time}`
    return checkingAvailability[key] === true
  }

  const handleBookAppointment = async (doctor) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time')
      return
    }

    const key = `${doctor._id}-${selectedDate}-${selectedTime}`
    if (!slotAvailability[key]) {
      toast.error('Selected slot is not available')
      return
    }

    setBookingInProgress(true)
    try {
      const response = await fetch(`${BASE_URL}/users/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          docId: doctor._id,
          slotDate: selectedDate,
          slotTime: selectedTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment')
      }

      // Success - show confirmation and navigate
      toast.success('Appointment booked successfully!')
      
      sessionStorage.setItem('selectedDoctor', JSON.stringify(doctor))
      sessionStorage.setItem('appointmentDetails', JSON.stringify({
        doctorId: doctor._id,
        date: selectedDate,
        time: selectedTime,
        docName: doctor.name,
        specialization: doctor.specialization,
        fees: doctor.fees,
      }))
      
      // Navigate to appointments tab on dashboard
      navigate('/dashboard?tab=appointments')
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setBookingInProgress(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-teal-500/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Available Doctors</h1>
              <p className="text-gray-400">
                {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={handleNewSearch}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors"
            >
              New Search
            </button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {filters.specialization && (
              <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/50 rounded-full px-4 py-2">
                <span className="text-sm text-teal-300">Specialization:</span>
                <span className="font-semibold">{filters.specialization}</span>
              </div>
            )}
            {filters.location && (
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full px-4 py-2">
                <span className="text-sm text-cyan-300">Location:</span>
                <span className="font-semibold">{filters.location}</span>
              </div>
            )}
          </div>

          {/* Location Selector */}
          <div className="bg-gray-700/30 border border-teal-500/20 rounded-lg p-4 mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">📍 Change Location</label>
            <div className="flex gap-3 items-end">
              <div className="flex-1 max-w-xs">
                <LocationSelector 
                  onLocationSelect={handleLocationChange}
                  currentLocation={selectedLocation}
                  placeholder="Select a different location..."
                />
              </div>
              {isSearching && (
                <div className="flex items-center gap-2 text-teal-300">
                  <div className="animate-spin">⟳</div>
                  <span className="text-sm">Searching...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {doctors.length > 0 ? (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-gradient-to-br from-gray-800 to-gray-800 border border-teal-500/30 rounded-xl overflow-hidden hover:border-teal-400 transition-all shadow-lg"
              >
                {/* Doctor Info Card */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Profile Info */}
                    <div className="flex-1">
                      <div className="flex gap-4 mb-4">
                        <img
                          src={doctor.image || "https://media.istockphoto.com/id/1478688327/vector/user-symbol-account-symbol-vector.jpg?s=612x612&w=0&k=20&c=N1Wxw0XjkUoXT9_Vaxa4SNIj1IvdJ2L2GQfEVVMTaFM="}
                          alt={doctor.name}
                          className="w-24 h-24 rounded-full object-cover border-3 border-teal-400"
                        />
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{doctor.name}</h3>
                          <p className="text-teal-400 font-semibold text-lg mb-3">{doctor.specialization}</p>
                          <div className="flex gap-4 text-sm text-gray-300">
                            <span className="flex items-center gap-1">
                              <span>🎓</span> {doctor.degree}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>📅</span> {doctor.experience} years exp
                            </span>
                            <span className="flex items-center gap-1">
                              <span>💰</span> ₹{doctor.fees}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {doctor.address && (
                        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300">
                          <p className="font-semibold text-teal-300 mb-1">📍 Location</p>
                          <p>
                            {doctor.address.line1}
                            {doctor.address.line2 && `, ${doctor.address.line2}`}
                          </p>
                          <p>
                            {doctor.address.city}, {doctor.address.state}
                          </p>
                        </div>
                      )}

                      {/* About */}
                      {doctor.about && (
                        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                          <p className="font-semibold text-teal-300 mb-2 text-sm">ℹ️ About</p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {doctor.about}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Appointment Selector (Always Visible) */}
                    <div className="lg:w-80 flex flex-col gap-4">
                      {/* Date Picker */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Select Date
                        </label>
                        <input
                          type="date"
                          min={getMinDate()}
                          max={getMaxDate()}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value)
                            setSelectedTime('')
                            setSlotAvailability({})
                          }}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors"
                        />
                      </div>

                      {/* Time Slots */}
                      {selectedDate && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Select Time
                          </label>
                          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {TimeSlots.map((time) => {
                              const isAvailable = isSlotAvailable(doctor._id, selectedDate, time)
                              const isChecking = isSlotChecking(doctor._id, selectedDate, time)
                              const isSelected = selectedTime === time
                              const hasChecked = slotAvailability.hasOwnProperty(`${doctor._id}-${selectedDate}-${time}`)

                              return (
                                <button
                                  key={time}
                                  onMouseEnter={() => {
                                    // Check availability on hover if not already checked
                                    if (!hasChecked && !isChecking) {
                                      checkSlotAvailability(doctor, selectedDate, time)
                                    }
                                  }}
                                  onClick={() => handleTimeSelect(doctor, selectedDate, time)}
                                  disabled={isChecking || (hasChecked && !isAvailable)}
                                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    isChecking
                                      ? 'bg-blue-600/50 text-blue-300 cursor-wait opacity-70 border border-blue-400/50'
                                      : hasChecked && !isAvailable
                                      ? 'bg-red-600/30 text-red-300 cursor-not-allowed border border-red-500/30'
                                      : isSelected && isAvailable
                                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-2 border-teal-300'
                                      : isAvailable
                                      ? 'bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 border border-teal-500/50 cursor-pointer'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  {isChecking ? (
                                    <span className="inline-block animate-spin">⟳</span>
                                  ) : (
                                    time
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Availability Status */}
                      {selectedDate && selectedTime && (
                        <div className={`p-3 rounded-lg text-sm font-semibold text-center ${
                          isSlotChecking(doctor._id, selectedDate, selectedTime)
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                            : isSlotAvailable(doctor._id, selectedDate, selectedTime)
                            ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                            : 'bg-red-600/20 text-red-300 border border-red-500/30'
                        }`}>
                          {isSlotChecking(doctor._id, selectedDate, selectedTime)
                            ? '⟳ Checking availability...'
                            : isSlotAvailable(doctor._id, selectedDate, selectedTime)
                            ? '✓ Slot Available'
                            : '✗ Slot Not Available'}
                        </div>
                      )}

                      {/* Book Button */}
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        disabled={
                          !selectedDate ||
                          !selectedTime ||
                          isSlotChecking(doctor._id, selectedDate, selectedTime) ||
                          !isSlotAvailable(doctor._id, selectedDate, selectedTime) ||
                          bookingInProgress
                        }
                        className={`w-full px-4 py-3 font-bold rounded-lg transition-all transform ${
                          selectedDate &&
                          selectedTime &&
                          !isSlotChecking(doctor._id, selectedDate, selectedTime) &&
                          isSlotAvailable(doctor._id, selectedDate, selectedTime) &&
                          !bookingInProgress
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 hover:scale-105 shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {bookingInProgress ? (
                          <>
                            <span className="inline-block animate-spin mr-2">⟳</span>
                            Booking...
                          </>
                        ) : isSlotChecking(doctor._id, selectedDate, selectedTime)
                          ? '⟳ Checking Availability...'
                          : selectedDate && selectedTime && isSlotAvailable(doctor._id, selectedDate, selectedTime)
                          ? 'Book Appointment'
                          : selectedDate && selectedTime && !isSlotAvailable(doctor._id, selectedDate, selectedTime)
                          ? '✗ Slot Not Available'
                          : 'Select Date & Time'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No Doctors Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We couldn't find any doctors matching your search criteria. Try a different location or specialty.
            </p>
            <button
              onClick={handleNewSearch}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
