// frontend/app/stories/edit/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EditStoryPage({ params }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchStory = async () => {
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
        const storyData = response.data;
        setTitle(storyData.title);
        setContent(storyData.content);
        setTags(storyData.tags.join(', '));
        // Note: The image field will be handled separately on submission
      } catch (err) {
        console.error('Error fetching story for edit:', err.response?.data);
        setError('Failed to load story for editing.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchStory();
    }
  }, [id, router]);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', tags);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.put(`http://localhost:8000/api/stories/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Story updated successfully!');
      setTimeout(() => {
        router.push(`/stories/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating story:', err.response?.data);
      setError('Failed to update story. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-lg bg-white p-6 shadow-md"
      >
        <h1 className="text-4xl font-bold text-purple-800">Edit Story</h1>
      </motion.header>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-white p-8 shadow-md"
      >
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        {success && <p className="mb-4 text-center text-green-500">{success}</p>}

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-semibold text-gray-700">Change Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-purple-800 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-purple-900 disabled:bg-gray-400"
        >
          {loading ? 'Updating...' : 'Update Story'}
        </button>
        <Link href={`/stories/${id}`} className="mt-4 block text-center text-purple-600 hover:underline">
          Cancel
        </Link>
      </motion.form>
    </div>
  );
}