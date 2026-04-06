import axios from 'axios';
import toast from 'react-hot-toast'; 

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 300000,
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

// ==========================================
// 🔥 THE PRO APPROACH: GLOBAL ERROR GUARD
// ==========================================
api.interceptors.response.use(
  (response) => {
    // Agar API successfully chal gayi, toh response aage bhej do
    return response;
  },
  (error) => {
    // 1. Agar Server Down hai ya Internet nahi chal raha (No Response)
    if (!error.response) {
      toast.error('Network Error: The vault is currently unreachable. Check your internet! 🌐', { id: 'net-err' });
    } 
    // 2. Agar API Time Out ho gayi (Gemini ne bohot time le liya)
    else if (error.code === 'ECONNABORTED') {
      toast.error('Timeout: The magic is taking too long. Please try again! ⏳', { id: 'time-err' });
    } 
    // 3. Agar Backend Code Phat Gaya (Server Error 500+)
    else if (error.response.status >= 500) {
      toast.error('Server Glitch: Our mechanics are fixing the vault. 🛠️', { id: 'svr-err' });
    }
    // 4. Agar Gemini API rate limit cross ho gayi (Too Many Requests 429)
    else if (error.response.status === 429) {
      toast.error('Whoa, slow down! Too many requests to the Oracle. 🔮', { id: 'rate-err' });
    }

    // Error ko wapas feko taaki local component bhi agar chahe toh use catch kar sake
    return Promise.reject(error);
  }
);

export default api;