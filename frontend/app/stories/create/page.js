// frontend/app/stories/create/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function CreateStoryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', tags);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post('http://localhost:8000/api/stories', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Story created successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating story:', err.response?.data);
      setError('Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-lg bg-white p-6 shadow-md"
      >
        <h1 className="text-4xl font-bold text-purple-800 text-center">Create a New Story</h1>
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
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-800"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-800"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none text-gray-800"
          />
        </div>

        <div className="mb-6">
        <label className="mb-2 block font-semibold text-gray-700">Upload Image</label>
        <input
            type="file"
            onChange={handleFileChange}
            className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none border-gray-800"
        />
        </div>


        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-purple-800 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-purple-900 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Story'}
        </button>
      </motion.form>
    </div>
  );
}