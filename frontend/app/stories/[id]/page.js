// frontend/app/stories/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StoryDetailPage({ params }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/api/stories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStory(response.data);
        // Assuming your backend sends a way to identify if the current user is the author
        // For now, we'll use a placeholder check
        const loggedInUserId = 'dummy-user-id'; // Replace with actual user ID from your auth system
        if (response.data.author === loggedInUserId) {
          setIsAuthor(true);
        }
      } catch (err) {
        console.error('Error fetching story:', err.response?.data);
        setError('Failed to load story.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchStory();
    }
  }, [id, router]);

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await axios.delete(`http://localhost:8000/api/stories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        router.push('/dashboard');
      } catch (err) {
        console.error('Error deleting story:', err.response?.data);
        setError('Failed to delete story. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-lg font-semibold text-red-500">
        {error}
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-lg font-semibold">
        Story not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md"
      >
        <Link href="/dashboard" className="text-purple-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        {isAuthor && (
          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={() => router.push(`/stories/edit/${id}`)}
              className="rounded-full bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Edit Story
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full bg-red-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-600"
            >
              Delete Story
            </button>
          </div>
        )}
        <h1 className="mt-4 text-4xl font-bold text-purple-900">{story.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Tags: {story.tags.join(', ')}
        </p>
        {story.image && (
          <img
            src={`http://localhost:8000/${story.image}`}
            alt={story.title}
            className="mt-6 w-full rounded-lg object-cover"
          />
        )}
        <p className="mt-6 text-lg text-gray-700">{story.content}</p>
      </motion.div>
    </div>
  );
}