import { useState, useRef, useEffect } from 'react';
import Confetti from 'react-confetti';
import { createStoryApi } from '../api/storyApi';
import { useAuth } from '../context/AuthContext';
import StoryComposer from '../components/story/StoryComposer';
import { motion, AnimatePresence } from 'framer-motion';


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
      const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.2, 0, canvas.width / 2, canvas.height * 0.2, canvas.width * 0.5);
      grd.addColorStop(0, 'rgba(212,130,40,0.05)');
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
  const motes = Array.from({ length: 20 }, (_, i) => ({
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

// ─── Logo Ring ────────────────────────────────────────────────────────────────
function LogoRing({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'ltRingSpin 18s linear infinite' }} viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5" />
        <circle cx="45" cy="45" r="40" stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="3 8" />
        <circle cx="45" cy="5" r="2" fill="rgba(212,168,80,0.7)" />
        <circle cx="83" cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="83" cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="45" cy="85" r="2" fill="rgba(212,168,80,0.7)" />
        <circle cx="7" cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="7" cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
      </svg>
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1410,#0f0c08)', border: '1px solid rgba(212,168,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#e8c87a', fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700 }}>LT</div>
      </div>
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

function VaultStoriesPage() {
  const { user, fetchFreshProfile } = useAuth();
  const activeCircleId = user?.activeCircleId || null;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePostStory = async (formData) => {
    setError(''); setSuccess(''); setUploading(true);
    try {
      await createStoryApi(formData);
      await fetchFreshProfile();
      setSuccess('Memory securely locked! 🔐 Check the Home page to view it.');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save memory');
      throw e;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#06080f', minHeight: '100vh', padding: '48px 20px 80px', fontFamily: "'Cormorant Garamond',serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ltFloat { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
        @keyframes ltRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ltShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes ltDot { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes ltPulseGlow { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.55)} }
        @keyframes ltScrollRune { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes ltInkDrop { from{opacity:0;transform:scaleY(0);transform-origin:top} to{opacity:1;transform:scaleY(1)} }
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2);font-style:italic;}
        input:-webkit-autofill,textarea:-webkit-autofill,select:-webkit-autofill{-webkit-box-shadow:0 0 0 30px #0c1020 inset!important;-webkit-text-fill-color:rgba(255,255,255,0.88)!important;}
        select option{background:#0c1020;color:rgba(255,255,255,0.88);}
      `}</style>

      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} gravity={0.25} numberOfPieces={500}
            colors={['#e8c87a', '#d4a850', '#fef08a', '#f59e0b', '#fff', '#c9933a']} />
        </div>
      )}

      <StarCanvas />
      <DustLayer />

      {/* Scrolling rune ticker */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 28, zIndex: 50, overflow: 'hidden', borderBottom: '1px solid rgba(212,168,80,0.1)', background: 'rgba(6,8,15,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ltScrollRune 30s linear infinite', whiteSpace: 'nowrap' }}>
          {Array(4).fill('✦ ᚦ ᛖ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ᛏ ᚱ ᚢ ᚾ ᚲ · The Legacy Trunk · Weave Your Memory · Seal the Vault · ').map((t, i) => (
            <span key={i} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '3px', color: 'rgba(212,168,80,0.25)', padding: '0 20px' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '28px auto 0', position: 'relative', zIndex: 10 }}>

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', marginBottom: 52 }}>
          <LogoRing size={88} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '16px 0 8px' }}>
            <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5))' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)' }}>The Legacy Trunk</span>
            <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.5))' }} />
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 60px rgba(212,168,80,0.4), 0 0 20px rgba(212,168,80,0.2)', letterSpacing: 3, margin: '0 0 10px' }}>
            Weave a Memory
          </h1>
          <p style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px' }}>
            Every family has a story. Save yours for the generations to come.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.2))' }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 6, color: 'rgba(212,168,80,0.2)' }}>✦ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦</span>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.2))' }} />
          </div>

          {activeCircleId && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '8px 22px', background: 'rgba(212,168,80,0.08)', border: '1px solid rgba(212,168,80,0.28)', borderRadius: 40, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.7)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', display: 'inline-block', animation: 'ltPulseGlow 2s ease-in-out infinite' }} />
              Active Vault · Encrypted & Sealed
            </motion.div>
          )}
        </motion.div>

        {/* ── ALERTS ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(220,60,60,0.12)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#f08080' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(60,168,80,0.10)', border: '1px solid rgba(60,168,80,0.3)', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#6ee87a' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#6ee87a" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NO VAULT ── */}
        {!activeCircleId ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(12,16,32,0.85)', border: '1px solid rgba(212,168,80,0.22)', borderRadius: 20, padding: '52px 40px', textAlign: 'center', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)' }} />
            <CornerAccents />
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔐</div>
            <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 30px rgba(212,168,80,0.3)', margin: '0 0 10px' }}>No Vault Selected</h3>
            <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)', fontSize: 16, margin: 0 }}>Please select a Family Circle from the top navigation to begin weaving memories.</p>
            <div style={{ marginTop: 20, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none' }}>✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦</div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <StoryComposer activeCircleId={activeCircleId} onPostStory={handlePostStory} uploading={uploading} />
          </motion.div>
        )}

        <div style={{ marginTop: 40, textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 5, color: 'rgba(212,168,80,0.15)', userSelect: 'none' }}>
          ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
        </div>
      </div>
    </div>
  );
}

export default VaultStoriesPage;