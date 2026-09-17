import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getCircleFeedApi, toggleLikeStoryApi, addCommentToStoryApi, deleteStoryApi } from '../../api/storyApi';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket.js';
import StoryCard from '../story/StoryCard';
import StorySkeleton from '../shared/StorySkeleton';

export default function FamilyLedgerFeed() {
  const { user } = useAuth();
  const activeCircleId = user?.activeCircleId || null;

  const [stories, setStories] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [error, setError] = useState('');

  const loadFeed = async () => {
    if (!activeCircleId) return;
    setLoadingFeed(true);
    setError('');
    try {
      const data = await getCircleFeedApi(activeCircleId); 
      setTimeout(() => {
        setStories(Array.isArray(data) ? data : []);
        setLoadingFeed(false);
      }, 600); 
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load circle feed');
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (activeCircleId) { loadFeed(); } else { setStories([]); }
  }, [activeCircleId]);
    
 useEffect(() => {
  const socket = getSocket();
  if (!activeCircleId || !socket) return;

  socket.emit('join_story_feed', { circleId: activeCircleId });

  const onNewStory = (incoming) => {
    setStories((prev) => {
      if (prev.some((x) => x._id === incoming._id)) return prev;
      return [incoming, ...prev];
    });
  };

  socket.off('new_story_added', onNewStory);
  socket.on('new_story_added', onNewStory);

  return () => {
    socket.emit('leave_story_feed', { circleId: activeCircleId });
    socket.off('new_story_added', onNewStory);
  };
}, [activeCircleId]);

  const handleLike = async (storyId) => {
    setStories((prev) => prev.map((s) => {
      if (s._id === storyId) {
        const hasLiked = s.likes?.includes(user._id);
        const newLikes = hasLiked ? s.likes.filter(id => id !== user._id) : [...(s.likes || []), user._id];      
        return { ...s, likes: newLikes };
      }
      return s;
    }));
    try {
      await toggleLikeStoryApi(storyId);
      toast.success('Heart added! ❤️'); 
    } catch (e) {
      toast.error('Network glitch, please try again ❌');
      loadFeed(); 
    }
  };

  const handleCommentSubmit = async (storyId, text) => {
    const tId = toast.loading('Scribbling note... ✍️');
    try {
      await addCommentToStoryApi(storyId, text);
      await loadFeed();
      toast.success('Note attached! 💬', { id: tId });
    } catch (e) { toast.error('Failed to comment ❌', { id: tId }); }
  };

  const handleDelete = async (storyId) => {
    const tId = toast.loading('Ripping page out... 🗑️');
    try {
      await deleteStoryApi(storyId);
      await loadFeed();
      toast.success('Page ripped out! 💥', { id: tId });
    } catch (err) { toast.error('Failed to delete ❌', { id: tId }); }
  };

  const sortedStories = useMemo(() => [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [stories]);

  // NEW COMIC UI FOR EMPTY/LOCKED STATES
  if (!activeCircleId) {
    return (
      <div style={{ textAlign: 'center', background: '#FFF', padding: '40px', borderRadius: 24, border: '6px solid #3E2723', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)' }}>
        <span style={{ fontSize: 60, display: 'block', marginBottom: 16 }}>🔐</span>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#D4B895', margin: '0 0 8px', fontSize: 32 }}>VAULT LOCKED!</h3>
        <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, color: '#3E2723', margin: 0, fontSize: 18 }}>Select a Family Circle to see the scrapbook.</p>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ background: '#1E352F', padding: '16px', borderRadius: 16, border: 'none', marginBottom: '24px', fontFamily: "'Playfair Display', serif", color: '#FFF', textAlign: 'center', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)' }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {loadingFeed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          <StorySkeleton /><StorySkeleton /><StorySkeleton />
        </div>
      ) : sortedStories.length === 0 ? (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '80px 20px', background: '#FFF', borderRadius: 24, border: '6px solid #3E2723', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)' }}>
          <span style={{ fontSize: 80, display: 'block', marginBottom: 20 }}>👻</span>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#3E2723', margin: '0 0 10px', fontSize: 32 }}>NOTHING TO SEE HERE!</h3>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, color: '#3E2723', margin: 0, fontSize: 18 }}>Be the first to paste a memory into the scrapbook!</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <AnimatePresence mode="popLayout">
            {sortedStories.map((s, index) => (
              <motion.div key={s._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}>
                <StoryCard story={s} currentUser={user} onLike={handleLike} onComment={handleCommentSubmit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}