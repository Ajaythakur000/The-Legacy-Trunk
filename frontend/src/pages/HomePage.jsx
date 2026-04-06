import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGlobalStoriesApi, toggleLikeStoryApi, addCommentToStoryApi } from '../api/storyApi'; 
import StoryCard from '../components/story/StoryCard'; 
import { motion } from 'framer-motion'; // 🔥 IMPORTED FRAMER MOTION

function HomePage() {
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
      const data = await toggleLikeStoryApi(storyId);
      setStories(stories.map(s => {
        if (s._id === storyId) {
          const hasLiked = s.likes.includes(user._id);
          const newLikes = hasLiked 
            ? s.likes.filter(id => id !== user._id) 
            : [...s.likes, user._id];
          return { ...s, likes: newLikes };
        }
        return s;
      }));
    } catch (err) { console.error('Like failed', err); }
  };

  const handleComment = async (storyId, text) => {
    try {
      const data = await addCommentToStoryApi(storyId, text);
      setStories(stories.map(s => {
        if (s._id === storyId) {
          return { ...s, comments: data.comments }; 
        }
        return s;
      }));
    } catch (err) { console.error('Comment failed', err); }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', paddingBottom: '40px', paddingTop: '40px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Elegant Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a', fontWeight: '900', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            The Global Vault 🌍
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '1.1rem' }}>
            Discover and cherish legacy stories from around the world.
          </p>
          <div style={{ width: '60px', height: '3px', background: '#d4af37', margin: '20px auto 0 auto', borderRadius: '2px' }}></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
            Dusting off the archives... ⏳
          </div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fafaf9', borderRadius: '12px', border: '1px dashed #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '40px' }}>📭</span>
            <p style={{ color: '#475569', fontWeight: '700', fontSize: '18px', marginTop: '16px' }}>
              The vault is currently empty.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 🔥 PREMIUM STAGGERED FEED ANIMATION */}
            {stories.map((story, index) => (
              <motion.div 
                key={story._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              >
                <StoryCard 
                  story={story} 
                  currentUser={user}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;