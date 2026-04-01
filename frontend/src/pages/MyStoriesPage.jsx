import { useEffect, useState } from 'react';
import { getMyStoriesApi, deleteStoryApi, toggleLikeStoryApi, addCommentToStoryApi, updateStoryApi } from '../api/storyApi';
import StoryCard from '../components/story/StoryCard';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import toast from 'react-hot-toast';
function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      toast.error('Failed to like ❌');
    }
  };

  const handleComment = async (id, text) => {
    const tId = toast.loading('Posting comment...');
    try {
      await addCommentToStoryApi(id, text);
      await loadMyStories();
      toast.success('Comment added! 💬', { id: tId });
    } catch (err) {
      toast.error('Could not post comment ❌', { id: tId });
    }
  };

  const handleDelete = async (id) => {
    const tId = toast.loading('Deleting story...');
    try {
      await deleteStoryApi(id);
      await loadMyStories(); // Screen se gayab karne ke liye reload
      toast.success('Story deleted successfully 🗑️', { id: tId });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete story ❌', { id: tId });
    }
  };

  const handleEdit = async (storyId, updatedData) => {
    const tId = toast.loading('Updating story...');
    try {
      await updateStoryApi(storyId, updatedData);
      await loadMyStories(); // Data refresh karne ke liye
      toast.success('Hogyi edit, ja maje kar! 🎉', { id: tId });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update story ❌', { id: tId });
    }
  };
  return (
    <div>
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          My Posted Stories 📁
        </h1>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading your stories...</p>
        ) : stories.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280', background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
            You haven't posted any stories yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {stories.map((s) => (
              <StoryCard 
                key={s._id} 
                story={s} 
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyStoriesPage;