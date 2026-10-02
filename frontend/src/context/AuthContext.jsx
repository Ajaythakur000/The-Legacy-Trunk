import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import api from '../api/axios';
import { connectSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Provides authentication state and methods to the app
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Sets up auth and fetches profile on mount
    const initializeAuth = async () => {
      setIsInitializing(true);

      try {
        if (token) {
          connectSocket(token);
          await fetchFreshProfile();
        }
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [token]);

  // Retrieves latest user data from the server
  const fetchFreshProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to fetch fresh profile data:', error);
      if (error.response && error.response.status === 401) {
        logout();
        toast.error('Session expired. Please log in again. 🔒');
      }
    }
  };

  // Handles user login and stores token
  const login = async (email, password) => {
    setLoading(true);
    setIsInitializing(true); 
    try {
      const data = await loginApi({ email, password });

      const receivedToken = data?.token;
      const receivedUser = data?.user || data;

      if (!receivedToken) throw new Error('Token not received from server');

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setUser(receivedUser);
      setToken(receivedToken);

      return { success: true, data };
    } catch (error) {
      setIsInitializing(false); 
      const message = error?.response?.data?.message || error.message || 'Login failed';
      return { success: false, message, errorData: error?.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Registers a new user and sets session
  const signup = async (payload) => {
    setLoading(true);
    try {
      const data = await signupApi(payload);

      const receivedToken = data?.token || null;
      const receivedUser = data?.user || data || null;

      if (receivedToken) {
        setToken(receivedToken);
        localStorage.setItem('token', receivedToken);
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

  // Clears session and logs user out
  const logout = () => {
    disconnectSocket();
    setToken(null);
    setUser(null);
    setIsInitializing(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Changes the active family circle for the user
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
      console.error('Failed to save switched circle to backend:', error);

      setUser(previousUser);
      localStorage.setItem('user', JSON.stringify(previousUser));
      toast.error('Failed to switch vault. Access Denied.');
    }
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    loading,
    isInitializing,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser,
    setToken,
    switchActiveCircle,
    fetchFreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};