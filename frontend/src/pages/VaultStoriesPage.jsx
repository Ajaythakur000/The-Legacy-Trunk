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

// 🔥 Naye Components Import kiye
import StoryComposer from '../components/story/StoryComposer';
import StoryCard from '../components/story/StoryCard';

function VaultStoriesPage() {
  const { user } = useAuth();
  
  // STRICT BINDING
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

  // AUTO-REFETCH
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

    // 🔥 Duplicate event listeners na bane isliye pehle purana hatao
    socket.off('new_story_added'); 

    const onNewStory = (incoming) => {
      setStories((prev) => {
        // 🔥 Strict duplicate check
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

  // ACTIONS PROPS FOR CHILD COMPONENTS
  const handlePostStory = async (formData) => {
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      await createStoryApi(formData);
      setSuccess('Story created successfully');
      await loadFeed();
    } catch (e) {
      console.error('createStory failed:', e?.response?.data || e);
      setError(e?.response?.data?.message || e?.message || 'Failed to create story');
      throw e; // Error ko composer tak phekna taaki wo dikha sake
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (storyId) => {
    // ⚡ Optimistic UI: Turant UI pe like count/status change karo (API se pehle)
    setStories((prev) => 
      prev.map((s) => {
        if (s._id === storyId) {
          const hasLiked = s.likes?.includes(user._id);
          const newLikes = hasLiked 
            ? s.likes.filter(id => id !== user._id) // Unlike kiya
            : [...(s.likes || []), user._id];       // Like kiya
          return { ...s, likes: newLikes };
        }
        return s;
      })
    );

    try {
      // Piche API call jayegi chupchaap
      await toggleLikeStoryApi(storyId);
      
      toast.success('Like updated! 👍'); 
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update like ❌');
      // ❌ Agar API fail hui, to UI original jaisa karne ke liye `loadFeed()` call kardo
      loadFeed(); 
    }
  };;

  const handleCommentSubmit = async (storyId, text) => {
    const tId = toast.loading('Posting comment... ✍️');
    try {
      await addCommentToStoryApi(storyId, text);
      await loadFeed();
      toast.success('Comment added! 💬', { id: tId });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add comment ❌', { id: tId });
    }
  };

  const handleDelete = async (storyId) => {
    const tId = toast.loading('Deleting story... 🗑️');
    try {
      await deleteStoryApi(storyId);
      await loadFeed();
      toast.success('Story deleted permanently! 💥', { id: tId });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete story ❌', { id: tId });
    }
  };

  const sortedStories = useMemo(
    () => [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [stories]
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '8px', color: '#111827' }}>Vault Stories</h1>
      
      {!activeCircleId ? (
        <p style={{ color: '#92400e', background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
          Please select a Family Circle from the top navigation to view or post stories.
        </p>
      ) : (
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Posting to: <b style={{ color: '#374151' }}>{activeCircleId}</b>
        </p>
      )}

      {error ? <p style={{ color: 'crimson', background: '#fef2f2', padding: '12px', borderRadius: '8px' }}>{error}</p> : null}
      {success ? <p style={{ color: '#166534', background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>{success}</p> : null}

      {/* 🔥 KACHRA GONE! Sirf ek line mein Composer aa gaya */}
      <StoryComposer 
        activeCircleId={activeCircleId} 
        onPostStory={handlePostStory} 
        uploading={uploading} 
      />

      <div>
        <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px', color: '#1f2937' }}>
          Circle Feed
        </h3>
        
        {loadingFeed ? <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Loading stories...</p> : null}

        {sortedStories.length === 0 && !loadingFeed ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
            No stories available in this circle. Be the first to post!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 🔥 KACHRA GONE! Har story ab apne aap ek Card mein dikhegi */}
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
    </div>
  );
}

export default VaultStoriesPage;