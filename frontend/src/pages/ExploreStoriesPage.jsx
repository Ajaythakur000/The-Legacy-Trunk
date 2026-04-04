import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStoriesApi } from '../api/storyApi';
import Navbar from '../components/shared/Navbar';

function ExploreStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'media', 'text'
  const [sortBy, setSortBy] = useState('latest'); // 🔥 NAYA: 'latest', 'most_liked'

  const loadExploreFeed = async () => {
    setLoading(true);
    try {
      const data = await getGlobalStoriesApi();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load explore stories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExploreFeed();
  }, []);

  // 🔥 Filter AND Sort Logic combined
  const processedStories = [...stories]
    .filter(s => {
      if (activeFilter === 'media') return s.mediaUrl;
      if (activeFilter === 'text') return !s.mediaUrl;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'most_liked') {
        return (b.likes?.length || 0) - (a.likes?.length || 0); // Most likes upar
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Latest upar
    });

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar /> 

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* 🎨 Premium Explore Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '20px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            background: 'linear-gradient(to right, #8b5cf6, #ec4899)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px' 
          }}>
            Discover the Vault 🌍
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Explore public moments, recipes, and memories from other families.
          </p>
        </div>

        {/* 🎛️ Filters & Sorting Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {['all', 'media', 'text'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setActiveFilter(filterType)}
                style={{
                  padding: '8px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize',
                  background: activeFilter === filterType ? '#111827' : '#e5e7eb',
                  color: activeFilter === filterType ? '#fff' : '#4b5563',
                  transition: 'all 0.2s'
                }}
              >
                {filterType === 'all' ? '🔥 All Posts' : filterType === 'media' ? '📸 Media' : '✍️ Discussions'}
              </button>
            ))}
          </div>

          {/* 🔥 Sorting Dropdown */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: '#fff', fontWeight: 'bold', color: '#374151', cursor: 'pointer', outline: 'none' }}
          >
            <option value="latest">🕒 Latest First</option>
            <option value="most_liked">❤️ Most Liked</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : processedStories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '40px' }}>🔭</span>
            <h3 style={{ color: '#374151', marginTop: '16px' }}>No stories found!</h3>
            <p style={{ color: '#9ca3af' }}>Try changing the filter or check back later.</p>
          </div>
        ) : (
          /* 🧱 Masonry CSS Grid Trick */
          <div style={{ columnCount: 3, columnGap: '16px', '@media (max-width: 768px)': { columnCount: 2 }, '@media (max-width: 480px)': { columnCount: 1 } }}>
            {processedStories.map((story) => (
              <Link 
                to={`/vault-stories/${story._id}`} 
                key={story._id}
                style={{ 
                  display: 'block', breakInside: 'avoid', marginBottom: '16px', textDecoration: 'none', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                }}
                className="explore-card"
              >
                
                {/* 🔥 THE GLOBAL PUBLIC BADGE */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(4px)', zIndex: 10 }}>
                  🌍 Public
                </div>

                {/* Agar Media hai toh Image dikhao */}
                {story.mediaUrl ? (
                  <img src={story.mediaUrl} alt={story.title} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                ) : (
                  /* Agar sirf Text hai toh ek colorful box dikhao */
                  <div style={{ padding: '24px', background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)', minHeight: '150px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>{story.title}</h3>
                    <p style={{ color: '#4b5563', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {story.content}
                    </p>
                  </div>
                )}

                {/* 🌑 Hover Overlay (Instagram style) */}
                <div 
                  className="card-overlay"
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', opacity: 0, transition: 'opacity 0.2s', backdropFilter: 'blur(2px)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>❤️ {story.likes?.length || 0}</span>
                    <span>💬 {story.comments?.length || 0}</span>
                  </div>
                  <span style={{ marginTop: '12px', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}>
                    by {story?.user?.name?.split(' ')[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 💅 CSS for Hover Effects */}
      <style>{`
        .explore-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .explore-card:hover .card-overlay { opacity: 1 !important; }
        @media (max-width: 768px) { div[style*="columnCount: 3"] { column-count: 2 !important; } }
        @media (max-width: 480px) { div[style*="columnCount: 3"] { column-count: 1 !important; } }
      `}</style>
    </div>
  );
}

export default ExploreStoriesPage;