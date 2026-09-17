import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGlobalStoriesApi, toggleLikeStoryApi, addCommentToStoryApi } from '../../api/storyApi'; 
import StoryCard from '../story/StoryCard'; 
import StorySkeleton from '../shared/StorySkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function StrangersMemoriesFeed() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getGlobalStoriesApi(); 
        setStories(Array.isArray(data) ? data : data?.stories || []);
      } catch (error) {
        console.error("Failed to load feed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleLike = async (storyId) => {
    try {
      await toggleLikeStoryApi(storyId);
      setStories(stories.map(s => {
        if (s._id === storyId) {
          const hasLiked = s.likes.includes(user._id);
          const newLikes = hasLiked ? s.likes.filter(id => id !== user._id) : [...s.likes, user._id];
          return { ...s, likes: newLikes };
        }
        return s;
      }));
    } catch (err) { console.error('Like failed', err); }
  };

  const handleComment = async (storyId, text) => {
    try {
      const data = await addCommentToStoryApi(storyId, text);
      setStories(stories.map(s => s._id === storyId ? { ...s, comments: data.comments } : s));
    } catch (err) { console.error('Comment failed', err); }
  };

  // NEW COMIC UI FOR LOADING/EMPTY STATES
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20 }}>
        <StorySkeleton /><StorySkeleton />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '80px 20px', background: '#FFF', borderRadius: 24, border: '6px solid #3E2723', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: 80, display: 'block', marginBottom: 20 }}>🌍</span>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#A0522D', margin: '0 0 10px', fontSize: 32 }}>THE WORLD IS QUIET</h3>
        <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, color: '#3E2723', margin: 0, fontSize: 18 }}>Nobody has shared a global memory yet.</p>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <AnimatePresence mode="popLayout">
        {stories.map((story, index) => (
          <motion.div 
            key={story._id} layout
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <StoryCard story={story} currentUser={user} onLike={handleLike} onComment={handleComment} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}