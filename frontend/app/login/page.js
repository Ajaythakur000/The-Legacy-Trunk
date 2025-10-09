// frontend/app/login/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted in test mode.');
    // In a real scenario, you would have API calls here.
    // For now, we'll just redirect to the dashboard.
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold text-purple-800">Log In</h2>
        <p className="mb-6 mt-2 text-center text-gray-600">
          Welcome back! Please enter your details.
        </p>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-800 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-900 disabled:bg-gray-400"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-purple-800 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}