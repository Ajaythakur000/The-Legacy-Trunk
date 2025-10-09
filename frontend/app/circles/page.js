// frontend/app/circles/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

export default function CirclesPage() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCircleName, setNewCircleName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCircles = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        // This is a placeholder API endpoint. You'll need to create this on the backend.
        const response = await axios.get('http://localhost:8000/api/circles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCircles(response.data);
      } catch (err) {
        console.error('Error fetching circles:', err.response?.data);
        setError('Failed to load family circles.');
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, [router]);

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      // This is a placeholder API endpoint. You'll need to create this on the backend.
      const response = await axios.post('http://localhost:8000/api/circles', { name: newCircleName }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCircles([...circles, response.data]);
      setNewCircleName('');
    } catch (err) {
      console.error('Error creating circle:', err.response?.data);
      setError('Failed to create circle. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.header
        className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-purple-800">My Family Circles</h1>
        <Link href="/dashboard" className="text-purple-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </motion.header>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Create Circle Form */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Create New Circle</h2>
          <form onSubmit={handleCreateCircle} className="space-y-4">
            <input
              type="text"
              placeholder="Circle Name"
              value={newCircleName}
              onChange={(e) => setNewCircleName(e.target.value)}
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full rounded-full bg-purple-800 py-3 font-semibold text-white transition-colors hover:bg-purple-900"
            >
              Create Circle
            </button>
          </form>
        </motion.div>

        {/* Circles List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">Your Circles</h2>
          {circles.length === 0 ? (
            <p className="text-center text-gray-500">No circles found. Create your first one!</p>
          ) : (
            circles.map((circle) => (
              <motion.div
                key={circle._id}
                className="rounded-lg bg-white p-6 shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-semibold text-purple-800">{circle.name}</h3>
                {/* You can add more details here, like members */}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}