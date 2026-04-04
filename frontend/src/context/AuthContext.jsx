import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import api from '../api/axios'; // 🔥 Ye import chahiye taaki hum directly profile fetch kar sakein
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // token exists => auto socket connect & Fetch Fresh Profile Data!
  useEffect(() => {
    if (token) {
      connectSocket(token);
      fetchFreshProfile(); // 🔥 Jaise hi token mile, fresh data manga lo (Points sync karne ke liye)
    }
  }, [token]);

  // ==========================================
  // 🔥 FETCH FRESH PROFILE DATA (SYNC FUNCTION)
  // ==========================================
  const fetchFreshProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch fresh profile data:", error);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginApi({ email, password });

      const receivedToken = data?.token;
      const receivedUser = data?.user || data;

      if (!receivedToken) throw new Error('Token not received from server');

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      connectSocket(receivedToken);

      return { success: true, data };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const data = await signupApi(payload);

      const receivedToken = data?.token || null;
      const receivedUser = data?.user || data || null;

      if (receivedToken) {
        setToken(receivedToken);
        localStorage.setItem('token', receivedToken);
        connectSocket(receivedToken);
      }

      if (receivedUser) {
        setUser(receivedUser);
        localStorage.setItem('user', JSON.stringify(receivedUser));
      }

      return { success: true, data };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Signup failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    disconnectSocket();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Switch Active Circle
  // ==========================================
  // 🔥 Switch Active Circle (FIXED)
  // ==========================================
  const switchActiveCircle = async (circleId) => {
    if (!user) return;
    
    // 1. Turant UI update kar (Optimistic update taaki fast lage)
    const updatedUser = { ...user, activeCircleId: circleId };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    try {
      // 2. Backend ko batao ki naya circle save kar le
      await api.put('/users/profile', { activeCircleId: circleId });
      
      // 3. Ab fresh points aur data mangwa lo
      fetchFreshProfile(); 
    } catch (error) {
      console.error("Failed to save switched circle to backend:", error);
    }
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser,
    switchActiveCircle,
    fetchFreshProfile, // 🔥 Is function ko baahar export kar diya taaki doosre components bhi ise bula sakein
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};