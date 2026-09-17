import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom'; 
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../api/axios';
import LegacyBookExporter from '../components/features/LegacyBookExporter';

// ─── Comic Background Elements ─────────────────────────────────────────────────
function ComicBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 60, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>🛤️</motion.div>
      <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', top: '40%', right: '8%', fontSize: 50, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>📸</motion.div>
      <motion.div animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: 70, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>✂️</motion.div>
    </div>
  );
}

// ─── Logo Badge ────────────────────────────────────────────────────────────────
function LogoBadge({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#D4B895', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', overflow: 'hidden', animation: 'spin 10s linear infinite' }}>
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

// ─── LOADING STATE ───────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3E2723' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ display: 'inline-block', marginBottom: 10 }}>⏳</motion.div>
      <div>FLIPPING THROUGH TIME...</div>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px', background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)', margin: '40px auto', maxWidth: 600 }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>👻</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: #FDFBF7, margin: '0 0 10px' }}>
        IT'S A GHOST TOWN!
      </h3>
      <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: '#3E2723', margin: 0 }}>
        Mark memories as "Family Milestone" to build this timeline!
      </p>
    </div>
  );
}

// ─── POPUP CARD (COMIC PANEL) ────────────────────────────────────────────────
function PopupCard({ node, isEven }) {
  const cardSideStyle = isEven ? { left: '70px', right: 'auto' } : { right: '70px', left: 'auto' };
  
  const isOldStory = node?.milestoneDate && new Date() - new Date(node.milestoneDate) > 1000 * 60 * 60 * 24 * 365;
  const vintageFilter = isOldStory ? 'sepia(0.5) contrast(0.9) brightness(1.05)' : 'none';

  return (
    <div className="popup-card" style={{ position: 'absolute', top: '50%', width: 380, background: '#FFF', border: 'var(--comic-border)', borderRadius: 20, padding: 20, boxShadow: 'var(--comic-shadow)', zIndex: 50, transform: 'translateY(-50%) scale(0.9)', opacity: 0, visibility: 'hidden', pointerEvents: 'none', transition: 'all 0.2s', ...cardSideStyle }}>
      {node.mediaUrl && (
        <div className="scrapbook-tape" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--pop-black)', background: 'var(--pop-black)' }}>
          {node.mediaType === 'video' ? <video src={node.mediaUrl} controls style={{ width: '100%', maxHeight: 200, display: 'block', filter: vintageFilter }} /> : <img src={node.mediaUrl} alt={node.title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block', filter: vintageFilter }} />}
        </div>
      )}
      <div style={{ background: 'var(--pop-yellow)', display: 'inline-block', padding: '4px 12px', border: '2px solid var(--pop-black)', borderRadius: 8, fontFamily: "'Playfair Display', serif", fontSize: 12, color: 'var(--pop-black)', marginBottom: 8, transform: 'rotate(-2deg)' }}>
        MILESTONE! ⭐
      </div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--pop-pink)', margin: '0 0 8px', lineHeight: 1.1 }}>{node.title}</h3>
      <p className="handwriting" style={{ marginBottom: 16, maxHeight: 100, overflowY: 'auto' }}>{node.content}</p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F5F5', padding: '8px 12px', borderRadius: 12, border: '2px dashed var(--pop-black)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--pop-black)', background: 'var(--pop-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {node.user?.avatar ? <img src={node.user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16 }}>{node.user?.name?.charAt(0) || 'U'}</span>}
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: 'var(--pop-black)' }}>By {node.user?.name?.split(' ')[0] || 'Unknown'}</span>
      </div>
    </div>
  );
}

// ─── CLOTHESPIN (pins the memory to the line) ────────────────────────────────
const PIN_COLORS = ['var(--pop-yellow)', 'var(--pop-cyan)', 'var(--pop-pink)', 'var(--pop-orange)'];
function ClothesPin({ index }) {
  const color = PIN_COLORS[index % PIN_COLORS.length];
  const tilt = index % 2 === 0 ? -10 : 10;
  return (
    <svg width="34" height="46" viewBox="0 0 40 54" style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${tilt}deg)`, zIndex: 15, filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.45))' }}>
      <rect x="4" y="2" width="14" height="50" rx="6" fill={color} stroke="var(--pop-black)" strokeWidth="3" />
      <rect x="22" y="2" width="14" height="50" rx="6" fill={color} stroke="var(--pop-black)" strokeWidth="3" />
      <circle cx="20" cy="15" r="7" fill="var(--pop-black)" />
      <circle cx="20" cy="15" r="3.5" fill="#FFF" />
    </svg>
  );
}

// ─── SNAKE ROW (hangs off the central clothesline) ───────────────────────────
function SnakeRow({ node, index }) {
  const isEven = index % 2 === 0;
  const dateObj = new Date(node.milestoneDate);
  const year = dateObj.getFullYear();
  const formattedDate = dateObj.toLocaleDateString('en-US', { month:'short', day:'numeric' }).toUpperCase();
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }).toUpperCase();

  return (
    <div className="snake-row" style={{ position: 'relative', width: '100%', height: 220 }}>

      {/* Twine stub connecting the node to the central rope */}
      <div className="twine-stub" style={{
        position: 'absolute', top: '50%', height: 4, zIndex: 2,
        background: 'repeating-linear-gradient(to right, #8B6142 0 6px, transparent 6px 11px)',
        ...(isEven ? { left: '20%', width: '30%' } : { left: '50%', width: '30%' })
      }} />

      <ClothesPin index={index} />

      <div className="hover-zone" style={{ position: 'absolute', top: '50%', left: isEven ? '20%' : '80%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>

        {/* The Node (Sticker) */}
        <div className="node-outer" style={{ width: 64, height: 64, background: 'var(--pop-pink)', border: 'var(--comic-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--comic-shadow)', transition: 'all 0.2s', cursor: 'pointer', zIndex: 10 }}>
          <div style={{ width: 32, height: 32, background: '#FFF', borderRadius: '50%', border: '1px solid var(--pop-black)' }} />
        </div>

        {/* Date Badge */}
        <div className="date-badge" style={{ position: 'absolute', background: '#FFF', border: 'var(--comic-border)', borderRadius: 12, padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--comic-shadow)', transition: 'all 0.2s', zIndex: 5, ...(isEven ? { left: '75px' } : { right: '75px', left: 'auto' }) }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--pop-cyan)', whiteSpace: 'nowrap' }}>{formattedDate}, {year}</span>
          <span className="handwriting" style={{ fontSize: 16, marginTop: '-4px' }}>{formattedTime}</span>
        </div>

        <PopupCard node={node} isEven={isEven}/>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function FamilyTimelinePage() {
  const { user }    = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const exporterRef = useRef();

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
    <div style={{ minHeight: '100vh', paddingBottom: 140, position: 'relative' }}>
      
      <ComicBackground />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <LogoBadge size={100} />
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', color: #FDFBF7, margin: '20px 0 10px', letterSpacing: 2 }}>
            MEMORY LANE 🛤️
          </motion.h1>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#3E2723', margin: '0 auto', background: '#C89B3C', display: 'inline-block', padding: '4px 16px', border: 'none', borderRadius: 8, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-2deg)' }}>
            Hover on the dots to unfold the story!
          </p>
        </div>

        {/* Hidden PDF exporter */}
        <LegacyBookExporter ref={exporterRef} milestones={milestones} circleName="Our Family"/>

        {/* Timeline */}
        {loading ? (
          <LoadingState/>
        ) : milestones.length === 0 ? (
          <EmptyState/>
        ) : (
          <div className="memory-track" style={{ padding: '20px 0', position: 'relative' }}>
            <div className="memory-rope" />
            {milestones.map((node, index) => (
              <SnakeRow key={node._id} node={node} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* FAB: Download Memories */}
      {milestones.length > 0 && (
        <motion.button
          onClick={() => exporterRef.current?.generatePDF()}
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' }}
          style={{
            position: 'fixed', bottom: 40, right: 40, zIndex: 9999,
            background: '#00C853', border: 'none', borderRadius: 16,
            padding: '16px 24px', fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#FFF',
            cursor: 'pointer', boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 10,
            transition: 'box-shadow 0.1s, transform 0.1s'
          }}
        >
          <span style={{ fontSize: 28 }}>🖨️</span> PRINT COMIC!
        </motion.button>
      )}

      {/* ══════════════════════════════════════════
         ALL CSS (Hover interactions fixed here)
      ══════════════════════════════════════════ */}
      <style>{`
        /* Central clothesline: twisted rope texture with black casing */
        .memory-rope {
          position: absolute; top: 0; bottom: 0; left: 50%; width: 10px;
          transform: translateX(-50%);
          background: repeating-linear-gradient(-45deg, #D9B382 0 6px, #B8935F 6px 12px);
          border-left: 3px solid #3E2723;
          border-right: 3px solid #3E2723;
          border-radius: 4px;
          z-index: 1;
        }

        .hover-zone:hover { z-index: 100 !important; }
        .hover-zone:hover .node-outer {
          background: #D4B895 !important;
          transform: scale(1.2) rotate(10deg);
        }
        .hover-zone:hover .date-badge {
          background: #C89B3C !important;
          transform: scale(1.1) rotate(-5deg);
        }
        .hover-zone:hover .popup-card {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(-50%) scale(1) !important;
        }

        /* Mobile specific adjustments */
        @media (max-width: 768px) {
          .snake-row   { height: 190px !important; }
          .hover-zone  { left: 40px !important; }
          .twine-stub  { display: none !important; }

          /* Rope moves to the left edge and pins sit directly on it */
          .memory-rope { left: 40px !important; width: 8px !important; }
          .snake-row .node-outer ~ svg,
          .snake-row svg { left: 40px !important; }

          .popup-card {
            left: 50vw !important; right: auto !important;
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

export default FamilyTimelinePage;