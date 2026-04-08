// File Path: src/components/feed/FamilyLedgerFeed.jsx
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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
    const tId = toast.loading('Whispering to the vault... ✍️');
    try {
      await addCommentToStoryApi(storyId, text);
      await loadFeed();
      toast.success('Comment sealed! 💬', { id: tId });
    } catch (e) { toast.error('Failed to comment ❌', { id: tId }); }
  };

  const handleDelete = async (storyId) => {
    const tId = toast.loading('Erasing memory... 🗑️');
    try {
      await deleteStoryApi(storyId);
      await loadFeed();
      toast.success('Memory erased completely! 💥', { id: tId });
    } catch (err) { toast.error('Failed to delete ❌', { id: tId }); }
  };

  const sortedStories = useMemo(() => [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [stories]);

  if (!activeCircleId) {
    return (
      <div style={{ textAlign: 'center', background: '#fef2f2', padding: '40px', borderRadius: '24px', border: '1px solid #fca5a5' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔐</span>
        <h3 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '1.5rem' }}>No Vault Selected</h3>
        <p style={{ color: '#b91c1c', margin: 0 }}>Please select a Family Circle to view stories.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #ef4444', marginBottom: '24px' }}>{error}</div>}
      
      {loadingFeed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <StorySkeleton /><StorySkeleton /><StorySkeleton />
        </div>
      ) : sortedStories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #cbd5e1' }}>
          <span style={{ fontSize: '60px', opacity: 0.4, filter: 'grayscale(100%)', display: 'block', marginBottom: '20px' }}>📸</span>
          <h3 style={{ color: '#334155', margin: '0 0 10px 0', fontSize: '1.5rem' }}>The vault is empty!</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Head to Vault Stories to be the first to save a memory.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sortedStories.map((s, index) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}>
              <StoryCard story={s} currentUser={user} onLike={handleLike} onComment={handleCommentSubmit} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}