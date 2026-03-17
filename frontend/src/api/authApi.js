import api from './axios';

/**
 * Signup API
 * payload example:
 * {
 *   name: "Ajay",
 *   email: "ajay@gmail.com",
 *   password: "123456"
 * }
 */
export const signupApi = async (payload) => {
  const response = await api.post('/users/register', payload);
  return response.data; // backend se actual data return
};

/**
 * Login API
 * payload example:
 * {
 *   email: "ajay@gmail.com",
 *   password: "123456"
 * }
 */
export const loginApi = async (payload) => {
  const response = await api.post('/users/login', payload);
  return response.data;
};