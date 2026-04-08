import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import api from '../api/axios'; 
import { connectSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      connectSocket(token);
      fetchFreshProfile(); 
    }
  }, [token]);

  const fetchFreshProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch fresh profile data:", error);
      if (error.response && error.response.status === 401) {
        logout();
        toast.error("Session expired. Please log in again. 🔒");
      }
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

      // 🔴 IMPORTANT LOGIC FIX:
      // yahan connectSocket dobara mat call karo, kyunki token state set hone ke baad
      // useEffect([token]) already connectSocket(token) chala deta hai.
      // connectSocket(receivedToken);

      return { success: true, data };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Login failed';
      return { success: false, message, errorData: error?.response?.data }; 
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

        // 🔴 IMPORTANT LOGIC FIX:
        // same reason as login - duplicate connect avoid
        // connectSocket(receivedToken);
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

  const switchActiveCircle = async (circleId) => {
    if (!user) return;
    
    const previousUser = { ...user };
    
    const updatedUser = { ...user, activeCircleId: circleId };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    try {
      await api.put('/users/profile', { activeCircleId: circleId });
      fetchFreshProfile(); 
    } catch (error) {
      console.error("Failed to save switched circle to backend:", error);
      
      setUser(previousUser);
      localStorage.setItem('user', JSON.stringify(previousUser));
      toast.error("Failed to switch vault. Access Denied.");
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
    fetchFreshProfile, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};