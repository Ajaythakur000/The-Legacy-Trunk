import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // 🔥 Naya Toast Import
import { getStoryByIdApi, toggleLikeStoryApi, addCommentToStoryApi, deleteStoryApi } from '../api/storyApi';
import StoryCard from '../components/story/StoryCard';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';

function StoryDetailPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStoryByIdApi(storyId);
      setStory(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load story details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storyId) loadStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  // 🔥 Optimistic Like Logic
  const handleLike = async (id) => {
    // 1. Turant UI update karo (API call se pehle)
    setStory((prev) => {
      if (!prev) return prev;
      const hasLiked = prev.likes?.includes(user._id);
      const newLikes = hasLiked 
        ? prev.likes.filter(uid => uid !== user._id) 
        : [...(prev.likes || []), user._id];
      return { ...prev, likes: newLikes };
    });

    // 2. Chupchaap API call bhejo
    try {
      await toggleLikeStoryApi(id);
      toast.success('Liked! 👍');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to like story ❌');
      loadStory(); // API fail hui toh rollback kar lo
    }
  };

  const handleComment = async (id, text) => {
    const tId = toast.loading('Posting comment... ✍️');
    try {
      await addCommentToStoryApi(id, text);
      await loadStory(); // Refresh story data to show new comments
      toast.success('Comment added! 💬', { id: tId });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add comment ❌', { id: tId });
    }
  };

  const handleDelete = async (id) => {
    const tId = toast.loading('Deleting story... 🗑️');
    try {
      await deleteStoryApi(id);
      toast.success('Story deleted successfully 💥', { id: tId });
      navigate('/vault-stories'); // Delete hone ke baad feed par wapas bhej do
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete story ❌', { id: tId });
    }
  };

  if (loading) return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>Loading Story... ⏳</div>
    </div>
  );
  
  if (error) return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'crimson', fontWeight: 'bold' }}>{error}</div>
    </div>
  );
  
  if (!story) return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>Story not found! 🕵️‍♂️</div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '20px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
        <button 
          onClick={() => navigate('/vault-stories')}
          style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          ⬅️ Back to Feed
        </button>

        <StoryCard 
          story={story} 
          currentUser={user} 
          onLike={handleLike} 
          onComment={handleComment} 
          onDelete={handleDelete}
          isDetailView={true} 
        />
      </div>
    </div>
  );
}

export default StoryDetailPage;