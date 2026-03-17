import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';

// 1) Context create
const AuthContext = createContext(null);

/**
 * AuthProvider:
 * Iske andar poori app wrap hogi (main.jsx me).
 * Is context se hum app ke kisi bhi component me user/token access kar paayenge.
 */
export const AuthProvider = ({ children }) => {
  // 2) Initial state: localStorage se load (page refresh survive kare)
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // user ko object form me localStorage se recover karo
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // loading useful hota hai startup checks ke liye
  const [loading, setLoading] = useState(false);

  /**
   * 3) login function
   * - backend ko call karta hai
   * - token + user save karta hai
   * - global state update karta hai
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginApi({ email, password });

      // IMPORTANT: backend response shape ke hisaab se fallback use kiya
      const receivedToken = data?.token;
      const receivedUser = data?.user || data;

      if (!receivedToken) {
        throw new Error('Token not received from server');
      }

      // state update
      setToken(receivedToken);
      setUser(receivedUser);

      // localStorage update
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      return { success: true, data };
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 4) signup function
   * - register API call
   * - agar backend token return kare to auto-login jaisa behavior
   */
  const signup = async (payload) => {
    setLoading(true);
    try {
      const data = await signupApi(payload);

      // Kuch backends signup me token dete hain, kuch nahi.
      // Dono cases handle kar rahe.
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
      const message =
        error?.response?.data?.message || error.message || 'Signup failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 5) logout function
   * - state clean
   * - localStorage clean
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * 6) helper: user logged in hai ya nahi
   */
  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser, // future me profile update me useful
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook for easy usage:
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};