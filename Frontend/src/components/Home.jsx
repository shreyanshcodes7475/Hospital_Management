import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import LocationSelector from './LocationSelector'
import BASE_URL from '../constants/BASE_URL'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const specialtyRef = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load location from sessionStorage if available
    const hasLocation = sessionStorage.getItem('userLocation')
    if (hasLocation) {
      setSelectedLocation(hasLocation)
    }
  }, [])

  const specialties = [
    { name: 'Cardiologist', icon: '❤️' },
    { name: 'Neurologist', icon: '🧠' },
    { name: 'Orthopedist', icon: '🦴' },
    { name: 'Dermatologist', icon: '🏥' },
    { name: 'Pediatrian', icon: '👨‍⚕️' },
    { name: 'Gynecologist ', icon: '👩‍⚕️' },
    { name: 'Medicine', icon: '💊' },
  ]

  const handleLocationSubmit = (location) => {
    setSelectedLocation(location)
    sessionStorage.setItem('userLocation', location)
  }

  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // Scroll to specialty section
    specialtyRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSpecialtyClick = (specialty) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!selectedLocation.trim()) {
      toast.error('Please select a location first')
      return
    }

    handleSearchDoctors(specialty.name)
  }

  const handleSearchDoctors = async (specialtyName) => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/users/doctors?specialization=${encodeURIComponent(specialtyName)}&location=${encodeURIComponent(selectedLocation)}`
      
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
      
      // Store the results and navigate to a results page or display them
      sessionStorage.setItem('doctorSearchResults', JSON.stringify(data))
      sessionStorage.setItem('searchFilters', JSON.stringify({
        specialization: specialtyName,
        location: selectedLocation,
      }))

      // Navigate to results page
      navigate('/doctors', { state: { doctors: data, filters: { specialization: specialtyName, location: selectedLocation } } })
      
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Error fetching doctors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 opacity-90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="z-10">
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                Book Appointment with Trusted Doctors <span className="text-cyan-300">~</span>
              </h1>
              <p className="text-xl text-cyan-100 mb-12 leading-relaxed">
                No Queues! No Worries. Easily explore our list of trusted doctors and book your appointment in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBookAppointment}
                  className="px-8 py-4 bg-white text-teal-600 font-bold rounded-lg hover:bg-cyan-50 transition-all transform hover:scale-105 shadow-lg text-center"
                >
                  Book Appointment →
                </button>
                <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative z-10 hidden lg:block">
              <div className="relative">
                {/* Background gradient blob */}
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/30 to-teal-600/30 rounded-3xl blur-3xl"></div>
                
                {/* Main container */}
                <div className="relative bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-3xl p-12 backdrop-blur border border-white/20">
                  <div className="space-y-6">
                    {/* Doctor 1 */}
                    <div className="flex items-center gap-6 bg-white/10 p-6 rounded-2xl backdrop-blur hover:bg-white/15 transition-all transform hover:scale-105">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-3 border-white/30">👨‍⚕️</div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-white">Dr. Rajesh Kumar</p>
                        <p className="text-cyan-100 text-sm font-medium">Cardiologist</p>
                      </div>
                    </div>

                    {/* Doctor 2 */}
                    <div className="flex items-center gap-6 bg-white/10 p-6 rounded-2xl backdrop-blur hover:bg-white/15 transition-all transform hover:scale-105">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-3 border-white/30">👩‍⚕️</div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-white">Dr. Priya Singh</p>
                        <p className="text-cyan-100 text-sm font-medium">Neurologist</p>
                      </div>
                    </div>

                    {/* Doctor 3 */}
                    <div className="flex items-center gap-6 bg-white/10 p-6 rounded-2xl backdrop-blur hover:bg-white/15 transition-all transform hover:scale-105">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-300 to-cyan-400 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-3 border-white/30">👨‍⚕️</div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-white">Dr. Arun Patel</p>
                        <p className="text-cyan-100 text-sm font-medium">Orthopedic Surgeon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find by Specialty Section */}
      <section ref={specialtyRef} className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Find by Speciality</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Simply browse through our extensive list of trusted doctors and schedule your appointment hassle-free
            </p>

            {/* Location Selector */}
            <div className="max-w-md mx-auto mb-12">
              <p className="text-sm text-gray-300 mb-3 font-semibold">📍 Select Your Location</p>
              <LocationSelector 
                onLocationSelect={handleLocationSubmit}
                currentLocation={selectedLocation}
                placeholder="Search and select your city..."
              />
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="inline-block bg-teal-600/20 border border-teal-500 rounded-lg px-6 py-2 mb-8">
                <p className="text-teal-300">
                  <span className="font-semibold">Location:</span> {selectedLocation}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
            {specialties.map((specialty, index) => (
              <button
                key={index}
                onClick={() => handleSpecialtyClick(specialty)}
                className="group cursor-pointer transition-all"
              >
                <div className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/50 hover:border-teal-400 rounded-xl p-8 text-center transition-all transform hover:scale-110 hover:shadow-xl hover:shadow-teal-500/30 h-full">
                  <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform">
                    {specialty.icon}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-teal-300 transition-colors">
                    {specialty.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose DocLink?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 border border-teal-500/30 rounded-xl p-8 hover:border-teal-400 transition-all">
              <div className="w-14 h-14 bg-teal-600 rounded-lg flex items-center justify-center mb-4 text-2xl">✓</div>
              <h3 className="text-xl font-bold mb-3">Verified Doctors</h3>
              <p className="text-gray-400">All our doctors are verified medical professionals with years of experience</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-cyan-500/30 rounded-xl p-8 hover:border-cyan-400 transition-all">
              <div className="w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center mb-4 text-2xl">⏱️</div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-gray-400">Book appointments in seconds without any waiting time or paperwork</p>
            </div>

            <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 border border-teal-500/30 rounded-xl p-8 hover:border-teal-400 transition-all">
              <div className="w-14 h-14 bg-teal-600 rounded-lg flex items-center justify-center mb-4 text-2xl">🏥</div>
              <h3 className="text-xl font-bold mb-3">Multi-hospital</h3>
              <p className="text-gray-400">Access to thousands of doctors across multiple hospitals and clinics</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-cyan-500/30 rounded-xl p-8 hover:border-cyan-400 transition-all">
              <div className="w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center mb-4 text-2xl">🔒</div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-gray-400">Your health data is encrypted and stored securely with HIPAA compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when not logged in */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold mb-6">Ready to Book Your Appointment?</h2>
            <p className="text-xl mb-10 text-cyan-100">
              Join thousands of patients who have already experienced hassle-free healthcare booking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-10 py-4 bg-white text-teal-600 font-bold rounded-lg hover:bg-cyan-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-10 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400">Features</a></li>
                <li><a href="#" className="hover:text-teal-400">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400">About</a></li>
                <li><a href="#" className="hover:text-teal-400">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400">Privacy</a></li>
                <li><a href="#" className="hover:text-teal-400">Terms</a></li>
                <li><a href="#" className="hover:text-teal-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400">Twitter</a></li>
                <li><a href="#" className="hover:text-teal-400">LinkedIn</a></li>
                <li><a href="#" className="hover:text-teal-400">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 DocLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
