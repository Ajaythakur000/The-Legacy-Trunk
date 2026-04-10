import { useEffect, useState, useMemo, useRef } from 'react';
import { getMyStoriesApi, deleteStoryApi, toggleLikeStoryApi, addCommentToStoryApi, updateStoryApi } from '../../api/storyApi';
import StoryCard from './StoryCard';
import StorySkeleton from '../shared/StorySkeleton';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Star Canvas ────────────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId, frame = 0;
    const stars = [];
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 140; i++) stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    });
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach(s => {
        const a = 0.25 + 0.5 * Math.sin(frame * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

// ── Dust Motes ────────────────────────────────────────────────────────────────
function DustMotes() {
  const motes = useRef(Array.from({ length: 18 }, (_, i) => ({
    id: i,
    lx:    `${Math.random() * 100}%`,
    lt:    `${Math.random() * 100}%`,
    tx:    `${Math.random() * 60 - 30}px`,
    ty:    `${-30 - Math.random() * 50}px`,
    sz:    `${4 + Math.random() * 8}px`,
    dur:   `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 10}s`,
    color: ['rgba(212,168,80,0.7)', 'rgba(100,140,220,0.5)', 'rgba(180,140,80,0.6)'][Math.floor(Math.random() * 3)],
  }))).current;

  return (
    <>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute',
          left: m.lx, top: m.lt,
          width: m.sz, height: m.sz,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${m.color}, transparent 70%)`,
          animation: `ltFloat ${m.dur} ${m.delay} ease-in-out infinite`,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}
    </>
  );
}

// ── Orbital Logo ──────────────────────────────────────────────────────────────
function VaultLogo() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, delay: 0.15 }}
      style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 18px' }}
    >
      <svg style={{ position: 'absolute', inset: 0, animation: 'ltRingSpin 18s linear infinite' }}
        viewBox="0 0 84 84" fill="none">
        <circle cx="42" cy="42" r="38" stroke="rgba(212,168,80,0.22)" strokeWidth="1"/>
        <circle cx="42" cy="4"  r="2.8" fill="rgba(212,168,80,0.85)"/>
        <circle cx="42" cy="80" r="2.8" fill="rgba(212,168,80,0.85)"/>
        <circle cx="4"  cy="42" r="2.8" fill="rgba(212,168,80,0.85)"/>
        <circle cx="80" cy="42" r="2.8" fill="rgba(212,168,80,0.85)"/>
        <circle cx="12.5" cy="12.5" r="2.2" fill="rgba(212,168,80,0.5)"/>
        <circle cx="71.5" cy="71.5" r="2.2" fill="rgba(212,168,80,0.5)"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 12,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a1410, #0f0c08)',
        border: '1px solid rgba(212,168,80,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cinzel', serif", color: '#e8c87a',
        fontSize: 12, fontWeight: 700, overflow: 'hidden',
      }}>
        <img src="/finall_logo.png" alt="LT"
          style={{ width: '110%', height: '110%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span style={{ position: 'absolute' }}>LT</span>
      </div>
    </motion.div>
  );
}

// ── Filter Tabs (Animated Pill) ────────────────────────────────────────────────
function FilterTabs({ filters, activeFilter, onFilterChange }) {
  const wrapRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const tabs = wrapRef.current.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
      if (tab.dataset.tab === activeFilter) {
        const wr = wrapRef.current.getBoundingClientRect();
        const tr = tab.getBoundingClientRect();
        setPillStyle({ left: tr.left - wr.left - 5, width: tr.width + 10 });
      }
    });
  }, [activeFilter]);

  return (
    <div ref={wrapRef} style={{
      display: 'flex', background: 'rgba(12,16,32,0.85)',
      border: '1px solid rgba(212,168,80,0.18)',
      borderRadius: 50, padding: 5, gap: 4,
      position: 'relative', width: '100%',
    }}>
      {/* Animated Pill */}
      <motion.div
        animate={pillStyle}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        style={{
          position: 'absolute', top: 5, bottom: 5,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #c9933a, #e8a820, #c9933a)',
          backgroundSize: '200%',
          animation: 'ltPulseGlow 3s ease-in-out infinite',
          zIndex: 1,
          ...pillStyle,
        }}
      />
      {filters.map(f => (
        <button
          key={f.id}
          data-tab={f.id}
          onClick={() => onFilterChange(f.id)}
          style={{
            flex: 1, padding: '11px 12px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            borderRadius: 40,
            fontFamily: "'Cinzel', serif", fontSize: 10,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: activeFilter === f.id ? '#1a0f00' : 'rgba(255,255,255,0.38)',
            transition: 'color 0.3s', position: 'relative', zIndex: 2,
            fontWeight: activeFilter === f.id ? 700 : 400,
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ hasStories }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        textAlign: 'center', padding: '60px 32px',
        background: 'rgba(12,16,32,0.85)',
        border: '1px solid rgba(212,168,80,0.15)',
        borderRadius: 20, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Shimmer lines */}
      <div style={{ position:'absolute',top:0,left:'20%',right:'20%',height:1,
        background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent)' }}/>

      <div style={{ fontSize: 56, marginBottom: 20 }}>
        {hasStories ? '🔍' : '📭'}
      </div>
      <h3 style={{
        fontFamily: "'Cinzel', serif", color: '#e8c87a',
        fontSize: '1.3rem', fontWeight: 700,
        marginBottom: 10, letterSpacing: 1,
      }}>
        {hasStories ? 'No Stories in This Realm' : 'The Vault Awaits'}
      </h3>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic', fontSize: '1.05rem',
        color: 'rgba(255,255,255,0.35)', lineHeight: 1.7,
      }}>
        {hasStories
          ? 'No memories found in this category. Try another filter.'
          : "You haven't added any personal stories to the vault yet."}
      </p>

      {/* Rune footer inside card */}
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: 9,
        letterSpacing: '4px', color: 'rgba(212,168,80,0.15)',
        userSelect: 'none', marginTop: 28,
      }}>
        ✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ✦
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all',       label: 'All Memories' },
    { id: 'milestone', label: 'Milestones'   },
    { id: 'global',    label: 'Global'        },
  ];

  const loadMyStories = async () => {
    setLoading(true);
    try {
      const data = await getMyStoriesApi();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load my stories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMyStories(); }, []);

  const handleLike    = async (id) => {
    try { await toggleLikeStoryApi(id); await loadMyStories(); toast.success('Liked! ✦'); }
    catch { toast.error('Failed to like'); }
  };
  const handleComment = async (id, text) => {
    const tId = toast.loading('Posting...');
    try { await addCommentToStoryApi(id, text); await loadMyStories(); toast.success('Comment added!', { id: tId }); }
    catch { toast.error('Could not post', { id: tId }); }
  };
  const handleDelete  = async (id) => {
    const tId = toast.loading('Deleting from the vault...');
    try { await deleteStoryApi(id); await loadMyStories(); toast.success('Memory released', { id: tId }); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete', { id: tId }); }
  };
  const handleEdit    = async (storyId, updatedData) => {
    const tId = toast.loading('Rewriting the scroll...');
    try { await updateStoryApi(storyId, updatedData); await loadMyStories(); toast.success('Memory updated! ✦', { id: tId }); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to update', { id: tId }); }
  };

  const filteredStories = useMemo(() => {
    if (activeFilter === 'milestone') return stories.filter(s => s.isMilestone);
    if (activeFilter === 'global')    return stories.filter(s => s.isGlobalPublic);
    return stories;
  }, [stories, activeFilter]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Space+Mono:wght@400;700&display=swap');

        @keyframes ltRingSpin  { to { transform: rotate(360deg); } }
        @keyframes ltPulseGlow {
          0%,100% { box-shadow: 0 4px 16px rgba(212,168,80,0.25); }
          50%     { box-shadow: 0 4px 28px rgba(212,168,80,0.55); }
        }
        @keyframes ltFloat {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          20%  { opacity:.7; }
          80%  { opacity:.3; }
          100% { opacity:0; transform:translate(var(--tx,20px),var(--ty,-50px)) scale(.15); }
        }
        @keyframes ltShimmerMove {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: '#06080f',
          minHeight: '100vh',
          paddingBottom: 80,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        <StarCanvas />
        <DustMotes />

        {/* ── HERO HEADER ── */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '52px 24px 0' }}>
          <VaultLogo />

          {/* Brand Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:28 }}>
            <div style={{ width:44,height:1,background:'linear-gradient(90deg,transparent,rgba(212,168,80,.5))' }}/>
            <span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'2.5px',color:'rgba(212,168,80,.55)',textTransform:'uppercase' }}>
              The Legacy Trunk
            </span>
            <div style={{ width:44,height:1,background:'linear-gradient(90deg,rgba(212,168,80,.5),transparent)' }}/>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
              fontWeight: 700,
              color: '#e8c87a',
              textShadow: '0 0 40px rgba(212,168,80,0.4)',
              letterSpacing: 2,
              margin: '0 0 14px',
            }}
          >
            My Personal Archive
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{
              display: 'inline-block',
              background: 'rgba(212,168,80,0.1)',
              border: '1px solid rgba(212,168,80,0.3)',
              borderRadius: 20, padding: '6px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: '2px',
              color: 'rgba(212,168,80,0.8)',
              textTransform: 'uppercase',
              marginBottom: 44,
            }}
          >
            {loading ? 'Reading the vault...' : `Preserving ${stories.length} memor${stories.length === 1 ? 'y' : 'ies'}`}
          </motion.div>
        </div>

        {/* ── FILTER TABS ── */}
        {!loading && stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              position: 'relative', zIndex: 2,
              maxWidth: 680, margin: '0 auto 36px',
              padding: '0 20px',
            }}
          >
            <FilterTabs
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </motion.div>
        )}

        {/* ── FEED ── */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StorySkeleton />
              <StorySkeleton />
            </div>
          ) : stories.length === 0 ? (
            <EmptyState hasStories={false} />
          ) : filteredStories.length === 0 ? (
            <EmptyState hasStories={true} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <AnimatePresence mode="popLayout">
                {filteredStories.map((s, index) => (
                  <motion.div
                    key={s._id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StoryCard
                      story={s}
                      currentUser={user}
                      onLike={handleLike}
                      onComment={handleComment}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Rune Footer */}
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 9,
          letterSpacing: '4px', color: 'rgba(212,168,80,0.15)',
          userSelect: 'none', textAlign: 'center',
          marginTop: 48, position: 'relative', zIndex: 2,
        }}>
          ✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦
        </div>
      </motion.div>
    </>
  );
}

export default MyStoriesPage;