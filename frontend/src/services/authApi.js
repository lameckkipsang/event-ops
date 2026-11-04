// src/services/authApi.js
import api from './api';

export const authService = {
  // Sends the Google access token received from Google's SDK to Django backend (dj_rest_auth)
  googleLogin: async (accessToken, role = 'ATTENDEE') => {
    const response = await api.post('auth/google/', {
      access_token: accessToken,
      role: role, // Passes preferred role for first-time account creation
    });
    return response.data;
  },

  // Standard email login using backend CustomTokenObtainPairView
  login: async (email, password) => {
    const response = await api.post('auth/login/', { email, password });
    return response.data;
  },

  // Standard registration using UserRegisterSerializer
  register: async (userData) => {
    const response = await api.post('accounts/', userData);
    return response.data;
  },

  // Fetch logged-in user profile
  getProfile: async () => {
    const response = await api.get('accounts/profile/');
    return response.data;
  },
};