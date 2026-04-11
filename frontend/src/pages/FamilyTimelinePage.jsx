import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LegacyBookExporter from '../components/features/LegacyBookExporter';

/* ─────────────────────────────────────────────────────────────
   STAR CANVAS HOOK
───────────────────────────────────────────────────────────── */
function useStarCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const stars = Array.from({ length: 140 }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;
      stars.forEach(s => {
        const op = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${op})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

/* ─────────────────────────────────────────────────────────────
   DUST MOTES  (generated once, stable across renders)
───────────────────────────────────────────────────────────── */
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  id:    i,
  size:  Math.random() * 80 + 30,
  left:  `${(Math.random() * 100).toFixed(1)}%`,
  top:   `${(Math.random() * 100).toFixed(1)}%`,
  dur:   `${(Math.random() * 8 + 6).toFixed(1)}s`,
  delay: `${(Math.random() * 10).toFixed(1)}s`,
  tx:    `${(Math.random() * 120 - 60).toFixed(0)}px`,
  ty:    `${(-(Math.random() * 120 + 40)).toFixed(0)}px`,
  gold:  Math.random() > 0.5,
}));

/* ─────────────────────────────────────────────────────────────
   SPOTLIGHT HOOK  (mouse glow inside popup card)
───────────────────────────────────────────────────────────── */
function useSpotlight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width  * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [ref]);
}

/* ─────────────────────────────────────────────────────────────
   LOGO ORB
───────────────────────────────────────────────────────────── */
function LogoOrb() {
  return (
    <div style={S.logoWrap}>
      <svg style={S.logoRing} viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="40"
          stroke="rgba(212,168,80,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
        {[
          [45,5,3,0.9],[79.6,22.5,2.5,0.6],[79.6,67.5,2,0.5],
          [45,85,3,0.9],[10.4,67.5,2.5,0.6],[10.4,22.5,2,0.5],
        ].map(([cx,cy,r,op],i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={`rgba(212,168,80,${op})`}/>
        ))}
      </svg>
      <div style={S.logoInner}>
        <img
          src="/finall_logo.png"
          alt="The Legacy Trunk"
          style={S.logoImg}
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{ ...S.logoFallback, display: 'none' }}>LT</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BRAND DIVIDER
───────────────────────────────────────────────────────────── */
function BrandDivider() {
  return (
    <div style={S.brandDiv}>
      <div style={S.brandLine}/>
      <span style={S.brandName}>The Legacy Trunk</span>
      <div style={{ ...S.brandLine, background: 'linear-gradient(90deg,rgba(212,168,80,0.6),transparent)' }}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOADING STATE
───────────────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div style={S.loadingWrap}>
      <span style={S.loadingText}>Unlocking the family vault</span>
      <span style={S.dotsWrap}>
        {[0,1,2].map(i => (
          <span key={i} style={{ ...S.dot, animationDelay:`${i*0.2}s` }}/>
        ))}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={S.emptyBox}>
      <h3 style={S.emptyTitle}>The Lane Lies Silent</h3>
      <p  style={S.emptySub}>
        Mark stories as "Family Milestone" to weave them into the tapestry of legacy.
      </p>
      <div style={S.runeFooter}>✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POPUP CARD
───────────────────────────────────────────────────────────── */
function PopupCard({ node, isEven }) {
  const cardRef = useRef(null);
  useSpotlight(cardRef);

  const cardSideStyle = isEven
    ? { left: '70px', right: 'auto' }
    : { right: '70px', left: 'auto' };

  return (
    <div
      ref={cardRef}
      className="popup-card"
      style={{ ...S.popupCard, ...cardSideStyle }}
    >
      {/* Top shimmer line */}
      <div style={S.shimmerTop}/>
      {/* Bottom shimmer line */}
      <div style={S.shimmerBottom}/>

      {/* Corner accents */}
      <div style={{ ...S.corner, top:12,    left:12,  borderTop:'1px solid rgba(212,168,80,0.6)', borderLeft:'1px solid rgba(212,168,80,0.6)' }}/>
      <div style={{ ...S.corner, top:12,    right:12, borderTop:'1px solid rgba(212,168,80,0.6)', borderRight:'1px solid rgba(212,168,80,0.6)' }}/>
      <div style={{ ...S.corner, bottom:12, left:12,  borderBottom:'1px solid rgba(212,168,80,0.6)', borderLeft:'1px solid rgba(212,168,80,0.6)' }}/>
      <div style={{ ...S.corner, bottom:12, right:12, borderBottom:'1px solid rgba(212,168,80,0.6)', borderRight:'1px solid rgba(212,168,80,0.6)' }}/>

      {/* Mouse spotlight overlay */}
      <div className="card-spotlight" style={S.spotlight}/>

      {/* Media */}
      {node.mediaUrl && (
        <div style={S.mediaWrap}>
          {node.mediaType === 'video'
            ? <video src={node.mediaUrl} controls style={S.mediaEl}/>
            : <img   src={node.mediaUrl} alt={node.title} style={S.mediaEl}/>
          }
        </div>
      )}

      <div style={S.popupLabel}>Family Milestone</div>
      <h3  style={S.popupTitle}>{node.title}</h3>
      <p   className="popup-content-inner" style={S.popupContent}>{node.content}</p>

      <div style={S.authorRow}>
        <img
          src={node.user?.avatar ||
            'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
          alt="Author"
          style={S.authorAvatar}
        />
        <span style={S.authorName}>
          Inscribed by {node.user?.name?.split(' ')[0] || 'Unknown'}
        </span>
      </div>

      <div style={S.runeFooter}>✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SNAKE ROW  (one milestone)
───────────────────────────────────────────────────────────── */
function SnakeRow({ node, index, isLast }) {
  const isEven        = index % 2 === 0;
  const dateObj       = new Date(node.milestoneDate);
  const year          = dateObj.getFullYear();
  const formattedDate = dateObj.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

  const goldPath = isEven
    ? 'M 20 0 C 20 50, 80 50, 80 100'
    : 'M 80 0 C 80 50, 20 50, 20 100';

  return (
    <div className="snake-row" style={S.snakeRow} id={isLast ? "last-milestone" : ""}>

      {/* ── Gold snake SVG ── zIndex:1 stays BEHIND hover zone (z:20) */}
      {!isLast && (
        <svg
          className="snake-svg"
          style={S.snakeSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          overflow="visible"
        >
          <defs>
            <linearGradient id={`gg${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(212,168,80,0.7)"/>
              <stop offset="50%"  stopColor="rgba(232,200,122,1)"/>
              <stop offset="100%" stopColor="rgba(180,130,50,0.6)"/>
            </linearGradient>
          </defs>
          <path
            d={goldPath}
            fill="none"
            stroke={`url(#gg${index})`}
            strokeWidth="5"
            vectorEffect="non-scaling-stroke"
            className="gold-path"
          />
        </svg>
      )}

      {/* ── Hover zone ── z-index:20 via CSS class */}
      <div
        className="hover-zone"
        style={{ left: isEven ? '20%' : '80%' }}
      >
        {/* Orbital node */}
        <div style={S.nodeOuter}>
          <svg style={S.nodeRingSvg} viewBox="0 0 54 54" fill="none">
            <circle cx="27" cy="27" r="24"
              stroke="rgba(212,168,80,0.4)" strokeWidth="1" strokeDasharray="3 4"/>
            <circle cx="27" cy="3"  r="2.5" fill="rgba(212,168,80,0.9)"/>
            <circle cx="51" cy="27" r="2"   fill="rgba(212,168,80,0.7)"/>
            <circle cx="27" cy="51" r="2.5" fill="rgba(212,168,80,0.9)"/>
            <circle cx="3"  cy="27" r="2"   fill="rgba(212,168,80,0.7)"/>
          </svg>
          <div className="node-core" style={S.nodeCore}/>
        </div>

        {/* Date badge */}
        <div
          className="date-badge"
          style={{
            ...S.dateBadge,
            ...(isEven ? { left:'65px' } : { right:'65px', left:'auto' }),
          }}
        >
          <span style={S.dateMain}>{formattedDate}, {year}</span>
          <span style={S.dateTime}>{formattedTime}</span>
        </div>

        {/* Popup card */}
        <PopupCard node={node} isEven={isEven}/>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────── */
function FamilyTimelinePage() {
  const { user }    = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const exporterRef = useRef();
  const canvasRef   = useRef();

  useStarCanvas(canvasRef);

  /* ── Original API logic — unchanged ── */
  useEffect(() => {
    const fetchTimeline = async () => {
      if (!user?.activeCircleId) return;
      try {
        setLoading(true);
        const res = await api.get(`/timeline/${user.activeCircleId}`);
        setMilestones(res.data);
      } catch (error) {
        console.error('Failed to load Memory Lane', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [user?.activeCircleId]);

  if (!user) return null;

  return (
    <div style={S.page}>

      {/* Star canvas — z-index 0 */}
      <canvas ref={canvasRef} style={S.canvas}/>

      {/* Dust motes — z-index 1 */}
      <div style={S.dustLayer}>
        {MOTES.map(m => (
          <div key={m.id} style={{
            position:'absolute', borderRadius:'50%',
            width:`${m.size}px`, height:`${m.size}px`,
            left:m.left, top:m.top,
            background: m.gold
              ? 'radial-gradient(circle,rgba(212,168,80,0.18) 0%,transparent 70%)'
              : 'radial-gradient(circle,rgba(80,100,200,0.12) 0%,transparent 70%)',
            animation:`ltFloat ${m.dur} ${m.delay} infinite ease-in-out`,
            '--tx': m.tx, '--ty': m.ty,
          }}/>
        ))}
      </div>

      {/* ── Navbar intentionally removed ── */}

      {/* Page content — z-index 10 */}
      <div style={S.pageWrap}>

        {/* Header */}
        <div style={S.header}>
          <LogoOrb/>
          <BrandDivider/>
          <h1 style={S.pageTitle}>Memory Lane</h1>
          <p  style={S.pageSub}>Hover upon the golden nodes to unlock our sacred legacy.</p>
        </div>

        {/* Hidden PDF exporter — original logic preserved */}
        <LegacyBookExporter ref={exporterRef} milestones={milestones} circleName="Our Family"/>

        {/* Timeline */}
        {loading ? (
          <LoadingState/>
        ) : milestones.length === 0 ? (
          <EmptyState/>
        ) : (
          <div style={S.timelineWrap} className="timeline-container">
            {milestones.map((node, index) => (
              <SnakeRow
                key={node._id}
                node={node}
                index={index}
                isLast={index === milestones.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB: Download Memories — Fixed position styling */}
      {milestones.length > 0 && (
        <button
          className="fixed-fab-download"
          style={S.fabDownload}
          onClick={() => exporterRef.current?.generatePDF()}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Memories
          <span style={S.fabShimmer}/>
        </button>
      )}

      {/* ══════════════════════════════════════════
         ALL CSS
      ══════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,600&family=Space+Mono:wght@400;700&display=swap');

        /* ── Keyframes ── */
        @keyframes ltFloat {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          20%  { opacity:1; }
          80%  { opacity:0.7; }
          100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.2); }
        }
        @keyframes ltRingSpin  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes ltShine     { 0%{left:-100%} 60%,100%{left:150%} }
        @keyframes ltPulseGlow {
          0%,100%{ box-shadow:0 0 20px rgba(212,168,80,0.25),0 4px 15px rgba(0,0,0,0.5); }
          50%    { box-shadow:0 0 38px rgba(212,168,80,0.55),0 4px 15px rgba(0,0,0,0.5); }
        }
        @keyframes ltDot {
          0%,80%,100%{ transform:scale(0); opacity:0; }
          40%        { transform:scale(1); opacity:1; }
        }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.6)}       to{opacity:1;transform:scale(1)} }
        @keyframes nodeGlow {
          0%,100%{ box-shadow:0 0 10px rgba(212,168,80,0.3),0 0 0 2px rgba(212,168,80,0.2); }
          50%    { box-shadow:0 0 24px rgba(212,168,80,0.8),0 0 0 3px rgba(212,168,80,0.5); }
        }
        @keyframes breathGold {
          from{ filter:drop-shadow(0 0 4px rgba(212,168,80,0.5)); }
          to  { filter:drop-shadow(0 0 14px rgba(212,168,80,1)) drop-shadow(0 0 28px rgba(212,168,80,0.5)); }
        }
        @keyframes ringOrbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        /* ── Class-based animations ── */
        .gold-path { animation:breathGold 3s infinite alternate; }
        .node-core { animation:nodeGlow 2.5s infinite ease-in-out; }

        /* 🔥 FIX FOR FLOATING BUTTONS - Ensuring they are locked to viewport */
        .fixed-fab-download {
          position: fixed !important;
          bottom: 40px !important;
          right: 40px !important;
          z-index: 9999 !important;
        }

        /* ══════════════════════════════════════════
           Z-INDEX STACK (most important fix):
           canvas      → z:0   (stars, furthest back)
           dustLayer   → z:1   (motes)
           pageWrap    → z:10  (all page content)
           snake svg   → z:1   (line, behind node)
           hover-zone  → z:20  (node + badge, above line)
           popup-card  → z:50  (card, topmost)
        ══════════════════════════════════════════ */

        /* ── Hover zone ── */
        .hover-zone {
          position: absolute;
          top: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
          z-index: 20;
        }
        .hover-zone:hover { z-index: 100; }

        /* ── Popup: hidden by default, revealed on hover ── */
        .popup-card {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-50%) scale(0.88);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .hover-zone:hover .popup-card {
          opacity: 1        !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(-50%) scale(1) !important;
        }

        /* ── Node glow on hover ── */
        .hover-zone:hover .node-core {
          background: radial-gradient(circle,#e8c87a 0%,rgba(212,168,80,0.4) 60%,transparent 100%) !important;
          box-shadow: 0 0 30px #e8c87a, 0 0 60px rgba(212,168,80,0.5) !important;
          border-color: #fff !important;
        }

        /* ── Date badge highlight ── */
        .hover-zone:hover .date-badge {
          background: rgba(212,168,80,0.12)       !important;
          border-color: rgba(212,168,80,0.7)      !important;
          box-shadow: 0 0 20px rgba(212,168,80,0.25) !important;
          transform: scale(1.06)                  !important;
        }

        /* ── Mouse spotlight inside card ── */
        .card-spotlight {
          background: radial-gradient(
            circle 140px at var(--mx, 50%) var(--my, 50%),
            rgba(212,168,80,0.08),
            transparent 70%
          );
        }

        /* ── Popup scrollbar ── */
        .popup-content-inner::-webkit-scrollbar       { width: 3px; }
        .popup-content-inner::-webkit-scrollbar-thumb { background: rgba(212,168,80,0.3); border-radius: 3px; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .snake-row  { height: 150px !important; }
          .hover-zone { left: 40px !important; }
          .snake-svg  { display: none !important; }
          .snake-row::before {
            content: '';
            position: absolute; top: 0; bottom: 0; left: 40px; width: 5px;
            background: linear-gradient(to bottom,
              rgba(212,168,80,0.8),
              rgba(232,200,122,1),
              rgba(180,130,50,0.6)
            );
            transform: translateX(-50%);
            filter: drop-shadow(0 0 6px rgba(212,168,80,0.6));
          }
          .snake-row:last-child::before { bottom: 50%; }
          .popup-card {
            left: 50vw !important;
            right: auto !important;
            transform: translate(-50vw, -10px) scale(0.9) !important;
            width: calc(100vw - 40px) !important;
          }
          .hover-zone:hover .popup-card {
            transform: translate(-50vw, 0) scale(1) !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STYLE OBJECTS
───────────────────────────────────────────────────────────── */
const S = {

  page: {
    backgroundColor: '#06080f',
    minHeight: '100vh',
    fontFamily: "'Cormorant Garamond', serif",
    color: 'rgba(255,255,255,0.88)',
    overflowX: 'hidden',
    position: 'relative',
  },

  canvas: {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },

  dustLayer: {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none', overflow: 'hidden',
    zIndex: 1,
  },

  pageWrap: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1100px', margin: '0 auto',
    padding: '40px 20px 140px',
    animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
  },

  header: { textAlign: 'center', marginBottom: '70px' },

  pageTitle: {
    fontFamily: "'Cinzel', serif",
    fontWeight: 700, fontSize: '3.4rem',
    color: '#e8c87a',
    textShadow: '0 0 40px rgba(212,168,80,0.3)',
    margin: '0 0 10px 0', lineHeight: 1.1,
  },

  pageSub: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic', fontSize: '1.15rem',
    color: 'rgba(255,255,255,0.38)',
  },

  logoWrap: {
    width: 90, height: 90,
    position: 'relative', margin: '0 auto 18px',
    cursor: 'pointer',
    animation: 'scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both',
  },

  logoRing: {
    position: 'absolute', inset: 0,
    animation: 'ltRingSpin 18s linear infinite',
  },

  logoInner: {
    position: 'absolute', inset: 10,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#1a1410,#0f0c08)',
    border: '1px solid rgba(212,168,80,0.3)',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  logoImg: { width: '110%', height: '110%', objectFit: 'cover' },

  logoFallback: {
    fontFamily: "'Cinzel', serif",
    color: '#e8c87a', fontSize: 18, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  brandDiv: {
    display: 'flex', alignItems: 'center', gap: 10,
    justifyContent: 'center', marginBottom: 24,
  },

  brandLine: {
    height: 1, maxWidth: 50, flex: 1,
    background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6))',
  },

  brandName: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: 'rgba(212,168,80,0.55)',
  },

  timelineWrap: { position: 'relative', padding: '20px 0' },

  snakeRow: {
    position: 'relative', width: '100%', height: 260,
    overflow: 'visible',
  },

  snakeSvg: {
    position: 'absolute', top: '50%', left: 0,
    width: '100%', height: '100%',
    zIndex: 1,
    pointerEvents: 'none', overflow: 'visible',
  },

  nodeOuter: {
    width: 54, height: 54,
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  },

  nodeRingSvg: {
    position: 'absolute', inset: 0,
    animation: 'ringOrbit 6s linear infinite',
  },

  nodeCore: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(232,200,122,0.25) 0%,#0c1020 70%)',
    border: '2px solid rgba(212,168,80,0.7)',
    zIndex: 2,
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  },

  dateBadge: {
    position: 'absolute',
    background: 'rgba(8,11,24,0.92)',
    border: '1px solid rgba(212,168,80,0.28)',
    borderRadius: 30, padding: '8px 18px',
    whiteSpace: 'nowrap', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.3,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  },

  dateMain: {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.95rem', fontWeight: 700, color: '#e8c87a',
    textShadow: '0 0 10px rgba(212,168,80,0.4)',
  },

  dateTime: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.7rem', letterSpacing: '1px',
    color: 'rgba(212,168,80,0.55)', textTransform: 'uppercase',
  },

  popupCard: {
    position: 'absolute', top: '50%',
    width: 370,
    background: 'rgba(8,11,24,0.97)',
    border: '1px solid rgba(212,168,80,0.22)',
    borderRadius: 20,
    padding: 22,
    boxShadow: '0 24px 70px rgba(0,0,0,0.9), 0 0 40px rgba(212,168,80,0.07)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    zIndex: 50,
    isolation: 'isolate',
  },

  shimmerTop: {
    position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
    background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)',
    borderRadius: 1, pointerEvents: 'none',
  },

  shimmerBottom: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1,
    background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)',
    borderRadius: 1, pointerEvents: 'none',
  },

  corner: {
    position: 'absolute', width: 18, height: 18,
    pointerEvents: 'none',
  },

  spotlight: {
    position: 'absolute', inset: 0, borderRadius: 20,
    pointerEvents: 'none', zIndex: 0,
  },

  mediaWrap: {
    borderRadius: 14, overflow: 'hidden',
    marginBottom: 14, background: '#000',
    position: 'relative', zIndex: 1,
  },

  mediaEl: { width: '100%', maxHeight: 190, objectFit: 'cover', display: 'block' },

  popupLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: '2.5px',
    textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)',
    marginBottom: 6, position: 'relative', zIndex: 1,
  },

  popupTitle: {
    fontFamily: "'Cinzel', serif", fontWeight: 700,
    fontSize: '1.25rem', color: '#e8c87a',
    textShadow: '0 0 20px rgba(212,168,80,0.2)',
    marginBottom: 10, position: 'relative', zIndex: 1,
  },

  popupContent: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic', fontSize: '0.98rem',
    color: 'rgba(255,255,255,0.78)', lineHeight: 1.65,
    marginBottom: 14, maxHeight: 110, overflowY: 'auto',
    position: 'relative', zIndex: 1,
  },

  authorRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    position: 'relative', zIndex: 1,
  },

  authorAvatar: {
    width: 26, height: 26, borderRadius: '50%',
    objectFit: 'cover', border: '1px solid rgba(212,168,80,0.4)',
  },

  authorName: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.72rem', letterSpacing: '0.5px',
    color: 'rgba(212,168,80,0.55)', textTransform: 'uppercase',
  },

  runeFooter: {
    fontFamily: "'Cinzel', serif", fontSize: 10,
    letterSpacing: '4px', color: 'rgba(212,168,80,0.18)',
    textAlign: 'center', userSelect: 'none',
    marginTop: 10, position: 'relative', zIndex: 1,
  },

  loadingWrap: {
    textAlign: 'center', padding: '60px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },

  loadingText: {
    fontFamily: "'Cinzel', serif",
    color: 'rgba(212,168,80,0.7)', fontSize: '1.1rem', letterSpacing: '2px',
  },

  dotsWrap: { display: 'inline-flex', gap: 6 },

  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(212,168,80,0.7)', display: 'inline-block',
    animation: 'ltDot 1.4s infinite ease-in-out',
  },

  emptyBox: {
    textAlign: 'center', padding: 50,
    background: 'rgba(12,16,32,0.7)',
    border: '1px dashed rgba(212,168,80,0.2)',
    borderRadius: 20, backdropFilter: 'blur(10px)',
  },

  emptyTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '1.4rem',
    color: 'rgba(212,168,80,0.6)', marginBottom: 10,
  },

  emptySub: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic', color: 'rgba(255,255,255,0.35)',
  },

  fabDownload: {
    position: 'fixed', bottom: 40, right: 40, zIndex: 200,
    background: 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
    backgroundSize: '200%',
    color: '#1a0f00', border: 'none', borderRadius: 50,
    padding: '14px 24px',
    fontFamily: "'Cinzel', serif",
    fontSize: 12, fontWeight: 700, letterSpacing: 2,
    textTransform: 'uppercase', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'ltPulseGlow 3s infinite ease-in-out',
    overflow: 'hidden',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  },

  fabShimmer: {
    position: 'absolute', top: 0, height: '100%', width: '38%',
    background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
    transform: 'skewX(-20deg)',
    animation: 'ltShine 3s infinite',
    pointerEvents: 'none',
  },
};

export default FamilyTimelinePage;