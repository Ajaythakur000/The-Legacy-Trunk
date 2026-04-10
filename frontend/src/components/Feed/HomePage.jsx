// File Path: src/pages/HomePage.jsx
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('family');
  const canvasRef = useRef(null);
  useStars(canvasRef);

  const tabs = [
    { id: 'family', label: 'Family Ledger',      icon: '⚜' },
    { id: 'global', label: "Stranger's Memories", icon: '✦' },
  ];

  return (
    <div style={S.page}>
      {/* ── Stars ── */}
      <canvas ref={canvasRef} style={S.canvas} />

      {/* ── Dust motes ── */}
      <div style={S.dustLayer}>
        {MOTES.map(m => (
          <div key={m.id} style={{
            position: 'absolute', borderRadius: '50%',
            width: m.size, height: m.size,
            left: m.left, top: m.top,
            background: m.gold
              ? 'radial-gradient(circle,rgba(212,168,80,0.16) 0%,transparent 70%)'
              : 'radial-gradient(circle,rgba(80,100,210,0.10) 0%,transparent 70%)',
            animation: `ltFloat ${m.dur} ${m.delay} infinite ease-in-out`,
            '--tx': m.tx, '--ty': m.ty,
          }} />
        ))}
      </div>

      {/* ── Page content ── */}
      <div style={S.wrap}>

        {/* ════ HERO HEADER ════ */}
        <motion.div
          style={S.hero}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo orb */}
          <div style={S.logoWrap}>
            <svg style={S.logoRing} viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="40"
                stroke="rgba(212,168,80,0.28)" strokeWidth="1" strokeDasharray="4 3" />
              {[[45,5,3,0.9],[79.6,22.5,2.5,0.6],[79.6,67.5,2,0.5],
                [45,85,3,0.9],[10.4,67.5,2.5,0.6],[10.4,22.5,2,0.5]
              ].map(([cx,cy,r,op],i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill={`rgba(212,168,80,${op})`} />
              ))}
            </svg>
            <div style={S.logoInner}>
              <img src="/finall_logo.png" alt="LT" style={S.logoImg}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              <div style={{ ...S.logoFb, display:'none' }}>LT</div>
            </div>
          </div>

          {/* Brand divider */}
          <div style={S.brandDiv}>
            <div style={S.brandLine} />
            <span style={S.brandName}>The Legacy Trunk</span>
            <div style={{ ...S.brandLine, background:'linear-gradient(90deg,rgba(212,168,80,0.6),transparent)' }} />
          </div>

          {/* Title block */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} style={{ textAlign:'center' }}
              initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:12 }} transition={{ duration:0.4 }}>
              <h1 style={S.heroTitle}>
                {activeTab === 'family' ? 'Family Ledger' : "Stranger's Memories"}
              </h1>
              <p style={S.heroSub}>
                {activeTab === 'family'
                  ? 'The intimate chronicles & sacred history of your kinship.'
                  : 'Timeless legacies from souls across the world.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Rune strip */}
          <div style={S.runeStrip}>
            ✦&nbsp;&nbsp;
            {RUNES.map((r, i) => (
              <span key={i} style={{ ...S.runeChar, animationDelay: `${i * 0.18}s` }}>{r}&nbsp;</span>
            ))}
            &nbsp;✦
          </div>
        </motion.div>

        {/* ════ TAB SWITCHER ════ */}
        <motion.div
          style={S.tabBar}
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, delay:0.25, ease:[0.16,1,0.3,1] }}
        >
          {/* Top shimmer */}
          <div style={S.tabShimmerTop} />
          {/* Bottom shimmer */}
          <div style={S.tabShimmerBot} />

          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ ...S.tabBtn, ...(active ? S.tabBtnActive : {}) }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(232,200,122,0.7)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >
                {active && (
                  <motion.div
                    layoutId="tab-pill"
                    style={S.tabPill}
                    transition={{ type:'spring', stiffness:380, damping:30 }}
                  />
                )}
                <span style={S.tabIcon}>{tab.icon}</span>
                <span style={{ position:'relative', zIndex:1 }}>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Gold divider line under tabs */}
        <div style={S.goldDivider}>
          <div style={S.gdLine} />
          <div style={S.gdDot} />
          <div style={S.gdLine} />
        </div>

        {/* ════ FEED AREA ════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-24 }}
            transition={{ duration:0.38, ease:[0.16,1,0.3,1] }}
          >
            {activeTab === 'family'
              ? <FamilyLedgerFeed />
              : <StrangersMemoriesFeed />
            }
          </motion.div>
        </AnimatePresence>

        {/* Rune footer */}
        <div style={{ ...S.runeStrip, marginTop:60, opacity:0.5 }}>
          ✦&nbsp;&nbsp;{RUNES.map((r,i)=><span key={i}>{r} </span>)}&nbsp;&nbsp;✦
        </div>

      </div>

      <style>{CSS}</style>
    </div>
  );
}

/* ────────────────── CSS ────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,600&family=Space+Mono:wght@400;700&display=swap');

  @keyframes ltFloat {
    0%   { opacity:0; transform:translate(0,0) scale(1); }
    20%  { opacity:1; }
    80%  { opacity:0.7; }
    100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.2); }
  }
  @keyframes ltRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes ltRuneGlow {
    0%,100% { opacity:0.15; text-shadow:none; }
    50%     { opacity:0.55; text-shadow:0 0 8px rgba(212,168,80,0.6); }
  }
  @keyframes ltPulse {
    0%,100% { box-shadow:0 0 18px rgba(212,168,80,0.18); }
    50%     { box-shadow:0 0 36px rgba(212,168,80,0.42); }
  }
  @keyframes ltGoldShimmer {
    0%   { background-position:200% center; }
    100% { background-position:-200% center; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(40px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

/* ────────────────── STYLES ────────────────── */
const S = {
  page: {
    background: '#06080f',
    minHeight: '100vh',
    fontFamily: "'Cormorant Garamond', serif",
    color: 'rgba(255,255,255,0.88)',
    overflowX: 'hidden',
    position: 'relative',
    paddingBottom: 80,
  },
  canvas: {
    position: 'fixed', top:0, left:0,
    width:'100%', height:'100%',
    pointerEvents:'none', zIndex:0,
  },
  dustLayer: {
    position: 'fixed', top:0, left:0,
    width:'100%', height:'100%',
    pointerEvents:'none', overflow:'hidden', zIndex:1,
  },
  wrap: {
    position: 'relative', zIndex:10,
    maxWidth: 720, margin:'0 auto',
    padding: '48px 20px 0',
  },

  /* Hero */
  hero: {
    textAlign: 'center',
    marginBottom: 40,
  },
  logoWrap: {
    width:88, height:88,
    position:'relative', margin:'0 auto 16px',
  },
  logoRing: {
    position:'absolute', inset:0,
    animation:'ltRingSpin 18s linear infinite',
  },
  logoInner: {
    position:'absolute', inset:10,
    borderRadius:'50%',
    background:'linear-gradient(135deg,#1a1410,#0f0c08)',
    border:'1px solid rgba(212,168,80,0.3)',
    overflow:'hidden',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  logoImg: { width:'110%', height:'110%', objectFit:'cover' },
  logoFb: {
    fontFamily:"'Cinzel',serif", color:'#e8c87a',
    fontSize:18, fontWeight:700,
    alignItems:'center', justifyContent:'center',
  },

  brandDiv: {
    display:'flex', alignItems:'center', gap:10,
    justifyContent:'center', marginBottom:22,
  },
  brandLine: {
    height:1, maxWidth:50, flex:1,
    background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.6))',
  },
  brandName: {
    fontFamily:"'Space Mono',monospace",
    fontSize:9, letterSpacing:'2.5px',
    textTransform:'uppercase', color:'rgba(212,168,80,0.55)',
  },

  heroTitle: {
    fontFamily:"'Cinzel',serif",
    fontWeight:700, fontSize:'2.9rem',
    color:'#e8c87a',
    textShadow:'0 0 50px rgba(212,168,80,0.35)',
    margin:'0 0 10px',
    background:'linear-gradient(90deg,#c9933a,#f0d080,#c9933a,#f0d080)',
    backgroundSize:'300% auto',
    WebkitBackgroundClip:'text',
    WebkitTextFillColor:'transparent',
    animation:'ltGoldShimmer 6s linear infinite',
  },
  heroSub: {
    fontFamily:"'Cormorant Garamond',serif",
    fontStyle:'italic', fontSize:'1.1rem',
    color:'rgba(255,255,255,0.35)',
    margin:0,
  },

  runeStrip: {
    fontFamily:"'Cinzel',serif",
    fontSize:10, letterSpacing:'3px',
    color:'rgba(212,168,80,0.22)',
    userSelect:'none', marginTop:18,
    display:'flex', justifyContent:'center', flexWrap:'wrap',
  },
  runeChar: {
    display:'inline-block',
    animation:'ltRuneGlow 4s infinite ease-in-out',
  },

  /* Tab bar */
  tabBar: {
    position:'relative',
    display:'flex',
    background:'rgba(12,16,32,0.85)',
    border:'1px solid rgba(212,168,80,0.2)',
    borderRadius:60,
    padding:6,
    marginBottom:0,
    backdropFilter:'blur(20px)',
    WebkitBackdropFilter:'blur(20px)',
    animation:'ltPulse 4s infinite ease-in-out',
    overflow:'hidden',
  },
  tabShimmerTop: {
    position:'absolute', top:0, left:'10%', right:'10%', height:1,
    background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)',
    pointerEvents:'none',
  },
  tabShimmerBot: {
    position:'absolute', bottom:0, left:'10%', right:'10%', height:1,
    background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.2),transparent)',
    pointerEvents:'none',
  },
  tabBtn: {
    flex:1, padding:'13px 20px',
    border:'none', background:'transparent',
    cursor:'pointer', position:'relative',
    fontFamily:"'Cinzel',serif",
    fontSize:'0.82rem', fontWeight:700,
    letterSpacing:'1.5px', textTransform:'uppercase',
    color:'rgba(255,255,255,0.3)',
    transition:'color 0.3s ease',
    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
  },
  tabBtnActive: {
    color:'#1a0f00',
  },
  tabPill: {
    position:'absolute', inset:0,
    background:'linear-gradient(135deg,#c9933a,#e8a820,#c9933a)',
    backgroundSize:'200%',
    borderRadius:54,
    zIndex:0,
    boxShadow:'0 0 20px rgba(212,168,80,0.4)',
  },
  tabIcon: {
    position:'relative', zIndex:1,
    fontSize:'0.9rem',
  },

  /* Gold divider between tabs and feed */
  goldDivider: {
    display:'flex', alignItems:'center', gap:10,
    margin:'24px 0 32px',
  },
  gdLine: {
    flex:1, height:1,
    background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.35),transparent)',
  },
  gdDot: {
    width:5, height:5, borderRadius:'50%',
    background:'rgba(212,168,80,0.6)',
    boxShadow:'0 0 8px rgba(212,168,80,0.5)',
  },
};