import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import BASE_URL from '../constants/BASE_URL'
import { userService } from '../services/userService'

export default function UserProfile() {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    gender: 'Not selected',
    dob: '',
  })

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.warn('No token available')
          toast.error('Please login to view profile')
          setLoading(false)
          return
        }

        const response = await fetch(`${BASE_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          const userData = data.user
          setProfileData({
            name: userData.name || '',
            phone: userData.phone || '',
            address: userData.address || {
              line1: '',
              line2: '',
              city: '',
              state: '',
              postal_code: '',
              country: '',
            },
            gender: userData.gender || 'Not selected',
            dob: userData.dob ? userData.dob.split('T')[0] : '',
          })
          setUser(userData)
        } else {
          toast.error('Failed to load profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [setUser])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address_')) {
      const addressField = name.replace('address_', '')
      setProfileData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch(`${BASE_URL}/users/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files (JPG, PNG, GIF, etc.)')
      setSelectedFile(null)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleUploadPicture = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first')
      return
    }

    try {
      setUploading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const response = await userService.uploadProfilePicture(token, selectedFile)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Update user profile with new picture
        const updatedUser = {
          ...user,
          image: data.imageUrl || data.user?.image,
          iamge: data.imageUrl || data.user?.iamge,
        }
        setUser(updatedUser)
        setSelectedFile(null)
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
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

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click()
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400 text-xl">Please login to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-teal-500/30 rounded-xl p-8 hover:border-teal-400 transition-all">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Clickable Profile Photo */}
            <div 
              onClick={handleProfilePhotoClick}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-5xl border-2 border-teal-400 shadow-lg cursor-pointer hover:opacity-80 hover:border-cyan-300 transition-all group"
            >
              {user?.iamge || user?.image ? (
                <img
                  src={user?.iamge || user?.image}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                '👤'
              )}
              
              {/* Hover overlay with upload icon */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-2xl">📷</span>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div>
              <h2 className="text-3xl font-bold text-white">{profileData.name}</h2>
              <p className="text-teal-400 text-lg">Patient</p>
              <p className="text-gray-400 text-sm mt-1">
                Joined {user?.joinedOn ? new Date(user.joinedOn).toLocaleDateString() : 'Recently'}
              </p>

              {/* Upload status */}
              {selectedFile && (
                <div className="mt-3 bg-cyan-900/30 border border-cyan-500/50 rounded px-3 py-2">
                  <p className="text-xs text-cyan-300">
                    📁 {selectedFile.name}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleUploadPicture}
                      disabled={uploading}
                      className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition"
                    >
                      {uploading ? '⏳ Uploading...' : '✅ Upload'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      disabled={uploading}
                      className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Information */}
      {!isEditing ? (
        // View Mode
        <div className="bg-gray-800/50 border border-teal-500/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-teal-300">Profile Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Email</p>
                <p className="text-white text-lg mt-2 break-all">{user?.email}</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Phone</p>
                <p className="text-white text-lg mt-2">{profileData.phone || 'Not provided'}</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Gender</p>
                <p className="text-white text-lg mt-2">{profileData.gender}</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Date of Birth</p>
                <p className="text-white text-lg mt-2">
                  {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>

            {/* Address Info */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Address Line 1</p>
                <p className="text-white text-lg mt-2">{profileData.address.line1 || 'Not provided'}</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Address Line 2</p>
                <p className="text-white text-lg mt-2">{profileData.address.line2 || 'Not provided'}</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">City</p>
                <p className="text-white text-lg mt-2">{profileData.address.city || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">State</p>
                  <p className="text-white text-lg mt-2">{profileData.address.state || 'N/A'}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Postal Code</p>
                  <p className="text-white text-lg mt-2">{profileData.address.postal_code || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Country</p>
                <p className="text-white text-lg mt-2">{profileData.address.country || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode - Clean Professional Form
        <div className="bg-gray-800/50 border border-teal-500/30 rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Edit Your Information</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/30">
              <h4 className="text-lg font-semibold text-teal-300 mb-4">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none transition-colors"
                  >
                    <option value="Not selected">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={profileData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/30">
              <h4 className="text-lg font-semibold text-teal-300 mb-4">Address</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={profileData.address.line1}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Additional Address (Optional)</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={profileData.address.line2}
                    onChange={handleInputChange}
                    placeholder="Apt, Suite, Floor, etc."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      name="address_city"
                      value={profileData.address.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                    <input
                      type="text"
                      name="address_state"
                      value={profileData.address.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="address_postal_code"
                      value={profileData.address.postal_code}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                  <input
                    type="text"
                    name="address_country"
                    value={profileData.address.country}
                    onChange={handleInputChange}
                    placeholder="India"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform disabled:scale-100 shadow-lg"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all border border-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>}
    </div>
  )
}
