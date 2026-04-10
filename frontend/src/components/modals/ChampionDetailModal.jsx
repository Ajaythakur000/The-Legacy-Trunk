import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── STAR CANVAS (mini — inside modal overlay) ────────────────────────────────
function MiniStars() {
  const ref = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.0 + 0.2,
      sp: Math.random() * 0.006 + 0.002,
      ph: Math.random() * Math.PI * 2,
    }));
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const a = 0.15 + 0.4 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${a})`;
        ctx.fill();
      });
    };
    const animate = ts => { draw(ts * 0.001); raf.current = requestAnimationFrame(animate); };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return (
    <canvas ref={ref} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }}/>
  );
}

// ─── SPINNING CROWN RING ──────────────────────────────────────────────────────
function CrownRing({ size = 110 }) {
  const r = size / 2, rr = r - 4;
  const dots = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => ({
    x: r + rr * Math.cos((deg - 90) * Math.PI / 180),
    y: r + rr * Math.sin((deg - 90) * Math.PI / 180),
    big: deg % 90 === 0,
  }));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Outer spin ring */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'cdmRingSpin 12s linear infinite' }}
        viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle cx={r} cy={r} r={rr - 1} stroke="rgba(212,168,80,0.18)" strokeWidth="0.5"/>
        <circle cx={r} cy={r} r={rr - 4} stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="4 8"/>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.big ? 2.2 : 1.3}
            fill={`rgba(212,168,80,${d.big ? 0.85 : 0.45})`}/>
        ))}
      </svg>
      {/* Counter-spin ring */}
      <svg style={{ position: 'absolute', top: 6, left: 6, width: `calc(100% - 12px)`, height: `calc(100% - 12px)`, animation: 'cdmRingSpinRev 20s linear infinite' }}
        viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="37" stroke="rgba(212,168,80,0.1)" strokeWidth="0.5" strokeDasharray="2 6"/>
      </svg>
      {/* Avatar circle */}
      <div style={{
        position: 'absolute', top: 10, left: 10, right: 10, bottom: 10,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a1410 0%, #0f0c08 100%)',
        border: '2px solid rgba(212,168,80,0.35)',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(212,168,80,0.25), 0 0 60px rgba(212,168,80,0.1), inset 0 0 20px rgba(212,168,80,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* Will be filled by champion avatar */}
        </div>
      </div>
    </div>
  );
}

// ─── DUST MOTES ───────────────────────────────────────────────────────────────
function DustMotes() {
  const motes = Array.from({ length: 14 }, (_, i) => {
    const sz = Math.random() * 2.5 + 1, gold = Math.random() > 0.3;
    const dur = Math.random() * 7 + 5, delay = Math.random() * 8;
    const tx = (Math.random() - 0.5) * 100, ty = -(Math.random() * 60 + 30);
    return { id: i, sz, gold, dur, delay, tx, ty, x: Math.random() * 100, y: Math.random() * 100 };
  });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute', width: m.sz, height: m.sz,
          left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%',
          background: `radial-gradient(circle, ${m.gold ? 'rgba(255,200,80,0.7)' : 'rgba(180,200,255,0.5)'} 0%, transparent 70%)`,
          animation: `cdmFloat ${m.dur}s ${m.delay}s linear infinite`,
          '--tx': `${m.tx}px`, '--ty': `${m.ty}px`,
        }}/>
      ))}
    </div>
  );
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────────
function StatBar({ label, value, max = 100, color = '#e8c87a', delay = 0 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(212,168,80,0.5)' }}>{label}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color, letterSpacing: 1 }}>{value}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.6 + delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%', borderRadius: 10,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — logic unchanged, only design
// ═════════════════════════════════════════════════════════════════════════════
function ChampionDetailModal({ onClose, champion }) {
  // Close on backdrop click
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const name    = champion?.name    || 'Unknown Soul';
  const avatar  = champion?.avatar  || null;
  const stories = champion?.storiesCount || champion?.totalStories || champion?.storyCount || 42;
  const likes   = champion?.totalLikes   || champion?.likesCount   || 128;
  const streak  = champion?.currentStreak || champion?.streak      || 7;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        key="cdm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBackdrop}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(4,6,14,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Stars in backdrop */}
        <MiniStars/>
        <DustMotes/>

        {/* MODAL */}
        <motion.div
          key="cdm-card"
          initial={{ opacity: 0, scale: 0.88, y: 28 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.88, y: 28  }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{
            position: 'relative', zIndex: 10,
            width: '100%', maxWidth: 420,
            background: 'rgba(12,16,32,0.95)',
            border: '1px solid rgba(212,168,80,0.22)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(212,168,80,0.05), 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(212,168,80,0.08)',
          }}
        >
          {/* ── DECORATIVE LINES ── */}
          {/* Top shimmer */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.75),transparent)', zIndex: 2 }}/>
          {/* Bottom shimmer */}
          <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)', zIndex: 2 }}/>

          {/* ── CORNER ACCENTS ── */}
          {[
            { top:14, left:14,   borderWidth:'1.5px 0 0 1.5px', borderRadius:'4px 0 0 0' },
            { top:14, right:14,  borderWidth:'1.5px 1.5px 0 0', borderRadius:'0 4px 0 0' },
            { bottom:14, left:14,  borderWidth:'0 0 1.5px 1.5px', borderRadius:'0 0 0 4px' },
            { bottom:14, right:14, borderWidth:'0 1.5px 1.5px 0', borderRadius:'0 0 4px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 18, height: 18, borderColor: 'rgba(212,168,80,0.55)', borderStyle: 'solid', zIndex: 3, pointerEvents: 'none', ...s }}/>
          ))}

          {/* ── CLOSE BUTTON ── */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, borderColor: 'rgba(212,168,80,0.7)', color: '#e8c87a', background: 'rgba(212,168,80,0.1)' }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'absolute', top: 18, right: 18, zIndex: 20,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,168,80,0.22)',
              color: 'rgba(212,168,80,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >✕</motion.button>

          {/* ── HERO SECTION ── */}
          <div style={{
            padding: '44px 32px 28px',
            background: 'linear-gradient(180deg, rgba(212,168,80,0.06) 0%, transparent 100%)',
            textAlign: 'center', position: 'relative',
          }}>
            {/* Ambient glow behind avatar */}
            <div style={{
              position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
              width: 160, height: 160, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,168,80,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}/>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}
            >
              <div style={{ height: 1, width: 36, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5))' }}/>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.5)' }}>
                The Legacy Trunk
              </span>
              <div style={{ height: 1, width: 36, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.5))' }}/>
            </motion.div>

            {/* Avatar with spinning ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 160 }}
              style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 16px' }}
            >
              {/* Spinning ring SVG */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'cdmRingSpin 14s linear infinite' }}
                viewBox="0 0 110 110" fill="none">
                <circle cx="55" cy="55" r="51" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5"/>
                <circle cx="55" cy="55" r="48" stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="3 8"/>
                {[0,60,120,180,240,300].map((deg,i) => {
                  const rx = 55 + 51 * Math.cos((deg-90)*Math.PI/180);
                  const ry = 55 + 51 * Math.sin((deg-90)*Math.PI/180);
                  return <circle key={i} cx={rx} cy={ry} r={i%2===0?2:1.4} fill={`rgba(212,168,80,${i%2===0?0.8:0.45})`}/>;
                })}
              </svg>
              {/* Counter ring */}
              <svg style={{ position: 'absolute', top: 8, left: 8, width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', animation: 'cdmRingSpinRev 22s linear infinite' }}
                viewBox="0 0 94 94" fill="none">
                <circle cx="47" cy="47" r="44" stroke="rgba(212,168,80,0.1)" strokeWidth="0.5" strokeDasharray="2 6"/>
              </svg>
              {/* Avatar */}
              <div style={{
                position: 'absolute', top: 9, left: 9, right: 9, bottom: 9,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a1410, #0f0c08)',
                border: '1.5px solid rgba(212,168,80,0.35)',
                overflow: 'hidden',
                boxShadow: '0 0 24px rgba(212,168,80,0.28), 0 0 60px rgba(212,168,80,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatar
                  ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/>
                  : <span style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 20px rgba(212,168,80,0.6)' }}>{initials}</span>
                }
              </div>
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                width: 12, height: 12, borderRadius: '50%',
                background: '#4ade80', border: '2px solid rgba(12,16,32,0.9)',
                boxShadow: '0 0 8px rgba(74,222,128,0.8)',
                animation: 'cdmOnlinePulse 2s infinite',
              }}/>
            </motion.div>

            {/* Crown badge */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ marginBottom: 6 }}
            >
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)',
              }}>Family Champion</span>
            </motion.div>

            {/* Name */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{
                margin: '0 0 10px', fontFamily: "'Cinzel',serif",
                fontSize: 22, fontWeight: 700, color: '#e8c87a',
                letterSpacing: 1, textShadow: '0 0 30px rgba(212,168,80,0.5)',
              }}
            >{name}</motion.h2>

            {/* Badge pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              <span style={{
                fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 1,
                color: '#1a0f00', fontWeight: 700,
                padding: '6px 18px',
                background: 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
                backgroundSize: '200% 100%',
                borderRadius: 30,
                boxShadow: '0 0 18px rgba(212,168,80,0.4), 0 4px 12px rgba(0,0,0,0.3)',
                animation: 'cdmPulseGlow 3s ease-in-out infinite',
                position: 'relative', overflow: 'hidden',
              }}>
                <span style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', transform: 'skewX(-20deg)', animation: 'cdmShine 3s ease-in-out infinite' }}/>
                👑 &nbsp; Most Active Soul
              </span>
            </motion.div>
          </div>

          {/* ── DIVIDER ── */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.2),transparent)', margin: '0 24px' }}/>

          {/* ── STATS SECTION ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ padding: '22px 28px' }}
          >
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
              {[
                { label: 'Memories', value: stories, icon: '📜', color: '#e8c87a' },
                { label: 'Blessings', value: likes,   icon: '❤️', color: '#f87171' },
                { label: 'Day Streak', value: streak,  icon: '⚡', color: '#a78bfa' },
              ].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                  style={{
                    padding: '14px 10px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,168,80,0.1)',
                    borderRadius: 14, position: 'relative', overflow: 'hidden',
                    transition: 'all 0.25s',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.3),transparent)' }}/>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: s.color, textShadow: `0 0 14px ${s.color}60`, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(212,168,80,0.4)', marginTop: 5 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Progress bars */}
            <div style={{ marginBottom: 4 }}>
              <StatBar label="Story Activity"  value={stories} max={100} color="#e8c87a"  delay={0}   />
              <StatBar label="Community Love"  value={likes}   max={200} color="#f87171"  delay={0.1} />
              <StatBar label="Legacy Streak"   value={streak}  max={30}  color="#a78bfa"  delay={0.2} />
            </div>
          </motion.div>

          {/* ── DIVIDER ── */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.15),transparent)', margin: '0 24px' }}/>

          {/* ── FOOTER ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            style={{ padding: '16px 28px 20px', textAlign: 'center' }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 14px', lineHeight: 1.6 }}>
              "The soul who guards the flame of memory keeps the family eternal."
            </p>

            {/* Close button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: 'relative', overflow: 'hidden',
                width: '100%', padding: '13px 20px',
                background: 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
                backgroundSize: '200% 100%',
                border: 'none', borderRadius: 10,
                color: '#1a0f00', fontFamily: "'Cinzel',serif",
                fontSize: 12, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(212,168,80,0.3)',
                animation: 'cdmPulseGlow 3s ease-in-out infinite',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-20deg)', animation: 'cdmShine 3s ease-in-out infinite' }}/>
              Seal the Chronicle
            </motion.button>

            {/* Rune footer */}
            <div style={{ marginTop: 14, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none' }}>
              ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes cdmRingSpin    { 0%{transform:rotate(0deg)}   100%{transform:rotate(360deg)} }
        @keyframes cdmRingSpinRev { 0%{transform:rotate(0deg)}   100%{transform:rotate(-360deg)} }
        @keyframes cdmShine       { 0%,70%{left:-100%}           100%{left:150%} }
        @keyframes cdmPulseGlow   { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 36px rgba(212,168,80,0.55)} }
        @keyframes cdmOnlinePulse { 0%,100%{box-shadow:0 0 8px rgba(74,222,128,.7)} 50%{box-shadow:0 0 14px rgba(74,222,128,1)} }
        @keyframes cdmFloat {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          15%  { opacity:1; }
          85%  { opacity:0.7; }
          100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.2); }
        }
      `}</style>
    </AnimatePresence>
  );
}

export default ChampionDetailModal;