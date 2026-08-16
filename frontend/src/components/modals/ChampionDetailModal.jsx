import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Comic Background / Motes ─────────────────────────────────────────────────
function DustMotes() {
  const motes = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    sz: Math.random() * 6 + 4,
    dur: Math.random() * 5 + 3,
    delay: Math.random() * 5,
    x: Math.random() * 100, y: Math.random() * 100,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute', width: m.sz, height: m.sz,
          left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%',
          background: '#FFD23F', border: '2px solid #171719',
          animation: `floatMote ${m.dur}s ${m.delay}s linear infinite`,
        }} />
      ))}
      <style>{`
        @keyframes floatMote {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-60px) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── STAT BAR (Comic Health Bar) ─────────────────────────────────────────────
function StatBar({ label, value, max = 100, color = '#3FE0FF', delay = 0 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontFamily: "'Luckiest Guy',cursive", fontSize: 14, color: '#171719' }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{ height: 16, background: '#FFF', borderRadius: 8, border: '3px solid #171719', overflow: 'hidden', boxShadow: '2px 2px 0px 0px #171719' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 + delay, type: 'spring' }}
          style={{ height: '100%', background: color, borderRight: '3px solid #171719' }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
function ChampionDetailModal({ onClose, champion }) {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const name   = champion?.name      || 'Unknown Soul';
  const avatar = champion?.avatar    || null;
  const stories = champion?.storiesCount || champion?.totalStories || champion?.storyCount || 42;
  const likes   = champion?.totalLikes   || champion?.likesCount   || 128;
  const streak  = champion?.currentStreak || champion?.streak      || 7;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        key="cdm-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(23,23,25,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}
      >
        <DustMotes />

        <motion.div
          key="cdm-card"
          initial={{ scale: 0.8, rotate: -2, y: 30 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          exit={{ scale: 0.8, rotate: 2, y: 30 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          style={{
            position: 'relative', zIndex: 10, width: '100%', maxWidth: 440,
            background: '#FFFFFF', border: '6px solid #171719', borderRadius: 24,
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            overflow: 'hidden', boxShadow: '16px 16px 0px 0px #171719',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 30,
              width: 40, height: 40, borderRadius: '50%',
              background: '#FF3D81', border: '4px solid #171719', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontFamily: "'Luckiest Guy',cursive", fontSize: 20,
              boxShadow: '4px 4px 0px 0px #171719', transition: 'transform 0.1s'
            }}
          >✕</button>

          {/* ── SCROLLABLE CONTENT ── */}
          <div className="lt-custom-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
            
            {/* HERO SECTION */}
            <div style={{ padding: '40px 24px 24px', background: '#FFD23F', borderBottom: '6px solid #171719', textAlign: 'center', position: 'relative' }}>
              
              <div style={{ position: 'absolute', top: 16, left: 16, background: '#3FE0FF', border: '3px solid #171719', padding: '4px 12px', borderRadius: 8, fontFamily: "'Luckiest Guy',cursive", fontSize: 14, boxShadow: '2px 2px 0px 0px #171719', transform: 'rotate(-5deg)' }}>
                #1 CHAMPION 👑
              </div>

              {/* Avatar Box */}
              <div style={{ width: 110, height: 110, margin: '20px auto 16px', borderRadius: '50%', background: '#FFF', border: '4px solid #171719', overflow: 'hidden', boxShadow: '6px 6px 0px 0px #171719', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatar ? (
                  <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 44, color: '#171719' }}>{initials}</span>
                )}
              </div>

              <h2 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 32, color: '#171719', margin: '0 0 4px', textShadow: '2px 2px 0px #FFF' }}>
                {name}
              </h2>
              
              <div style={{ display: 'inline-block', background: '#FF3D81', color: '#FFF', border: '3px solid #171719', padding: '4px 16px', borderRadius: 8, fontFamily: "'Luckiest Guy',cursive", fontSize: 14, boxShadow: '2px 2px 0px 0px #171719', transform: 'rotate(2deg)' }}>
                TOP HISTORIAN
              </div>
            </div>

            {/* ── STATS SECTION ── */}
            <div style={{ padding: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {[
                  { label: 'STORIES', value: stories, color: '#FFD23F', icon: '📜' },
                  { label: 'LIKES', value: likes, color: '#FF3D81', icon: '❤️' },
                  { label: 'STREAK', value: streak, color: '#3FE0FF', icon: '⚡' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.color, border: '3px solid #171719', borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: '4px 4px 0px 0px #171719' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 22, color: '#171719', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 10, color: '#171719', marginTop: 4 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Progress bars */}
              <div style={{ background: '#F5F5F5', border: '3px solid #171719', borderRadius: 16, padding: 16, boxShadow: '4px 4px 0px 0px #171719' }}>
                <StatBar label="STORY POWER" value={stories} max={100} color="#FFD23F" delay={0} />
                <StatBar label="COMMUNITY LOVE" value={likes} max={200} color="#FF3D81" delay={0.1} />
                <StatBar label="FIRE STREAK" value={streak} max={30} color="#3FE0FF" delay={0.2} />
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 24 }}>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95, x: 2, y: 2, boxShadow: '0px 0px 0px 0px #171719' }}
                  style={{
                    width: '100%', padding: '16px', background: '#00C853',
                    border: '4px solid #171719', borderRadius: 12, color: '#FFF',
                    fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer',
                    boxShadow: '6px 6px 0px 0px #171719', textShadow: '2px 2px 0px #171719'
                  }}
                >
                  AWESOME! 💥
                </motion.button>
              </div>

            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ChampionDetailModal;