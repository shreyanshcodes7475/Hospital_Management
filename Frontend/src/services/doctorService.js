import Base_url from '../constants/BASE_URL'

export const doctorAuthService = {
  login: async (email, password) => {
    return fetch(`${Base_url}/doctors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
  },

  signup: async (name, email, password, specialization, licenseNumber) => {
    return fetch(`${Base_url}/doctors/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, specialization, licenseNumber }),
      credentials: 'include',
    })
  },

  logout: async () => {
    return fetch(`${Base_url}/doctors/logout`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },
}

export const doctorService = {
  getProfile: async () => {
    return fetch(`${Base_url}/doctors/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  updateProfile: async (data) => {
    return fetch(`${Base_url}/doctors/edit`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  getAppointments: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString()
    return fetch(`${Base_url}/doctors/appointments${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    return fetch(`${Base_url}/doctors/appointments/${appointmentId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  },

  getPatients: async () => {
    return fetch(`${Base_url}/doctors/patients`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  getPatientDetails: async (patientId) => {
    return fetch(`${Base_url}/doctors/patients/${patientId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  getStats: async () => {
    return fetch(`${Base_url}/doctors/stats`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  createPrescription: async (appointmentId, prescriptionData) => {
    return fetch(`${Base_url}/doctors/prescriptions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, ...prescriptionData }),
    })
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return fetch(`${Base_url}/doctors/upload-profile-picture`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
  },

  removeProfilePicture: async () => {
    return fetch(`${Base_url}/doctors/remove-profile-picture`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  getPrescriptions: async () => {
    return fetch(`${Base_url}/doctors/prescriptions`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
