import BASE_URL from '../constants/BASE_URL';

export const userService = {
  // Fetch user profile
  getProfile: async (token) => {
    return fetch(`${BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Fetch all appointments with pagination
  getAppointments: async (token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/appointments?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update user profile
  updateProfile: async (token, profileData) => {
    return fetch(`${BASE_URL}/users/edit`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (token, file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return fetch(`${BASE_URL}/users/upload-profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },

  // Remove profile picture
  removeProfilePicture: async (token) => {
    return fetch(`${BASE_URL}/users/remove-profile-picture`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Cancel appointment
  cancelAppointment: async (token, appointmentId) => {
    return fetch(`${BASE_URL}/users/cancel-appointment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointmentId: appointmentId,
      }),
    });
  },
};
