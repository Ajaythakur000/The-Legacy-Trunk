import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // token exists => auto socket connect (refresh case)
  useEffect(() => {
    if (token) connectSocket(token);
  }, [token]);

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
      const message =
        error?.response?.data?.message || error.message || 'Login failed';
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
      const message =
        error?.response?.data?.message || error.message || 'Signup failed';
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

  // ==========================================
  // 🔥 NEW FUNCTION: Switch Active Circle
  // ==========================================
  const switchActiveCircle = (circleId) => {
    if (!user) return;
    
    const updatedUser = { ...user, activeCircleId: circleId };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Optional: Agar tera backend bhi user profile update mangta hai, toh yahan ek API call bhi laga sakta hai future mein.
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
    switchActiveCircle, // <-- Isko expose kar diya
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};