import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BASE_URL from '../constants/BASE_URL'

const TimeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export default function Doctors() {
  const location = useLocation()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
  })
  const [expandedDoctorId, setExpandedDoctorId] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slotAvailability, setSlotAvailability] = useState({})
  const [checkingAvailability, setCheckingAvailability] = useState({})

  useEffect(() => {
    // Get data from navigation state or sessionStorage
    if (location.state?.doctors) {
      // Handle both { doctors: [...] } and [...] formats
      const doctorsList = location.state.doctors.doctors || location.state.doctors
      setDoctors(Array.isArray(doctorsList) ? doctorsList : [])
      setFilters(location.state.filters)
    } else {
      const storedResults = sessionStorage.getItem('doctorSearchResults')
      const storedFilters = sessionStorage.getItem('searchFilters')
      
      if (storedResults && storedFilters) {
        const parsed = JSON.parse(storedResults)
        // Handle both { doctors: [...] } and [...] formats
        const doctorsList = parsed.doctors || parsed
        setDoctors(Array.isArray(doctorsList) ? doctorsList : [])
        setFilters(JSON.parse(storedFilters))
      } else {
        navigate('/')
      }
    }
  }, [location, navigate])

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
      setSlotAvailability(prev => ({
        ...prev,
        [key]: data.available || data.isAvailable || data.success,
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
    checkSlotAvailability(doctor, date, time)
  }

  const isSlotAvailable = (docId, date, time) => {
    const key = `${docId}-${date}-${time}`
    return slotAvailability[key]
  }

  const handleBookAppointment = (doctor) => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time')
      return
    }

    const key = `${doctor._id}-${selectedDate}-${selectedTime}`
    if (!slotAvailability[key]) {
      alert('Selected slot is not available')
      return
    }

    sessionStorage.setItem('selectedDoctor', JSON.stringify(doctor))
    sessionStorage.setItem('appointmentDetails', JSON.stringify({
      doctorId: doctor._id,
      date: selectedDate,
      time: selectedTime,
      docName: doctor.name,
      specialization: doctor.specialization,
      fees: doctor.fees,
    }))
    navigate('/book-appointment')
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
          <div className="flex flex-wrap gap-3">
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
                              const isChecking = checkingAvailability[`${doctor._id}-${selectedDate}-${time}`]
                              const isSelected = selectedTime === time

                              return (
                                <button
                                  key={time}
                                  onClick={() => handleTimeSelect(doctor, selectedDate, time)}
                                  disabled={isChecking}
                                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    isChecking
                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                      : isAvailable === undefined
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : isAvailable === false
                                      ? 'bg-red-600/30 text-red-300 cursor-not-allowed border border-red-500/30'
                                      : isSelected
                                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-2 border-teal-300'
                                      : 'bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 border border-teal-500/50'
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
                          slotAvailability[`${doctor._id}-${selectedDate}-${selectedTime}`]
                            ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                            : 'bg-red-600/20 text-red-300 border border-red-500/30'
                        }`}>
                          {checkingAvailability[`${doctor._id}-${selectedDate}-${selectedTime}`]
                            ? '⟳ Checking availability...'
                            : slotAvailability[`${doctor._id}-${selectedDate}-${selectedTime}`]
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
                          !slotAvailability[`${doctor._id}-${selectedDate}-${selectedTime}`]
                        }
                        className={`w-full px-4 py-3 font-bold rounded-lg transition-all transform ${
                          selectedDate &&
                          selectedTime &&
                          slotAvailability[`${doctor._id}-${selectedDate}-${selectedTime}`]
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 hover:scale-105 shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {selectedDate && selectedTime && slotAvailability[`${doctor._id}-${selectedDate}-${selectedTime}`]
                          ? 'Book Appointment'
                          : selectedDate && selectedTime
                          ? 'Checking...'
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
