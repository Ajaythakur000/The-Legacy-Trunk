import { useState, useRef, useEffect, useCallback } from 'react';
import { getLeaderboardApi } from '../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';

const getFamilyBadge = (points) => {
  if (points < 500) return { title: '🏡 ROOKIES', color: '#3E2723', bg: '#D4B895' };
  if (points < 2000) return { title: '🌟 RISING STARS', color: '#FFF', bg: '#A0522D' };
  if (points < 5000) return { title: '🏛️ LEGENDS', color: '#FFF', bg: '#C89B3C' };
  return { title: '👑 GOATS', color: '#3E2723', bg: '#00C853' };
};

// ─── Comic Background ────────────────────────────────────────────────────────
function ComicBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', top: '15%', left: '10%', fontSize: 60, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>🥇</motion.div>
      <motion.div animate={{ rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '50%', right: '5%', fontSize: 70, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>🔥</motion.div>
      <motion.div animate={{ rotate: [0, 5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', bottom: '20%', left: '8%', fontSize: 50, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>⭐</motion.div>
    </div>
  );
}

// ─── Podium Card ─────────────────────────────────────────────────────────────
function PodiumCard({ family, rank, delay }) {
  const badge = getFamilyBadge(family.familyBondPoints);

  const rankConfig = {
    1: { pillarH: 260, scale: 1, color: '#D4B895', medal: '🏆', label: '1ST PLACE' },
    2: { pillarH: 210, scale: 0.9, color: '#C89B3C', medal: '🥈', label: '2ND PLACE' },
    3: { pillarH: 170, scale: 0.8, color: '#A0522D', medal: '🥉', label: '3RD PLACE' },
  };

  const cfg = rankConfig[rank];
  const avatarUrl = family.championAvatar;
  const avatarName = family.championName || 'Contributor';
  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', bounce: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: rank === 1 ? '0 0 240px' : '0 0 200px', zIndex: rank === 1 ? 10 : 1 }}
    >
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: rank === 1 ? 2 : 3 }} style={{ fontSize: 60, marginBottom: -10, zIndex: 20, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>
        {cfg.medal}
      </motion.div>

      {/* Avatar */}
      <div style={{ position: 'relative', marginBottom: 12, zIndex: 10 }}>
        <div style={{ width: rank === 1 ? 100 : 80, height: rank === 1 ? 100 : 80, borderRadius: '50%', border: 'none', overflow: 'hidden', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={avatarName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: rank === 1 ? 40 : 32, color: '#3E2723' }}>{initial}</span>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#FFF', border: 'none', borderRadius: 8, padding: '2px 6px', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-5deg)' }}>
          {cfg.label}
        </div>
      </div>

      {/* Pillar */}
      <div
        style={{
          width: '100%', height: cfg.pillarH,
          background: cfg.color, border: 'none', borderBottom: 'none',
          borderRadius: '16px 16px 0 0', position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-start', padding: '20px 10px',
          boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 80, opacity: 0.3, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{rank}</div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', background: '#FFF', border: 'none', borderRadius: 12, padding: '8px', width: '100%', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {family.circleName}
          </h3>
          <div style={{ display: 'inline-block', padding: '2px 8px', background: badge.bg, border: 'none', borderRadius: 8, fontFamily: "'Playfair Display', serif", fontSize: 12, color: badge.color }}>
            {badge.title}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', background: '#3E2723', border: 'none', borderRadius: 12, padding: '8px', width: '100%', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#FFF', lineHeight: 1 }}>
            {family.familyBondPoints.toLocaleString()}
          </div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 12, color: '#D4B895', marginTop: 2 }}>
            PTS
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Rank Row (4+) ────────────────────────────────────────────────────────────
function RankRow({ family, rank, index }) {
  const badge = getFamilyBadge(family.familyBondPoints);
  const avatarUrl = family.championAvatar;
  const avatarName = family.championName || 'Contributor';
  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.05, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.02, x: 10 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: '#FFF', border: 'none',
        borderRadius: 16, padding: '16px 20px',
        boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3E2723', width: 40 }}>#{rank}</div>

      <div style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', overflow: 'hidden', background: '#C89B3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {avatarUrl ? <img src={avatarUrl} alt={avatarName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3E2723' }}>{initial}</span>}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', margin: '0 0 4px' }}>{family.circleName}</h3>
        <div style={{ display: 'inline-block', padding: '2px 8px', background: badge.bg, border: 'none', borderRadius: 8, fontFamily: "'Playfair Display', serif", fontSize: 10, color: badge.color }}>{badge.title}</div>
      </div>

      <div style={{ textAlign: 'right', background: '#F5F5F5', border: 'none', borderRadius: 8, padding: '6px 12px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#D4B895', lineHeight: 1 }}>{family.familyBondPoints.toLocaleString()}</div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 10, color: '#3E2723', marginTop: 2 }}>PTS</div>
      </div>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: '#3E2723' }}>LOADING LEADERBOARD...</div>
    </div>
  );
}

// ─── Main LeaderboardPage ─────────────────────────────────────────────────────
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

  const top3 = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      <ComicBackground />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 10 }}>

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#D4B895', textShadow: '4px 4px 0px #3E2723', WebkitTextStroke: '2px #3E2723', margin: '0 0 10px', letterSpacing: 2 }}>
            HALL OF FAME 🏆
          </h1>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#3E2723', margin: 0, background: '#C89B3C', display: 'inline-block', padding: '4px 16px', border: 'none', borderRadius: 8, transform: 'rotate(-2deg)', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
            Where the best families flex their points!
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div style={{ background: '#1E352F', border: 'none', borderRadius: 16, padding: '20px', textAlign: 'center', boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.45)', marginBottom: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#FFF' }}>{error}</div>
          </div>
        )}

        {/* ── PODIUM SECTION ── */}
        {top3.length > 0 ? (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, borderBottom: '6px solid #3E2723', paddingBottom: 0 }}>
              {top3[1] && <PodiumCard family={top3[1]} rank={2} delay={0.2} />}
              {top3[0] && <PodiumCard family={top3[0]} rank={1} delay={0} />}
              {top3[2] && <PodiumCard family={top3[2]} rank={3} delay={0.4} />}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', background: '#FFF', border: 'none', borderRadius: 16, padding: '40px', boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.45)', marginBottom: 40 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723' }}>NO ONE IS HERE YET. START POSTING!</div>
          </div>
        )}

        {/* ── RANKING LIST (4+) ── */}
        {restOfList.length > 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24, fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', background: '#FFF', border: 'none', borderRadius: 12, padding: '10px', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', display: 'inline-block', transform: 'rotate(1deg)' }}>
              THE CHALLENGERS 🔥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {restOfList.map((family, index) => (
                <RankRow key={family._id} family={family} rank={index + 4} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;