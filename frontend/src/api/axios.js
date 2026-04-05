import axios from 'axios';

/**
 * Ye humara main axios client hai.
 * Isko hum poori app me reuse karenge taaki har jagah base URL repeat na karna pade.
 */
const api = axios.create({
  // Tumhara backend server
  baseURL: 'http://localhost:8000/api',

  // Agar request 10 sec me complete na ho toh fail kar do
  timeout: 300000,
});

/**
 * Request interceptor:
 * Har API call bhejne se pehle yeh function chalega.
 * Kaam:
 * 1) localStorage se token uthao
 * 2) token mil gaya toh request header me chipka do
 *
 * Benefit:
 * Hume har API file me Authorization header manually nahi likhna padta.
 */
api.interceptors.request.use(
  (config) => {
    // login ke baad token yahan save hota hai (Phase 3 me karenge)
    const token = localStorage.getItem('token');

    if (token) {
      // Standard JWT auth header format
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;