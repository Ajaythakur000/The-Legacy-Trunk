import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Star Canvas ──────────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 130 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.2, sp: Math.random() * 0.007 + 0.002, ph: Math.random() * Math.PI * 2 }));
    const resize = () => { canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth; canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { const a = 0.2 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)); ctx.beginPath(); ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(212,180,80,${a})`; ctx.fill(); });
    };
    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── Dust Motes ───────────────────────────────────────────────────────────────
function DustMotes() {
  const motes = useRef(Array.from({ length: 18 }, (_, i) => ({ id: i, sz: Math.random() * 3 + 1.5, gold: Math.random() > 0.3, dur: Math.random() * 8 + 5, delay: Math.random() * 10, tx: (Math.random() - 0.5) * 120, ty: -(Math.random() * 80 + 30), x: Math.random() * 100, y: Math.random() * 100 }))).current;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {motes.map(m => (
        <div key={m.id} style={{ position: 'absolute', width: m.sz, height: m.sz, left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%', background: `radial-gradient(circle,${m.gold ? 'rgba(255,200,80,.7)' : 'rgba(180,200,255,.5)'} 0%,transparent 70%)`, animation: `vgFloat ${m.dur}s ${m.delay}s linear infinite`, '--tx': `${m.tx}px`, '--ty': `${m.ty}px` }} />
      ))}
    </div>
  );
}

// ─── Slide content definitions ────────────────────────────────────────────────
const SLIDES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    title: 'Welcome to the Vault.',
    text: 'More than an app — it\'s the digital estate of your family\'s legacy. A place where your history lives forever.',
    extra: (
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Family Vault', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg> },
          { label: 'Memories', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg> },
          { label: 'Family Bond', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
        ].map((f, i) => (
          <div key={i} style={{ flex: 1, padding: '10px 8px', background: 'rgba(212,168,80,0.05)', border: '1px solid rgba(212,168,80,0.12)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ marginBottom: 5, display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)' }}>{f.label}</div>
          </div>
        ))}
      </div>
    ),
    orbColor: 'radial-gradient(circle,rgba(212,168,80,0.13) 0%,transparent 70%)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'A Vault Untouched.',
    text: 'End-to-end encrypted. No ads, no tracking. Your stories and photos are shared only with the bloodlines you trust.',
    extra: (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '14px 0', padding: 14, background: 'rgba(212,168,80,0.04)', border: '1px solid rgba(212,168,80,0.1)', borderRadius: 10 }}>
        {[['0', 'Ads Ever'], ['E2E', 'Encrypted'], ['∞', 'Legacy']].map(([num, lbl], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', lineHeight: 1 }}>{num}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(212,168,80,0.4)', marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>
    ),
    orbColor: 'radial-gradient(circle,rgba(100,160,255,0.1) 0%,transparent 70%)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Become the Champion.',
    text: 'Every memory you add earns Family Bond Points. Rise through the leaderboard and claim your crown as the ultimate historian.',
    extra: (
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Bond Points', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
          { label: 'Leaderboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg> },
          { label: 'Crown', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg> },
        ].map((f, i) => (
          <div key={i} style={{ flex: 1, padding: '10px 8px', background: 'rgba(212,168,80,0.05)', border: '1px solid rgba(212,168,80,0.12)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ marginBottom: 5, display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)' }}>{f.label}</div>
          </div>
        ))}
      </div>
    ),
    orbColor: 'radial-gradient(circle,rgba(212,168,80,0.15) 0%,transparent 70%)',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
function VaultGateway({ onClose }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // 🔥 FIX: Changed to sessionStorage. 
    // Isse jab bhi naya tab khulega ya login hoga, Gateway wapas dikhega.
    const hasSeenThisSession = sessionStorage.getItem('vault_gateway_seen_session');
    
    if (!hasSeenThisSession) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleFinish = useCallback(() => {
    setDone(true);
    setIsVisible(false);
    
    // Save state in session storage so it doesn't pop up again while browsing the app
    sessionStorage.setItem('vault_gateway_seen_session', 'true');
    
    setTimeout(onClose, 500);
  }, [onClose]);

  const handleNext = () => { if (step < SLIDES.length - 1) setStep(s => s + 1); };
  const isLast = step === SLIDES.length - 1;

  if (!shouldRender) return null;

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes vgFloat{0%{opacity:0;transform:translate(0,0) scale(1)}15%{opacity:1}85%{opacity:.7}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.2)}}
        @keyframes vgRingSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes vgRingRev{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @keyframes vgIconFloat{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-7px) rotate(2deg)}66%{transform:translateY(-3px) rotate(-1deg)}}
        @keyframes vgShine{0%,70%{left:-100%}100%{left:160%}}
        @keyframes vgPulseGlow{0%,100%{box-shadow:0 6px 24px rgba(212,168,80,.3)}50%{box-shadow:0 6px 40px rgba(212,168,80,.6),0 0 60px rgba(212,168,80,.2)}}
        @keyframes vgSuccessPop{0%{transform:scale(0) rotate(-30deg);opacity:0}60%{transform:scale(1.15) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
      `}</style>

      {/* Full-screen overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4,6,14,0.96)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: 20,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.45s ease',
        fontFamily: "'Cormorant Garamond',serif",
        overflow: 'hidden',
      }}>
        <StarCanvas />
        <DustMotes />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.88, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          style={{
            position: 'relative', zIndex: 10,
            width: '100%', maxWidth: 480,
            background: 'rgba(10,14,26,0.9)',
            border: '1px solid rgba(212,168,80,0.25)',
            borderRadius: 22,
            padding: '44px 40px 38px',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,80,0.05)',
          }}
        >
          {/* Gold edge lines */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.8),transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />

          {/* Corner accents */}
          {[{ top: 12, left: 12, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' }, { top: 12, right: 12, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' }, { bottom: 12, left: 12, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' }, { bottom: 12, right: 12, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 20, height: 20, borderColor: 'rgba(212,168,80,0.55)', borderStyle: 'solid', ...s }} />
          ))}

          {/* Ambient orb */}
          <motion.div
            animate={{ background: SLIDES[step].orbColor }}
            transition={{ duration: 0.8 }}
            style={{ position: 'absolute', top: '-40%', left: '-40%', width: '180%', height: '180%', pointerEvents: 'none', zIndex: 0 }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>

            {/* SUCCESS STATE */}
            <AnimatePresence>
              {done && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(212,168,80,0.1)', border: '1px solid rgba(212,168,80,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(212,168,80,0.2)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </motion.div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', letterSpacing: 1, marginBottom: 8 }}>The Vault is Open</div>
                  <div style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.38)' }}>Your legacy awaits...</div>
                </motion.div>
              )}
            </AnimatePresence>

            {!done && (
              <>
                {/* Crest / icon ring */}
                <div style={{ width: 96, height: 96, margin: '0 auto 6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.22)', animation: 'vgRingSpin 20s linear infinite' }}>
                    <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: 'rgba(212,168,80,0.8)', top: '50%', left: -3, transform: 'translateY(-50%)' }} />
                  </div>
                  <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.1)', animation: 'vgRingRev 14s linear infinite' }} />
                  <motion.div
                    key={step}
                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ position: 'relative', zIndex: 2, width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,168,80,0.08)', border: '1px solid rgba(212,168,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(212,168,80,0.12)', animation: 'vgIconFloat 4s ease-in-out infinite' }}
                  >
                    {SLIDES[step].icon}
                  </motion.div>
                </div>

                {/* Brand divider */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0 16px' }}>
                  <div style={{ flex: 1, maxWidth: 44, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.45))' }} />
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)' }}>The Legacy Trunk</span>
                  <div style={{ flex: 1, maxWidth: 44, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.45))' }} />
                </div>

                {/* Slide content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, color: '#e8c87a', textAlign: 'center', letterSpacing: 1, textShadow: '0 0 40px rgba(212,168,80,0.3)', margin: '0 0 10px' }}>
                      {SLIDES[step].title}
                    </h2>
                    <p style={{ fontSize: 15, fontStyle: 'italic', color: 'rgba(255,255,255,0.42)', textAlign: 'center', lineHeight: 1.65, margin: 0, minHeight: 52 }}>
                      {SLIDES[step].text}
                    </p>
                    {SLIDES[step].extra}
                  </motion.div>
                </AnimatePresence>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 3, background: 'rgba(212,168,80,0.1)', borderRadius: 2, margin: '20px 0 18px', position: 'relative', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${((step + 1) / SLIDES.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,rgba(212,168,80,0.4),#e8c87a)' }}
                  />
                  <div style={{ position: 'absolute', top: 0, left: '-60%', width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)', animation: 'vgShine 2s ease-in-out infinite' }} />
                </div>

                {/* Step dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                  {SLIDES.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ width: i === step ? 28 : 7, background: i === step ? '#e8c87a' : 'rgba(212,168,80,0.25)', boxShadow: i === step ? '0 0 10px rgba(212,168,80,0.5)' : 'none' }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setStep(i)}
                      style={{ height: 7, borderRadius: 4, cursor: 'pointer' }}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <AnimatePresence mode="wait">
                  {!isLast ? (
                    <motion.div key="step-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 12 }}>
                      <button onClick={handleFinish}
                        style={{ flex: 1, padding: '13px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(212,168,80,0.2)', color: 'rgba(212,168,80,0.45)', fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.07)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.4)'; e.currentTarget.style.color = 'rgba(212,168,80,0.8)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.2)'; e.currentTarget.style.color = 'rgba(212,168,80,0.45)'; }}
                      >
                        Skip
                      </button>
                      <button onClick={handleNext}
                        style={{ flex: 2, padding: '14px', borderRadius: 10, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)', backgroundSize: '200% 100%', border: 'none', color: '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', animation: 'vgPulseGlow 3s ease-in-out infinite', transition: 'transform 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      >
                        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '55%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-20deg)', animation: 'vgShine 2.5s ease-in-out infinite' }} />
                        Continue ✦
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="enter-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
                      <button onClick={handleFinish}
                        style={{ width: '100%', padding: '16px', borderRadius: 10, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)', border: 'none', color: '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', cursor: 'pointer', animation: 'vgPulseGlow 2.5s ease-in-out infinite', transition: 'transform 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      >
                        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '55%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-20deg)', animation: 'vgShine 2.5s ease-in-out infinite' }} />
                        Enter the Vault ✦
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rune footer */}
                <div style={{ marginTop: 18, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,0.15)', userSelect: 'none', textAlign: 'center' }}>
                  ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}

export default VaultGateway;