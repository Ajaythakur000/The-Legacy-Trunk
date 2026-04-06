import { useEffect, useState, useMemo } from 'react';
import { getMyStoriesApi, deleteStoryApi, toggleLikeStoryApi, addCommentToStoryApi, updateStoryApi } from '../../api/storyApi';
import StoryCard from './StoryCard';
import StorySkeleton from '../shared/StorySkeleton'; // 🔥 Skeleton add kar diya
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // 🔥 Framer motion for magic
import toast from 'react-hot-toast';

function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 🔥 Naya state filter ke liye

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

  useEffect(() => {
    loadMyStories();
  }, []);

  // Actions
  const handleLike = async (id) => {
    try {
      await toggleLikeStoryApi(id);
      await loadMyStories();
      toast.success('Liked! 👍');
    } catch (err) { toast.error('Failed to like ❌'); }
  };

  const handleComment = async (id, text) => {
    const tId = toast.loading('Posting comment...');
    try {
      await addCommentToStoryApi(id, text);
      await loadMyStories();
      toast.success('Comment added! 💬', { id: tId });
    } catch (err) { toast.error('Could not post comment ❌', { id: tId }); }
  };

  const handleDelete = async (id) => {
    const tId = toast.loading('Deleting story...');
    try {
      await deleteStoryApi(id);
      await loadMyStories(); 
      toast.success('Story deleted successfully 🗑️', { id: tId });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete story ❌', { id: tId }); }
  };

  const handleEdit = async (storyId, updatedData) => {
    const tId = toast.loading('Updating story...');
    try {
      await updateStoryApi(storyId, updatedData);
      await loadMyStories(); 
      toast.success('Hogyi edit, ja maje kar! 🎉', { id: tId });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update story ❌', { id: tId }); }
  };

  // 🔥 FILTER LOGIC
  const filteredStories = useMemo(() => {
    if (activeFilter === 'milestone') return stories.filter(s => s.isMilestone);
    if (activeFilter === 'global') return stories.filter(s => s.isGlobalPublic);
    return stories;
  }, [stories, activeFilter]);

  // Filter Tabs Configuration
  const filters = [
    { id: 'all', label: '📚 All Memories' },
    { id: 'milestone', label: '🌟 Milestones' },
    { id: 'global', label: '🌍 Global Public' }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px', paddingTop: '40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* ✨ PREMIUM HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              fontSize: '3rem', fontWeight: '900', margin: '0 0 10px 0', 
              background: 'linear-gradient(135deg, #0f172a, #3b82f6)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}
          >
            My Personal Archive
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'inline-block', background: '#e0e7ff', color: '#4338ca', padding: '6px 16px', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '700' }}
          >
            You have preserved {stories.length} memories 🔒
          </motion.div>
        </div>

        {/* 🔥 SLIDING FILTER TABS */}
        {!loading && stories.length > 0 && (
          <div style={{ 
            display: 'flex', background: '#e2e8f0', borderRadius: '30px', padding: '6px', 
            marginBottom: '40px', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
            flexWrap: 'wrap', gap: '5px'
          }}>
            {filters.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    flex: 1, padding: '12px 16px', border: 'none', background: 'transparent',
                    cursor: 'pointer', position: 'relative', zIndex: 2, fontWeight: '700',
                    color: isActive ? '#0f172a' : '#64748b', transition: 'color 0.3s ease',
                    fontSize: '0.95rem', minWidth: '120px'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="my-stories-filter"
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: '#ffffff', borderRadius: '25px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* FEED SECTION */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <StorySkeleton />
            <StorySkeleton />
          </div>
        ) : stories.length === 0 ? (
          /* ✨ PREMIUM EMPTY STATE (When completely 0 stories) */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '2px dashed #cbd5e1', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}
          >
            <span style={{ fontSize: '60px', display: 'block', marginBottom: '16px' }}>📭</span>
            <h3 style={{ color: '#1e293b', margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '800' }}>Your archive is empty</h3>
            <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '1.1rem' }}>You haven't added any personal stories to the vault yet.</p>
          </motion.div>
        ) : filteredStories.length === 0 ? (
          /* ✨ EMPTY STATE FOR SPECIFIC FILTER */
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '40px', background: '#f1f5f9', borderRadius: '16px', color: '#64748b', fontWeight: '600' }}
          >
            No stories found in this category. 🔍
          </motion.div>
        ) : (
          /* ✨ STAGGERED ANIMATED FEED */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AnimatePresence mode="popLayout">
              {filteredStories.map((s, index) => (
                <motion.div 
                  key={s._id} 
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
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