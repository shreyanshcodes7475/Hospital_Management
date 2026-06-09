import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProfileEditModal from './ProfileEditModal';
import ProfilePhotoModal from './ProfilePhotoModal';
import BASE_URL from '../constants/BASE_URL';
import { userService } from '../services/userService';

export default function UserDashboard() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editData, setEditData] = useState({});
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
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    handleUploadProfilePicture(file);
  };

  const handleUploadProfilePicture = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

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
        setShowPhotoModal(false);
        toast.success('Profile picture updated successfully!');
      } else {
        toast.error(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Error uploading profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setUploading(true);
      const response = await fetch(`${BASE_URL}/users/remove-profile-picture`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setShowPhotoModal(false);
        toast.success('Profile picture removed successfully!');
      } else {
        toast.error(data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Error: ' + (error.message || 'Failed to remove profile picture'));
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

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/edit`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.user || { ...profile, ...editData });
          setShowProfileEdit(false);
          setEditData({});
          toast.success('Profile updated successfully');
        } else {
          toast.error(data.message || 'Failed to update profile');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
            {loading ? (
              <div className="bg-gray-800/50 rounded-lg p-6 animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur border border-blue-500/30 rounded-xl p-8">
                {!showProfileEdit ? (
                  <div>
                    {/* Profile Picture Section */}
                    <div className="mb-8 pb-8 border-b border-blue-500/20">
                      <div className="flex items-center gap-6">
                        {/* Clickable Profile Photo */}
                        <div
                          onClick={() => setShowPhotoModal(true)}
                          className="relative w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-5xl border-2 border-blue-400 shadow-lg cursor-pointer hover:opacity-80 hover:border-cyan-300 transition-all group shrink-0"
                        >
                          {profile?.iamge || profile?.image ? (
                            <img
                              src={profile?.iamge || profile?.image}
                              alt="Profile"
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            '👤'
                          )}

                          {/* Hover overlay with camera icon */}
                          <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-2xl">📷</span>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">{profile?.name || 'N/A'}</h2>
                          <p className="text-blue-400 text-lg font-medium">Patient</p>
                          <p className="text-gray-400 text-sm mt-2">Joined {new Date(profile.joinedOn).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-6 text-blue-300">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Email</label>
                          <p className="text-white text-lg">{profile?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                          <p className="text-white text-lg">{profile?.phone || 'N/A'}</p>
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
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-6 text-blue-300">Address</h3>
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
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Postal Code</label>
                          <p className="text-white text-lg">{profile?.address?.postal_code || profile?.address?.postalCode || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Country</label>
                          <p className="text-white text-lg">{profile?.address?.country || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditData({
                          name: profile?.name || '',
                          phone: profile?.phone || '',
                          gender: profile?.gender || '',
                          dob: profile?.dob || '',
                          address: profile?.address || { line1: '', line2: '', city: '', state: '', postal_code: '', country: '' },
                        });
                        setShowProfileEdit(true);
                      }}
                      className="px-6 py-3 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition font-medium"
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
                          value={editData?.name || profile?.name || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        />
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-medium">Phone</label>
                        <input
                          type="tel"
                          value={editData?.phone || profile?.phone || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, phone: e.target.value })
                          }
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        />
                      </div>

                      {/* Gender Field */}
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-medium">Gender</label>
                        <select
                          value={editData?.gender || profile?.gender || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, gender: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
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
                              : (profile?.dob ? profile.dob.split('T')[0] : '')
                          }
                          onChange={(e) =>
                            setEditData({ ...editData, dob: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        />
                      </div>

                      {/* Address Fields */}
                      <div className="border-t border-blue-500/20 pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-blue-300">Address</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-medium">Address Line 1</label>
                            <input
                              type="text"
                              value={editData?.address?.line1 || profile?.address?.line1 || ''}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  address: { ...(editData?.address || profile?.address || {}), line1: e.target.value },
                                })
                              }
                              placeholder="Street address"
                              className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-medium">Address Line 2</label>
                            <input
                              type="text"
                              value={editData?.address?.line2 || profile?.address?.line2 || ''}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  address: { ...(editData?.address || profile?.address || {}), line2: e.target.value },
                                })
                              }
                              placeholder="Apartment, suite, etc."
                              className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-medium">City</label>
                              <input
                                type="text"
                                value={editData?.address?.city || profile?.address?.city || ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    address: { ...(editData?.address || profile?.address || {}), city: e.target.value },
                                  })
                                }
                                placeholder="City"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-medium">State</label>
                              <input
                                type="text"
                                value={editData?.address?.state || profile?.address?.state || ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    address: { ...(editData?.address || profile?.address || {}), state: e.target.value },
                                  })
                                }
                                placeholder="State"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-medium">Postal Code</label>
                              <input
                                type="text"
                                value={editData?.address?.postal_code || profile?.address?.postal_code || profile?.address?.postalCode || ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    address: { ...(editData?.address || profile?.address || {}), postal_code: e.target.value },
                                  })
                                }
                                placeholder="Postal Code"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-medium">Country</label>
                              <input
                                type="text"
                                value={editData?.address?.country || profile?.address?.country || ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    address: { ...(editData?.address || profile?.address || {}), country: e.target.value },
                                  })
                                }
                                placeholder="Country"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-6 border-t border-blue-500/20">
                        <button
                          onClick={() => {
                            setShowProfileEdit(false);
                            setEditData({});
                          }}
                          className="flex-1 px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileUpdate}
                          className="flex-1 px-6 py-3 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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

      {/* Photo Modal */}
      {showPhotoModal && (
        <ProfilePhotoModal
          currentImage={profile?.iamge || profile?.image}
          uploading={uploading}
          onUpload={handleUploadProfilePicture}
          onRemove={handleRemoveProfilePicture}
          onClose={() => setShowPhotoModal(false)}
          userName={profile?.name || 'User'}
        />
      )}
    </div>
  );
}
