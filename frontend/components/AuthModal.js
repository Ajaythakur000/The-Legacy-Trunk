// frontend/components/AuthModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Variants for modal animations
const modalVariants = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 100 } },
  exit: { y: "100vh", opacity: 0, transition: { duration: 0.2 } }
};

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 }
};

const AuthModal = ({ isVisible, onClose, isLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const API_URL = 'http://localhost:8000/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        // Login API call
        const response = await axios.post(`${API_URL}/login`, { email, password });
        setMessage('Login successful!');
        localStorage.setItem('token', response.data.token);
        console.log('Login success:', response.data);
        onClose(); 
        router.push('/dashboard');
      } else {
        // Register API call
        const response = await axios.post(`${API_URL}/register`, { name, email, password });
        setMessage('Registration successful! Please log in.');
        console.log('Registration success:', response.data);
        // After successful registration, we can set the state to login for the user to proceed.
        // We will pass the state to the next modal instance via a callback if needed
      }
    } catch (err) {
      console.error('API Error:', err.response?.data);
      if (err.response?.data?.message === 'User already exists') {
        setError('This email is already registered. Please log in.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="w-11/12 max-w-lg rounded-xl bg-gradient-to-br from-white via-yellow-50 to-purple-50 p-8 shadow-2xl"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center font-serif text-4xl font-bold text-purple-900">
          {isLogin ? 'Open the Trunk' : 'Join a Family'}
        </h2>
        <p className="mt-2 text-center text-base text-gray-700">
          {isLogin ? 'Log in to continue your journey.' : 'Start your Legacy Trunk today.'}
        </p>

        {error && <p className="mt-4 text-center font-medium text-red-600">{error}</p>}
        {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {!isLogin && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-purple-300 px-5 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-purple-300 px-5 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-purple-300 px-5 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="w-full rounded-full bg-purple-800 py-3 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-base text-gray-600">
          {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
          <span
            className="cursor-pointer font-semibold text-purple-800 hover:underline"
            onClick={() => onClose()} // Simply close the current modal
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;