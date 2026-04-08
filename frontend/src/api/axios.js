import axios from 'axios';
import toast from 'react-hot-toast'; 

// 🔴 IMPORTANT: backend routes '/api/...' pe mounted hain
// Isliye base URL me '/api' ensure karo
const getApiBaseUrl = () => {
  const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000';

  const clean = raw.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && error.code !== 'ECONNABORTED') {
      toast.error('Network Error: The vault is currently unreachable. Check your internet! 🌐', { id: 'net-err' });
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Timeout: The magic is taking too long. Please try again! ⏳', { id: 'time-err' });
    } else if (error.response?.status >= 500) {
      toast.error('Server Glitch: Our mechanics are fixing the vault. 🛠️', { id: 'svr-err' });
    } else if (error.response?.status === 429) {
      toast.error('Whoa, slow down! Too many requests. 🔮', { id: 'rate-err' });
    }

    return Promise.reject(error);
  }
);

export default api;