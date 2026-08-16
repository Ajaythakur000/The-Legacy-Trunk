import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchContentApi } from '../api/searchApi';
import StoryCard from '../components/story/StoryCard';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

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
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* ── HEADER ── */}
      <div style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '6px solid #171719' }}>
        <h1 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: '48px', color: '#FF3D81', textShadow: '4px 4px 0px #171719', WebkitTextStroke: '2px #171719', margin: '0 0 12px 0', letterSpacing: '2px' }}>
          SEARCH RESULTS
        </h1>
        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: '18px', color: '#171719', margin: 0, background: '#FFD23F', display: 'inline-block', padding: '4px 12px', border: '3px solid #171719', borderRadius: 8, boxShadow: '4px 4px 0px 0px #171719' }}>
          HUNTING FOR: <span style={{ color: '#FF3D81' }}>"{query}"</span>
        </p>
      </div>

      {/* ── RESULTS ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: "'Luckiest Guy',cursive", fontSize: '32px', color: '#171719' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ display: 'inline-block', marginBottom: 10 }}>🔍</motion.div>
          <div>DIGGING THROUGH THE SCRAPBOOK...</div>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {results.map((story) => (
            <StoryCard 
              key={story._id} 
              story={story} 
              currentUser={user}
              onLike={() => {}} 
              onComment={() => {}}
            />
          ))}
        </div>
      ) : (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '80px 20px', background: '#FFF', borderRadius: '24px', border: '6px solid #171719', boxShadow: '12px 12px 0px 0px #171719' }}>
          <span style={{ fontSize: '80px', display: 'block', marginBottom: '20px' }}>🕸️</span>
          <h3 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: '32px', color: '#171719', margin: '0 0 10px 0' }}>NOTHING HERE!</h3>
          <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: '18px', color: '#171719', margin: 0 }}>Try searching with different keywords or tags.</p>
        </motion.div>
      )}
    </div>
  );
}

export default SearchResultsPage;