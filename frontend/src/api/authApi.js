import api from './axios';

/**
 * Signup API
 * payload example:
 * {
 * name: "Ajay",
 * email: "ajay@gmail.com",
 * password: "123456"
 * }
 */
export const signupApi = async (payload) => {
  const response = await api.post('/users/register', payload);
  return response.data; 
};

/**
 * Login API
 * payload example:
 * {
 * email: "ajay@gmail.com",
 * password: "123456"
 * }
 */
export const loginApi = async (payload) => {
  const response = await api.post('/users/login', payload);
  return response.data;
};


/**
 * Update Profile API
 * payload example:
 * {
 * name: "Ajay Thakur",
 * bio: "Coding my way through life",
 * avatar: "https://url.com/image.jpg",
 * dateOfBirth: "2000-01-01"
 * }
 */
export const updateUserProfileApi = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// 🔥 NEW: Forgot Password Request API
export const forgotPasswordApi = async (email) => {
  const response = await api.post('/users/forgot-password', { email });
  return response.data;
};

// 🔥 NEW: Reset Password Verify API
export const resetPasswordApi = async (payload) => {
  const response = await api.post('/users/reset-password', payload);
  return response.data;
};