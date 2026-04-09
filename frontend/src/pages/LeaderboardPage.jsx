import { useState, useEffect, useRef, useCallback } from 'react';
import { getLeaderboardApi } from '../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Badge Logic (UNCHANGED) ─────────────────────────────────────────────────
const getFamilyBadge = (points) => {
  if (points < 500) return {
    title: '🏡 The Quiet Hearth', color: '#d4a850', bg: 'rgba(212,168,80,0.12)',
    glow: '#d4a850', gradient: 'linear-gradient(90deg,#78350f,#d4a850,#fef08a)',
  };
  if (points < 2000) return {
    title: '🌟 The Vibrant Tribe', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
    glow: '#f59e0b', gradient: 'linear-gradient(90deg,#b45309,#f59e0b,#fef08a)',
  };
  if (points < 5000) return {
    title: '🏛️ Legacy Builders', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',
    glow: '#3b82f6', gradient: 'linear-gradient(90deg,#1e3a8a,#3b82f6,#bfdbfe)',
  };
  return {
    title: '👑 Eternal Dynasty', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
    glow: '#8b5cf6', gradient: 'linear-gradient(90deg,#4c1d95,#8b5cf6,#ede9fe)',
  };
};

// ─── Star Canvas ─────────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      sp: Math.random() * 0.007 + 0.002,
      ph: Math.random() * Math.PI * 2,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${alpha})`;
        ctx.fill();
      });
      // Nebula center glow
      const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.3, 0, canvas.width / 2, canvas.height * 0.3, canvas.width * 0.5);
      grd.addColorStop(0, 'rgba(212,130,40,0.04)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── Dust Layer ───────────────────────────────────────────────────────────────
function DustLayer() {
  const motes = Array.from({ length: 22 }, (_, i) => ({
    id: i, sz: Math.random() * 3.5 + 1.5,
    gold: Math.random() > 0.3,
    dur: Math.random() * 9 + 6,
    delay: Math.random() * 12,
    tx: (Math.random() - 0.5) * 140,
    ty: -(Math.random() * 100 + 40),
    x: Math.random() * 100, y: Math.random() * 100,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute', width: m.sz, height: m.sz,
          left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%',
          background: `radial-gradient(circle,${m.gold ? 'rgba(255,200,80,0.75)' : 'rgba(180,200,255,0.5)'} 0%,transparent 70%)`,
          animation: `ltFloat ${m.dur}s ${m.delay}s linear infinite`,
          '--tx': `${m.tx}px`, '--ty': `${m.ty}px`,
        }} />
      ))}
    </div>
  );
}

// ─── Corner Accents ───────────────────────────────────────────────────────────
function CornerAccents({ size = 18, inset = 12, opacity = 0.5 }) {
  const base = { position: 'absolute', width: size, height: size, borderColor: `rgba(212,168,80,${opacity})`, borderStyle: 'solid' };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' }} />
      <div style={{ ...base, top: inset, right: inset, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' }} />
      <div style={{ ...base, bottom: inset, left: inset, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' }} />
      <div style={{ ...base, bottom: inset, right: inset, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

// ─── Podium Card ─────────────────────────────────────────────────────────────
function PodiumCard({ family, rank, delay }) {
  const cardRef = useRef(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const badge = getFamilyBadge(family.familyBondPoints);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const rankConfig = {
    1: {
      pillarH: 200, scale: 1, crownSize: 52,
      borderColor: '#e8c87a', glowColor: 'rgba(232,200,122,0.5)',
      pillarGrad: 'linear-gradient(160deg,#78350f 0%,#b8832a 40%,#e8c87a 70%,#fef08a 100%)',
      rimGrad: 'linear-gradient(90deg,transparent,rgba(232,200,122,0.9),transparent)',
      medal: '🥇', rankLabel: 'Grand Champion',
      avatarSize: 96, avatarBorder: 4,
    },
    2: {
      pillarH: 155, scale: 0.93, crownSize: 36,
      borderColor: '#cbd5e1', glowColor: 'rgba(203,213,225,0.35)',
      pillarGrad: 'linear-gradient(160deg,#1e293b 0%,#475569 40%,#cbd5e1 100%)',
      rimGrad: 'linear-gradient(90deg,transparent,rgba(203,213,225,0.7),transparent)',
      medal: '🥈', rankLabel: 'Silver Sage',
      avatarSize: 78, avatarBorder: 3,
    },
    3: {
      pillarH: 120, scale: 0.88, crownSize: 30,
      borderColor: '#cd7f32', glowColor: 'rgba(205,127,50,0.35)',
      pillarGrad: 'linear-gradient(160deg,#431407 0%,#9a3412 40%,#ea580c 80%,#fed7aa 100%)',
      rimGrad: 'linear-gradient(90deg,transparent,rgba(205,127,50,0.7),transparent)',
      medal: '🥉', rankLabel: 'Bronze Elder',
      avatarSize: 68, avatarBorder: 3,
    },
  };

  const cfg = rankConfig[rank];

  const avatarUrl = family.championAvatar;
  const avatarName = family.championName || 'Contributor';
  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: rank === 1 ? '0 0 300px' : '0 0 240px', zIndex: rank === 1 ? 10 : 1 }}
    >
      {/* Crown / Medal emoji */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: rank === 1 ? 2.5 : 3.5, ease: 'easeInOut' }}
        style={{ fontSize: cfg.crownSize, marginBottom: -8, zIndex: 20, filter: `drop-shadow(0 0 12px ${cfg.glowColor})` }}
        title={avatarName} 
      >
        {rank === 1 ? '👑' : cfg.medal}
      </motion.div>

      {/* Avatar with orbital ring */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        {rank === 1 && (
          <svg style={{ position: 'absolute', top: -12, left: -12, width: `calc(100% + 24px)`, height: `calc(100% + 24px)`, animation: 'ltRingSpin 14s linear infinite', pointerEvents: 'none', zIndex: 5 }}
            viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="57" stroke="rgba(232,200,122,0.2)" strokeWidth="0.5" />
            <circle cx="60" cy="60" r="55" stroke="rgba(232,200,122,0.1)" strokeWidth="0.5" strokeDasharray="2 6" />
            <circle cx="60" cy="5" r="3" fill="rgba(232,200,122,0.9)" />
            <circle cx="115" cy="60" r="2" fill="rgba(232,200,122,0.6)" />
            <circle cx="60" cy="115" r="3" fill="rgba(232,200,122,0.9)" />
            <circle cx="5" cy="60" r="2" fill="rgba(232,200,122,0.6)" />
          </svg>
        )}
        {/* Glow pulse behind avatar */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: cfg.glowColor, filter: 'blur(12px)', zIndex: 0 }}
        />
        
        <div style={{
          width: cfg.avatarSize, height: cfg.avatarSize, borderRadius: '50%',
          border: `${cfg.avatarBorder}px solid ${cfg.borderColor}`,
          overflow: 'hidden', background: 'linear-gradient(135deg, #1a1410, #0f0c08)', position: 'relative', zIndex: 2,
          boxShadow: `0 0 30px ${cfg.glowColor}, 0 0 60px ${cfg.glowColor.replace('0.5', '0.2')}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} title={avatarName}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={avatarName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: cfg.avatarSize * 0.4, color: '#e8c87a', fontWeight: 'bold' }}>{initial}</span>
          )}
        </div>

        {/* Rank badge dot */}
        <div style={{ position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: '50%', background: cfg.pillarGrad, border: `2px solid #06080f`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, zIndex: 10 }}>
          {rank}
        </div>
      </div>

      {/* Rank label */}
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '2.5px', textTransform: 'uppercase', color: cfg.borderColor, opacity: 0.7, marginBottom: 4 }}>
        {cfg.rankLabel}
      </div>

      {/* Pillar card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          width: '100%', height: cfg.pillarH,
          background: 'rgba(12,16,32,0.9)',
          border: `1px solid ${cfg.borderColor}55`,
          borderRadius: '16px 16px 0 0',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-between', padding: '18px 16px 16px',
          boxShadow: `0 -10px 40px ${cfg.glowColor}, 0 20px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Spotlight */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: isHovering ? `radial-gradient(200px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212,168,80,0.09) 0%, transparent 70%)` : 'none',
        }} />

        {/* Top rim glow line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: cfg.rimGrad }} />

        {/* Rank number watermark */}
        <div style={{ position: 'absolute', bottom: -10, right: 8, fontFamily: "'Cinzel',serif", fontSize: 80, fontWeight: 700, color: `${cfg.borderColor}08`, lineHeight: 1, userSelect: 'none', zIndex: 0 }}>
          {rank}
        </div>

        {/* Circle name */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: rank === 1 ? 16 : 13, fontWeight: 700, color: '#fff', margin: '0 0 6px', textShadow: `0 0 20px ${cfg.borderColor}55`, letterSpacing: 0.5 }}>
            {family.circleName}
          </h3>
          <div style={{ display: 'inline-block', padding: '3px 10px', background: badge.bg, border: `1px solid ${badge.color}44`, borderRadius: 40, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1.5px', color: badge.color }}>
            {badge.title}
          </div>
        </div>

        {/* Points */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: rank === 1 ? 36 : 26, fontWeight: 700, color: cfg.borderColor, lineHeight: 1, textShadow: `0 0 30px ${cfg.glowColor}` }}>
            {family.familyBondPoints.toLocaleString()}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)', marginTop: 3 }}>
            Bond Points
          </div>
        </div>
      </div>

      {/* Pillar base shadow */}
      <div style={{ width: '90%', height: 6, background: `radial-gradient(ellipse,${cfg.glowColor} 0%,transparent 70%)`, marginTop: 2 }} />
    </motion.div>
  );
}

// ─── Rank Row (4+) ────────────────────────────────────────────────────────────
function RankRow({ family, rank, index }) {
  const badge = getFamilyBadge(family.familyBondPoints);
  const cardRef = useRef(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const avatarUrl = family.championAvatar;
  const avatarName = family.championName || 'Contributor';
  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.015, y: -2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 20,
        background: 'rgba(12,16,32,0.85)',
        border: '1px solid rgba(212,168,80,0.12)',
        borderRadius: 16, padding: '18px 24px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        cursor: 'default',
      }}
    >
      {/* Spotlight */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: isHovering ? `radial-gradient(240px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212,168,80,0.06) 0%, transparent 70%)` : 'none',
      }} />

      {/* Gold top line */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />

      {/* Rank number */}
      <div style={{ width: 48, flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: 'rgba(212,168,80,0.35)', lineHeight: 1 }}>#{rank}</div>
      </div>

      <div style={{ position: 'relative', flexShrink: 0, zIndex: 2 }} title={avatarName}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.3)', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1410, #0f0c08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={avatarName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: '#e8c87a', fontWeight: 'bold' }}>{initial}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)', margin: '0 0 5px', letterSpacing: 0.5 }}>
          {family.circleName}
        </h3>
        <div style={{ display: 'inline-block', padding: '3px 12px', background: badge.bg, border: `1px solid ${badge.color}44`, borderRadius: 40, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1.5px', color: badge.color }}>
          {badge.title}
        </div>
      </div>

      {/* Points */}
      <div style={{ textAlign: 'right', position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 20px rgba(212,168,80,0.4)', lineHeight: 1 }}>
          {family.familyBondPoints.toLocaleString()}
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)', marginTop: 3 }}>
          Bond Points
        </div>
      </div>

      {/* Corner accents mini */}
      <CornerAccents size={10} inset={6} opacity={0.25} />
    </motion.div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#06080f', gap: 24 }}>
      <StarCanvas />
      <DustLayer />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8c87a', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
          ))}
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
          Summoning the Legacy Rankings…
        </p>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', marginTop: 8 }}>
          ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
        </div>
      </div>
    </div>
  );
}

// ─── Main LeaderboardPage ─────────────────────────────────────────────────────
function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // LOGIC UNCHANGED
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
    <div style={{ background: '#06080f', minHeight: '100vh', padding: '48px 20px 80px', fontFamily: "'Cormorant Garamond',serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ltFloat { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
        @keyframes ltRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ltDot { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes ltPulseGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes ltSweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
      `}</style>

      <StarCanvas />
      <DustLayer />

      {/* Error */}
      {error && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <div style={{ background: 'rgba(12,16,32,0.95)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 20, padding: '32px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <CornerAccents />
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontFamily: "'Cinzel',serif", color: '#f08080', fontSize: 15, margin: 0 }}>{error}</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', marginBottom: 64 }}>

          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 60px rgba(212,168,80,0.4), 0 0 20px rgba(212,168,80,0.2)', letterSpacing: 3, margin: '0 0 10px' }}>
            Hall of Legends
          </h1>
          <p style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
            Where dynasties are born and legacies are immortalised
          </p>

          {/* Decorative divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.3))' }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 6, color: 'rgba(212,168,80,0.25)' }}>✦ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦</span>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.3))' }} />
          </div>
        </motion.div>

        {/* ── PODIUM SECTION ── */}
        {top3.length > 0 ? (
          <div style={{ marginBottom: 60 }}>
            {/* Section label */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)' }}>
                ✦ &nbsp; The Royal Podium &nbsp; ✦
              </span>
            </motion.div>

            {/* Ground glow under podium */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4),transparent)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: '20%', right: '20%', height: 30, background: 'radial-gradient(ellipse,rgba(212,168,80,0.12) 0%,transparent 70%)', filter: 'blur(10px)' }} />

              {/* Podium layout: 2 - 1 - 3 */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12 }}>
                {top3[1] && <PodiumCard family={top3[1]} rank={2} delay={0.5} />}
                {top3[0] && <PodiumCard family={top3[0]} rank={1} delay={0.2} />}
                {top3[2] && <PodiumCard family={top3[2]} rank={3} delay={0.7} />}
              </div>

              {/* Ground line */}
              <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),rgba(212,168,80,0.5),transparent)', marginTop: 0 }} />
              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.2),transparent)', marginTop: 2 }} />
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', background: 'rgba(12,16,32,0.85)', border: '1px solid rgba(212,168,80,0.18)', borderRadius: 20, padding: '40px', marginBottom: 40, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <CornerAccents />
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent)' }} />
            <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontSize: 17, margin: 0 }}>
              The Vault is empty. Create a family circle and start earning points!
            </p>
          </motion.div>
        )}

        {/* ── RANKING LIST (4+) ── */}
        {restOfList.length > 0 && (
          <div>
            {/* Section label */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.2))' }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)', whiteSpace: 'nowrap' }}>
                  ✦ &nbsp; The Rising Dynasties &nbsp; ✦
                </span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.2))' }} />
              </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {restOfList.map((family, index) => (
                <RankRow key={family._id} family={family} rank={index + 4} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Rune footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ textAlign: 'center', marginTop: 60, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 5, color: 'rgba(212,168,80,0.15)', userSelect: 'none' }}>
          ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
        </motion.div>
      </div>
    </div>
  );
}

export default LeaderboardPage;