import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProfileEditModal from './ProfileEditModal';
import BASE_URL from '../constants/BASE_URL';

export default function UserDashboard() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files (JPG, PNG, GIF, etc.)');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await fetch(`${BASE_URL}/users/upload-profile-picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update profile with new picture
        const updatedProfile = {
          ...profile,
          image: data.imageUrl || data.user?.image,
          iamge: data.imageUrl || data.user?.iamge,
        };
        setProfile(updatedProfile);
        setSelectedFile(null);
        setFilePreview(null);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setShowPhotoMenu(false);
        toast.success('Profile picture updated successfully! ✨');
      } else {
        toast.error(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setUploading(true);
      const response = await fetch(`${BASE_URL}/users/remove-profile-picture`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update profile
        const updatedProfile = {
          ...profile,
          image: null,
          iamge: null,
        };
        setProfile(updatedProfile);
        setShowPhotoMenu(false);
        toast.success('Profile picture removed successfully! 🗑️');
      } else {
        toast.error(data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, currentPage]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/appointments?page=${currentPage}&limit=5`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Appointments error:', error);
      toast.error('Failed to load appointments');
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Tabs - Sticky below navbar */}
      <div className="sticky top-16 bg-gray-800/80 border-b border-gray-700 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => {
              setActiveTab('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-4 font-semibold transition ${
              activeTab === 'profile'
                ? 'text-blue-300 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => {
              setActiveTab('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-4 font-semibold transition ${
              activeTab === 'appointments'
                ? 'text-blue-300 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📅 Appointments
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'profile' && profile && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-linear-to-r from-blue-600/20 to-cyan-600/20 p-8 flex gap-8 items-start relative">
                {/* Clickable Profile Photo */}
                <div 
                  onClick={() => setShowPhotoMenu(true)}
                  className="relative cursor-pointer group shrink-0"
                >
                  <img
                    src={profile.iamge || profile.image || 'https://via.placeholder.com/120'}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full border-2 border-blue-500 object-cover group-hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120?text=User';
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xl">📷</span>
                  </div>
                </div>

                {/* Photo Options Menu */}
                {showPhotoMenu && (
                  <div className="absolute left-8 top-32 bg-gray-900 border border-blue-500/50 rounded-lg shadow-xl z-50 p-4 min-w-max">
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowPhotoMenu(false);
                        }}
                        disabled={uploading}
                        className="w-full text-left px-4 py-2 hover:bg-blue-900/30 rounded transition text-white text-sm font-medium disabled:opacity-50"
                      >
                        📤 Upload Photo
                      </button>

                      <button
                        onClick={handleRemoveProfilePicture}
                        disabled={uploading || !profile.image}
                        className="w-full text-left px-4 py-2 hover:bg-red-900/30 rounded transition text-red-400 text-sm font-medium disabled:opacity-50 disabled:text-gray-500"
                      >
                        🗑️ Remove Photo
                      </button>

                      <button
                        onClick={() => setShowPhotoMenu(false)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded transition text-gray-400 text-sm font-medium"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Joined {new Date(profile.joinedOn).toLocaleDateString()}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="text-white">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="text-white">{profile.phone || 'Not added'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="text-white">{profile.gender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">DOB</p>
                      <p className="text-white">
                        {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not added'}
                      </p>
                    </div>
                  </div>

                  {/* File selection status - Beautiful Modal */}
                  {selectedFile && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-gray-900 border border-blue-500/50 rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-white mb-2">📸 Upload Profile Picture</h3>
                          <p className="text-gray-400 text-sm">Ready to upload your new photo</p>
                        </div>

                        {/* Image Preview */}
                        {filePreview && (
                          <div className="flex justify-center">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                              <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <p className="text-xs text-gray-500 mb-1">File Details</p>
                          <p className="text-sm text-white font-semibold truncate">📁 {selectedFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleUploadPicture}
                            disabled={uploading}
                            className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
                          >
                            {uploading ? '⏳ Uploading...' : '✅ Upload'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreview(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            disabled={uploading}
                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition disabled:cursor-not-allowed"
                          >
                            ❌ Cancel
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">Max size: 5MB • JPG, PNG, GIF</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="p-8 border-t border-gray-700">
                <h3 className="font-bold text-blue-300 mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Line 1</p>
                    <p className="text-white">{profile.address?.line1 || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Line 2</p>
                    <p className="text-white">{profile.address?.line2 || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">City</p>
                    <p className="text-white">{profile.address?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">State</p>
                    <p className="text-white">{profile.address?.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Postal Code</p>
                    <p className="text-white">{profile.address?.postal_code || profile.address?.postalCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Country</p>
                    <p className="text-white">{profile.address?.country || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="p-8 border-t border-gray-700">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-300">Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded p-6 text-center text-gray-400">
                No appointments found
              </div>
            ) : (
              <>
                {appointments.map((apt) => (
                  <div key={apt._id} className="bg-gray-800 border border-gray-700 rounded p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Dr. {apt.docData?.name}</h3>
                        <p className="text-blue-300 text-sm">{apt.docData?.specialization}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        apt.cancelled
                          ? 'bg-red-900 text-red-300'
                          : apt.isCompleted
                          ? 'bg-green-900 text-green-300'
                          : apt.payment
                          ? 'bg-blue-900 text-blue-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {apt.cancelled ? 'Cancelled' : apt.isCompleted ? 'Completed' : apt.payment ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date & Time</p>
                        <p className="text-white">{apt.slotDate} {apt.slotTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="text-white">₹{apt.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Degree</p>
                        <p className="text-white">{apt.docData?.degree}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Experience</p>
                        <p className="text-white">{apt.docData?.experience} years</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Sticky Pagination */}
                {(currentPage > 1 || appointments.length > 0) && (
                  <div className="sticky bottom-0 flex justify-center gap-3 mt-8 bg-gray-900 py-6 px-4 border-t border-gray-700 rounded-lg">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      disabled={currentPage === 1}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                    >
                      ← Previous
                    </button>
                    <span className="px-4 py-3 bg-blue-600 text-white rounded-lg font-bold min-w-[50px] text-center">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition transform hover:scale-105 flex items-center gap-2"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedProfile) => {
            setProfile(updatedProfile);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}
