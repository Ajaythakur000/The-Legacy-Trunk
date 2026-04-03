import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 👇 NOTE: Apne API function ka naam check kar lena, jo 'Explore' page me use ho raha tha
import { getGlobalStoriesApi } from '../api/storyApi'; 

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

  const timeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#111827', fontWeight: '800' }}>Global Feed 🌍</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280' }}>Discover public stories from all families.</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading stories... ⏳</div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px', border: '1px dashed #d1d5db' }}>
            <span style={{ fontSize: '30px' }}>📭</span>
            <p style={{ color: '#4b5563', fontWeight: '600' }}>No public stories yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {stories.map((story) => (
              <div 
                key={story._id} 
                style={{ 
                  background: '#fff', 
                  borderRadius: '16px', 
                  border: '1px solid #e5e7eb', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}
              >
                {/* 👤 Card Header: Avatar + Info */}
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  <img 
                    src={story.user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                    alt="Author DP" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} 
                  />
                  <div>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                      {story.user?.name || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {timeAgo(story.createdAt)} • {story.familyCircle?.circleName || 'Public'}
                    </div>
                  </div>
                </div>

                {/* 📝 Card Body: Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>{story.title}</h3>
                  <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.5', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                    {story.content}
                  </p>
                </div>

                {/* 📸 Card Media (If any) */}
                {story.mediaUrl && (
                  <div style={{ width: '100%', maxHeight: '400px', backgroundColor: '#f3f4f6' }}>
                    {story.mediaType?.includes('video') ? (
                      <video src={story.mediaUrl} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                    ) : (
                      <img src={story.mediaUrl} alt="Story Media" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                    )}
                  </div>
                )}

                {/* 👍 Card Footer (Actions) */}
                <div style={{ padding: '12px 16px', background: '#f8fafc', display: 'flex', gap: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <Link to={`/vault-stories/${story._id}`} style={{ textDecoration: 'none', color: '#4b5563', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💬 View Details
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;