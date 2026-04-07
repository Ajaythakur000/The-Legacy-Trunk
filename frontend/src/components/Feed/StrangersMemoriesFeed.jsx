// File Path: src/components/feed/StrangersMemoriesFeed.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGlobalStoriesApi, toggleLikeStoryApi, addCommentToStoryApi } from '../../api/storyApi'; 
import StoryCard from '../story/StoryCard'; 
import { motion } from 'framer-motion';

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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Dusting off the archives... ⏳</div>;
  }

  if (stories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: '#fafaf9', borderRadius: '12px', border: '1px dashed #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <span style={{ fontSize: '40px' }}>📭</span>
        <p style={{ color: '#475569', fontWeight: '700', fontSize: '18px', marginTop: '16px' }}>The vault is currently empty.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {stories.map((story, index) => (
        <motion.div 
          key={story._id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
        >
          <StoryCard story={story} currentUser={user} onLike={handleLike} onComment={handleComment} />
        </motion.div>
      ))}
    </div>
  );
}