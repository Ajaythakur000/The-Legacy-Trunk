import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchContentApi } from '../api/searchApi';
import StoryCard from '../components/story/StoryCard';
import { useAuth } from '../context/AuthContext';

function SearchResultsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await searchContentApi(query);
        // User ne bola "Sirf posts rakhte hain", toh hum sirf stories render karenge
        setResults(data.stories || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '900', letterSpacing: '-1px' }}>
          Search Results
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
          Showing memories matching: <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontWeight: 'bold' }}>
          🔍 Searching the vault...
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {results.map((story) => (
            <StoryCard 
              key={story._id} 
              story={story} 
              currentUser={user}
              onLike={() => {}} // Disabled in search view to keep it simple, or pass exact handlers
              onComment={() => {}}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #cbd5e1' }}>
          <span style={{ fontSize: '60px', opacity: 0.5, display: 'block', marginBottom: '20px' }}>🕸️</span>
          <h3 style={{ color: '#334155', margin: '0 0 10px 0', fontSize: '1.5rem' }}>No memories found</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Try searching with different keywords or tags.</p>
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;