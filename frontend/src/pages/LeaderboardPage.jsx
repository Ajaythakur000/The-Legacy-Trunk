import { useState, useEffect } from 'react';
import { getLeaderboardApi } from '../api/circleApi';

// ==========================================
// 🛡️ THE FAMILY BADGE LOGIC
// ==========================================
const getFamilyBadge = (points) => {
  if (points < 500) return { title: '🏡 The Quiet Hearth', color: '#059669', bg: '#d1fae5', shadow: 'rgba(5, 150, 105, 0.2)' };
  if (points < 2000) return { title: '🌟 The Vibrant Tribe', color: '#ea580c', bg: '#ffedd5', shadow: 'rgba(234, 88, 12, 0.2)' };
  if (points < 5000) return { title: '🏛️ Legacy Builders', color: '#4f46e5', bg: '#e0e7ff', shadow: 'rgba(79, 70, 229, 0.2)' };
  return { title: '👑 Eternal Dynasty', color: '#7c3aed', bg: '#ede9fe', shadow: 'rgba(124, 58, 237, 0.4)' };
};

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboardApi();
        setLeaderboard(data);
      } catch (err) {
        setError('Failed to load the Hall of Fame. The Vault is currently locked.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a' }}>
        <h2 style={{ color: '#38bdf8', animation: 'pulse 1.5s infinite' }}>Summoning the Legacy Rankings... ⏳</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {error}</div>
    );
  }

  // Top 3 for the Podium, Rest for the List
  const top3 = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  // Helper for Podium Styling
  const getPodiumStyle = (rank) => {
    if (rank === 1) return { height: '180px', bg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', shadow: '0 0 30px rgba(251, 191, 36, 0.5)', delay: '0s' };
    if (rank === 2) return { height: '140px', bg: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', shadow: '0 0 20px rgba(148, 163, 184, 0.4)', delay: '0.2s' };
    return { height: '110px', bg: 'linear-gradient(135deg, #f97316 0%, #9a3412 100%)', shadow: '0 0 20px rgba(249, 115, 22, 0.4)', delay: '0.4s' };
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px', margin: '0 0 10px 0' }}>
            GLOBAL <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>LEADERBOARD</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0 }}>The Clash of Family Legacies. Earn Bond Points to rise.</p>
        </div>

        {/* 🏆 THE ROYAL PODIUM (Top 3) */}
        {top3.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '60px', height: '280px' }}>
            
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <PodiumCard family={top3[1]} rank={2} styles={getPodiumStyle(2)} />
            )}

            {/* Rank 1 (Gold) - Center */}
            {top3[0] && (
              <PodiumCard family={top3[0]} rank={1} styles={getPodiumStyle(1)} />
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <PodiumCard family={top3[2]} rank={3} styles={getPodiumStyle(3)} />
            )}

          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
            The Vault is empty. Create a family circle and start earning points!
          </div>
        )}

        {/* 🎖️ THE RANKING LIST (Rank 4 to 10) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {restOfList.map((family, index) => {
            const rank = index + 4;
            const badge = getFamilyBadge(family.familyBondPoints);

            return (
              <div key={family._id} style={{
                display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.7)', 
                backdropFilter: 'blur(10px)', padding: '20px 24px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s',
                animation: 'slideUp 0.5s ease-out forwards', opacity: 0, animationDelay: `${index * 0.1}s`
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Rank Number */}
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#64748b', width: '50px' }}>
                  #{rank}
                </div>

                {/* Family Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: '700' }}>
                    {family.circleName}
                  </h3>
                  <div style={{ display: 'inline-block', width: 'fit-content', fontSize: '0.85rem', padding: '4px 10px', background: badge.bg, color: badge.color, borderRadius: '8px', fontWeight: '700' }}>
                    {badge.title}
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38bdf8' }}>
                    {family.familyBondPoints}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Points</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// 🏆 HELPER COMPONENT FOR THE PODIUM
// ==========================================
function PodiumCard({ family, rank, styles }) {
  const badge = getFamilyBadge(family.familyBondPoints);
  const isWinner = rank === 1;

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      width: isWinner ? '35%' : '30%', zIndex: isWinner ? 10 : 1,
      animation: `slideUp 0.6s ease-out forwards ${styles.delay}`, opacity: 0
    }}>
      
      {/* Crown for Rank 1 */}
      {isWinner && <div style={{ fontSize: '40px', animation: 'float 3s infinite ease-in-out', marginBottom: '-10px', zIndex: 20 }}>👑</div>}
      
      {/* Admin Avatar (Representative) */}
      <div style={{ 
        width: isWinner ? '90px' : '70px', height: isWinner ? '90px' : '70px', 
        borderRadius: '50%', border: `4px solid ${isWinner ? '#fbbf24' : '#cbd5e1'}`,
        overflow: 'hidden', marginBottom: '16px', background: '#1e293b',
        boxShadow: styles.shadow, zIndex: 10, position: 'relative'
      }}>
        <img 
          src={family.admin?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
          alt="Admin" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* The Pillar */}
      <div style={{ 
        width: '100%', height: styles.height, background: styles.bg, 
        borderRadius: '16px 16px 0 0', boxShadow: styles.shadow,
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px',
        color: '#111827', position: 'relative', overflow: 'hidden'
      }}>
        {/* Shine effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }}></div>
        
        <h3 style={{ margin: 0, fontSize: isWinner ? '1.2rem' : '1rem', fontWeight: '900', textAlign: 'center', zIndex: 2 }}>
          {family.circleName}
        </h3>
        
        <div style={{ marginTop: 'auto', textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: isWinner ? '2rem' : '1.5rem', fontWeight: '900', lineHeight: 1 }}>
            {family.familyBondPoints}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Points</div>
        </div>
      </div>
      
    </div>
  );
}

export default LeaderboardPage;