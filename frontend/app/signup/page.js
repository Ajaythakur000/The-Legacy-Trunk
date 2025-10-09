// frontend/app/signup/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Assuming your backend handles registration AND returns a JWT token
      const response = await axios.post('http://localhost:8000/api/users/register', {
        name,
        email,
        password,
      });
      
      // Store the JWT token and redirect to dashboard
      localStorage.setItem('token', response.data.token); 
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Signup Error:', err.response?.data);
      setError(err.response?.data?.message || 'Something went wrong. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold text-purple-800">Join a Family</h2>
        <p className="mb-6 mt-2 text-center text-gray-600">
          Start your Legacy Trunk today.
        </p>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-900"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-900"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-900"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-900"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-800 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-900 disabled:bg-gray-400"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already a member?{' '}
          <Link href="/login" className="text-purple-800 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}