import { useEffect, useState, useMemo } from 'react';
import { getMyStoriesApi, deleteStoryApi, toggleLikeStoryApi, addCommentToStoryApi, updateStoryApi } from '../../api/storyApi';
import StoryCard from './StoryCard';
import StorySkeleton from '../shared/StorySkeleton';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Filter Tabs (Comic Buttons) ────────────────────────────────────────────────
function FilterTabs({ filters, activeFilter, onFilterChange }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      {filters.map(f => {
        const isActive = activeFilter === f.id;
        return (
          <motion.button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              background: isActive ? '#C89B3C' : '#FFF',
              border: 'none',
              borderRadius: 12,
              fontFamily: "'Playfair Display', serif",
              fontSize: 16,
              color: '#3E2723',
              cursor: 'pointer',
              boxShadow: isActive ? '4px 4px 0px 0px #3E2723' : '2px 2px 0px 0px #3E2723',
              transform: isActive ? 'translate(-2px, -2px)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s'
            }}
          >
            {f.label.toUpperCase()}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ hasStories }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      style={{
        textAlign: 'center', padding: '60px 20px',
        background: '#FFF',
        border: '6px solid #3E2723',
        borderRadius: 24,
        boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)',
        margin: '20px 0'
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 20 }}>
        {hasStories ? '🔍' : '📭'}
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif", color: '#1E352F',
        fontSize: 32, margin: '0 0 12px', letterSpacing: 1,
        textShadow: '2px 2px 0px #3E2723', WebkitTextStroke: '1px #3E2723'
      }}>
        {hasStories ? 'NOTHING IN THIS PILE!' : 'YOUR SCRAPBOOK IS EMPTY!'}
      </h3>
      <p style={{
        fontFamily: "'Baloo 2', sans-serif", fontWeight: 700,
        fontSize: 18, color: '#3E2723', margin: 0
      }}>
        {hasStories
          ? 'No memories found in this category. Try another filter.'
          : "You haven't pasted any personal stories in here yet. Go add some!"}
      </p>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all',       label: 'All Memories' },
    { id: 'milestone', label: 'Milestones'   },
    { id: 'global',    label: 'Global'       },
  ];

  const loadMyStories = async () => {
    setLoading(true);
    try {
      const data = await getMyStoriesApi();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load my stories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMyStories(); }, []);

  // Optimistic Like Update
  const handleLike = async (id) => {
    setStories(prevStories => prevStories.map(story => {
      if (story._id === id) {
        const isLikedByMe = story.likes?.includes(user._id);
        const newLikes = isLikedByMe 
          ? story.likes.filter(userId => String(userId) !== String(user._id)) 
          : [...(story.likes || []), user._id];
        return { ...story, likes: newLikes };
      }
      return story;
    }));

    try { 
      await toggleLikeStoryApi(id); 
    } catch { 
      await loadMyStories();
      toast.error('Failed to like'); 
    }
  };

  // Optimistic Comment Update
  const handleComment = async (id, text) => {
    const tId = toast.loading('Posting...');
    try { 
      const response = await addCommentToStoryApi(id, text); 
      setStories(prevStories => prevStories.map(story => {
        if(story._id === id) {
           return {
             ...story,
             comments: [...(story.comments || []), response.data || { _id: Date.now(), text, user }]
           };
        }
        return story;
      }));
      toast.success('Comment added!', { id: tId }); 
    } catch { 
      toast.error('Could not post', { id: tId }); 
    }
  };

  const handleDelete  = async (id) => {
    const tId = toast.loading('Ripping from scrapbook...');
    try { 
      await deleteStoryApi(id); 
      setStories(prev => prev.filter(s => s._id !== id)); 
      toast.success('Memory thrown away! 🗑️', { id: tId }); 
    }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete', { id: tId }); }
  };
  
  const handleEdit    = async (storyId, updatedData) => {
    const tId = toast.loading('Updating memory...');
    try { 
      const res = await updateStoryApi(storyId, updatedData); 
      setStories(prev => prev.map(s => s._id === storyId ? {...s, ...updatedData} : s)); 
      toast.success('Memory updated! 💥', { id: tId }); 
    }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to update', { id: tId }); }
  };

  const filteredStories = useMemo(() => {
    if (activeFilter === 'milestone') return stories.filter(s => s.isMilestone);
    if (activeFilter === 'global')    return stories.filter(s => s.isGlobalPublic);
    return stories;
  }, [stories, activeFilter]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      
      {/* ── HERO HEADER ── */}
      <div style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 20 }}>
        <motion.div 
          animate={{ rotate: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 4 }}
          style={{ fontSize: 80, display: 'inline-block', filter: 'drop-shadow(4px 4px 0px #3E2723)', marginBottom: 10 }}
        >
          🖼️
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            color: '#D4B895', textShadow: '4px 4px 0px #3E2723', WebkitTextStroke: '2px #3E2723',
            margin: '0 0 16px', letterSpacing: 2
          }}
        >
          MY SCRAPBOOK
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'inline-block', background: '#1E352F', border: 'none',
            borderRadius: 12, padding: '8px 16px', fontFamily: "'Playfair Display', serif",
            fontSize: 16, color: '#FFF', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)',
            transform: 'rotate(2deg)'
          }}
        >
          {loading ? 'FLIPPING PAGES...' : `HOARDING ${stories.length} MEMORIES`}
        </motion.div>
      </div>

      {/* ── FILTER TABS ── */}
      {!loading && stories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 680, margin: '0 auto 36px', padding: '0 20px' }}
        >
          <FilterTabs filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </motion.div>
      )}

      {/* ── FEED ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <StorySkeleton />
            <StorySkeleton />
          </div>
        ) : stories.length === 0 ? (
          <EmptyState hasStories={false} />
        ) : filteredStories.length === 0 ? (
          <EmptyState hasStories={true} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AnimatePresence mode="popLayout">
              {filteredStories.map((s) => (
                <motion.div
                  key={s._id} layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                >
                  <StoryCard
                    story={s}
                    currentUser={user}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}

export default MyStoriesPage;