import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FamilyLedgerFeed from './FamilyLedgerFeed';
import StrangersMemoriesFeed from './StrangersMemoriesFeed';

/* ─── Dust motes (stable, generated once) ─── */
const MOTES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: Math.random() * 70 + 25,
  left: `${(Math.random() * 100).toFixed(1)}%`,
  top: `${(Math.random() * 100).toFixed(1)}%`,
  dur: `${(Math.random() * 8 + 6).toFixed(1)}s`,
  delay: `${(Math.random() * 10).toFixed(1)}s`,
  tx: `${(Math.random() * 120 - 60).toFixed(0)}px`,
  ty: `${(-(Math.random() * 100 + 40)).toFixed(0)}px`,
  gold: Math.random() > 0.45,
}));

/* ─── Star canvas hook ─── */
function useStars(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    const stars = Array.from({ length: 130 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.1 + 0.3,
      sp: Math.random() * 0.02 + 0.005,
      ph: Math.random() * Math.PI * 2,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;
      stars.forEach(s => {
        const op = 0.15 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp * 60 + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${op})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [ref]);
}

/* ─── Animated rune sequence ─── */
const RUNES = ['ᚦ','ᛖ','ᛚ','ᛖ','ᚷ','ᚨ','ᚲ','ᛃ','ᛏ','ᚱ','ᚢ','ᚾ','ᚲ'];

// ─── NEW COMIC UI COMPONENTS ───
function ComicBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 60, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>📸</motion.div>
      <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', top: '40%', right: '8%', fontSize: 50, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>📖</motion.div>
      <motion.div animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: 70, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>📌</motion.div>
    </div>
  );
}

function LogoBadge({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#D4B895', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', overflow: 'hidden', /* removed spin */ }}>
        <div style={{ width: '120%', height: '120%', background: '#C89B3C', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
      </div>
      <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: '50%', background: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 26 }}>LT</div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('family');
  const canvasRef = useRef(null);
  // Keeping the hook call to avoid unused variable errors, but canvas is hidden in new UI
  useStars(canvasRef);

  const comicTabs = [
    { id: 'family', label: 'FAMILY VAULT', color: '#FDFBF7' },
    { id: 'global', label: 'EXPLORE WORLD', color: '#C89B3C' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      {/* Hidden old canvas to keep useStars hook working without error */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <ComicBackground />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '48px 20px 0' }}>

        {/* ════ HERO HEADER ════ */}
        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          
          <LogoBadge size={100} />

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} style={{ marginTop: 24 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 56px)', color: '#FDFBF7', margin: '0 0 10px', letterSpacing: 2 }}>
                {activeTab === 'family' ? 'OUR SCRAPBOOK' : 'GLOBAL MEMORIES'}
              </h1>
              <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#3E2723', margin: '0 auto', background: activeTab === 'family' ? '#D4B895' : '#C89B3C', display: 'inline-block', padding: '4px 16px', border: 'none', borderRadius: 8, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-2deg)' }}>
                {activeTab === 'family' ? 'Inside jokes and embarrassing photos.' : 'See what other families are sharing.'}
              </p>
            </motion.div>
          </AnimatePresence>

        </motion.div>

        {/* ════ TAB SWITCHER ════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
          {comicTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '16px', borderRadius: 16, cursor: 'pointer',
                  background: isActive ? tab.color : '#FFF',
                  border: 'none',
                  color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20,
                  boxShadow: isActive ? '4px 4px 0px 0px #3E2723' : '2px 2px 0px 0px #3E2723',
                  transform: isActive ? 'translate(-2px, -2px)' : 'none',
                  transition: 'all 0.1s ease', position: 'relative'
                }}
              >
                {isActive && <span style={{ position: 'absolute', top: -10, left: -10, fontSize: 24, transform: 'rotate(-10deg)' }}>📌</span>}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* ════ FEED AREA ════ */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}>
            {activeTab === 'family' ? <FamilyLedgerFeed /> : <StrangersMemoriesFeed />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}