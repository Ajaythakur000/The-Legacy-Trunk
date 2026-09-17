import { useState, useEffect } from 'react';
import { getLeaderboardApi } from '../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Crown, ChevronLeft, ChevronRight, Landmark } from 'lucide-react';

const getFamilyBadge = (points) => {
  if (points < 500) return { title: 'ROOKIES', color: '#8C7B6B', border: '#D4B895' };
  if (points < 2000) return { title: 'HISTORIANS', color: '#3E2723', border: '#C89B3C' };
  if (points < 5000) return { title: 'LEGENDS', color: '#FFF', border: '#1E352F', bg: '#1E352F' };
  return { title: 'ARCHIVISTS', color: '#FDFBF7', border: '#3E2723', bg: '#3E2723' };
};

function PodiumCard({ family, rank, delay }) {
  const badge = getFamilyBadge(family.familyBondPoints);
  
  const rankConfig = {
    1: { height: 200, scale: 1, color: '#D4AF37', icon: Crown, label: 'Grand Archivist' },
    2: { height: 160, scale: 0.9, color: '#C0C0C0', icon: Medal, label: 'Master Chronicler' },
    3: { height: 130, scale: 0.8, color: '#CD7F32', icon: Award, label: 'Honored Keeper' },
  };

  const cfg = rankConfig[rank];
  const Icon = cfg.icon;
  const avatarUrl = family.championAvatar;
  const avatarName = family.championName || 'Contributor';
  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', bounce: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: rank === 1 ? '0 0 260px' : '0 0 200px', zIndex: rank === 1 ? 10 : 1, position: 'relative' }}
    >
      {/* Vintage Medal / Ribbon above frame */}
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: rank === 1 ? 3 : 4 }} style={{ marginBottom: -15, zIndex: 20, color: cfg.color, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
        <Icon size={rank === 1 ? 64 : 48} strokeWidth={1} />
      </motion.div>

      {/* Ornate Frame Avatar */}
      <div style={{ position: 'relative', marginBottom: 20, zIndex: 10, width: rank === 1 ? 130 : 100, height: rank === 1 ? 160 : 130 }}>
        {/* Frame Outer */}
        <div style={{ position: 'absolute', inset: 0, background: '#3E2723', padding: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', borderRadius: 2 }}>
          {/* Frame Inner Matting */}
          <div style={{ position: 'absolute', inset: 8, background: '#FDFBF7', padding: 4, border: `2px solid ${cfg.color}` }}>
            {/* The Photo */}
            <div style={{ width: '100%', height: '100%', background: '#EEDEC1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={avatarName} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.4) contrast(1.1)' }} />
              ) : (
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: rank === 1 ? 40 : 32, color: '#8C7B6B' }}>{initial}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Label Tape */}
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%) rotate(-2deg)', background: '#FDFBF7', border: '1px solid rgba(0,0,0,0.1)', padding: '2px 8px', fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#3E2723', whiteSpace: 'nowrap', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)' }}>
          {cfg.label}
        </div>
      </div>

      {/* Wooden Podium Pillar */}
      <div
        style={{
          width: '100%', height: cfg.height,
          background: 'linear-gradient(to right, #4A3325, #3E2723, #2D1A11)',
          borderTop: '4px solid #5C4033',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          borderRight: '2px solid rgba(0,0,0,0.5)',
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 10px',
          boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), 10px 10px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 60, opacity: 0.1, fontFamily: "'Playfair Display', serif", color: '#FDFBF7' }}>{rank}</div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: rank === 1 ? 22 : 18, color: '#FDFBF7', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            {family.circleName}
          </h3>
          <div style={{ display: 'inline-block', padding: '2px 8px', border: `1px solid ${badge.border}`, background: badge.bg || 'transparent', fontFamily: "'Courier Prime', monospace", fontSize: 10, color: badge.bg ? '#FDFBF7' : badge.border, letterSpacing: 1 }}>
            {badge.title}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', width: '90%', borderRadius: 4 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: rank === 1 ? 28 : 22, color: cfg.color, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {family.familyBondPoints.toLocaleString()}
          </div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(253,251,247,0.5)', marginTop: 4, letterSpacing: 1 }}>
            PTS
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LedgerRow({ family, rank, index }) {
  const badge = getFamilyBadge(family.familyBondPoints);
  const avatarUrl = family.championAvatar;
  const initial = family.championName ? family.championName.charAt(0).toUpperCase() : '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ backgroundColor: 'rgba(62,39,35,0.02)' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px',
        borderBottom: '1px solid rgba(62,39,35,0.1)',
        position: 'relative',
      }}
    >
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#8C7B6B', width: 40, fontStyle: 'italic' }}>{rank}.</div>

      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #D4B895', overflow: 'hidden', background: '#FDFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3)' }} /> : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#3E2723' }}>{initial}</span>}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', margin: '0 0 4px', fontWeight: 500 }}>{family.circleName}</h3>
        <div style={{ display: 'inline-block', padding: '0', fontFamily: "'Courier Prime', monospace", fontSize: 11, color: '#8C7B6B' }}>
           {badge.title}
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#3E2723' }}>{family.familyBondPoints.toLocaleString()}</div>
        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#8C7B6B' }}>pts</div>
      </div>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#2D1A11' }}>
      <Trophy size={48} color="#D4B895" style={{ marginBottom: 20, opacity: 0.5 }} />
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#D4B895', textTransform: 'uppercase', letterSpacing: 2 }}>Dusting off the archives...</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboardApi();
        setLeaderboard(data);
      } catch (err) {
        setError('The Archives are currently locked.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);
  
  // Pagination Logic
  const totalPages = Math.ceil(restOfList.length / itemsPerPage);
  const currentChallengers = restOfList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative', background: '#2D1A11' }}>
      
      {/* Faint wood grain / dark texture overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.05, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 10 }}>

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginBottom: 80 }}>
          <Landmark size={48} color="#D4AF37" strokeWidth={1} style={{ marginBottom: 20 }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#FDFBF7', margin: '0 0 20px', fontWeight: 400, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            The Legacy Keepers
          </h1>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Masking tape background */}
            <div style={{ position: 'absolute', inset: -4, background: '#EEDEC1', transform: 'rotate(-1deg)', boxShadow: '1px 2px 4px rgba(0,0,0,0.2)' }}></div>
            <p style={{ position: 'relative', fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#3E2723', margin: 0, padding: '4px 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Honoring the families preserving the most memories
            </p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#FDFBF7' }}>{error}</div>
          </div>
        )}

        {/* ── PODIUM SECTION ── */}
        {top3.length > 0 ? (
          <div style={{ marginBottom: 80 }}>
            {/* Wooden shelf base */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, borderBottom: '16px solid #1A0F0A', paddingBottom: 0, boxShadow: '0 20px 30px rgba(0,0,0,0.8)' }}>
              {top3[1] && <PodiumCard family={top3[1]} rank={2} delay={0.2} />}
              {top3[0] && <PodiumCard family={top3[0]} rank={1} delay={0} />}
              {top3[2] && <PodiumCard family={top3[2]} rank={3} delay={0.4} />}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '40px', marginBottom: 40 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#FDFBF7' }}>The archives are empty. Begin the legacy!</div>
          </div>
        )}

        {/* ── LEDGER BOOK (4+) ── */}
        {restOfList.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#D4B895', textTransform: 'uppercase', letterSpacing: 3, borderBottom: '1px solid #D4B895', paddingBottom: 6 }}>
                The Grand Ledger
              </span>
            </div>
            
            {/* Paper Ledger */}
            <div style={{ background: '#FDFBF7', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(140, 123, 107, 0.1)', padding: '20px 0', position: 'relative' }}>
              
              {/* Red vertical margin line of a ledger */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 60, width: 1, background: 'rgba(216, 27, 96, 0.3)' }}></div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 64, width: 1, background: 'rgba(216, 27, 96, 0.1)' }}></div>

              <div style={{ minHeight: 400 }}>
                {currentChallengers.map((family, index) => (
                  <LedgerRow key={family._id} family={family} rank={(currentPage - 1) * itemsPerPage + index + 4} index={index} />
                ))}
              </div>

              {/* ── VINTAGE PAGINATION ── */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '30px 20px 10px', borderTop: '1px solid rgba(62,39,35,0.1)', marginTop: 20 }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ background: 'transparent', border: 'none', color: currentPage === 1 ? 'rgba(62,39,35,0.2)' : '#3E2723', cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Courier Prime', monospace", fontSize: 12, textTransform: 'uppercase', transition: 'all 0.2s' }}
                  >
                    <ChevronLeft size={16} /> Prev Page
                  </button>
                  
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#8C7B6B', fontStyle: 'italic' }}>
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ background: 'transparent', border: 'none', color: currentPage === totalPages ? 'rgba(62,39,35,0.2)' : '#3E2723', cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Courier Prime', monospace", fontSize: 12, textTransform: 'uppercase', transition: 'all 0.2s' }}
                  >
                    Next Page <ChevronRight size={16} />
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
