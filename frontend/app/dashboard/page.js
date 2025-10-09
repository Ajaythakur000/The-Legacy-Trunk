// frontend/app/dashboard/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Stories ke liye dummy data (HARDCODED)
  const [stories, setStories] = useState([
    {
      _id: '1',
      title: 'My First Story',
      content: 'This is a test story content. It is a very long story to check how it looks on the page.',
      image: 'https://images.unsplash.com/photo-1517457210206-a60d8441f3e3',
    },
    {
      _id: '2',
      title: 'A Memory from Childhood',
      content: 'Recalling a funny memory from my childhood. It was a great day with friends.',
      image: 'https://images.unsplash.com/photo-1543353071-87426178226e',
    },
    {
      _id: '3',
      title: 'The Day I Found My Calling',
      content: 'A detailed narrative of a pivotal moment in my life that set me on my current path.',
      image: 'https://images.unsplash.com/photo-1519757656644-2453e1a141b0',
    },
  ]);

  const [loadingStories, setLoadingStories] = useState(false); // Set to false to show dummy data

  useEffect(() => {
    // Ye code abhi comment out kiya gaya hai taaki aap bina login ke page dekh sakein.
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   router.push('/login');
    // }
    
    // Test mode ke liye dummy user data
    setUser({ name: 'Aayush' });

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <motion.header
        className="mb-8 flex flex-col items-center justify-between gap-4 rounded-lg bg-white p-6 shadow-md md:flex-row"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-purple-900 md:text-4xl">
            Welcome, {user.name}!
          </h1>
        </motion.div>
        
        {/* Navigation Links and Buttons */}
        <motion.div className="flex flex-col items-center gap-4 md:flex-row" variants={itemVariants}>
          {/* Navigation Links */}
          <nav>
            <ul className="flex flex-col gap-4 text-lg md:flex-row md:gap-6">
              <Link href="/timelines" legacyBehavior>
                <a className="text-purple-600 hover:underline">Timelines</a>
              </Link>
              <Link href="/circles" legacyBehavior>
                <a className="text-purple-600 hover:underline">Family Circles</a>
              </Link>
            </ul>
          </nav>

          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search stories..." 
              className="rounded-full border px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Buttons */}
          <Link href="/stories/create" legacyBehavior>
            <motion.button className="rounded-full bg-purple-800 px-6 py-2 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-purple-900">
              Create New Story
            </motion.button>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border-2 border-red-500 px-6 py-2 font-semibold text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </motion.div>
      </motion.header>

      {/* Main Content Area - Stories will go here */}
      <main>
        <h2 className="mb-4 text-2xl font-bold text-gray-700">Your Stories</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 h-[600px] overflow-y-auto">
          {loadingStories ? (
            <div className="text-center text-gray-500">
              <p>Loading stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>You haven't created any stories yet.</p>
              <Link href="/stories/create" legacyBehavior>
                <button className="mt-4 rounded-full bg-purple-800 px-6 py-2 font-semibold text-white transition-colors hover:bg-purple-900">
                  Create your first story!
                </button>
              </Link>
            </div>
          ) : (
            stories.map((story) => (
              <Link key={story._id} href={`/stories/${story._id}`} legacyBehavior>
                <div className="relative h-96 overflow-hidden rounded-xl bg-white shadow-xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl">
                  {story.image && (
                    <img
                      src={story.image}
                      alt={story.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h3 className="text-xl font-bold">{story.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm">
                      {story.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}