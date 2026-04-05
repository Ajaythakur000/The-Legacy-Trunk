import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  addCommentToStoryApi,
  createStoryApi,
  getCircleFeedApi,
  toggleLikeStoryApi,
  deleteStoryApi
} from '../api/storyApi';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket.js';

import StoryComposer from '../components/story/StoryComposer';
import StoryCard from '../components/story/StoryCard';

function VaultStoriesPage() {
  const { user } = useAuth();
  const activeCircleId = user?.activeCircleId || null;

  const [stories, setStories] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadFeed = async () => {
    if (!activeCircleId) return;
    setLoadingFeed(true);
    setError('');
    try {
      const data = await getCircleFeedApi(activeCircleId); 
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load circle feed');
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (activeCircleId) {
      loadFeed();
    } else {
      setStories([]); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCircleId]);
    
  // SOCKET INTEGRATION
  useEffect(() => {
    const socket = getSocket();
    if (!activeCircleId || !socket) return;

    socket.emit('join_story_feed', { circleId: activeCircleId });
    socket.off('new_story_added'); 

    const onNewStory = (incoming) => {
      setStories((prev) => {
        const exists = prev.some((x) => x._id === incoming._id);
        if (exists) return prev;
        return [incoming, ...prev];
      });
    };

    socket.on('new_story_added', onNewStory);

    return () => {
      socket.emit('leave_story_feed', { circleId: activeCircleId });
      socket.off('new_story_added', onNewStory);
    };
  }, [activeCircleId]);

  const handlePostStory = async (formData) => {
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      await createStoryApi(formData);
      setSuccess('Memory securely locked in the vault! 🔐');
      await loadFeed();
    } catch (e) {
      console.error('createStory failed:', e?.response?.data || e);
      setError(e?.response?.data?.message || e?.message || 'Failed to weave memory');
      throw e; 
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (storyId) => {
    setStories((prev) => 
      prev.map((s) => {
        if (s._id === storyId) {
          const hasLiked = s.likes?.includes(user._id);
          const newLikes = hasLiked 
            ? s.likes.filter(id => id !== user._id) 
            : [...(s.likes || []), user._id];       
          return { ...s, likes: newLikes };
        }
        return s;
      })
    );

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
    } catch (e) {
      toast.error('Failed to comment ❌', { id: tId });
    }
  };

  const handleDelete = async (storyId) => {
    const tId = toast.loading('Erasing memory... 🗑️');
    try {
      await deleteStoryApi(storyId);
      await loadFeed();
      toast.success('Memory erased completely! 💥', { id: tId });
    } catch (err) {
      toast.error('Failed to delete ❌', { id: tId });
    }
  };

  const sortedStories = useMemo(
    () => [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [stories]
  );

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '60px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ✨ WOW HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '50px', animation: 'fadeInDown 0.8s ease' }}>
        <h1 style={{ 
          fontSize: '3.5rem', fontWeight: '900', margin: '0 0 12px 0', 
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px', lineHeight: '1.2'
        }}>
          Weave a Memory ✨
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#64748b', margin: '0 auto', maxWidth: '500px', lineHeight: '1.5' }}>
          Every family has a story. Chronicle yours for the generations to come.
        </p>
        
        {activeCircleId && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '8px 20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '99px', fontSize: '0.9rem', color: '#1d4ed8', fontWeight: '700', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.1)' }}>
            <span>🏰</span> Active Vault: Encrypted & Safe
          </div>
        )}
      </div>
      
      {!activeCircleId ? (
        <div style={{ textAlign: 'center', background: '#fef2f2', padding: '40px', borderRadius: '24px', border: '1px solid #fca5a5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔐</span>
          <h3 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '1.5rem' }}>No Vault Selected</h3>
          <p style={{ color: '#b91c1c', margin: 0, fontSize: '1.1rem' }}>Please select a Family Circle from the top navigation to view or post stories.</p>
        </div>
      ) : (
        <>
          {error && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #ef4444', marginBottom: '24px', fontWeight: '600' }}>{error}</div>}
          {success && <div style={{ color: '#15803d', background: '#f0fdf4', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #22c55e', marginBottom: '24px', fontWeight: '600' }}>{success}</div>}

          {/* ✍️ STORY COMPOSER (With AI Magic Inside) */}
          <div style={{ animation: 'fadeInUp 0.8s ease 0.1s both' }}>
            <StoryComposer 
              activeCircleId={activeCircleId} 
              onPostStory={handlePostStory} 
              uploading={uploading} 
            />
          </div>

          <div style={{ marginTop: '70px', animation: 'fadeInUp 0.8s ease 0.2s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>📜 The Family Ledger</h3>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {sortedStories.length} Memories
              </span>
            </div>
            
            {loadingFeed ? (
               <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                  <p style={{ color: '#64748b', marginTop: '20px', fontWeight: '600', letterSpacing: '1px' }}>Dusting off the old books...</p>
               </div>
            ) : null}

            {sortedStories.length === 0 && !loadingFeed ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #cbd5e1' }}>
                <span style={{ fontSize: '60px', opacity: 0.4, filter: 'grayscale(100%)', display: 'block', marginBottom: '20px' }}>📸</span>
                <h3 style={{ color: '#334155', margin: '0 0 10px 0', fontSize: '1.5rem' }}>The vault is empty!</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Be the first to weave a memory into the family trunk.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {sortedStories.map((s) => (
                  <StoryCard 
                    key={s._id} 
                    story={s} 
                    currentUser={user}
                    onLike={handleLike}
                    onComment={handleCommentSubmit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default VaultStoriesPage;