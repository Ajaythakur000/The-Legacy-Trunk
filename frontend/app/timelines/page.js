// frontend/app/timelines/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function TimelinesPage() {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTimeline, setNewTimeline] = useState({ title: '', description: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchTimelines = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/api/timelines', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTimelines(response.data);
      } catch (err) {
        console.error('Error fetching timelines:', err.response?.data);
        setError('Failed to load timelines.');
      } finally {
        setLoading(false);
      }
    };
    fetchTimelines();
  }, [router]);

  const handleCreateTimeline = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/timelines', newTimeline, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTimelines([...timelines, response.data]);
      setNewTimeline({ title: '', description: '' });
    } catch (err) {
      console.error('Error creating timeline:', err.response?.data);
      setError('Failed to create timeline.');
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
        <h1 className="text-4xl font-bold text-purple-800">My Timelines</h1>
        <Link href="/dashboard" className="text-purple-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </motion.header>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Create Timeline Form */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Create New Timeline</h2>
          <form onSubmit={handleCreateTimeline} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newTimeline.title}
              onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
              required
            />
            <textarea
              placeholder="Description"
              value={newTimeline.description}
              onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
              rows="3"
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full rounded-full bg-purple-800 py-3 font-semibold text-white transition-colors hover:bg-purple-900"
            >
              Create
            </button>
          </form>
        </motion.div>

        {/* Timelines List */}
        <div className="col-span-2 space-y-4">
          {timelines.length === 0 ? (
            <p className="text-center text-gray-500">No timelines found. Create your first one!</p>
          ) : (
            timelines.map((timeline) => (
              <motion.div
                key={timeline._id}
                className="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-[1.01]"
                variants={itemVariants}
              >
                <Link href={`/timelines/${timeline._id}`} className="block">
                  <h3 className="text-2xl font-semibold text-purple-800">{timeline.title}</h3>
                  <p className="mt-2 text-gray-600">{timeline.description}</p>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}