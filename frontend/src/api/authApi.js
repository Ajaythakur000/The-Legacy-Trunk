import api from './axios';

// Registers a new user
export const signupApi = async (payload) => {
  const response = await api.post('/users/register', payload);
  return response.data; 
};

// Logs in an existing user
export const loginApi = async (payload) => {
  const response = await api.post('/users/login', payload);
  return response.data;
};

// Updates the user's profile info
export const updateUserProfileApi = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Sends a forgot password request
export const forgotPasswordApi = async (email) => {
  const response = await api.post('/users/forgot-password', { email });
  return response.data;
};

// Verifies and resets the password
export const resetPasswordApi = async (payload) => {
  const response = await api.post('/users/reset-password', payload);
  return response.data;
};