import { useState } from 'react';
import { toast } from 'react-toastify';
import BASE_URL from '../constants/BASE_URL';

export default function ProfileEditModal({ profile, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    gender: profile.gender || '',
    dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
    address: {
      line1: profile.address?.line1 || '',
      line2: profile.address?.line2 || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      postal_code: profile.address?.postal_code || profile.address?.postalCode || '',
      country: profile.address?.country || '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
      };

      console.log('Sending payload:', payload);
      
      const response = await fetch(`${BASE_URL}/users/edit`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        toast.error(errorData.message || `Error: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (data.success) {
        toast.success('Profile updated successfully!');
        if (data.user) {
          onUpdate(data.user);
        }
        onClose();
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error: ' + (error.message || 'Failed to update'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="col-span-2 bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 text-white rounded p-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="col-span-2 bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="line1"
                value={formData.address.line1}
                onChange={handleAddressChange}
                placeholder="Line 1"
                className="col-span-2 bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <input
                type="text"
                name="line2"
                value={formData.address.line2}
                onChange={handleAddressChange}
                placeholder="Line 2"
                className="col-span-2 bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                placeholder="City"
                className="bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                placeholder="State"
                className="bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <input
                type="text"
                name="postal_code"
                value={formData.address.postal_code}
                onChange={handleAddressChange}
                placeholder="Postal Code"
                className="bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
              <input
                type="text"
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                placeholder="Country"
                className="bg-gray-700 border border-gray-600 text-white rounded p-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="border-t border-gray-700 pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
