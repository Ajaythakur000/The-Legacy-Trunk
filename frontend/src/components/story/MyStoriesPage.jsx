/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react';
import { getMyStoriesApi, deleteStoryApi, toggleLikeStoryApi, addCommentToStoryApi, updateStoryApi } from '../../api/storyApi';
import StoryCard from './StoryCard';
import StorySkeleton from '../shared/StorySkeleton';
import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';
import { BookOpen, FolderOpen, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

function FilterTabs({ filters, activeFilter, onFilterChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(62,39,35,0.2)' }}>
      {filters.map(f => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            style={{
              padding: '12px 24px',
              background: isActive ? '#FDFBF7' : 'transparent',
              border: '1px solid rgba(62,39,35,0.2)',
              borderBottom: isActive ? '1px solid #FDFBF7' : '1px solid rgba(62,39,35,0.2)',
              borderRadius: '8px 8px 0 0',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 14,
              color: isActive ? '#3E2723' : '#8C7B6B',
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            {f.icon && <f.icon size={16} strokeWidth={isActive ? 2 : 1.5} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ hasStories }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center', padding: '60px 40px',
        background: 'rgba(255,255,255,0.4)',
        border: '1px dashed rgba(62,39,35,0.3)',
        margin: '40px auto'
      }}
    >
      <div style={{ marginBottom: 20, color: 'rgba(62,39,35,0.3)', display: 'flex', justifyContent: 'center' }}>
        {hasStories ? <FolderOpen size={64} strokeWidth={1} /> : <Inbox size={64} strokeWidth={1} />}
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif", color: '#3E2723',
        fontSize: 24, margin: '0 0 12px', fontStyle: 'italic'
      }}>
        {hasStories ? 'No entries found.' : 'The archives are empty.'}
      </h3>
      <p style={{
        fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#8C7B6B', margin: 0
      }}>
        {hasStories
          ? 'Try selecting a different folder tab.'
          : 'You haven\'t filed any personal entries here yet. Start writing!'}
      </p>
    </motion.div>
  );
}

function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filters = [
    { id: 'all',       label: 'All Entries', icon: BookOpen },
    { id: 'milestone', label: 'Milestones',  icon: FolderOpen },
    { id: 'global',    label: 'Public',      icon: FolderOpen },
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

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [activeFilter]);

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
    try { await toggleLikeStoryApi(id); } catch { await loadMyStories(); toast.error('Failed to like'); }
  };

  const handleComment = async (id, text) => {
    const tId = toast.loading('Adding note...');
    try { 
      const response = await addCommentToStoryApi(id, text); 
      setStories(prevStories => prevStories.map(story => {
        if(story._id === id) {
           return { ...story, comments: [...(story.comments || []), response.data || { _id: Date.now(), text, user }] };
        }
        return story;
      }));
      toast.success('Note added.', { id: tId }); 
    } catch { toast.error('Failed to add note.', { id: tId }); }
  };

  const handleDelete  = async (id) => {
    const tId = toast.loading('Removing entry...');
    try { 
      await deleteStoryApi(id); 
      setStories(prev => prev.filter(s => s._id !== id)); 
      toast.success('Entry removed.', { id: tId }); 
    } catch (err) { toast.error('Failed to remove.', { id: tId }); }
  };
  
  const handleEdit = async (storyId, updatedData) => {
    const tId = toast.loading('Revising entry...');
    try { 
      const res = await updateStoryApi(storyId, updatedData); 
      setStories(prev => prev.map(s => s._id === storyId ? {...s, ...updatedData} : s)); 
      toast.success('Entry revised.', { id: tId }); 
    } catch (err) { toast.error('Failed to revise.', { id: tId }); }
  };

  const filteredStories = useMemo(() => {
    if (activeFilter === 'milestone') return stories.filter(s => s.isMilestone);
    if (activeFilter === 'global')    return stories.filter(s => s.isGlobalPublic);
    return stories;
  }, [stories, activeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
  const currentStories = filteredStories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, position: 'relative' }}>
      
      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', padding: '60px 20px', marginBottom: 20 }}>
        <BookOpen size={48} color="#C89B3C" strokeWidth={1} style={{ marginBottom: 20 }} />
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#FDFBF7', margin: '0 0 16px', fontWeight: 400, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
        >
          My Journal
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'inline-block', background: 'transparent', border: '1px solid #D4B895', padding: '6px 16px', fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#D4B895', textTransform: 'uppercase', letterSpacing: 2 }}
        >
          {loading ? 'Flipping pages...' : `${stories.length} Entries Filed`}
        </motion.div>
      </div>

      {/* ── FILTER TABS ── */}
      {!loading && stories.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 680, margin: '0 auto 40px', padding: '0 20px' }}>
          <FilterTabs filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </motion.div>
      )}

      {/* ── FEED ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <StorySkeleton />
            <StorySkeleton />
          </div>
        ) : stories.length === 0 ? (
          <EmptyState hasStories={false} />
        ) : filteredStories.length === 0 ? (
          <EmptyState hasStories={true} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <AnimatePresence mode="popLayout">
              {currentStories.map((s) => (
                <motion.div key={s._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
                  <StoryCard story={s} currentUser={user} onLike={handleLike} onComment={handleComment} onDelete={handleDelete} onEdit={handleEdit} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ── VINTAGE PAGINATION ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(62,39,35,0.1)' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ background: 'transparent', border: '1px solid rgba(62,39,35,0.2)', borderRadius: 2, padding: '8px 16px', color: currentPage === 1 ? 'rgba(62,39,35,0.3)' : '#3E2723', cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', transition: 'all 0.2s' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#8C7B6B', fontStyle: 'italic' }}>
                  Page {currentPage} of {totalPages}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ background: 'transparent', border: '1px solid rgba(62,39,35,0.2)', borderRadius: 2, padding: '8px 16px', color: currentPage === totalPages ? 'rgba(62,39,35,0.3)' : '#3E2723', cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', transition: 'all 0.2s' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default MyStoriesPage;
