import Base_url from '../constants/BASE_URL';

export const loginAPI = {
  patient: async (email, password) => {
    return fetch(`${Base_url}/patient/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  doctor: async (email, password) => {
    return fetch(`${Base_url}/doctor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  admin: async (email, password) => {
    return fetch(`${Base_url}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },
};

export const signupAPI = {
  patient: async (name, email, password) => {
    return fetch(`${Base_url}/patient/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  },
};
