import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoryByIdApi, toggleLikeStoryApi, addCommentToStoryApi, deleteStoryApi } from '../api/storyApi';
import StoryCard from '../components/story/StoryCard';
import { useAuth } from '../context/AuthContext';

function StoryDetailPage() {
  const { storyId } = useParams(); // 🔥 URL se ID nikal li
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

  // Actions
  const handleLike = async (id) => {
    try {
      await toggleLikeStoryApi(id);
      await loadStory(); // Refresh story data to show new likes
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to like story');
    }
  };

  const handleComment = async (id, text) => {
    try {
      await addCommentToStoryApi(id, text);
      await loadStory(); // Refresh story data to show new comments
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStoryApi(id);
      alert('Story deleted successfully');
      navigate('/vault-stories'); // Delete hone ke baad feed par wapas bhej do
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete story');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Story... ⏳</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'crimson' }}>{error}</div>;
  if (!story) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Story not found! 🕵️‍♂️</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <button 
        onClick={() => navigate('/vault-stories')}
        style={{ marginBottom: '16px', padding: '8px 12px', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px' }}
      >
        ⬅️ Back to Feed
      </button>

      {/* 🔥 Reuse kar liya apna smart component */}
      <StoryCard 
        story={story} 
        currentUser={user} 
        onLike={handleLike} 
        onComment={handleComment} 
        onDelete={handleDelete}
        isDetailView={true} // Taki isme title dobara clickable na ho aur photo badi dikhe
      />
    </div>
  );
}

export default StoryDetailPage;