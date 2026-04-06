import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGlobalStoriesApi, toggleLikeStoryApi, addCommentToStoryApi } from '../api/storyApi'; 
// 🔥 WE IMPORT OUR NEW PREMIUM CARD
import StoryCard from '../components/story/StoryCard'; 

function HomePage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getGlobalStoriesApi(); // API call to get all public stories
        setStories(Array.isArray(data) ? data : data?.stories || []);
      } catch (error) {
        console.error("Failed to load feed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // 🔥 HANDLE INLINE PROTECT (LIKE)
  const handleLike = async (storyId) => {
    try {
      const data = await toggleLikeStoryApi(storyId);
      // Optimistic update so UI feels instant
      setStories(stories.map(s => {
        if (s._id === storyId) {
          const hasLiked = s.likes.includes(user._id);
          const newLikes = hasLiked 
            ? s.likes.filter(id => id !== user._id) 
            : [...s.likes, user._id];
          return { ...s, likes: newLikes };
        }
        return s;
      }));
    } catch (err) { console.error('Like failed', err); }
  };

  // 🔥 HANDLE INLINE REFLECTION (COMMENT)
  const handleComment = async (storyId, text) => {
    try {
      const data = await addCommentToStoryApi(storyId, text);
      // Update state immediately
      setStories(stories.map(s => {
        if (s._id === storyId) {
          return { ...s, comments: data.comments }; 
        }
        return s;
      }));
    } catch (err) { console.error('Comment failed', err); }
  };

  return (
    // Background matches the Journal vibe
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', paddingBottom: '40px', paddingTop: '40px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Elegant Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a', fontWeight: '900', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            The Global Vault 🌍
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '1.1rem' }}>
            Discover and cherish legacy stories from around the world.
          </p>
          <div style={{ width: '60px', height: '3px', background: '#d4af37', margin: '20px auto 0 auto', borderRadius: '2px' }}></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
            Dusting off the archives... ⏳
          </div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fafaf9', borderRadius: '12px', border: '1px dashed #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '40px' }}>📭</span>
            <p style={{ color: '#475569', fontWeight: '700', fontSize: '18px', marginTop: '16px' }}>
              The vault is currently empty.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 🔥 RENDER OUR PREMIUM STORY CARDS */}
            {stories.map((story) => (
              <StoryCard 
                key={story._id} 
                story={story} 
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
                // No onDelete/onEdit here because it's the global feed. 
                // Only allow edits on "My Stories" page.
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;