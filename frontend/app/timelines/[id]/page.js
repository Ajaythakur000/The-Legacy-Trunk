// frontend/app/timelines/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

export default function TimelineDetailPage({ params }) {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEvent, setNewEvent] = useState({ eventName: '', eventDate: '', description: '' });
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchTimeline = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/api/timelines/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimeline(response.data);
      } catch (err) {
        console.error('Error fetching timeline:', err.response?.data);
        setError('Failed to load timeline.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchTimeline();
    }
  }, [id, router]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8000/api/timelines/${id}/events`,
        newEvent,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeline((prev) => ({
        ...prev,
        events: [...prev.events, response.data],
      }));
      setNewEvent({ eventName: '', eventDate: '', description: '' });
    } catch (err) {
      console.error('Error adding event:', err.response?.data);
      setError('Failed to add event.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(
          `http://localhost:8000/api/timelines/${id}/events/${eventId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTimeline((prev) => ({
          ...prev,
          events: prev.events.filter((event) => event._id !== eventId),
        }));
      } catch (err) {
        console.error('Error deleting event:', err.response?.data);
        setError('Failed to delete event.');
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

  if (!timeline) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-lg font-semibold">
        Timeline not found.
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
        <h1 className="text-4xl font-bold text-purple-800">{timeline.title}</h1>
        <Link href="/timelines" className="text-purple-600 hover:underline">
          &larr; Back to Timelines
        </Link>
      </motion.header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Add Event Form */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Add New Event</h2>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <input
              type="text"
              placeholder="Event Name"
              value={newEvent.eventName}
              onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
              required
            />
            <input
              type="date"
              placeholder="Event Date"
              value={newEvent.eventDate}
              onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
              required
            />
            <textarea
              placeholder="Description (Optional)"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows="3"
              className="w-full rounded-md border p-3 focus:border-purple-500 focus:outline-none"
            ></textarea>
            <button
              type="submit"
              className="w-full rounded-full bg-purple-800 py-3 font-semibold text-white transition-colors hover:bg-purple-900"
            >
              Add Event
            </button>
          </form>
        </motion.div>

        {/* Events List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">Events</h2>
          {timeline.events.length === 0 ? (
            <p className="text-gray-500">No events found for this timeline. Add one to get started!</p>
          ) : (
            timeline.events.map((event) => (
              <motion.div
                key={event._id}
                className="flex items-start justify-between rounded-lg bg-white p-6 shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h3 className="text-xl font-semibold text-purple-800">{event.eventName}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-gray-700">{event.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}