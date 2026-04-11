import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import StoryCommentBox from './StoryCommentBox';
import StoryExportTemplate from './StoryExportTemplate';
import { motion, AnimatePresence } from 'framer-motion';

function CornerAccents({ size = 14, inset = 10, opacity = 0.3 }) {
  const base = { position: 'absolute', width: size, height: size, borderColor: `rgba(212,168,80,${opacity})`, borderStyle: 'solid' };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset, borderWidth: '1px 0 0 1px', borderRadius: '3px 0 0 0' }} />
      <div style={{ ...base, top: inset, right: inset, borderWidth: '1px 1px 0 0', borderRadius: '0 3px 0 0' }} />
      <div style={{ ...base, bottom: inset, left: inset, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 3px' }} />
      <div style={{ ...base, bottom: inset, right: inset, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

// Gold gradient def — shared across icons
const GOLD_GRAD_ID = 'ltShieldGrad';
const GoldGradDef = () => (
  <defs>
    <linearGradient id={GOLD_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stopColor="rgba(232,200,122,0.95)" />
      <stop offset="100%" stopColor="rgba(180,130,40,0.75)" />
    </linearGradient>
  </defs>
);

// ── Curio Button shell ────────────────────────────────────────────────────────
function CurioBtn({ onClick, active, children, style: extra, className = '' }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.94 }}
      className={className}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 13px',
        borderRadius: 12,
        border: `1px solid ${hov || active ? 'rgba(212,168,80,0.38)' : 'rgba(212,168,80,0.12)'}`,
        background: hov
          ? 'linear-gradient(135deg,rgba(212,168,80,0.08),rgba(212,168,80,0.03))'
          : 'rgba(12,16,32,0.55)',
        cursor: 'pointer',
        transition: 'border-color .25s, background .25s',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.35),0 0 0 1px rgba(212,168,80,0.08)' : 'none',
        ...extra,
      }}
    >
      {children}
    </motion.button>
  );
}

// ── Icon medallion ────────────────────────────────────────────────────────────
function IconMedallion({ active, activeGlow = 'rgba(212,168,80,0.35)', pulse = false, children }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      background: active
        ? 'radial-gradient(circle at 35% 35%,rgba(212,168,80,0.45),rgba(180,130,40,0.25))'
        : 'radial-gradient(circle at 35% 35%,rgba(212,168,80,0.14),rgba(212,168,80,0.05))',
      border: `1px solid ${active ? 'rgba(212,168,80,0.65)' : 'rgba(212,168,80,0.2)'}`,
      boxShadow: active
        ? `0 0 ${pulse ? '20px' : '12px'} ${activeGlow}, inset 0 1px 0 rgba(255,255,255,0.1)`
        : 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.2)',
      transition: 'all .35s',
      animation: active && pulse ? 'ltIconPulse 2.5s ease-in-out infinite' : 'none',
    }}>
      {children}
    </div>
  );
}

// ── Curio label ───────────────────────────────────────────────────────────────
function CurioLabel({ count, name, active, activeColor = '#e8c87a' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', color: active ? activeColor : 'rgba(212,168,80,0.5)', lineHeight: 1, transition: 'color .25s' }}>
        {count}
      </span>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: '2px', textTransform: 'uppercase', color: active ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.3)', lineHeight: 1, marginTop: 3, transition: 'color .25s' }}>
        {name}
      </span>
    </div>
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────
const BarSep = () => (
  <div style={{ width: 1, height: 36, background: 'rgba(212,168,80,0.1)', flexShrink: 0, margin: '0 2px' }} />
);

function StoryCard({ story, currentUser, onLike, onComment, onDelete, onEdit }) {
  const isAuthor = Boolean(currentUser?._id && story?.user?._id && String(story.user._id) === String(currentUser._id));
  const storyCircleId = typeof story?.originCircleId === 'object' && story?.originCircleId?._id ? story.originCircleId._id : story?.originCircleId || null;
  const currentUserCircleId = typeof currentUser?.activeCircleId === 'object' && currentUser?.activeCircleId?._id ? currentUser.activeCircleId._id : currentUser?.activeCircleId || null;
  const isCircleAdmin = Boolean(currentUser?.role === 'admin' && currentUserCircleId && storyCircleId && String(currentUserCircleId) === String(storyCircleId));
  const canManage = isAuthor || isCircleAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story?.title || '');
  const [editContent, setEditContent] = useState(story?.content || '');
  const [showComments, setShowComments] = useState(false);
  const [showShieldAnim, setShowShieldAnim] = useState(false);
  const isLikedByMe = Boolean(currentUser?._id && story?.likes?.some(id => String(id) === String(currentUser._id)));
  const [isShared, setIsShared] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const exportRef = useRef();
  const cardRef = useRef(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const images = [];
  if (story?.mediaUrls?.length > 0) images.push(...story.mediaUrls);
  else if (story?.mediaUrl) images.push(story.mediaUrl);

  useEffect(() => {
    let t; if (showShieldAnim) t = setTimeout(() => setShowShieldAnim(false), 1000);
    return () => clearTimeout(t);
  }, [showShieldAnim]);

  useEffect(() => {
    let t; if (isShared) t = setTimeout(() => setIsShared(false), 2000);
    return () => clearTimeout(t);
  }, [isShared]);

  const handleSaveEdit = () => {
    if (onEdit && story?._id) { onEdit(story._id, { title: editTitle, content: editContent }); setIsEditing(false); }
  };

  const getFormattedDates = () => {
    if (!story?.createdAt) return { displayDate: '', eventBadge: null, timeTravelBadge: null };
    const postDateObj = new Date(story.createdAt);
    const postDateStr = postDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let eventDateStr = null, timeTravelBadge = null;
    if (story.isMilestone && story.milestoneDate) {
      const eventDateObj = new Date(story.milestoneDate);
      eventDateStr = eventDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const yearDiff = postDateObj.getFullYear() - eventDateObj.getFullYear();
      if (yearDiff > 0) timeTravelBadge = `⏳ ${yearDiff} Year${yearDiff > 1 ? 's' : ''} Ago`;
    }
    if (eventDateStr === postDateStr) return { displayDate: postDateStr, eventBadge: null, timeTravelBadge: null };
    return { displayDate: postDateStr, eventBadge: eventDateStr ? `Event: ${eventDateStr}` : null, timeTravelBadge };
  };
  const { displayDate, eventBadge, timeTravelBadge } = getFormattedDates();

  const handleShare = async () => {
    if (!story?._id) return;
    const shareData = { title: story.title || 'Family Memory', text: `Check out this memory: "${story.title || 'A special moment'}"`, url: `${window.location.origin}/vault-stories/${story._id}` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); toast.success('Link copied! 📋', { style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } }); setIsShared(true); }
    } catch {}
  };

  const handleDownloadImage = async () => {
    if (exportRef.current) { exportRef.current.generateImage(); setIsDownloaded(true); setTimeout(() => setIsDownloaded(false), 1200); }
  };

  const handleDoubleTap = (e) => {
    e.preventDefault();
    if (!isLikedByMe && story?._id && typeof onLike === 'function') onLike(story._id);
    setShowShieldAnim(false);
    setTimeout(() => setShowShieldAnim(true), 10);
  };

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto/');
  };

  const renderMediaGrid = () => {
    if (images.length === 0) return null;
    if (story?.mediaType === 'video') {
      return (
        <div style={{ marginTop: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,168,80,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <video controls preload="metadata" style={{ width: '100%', maxHeight: 500, background: '#000', display: 'block' }}>
            <source src={images[0]} />
          </video>
        </div>
      );
    }
    const imgProps = {
      loading: 'lazy', decoding: 'async',
      onError: e => { e.target.onerror = null; e.target.src = '/web-app-manifest-512x512.png'; e.target.style.objectFit = 'contain'; e.target.style.padding = '20px'; },
    };
    const count = images.length;
    const ShieldAnim = () => showShieldAnim ? (
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: 'shieldPop 1s cubic-bezier(0.175,0.885,0.32,1.275) forwards', pointerEvents: 'none', filter: 'drop-shadow(0 10px 20px rgba(212,168,80,0.6))' }}>
        <svg width="110" height="110" viewBox="0 0 24 24" fill="rgba(212,168,80,0.9)" stroke="rgba(232,200,122,0.5)" strokeWidth="1">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
    ) : null;

    if (count === 1) {
      return (
        <div onDoubleClick={handleDoubleTap} style={{ position: 'relative', marginTop: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,168,80,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', cursor: 'pointer', userSelect: 'none' }}>
          <img {...imgProps} src={getOptimizedUrl(images[0])} alt={story?.title} style={{ width: '100%', maxHeight: 580, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,8,15,0.4) 0%, transparent 50%)' }} />
          <ShieldAnim />
        </div>
      );
    }
    return (
      <div onDoubleClick={handleDoubleTap} style={{ position: 'relative', marginTop: 24, display: 'grid', gridTemplateColumns: count === 2 ? '1fr 1fr' : '1fr 1fr', gap: 3, height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,168,80,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', cursor: 'pointer' }}>
        {images.slice(0, count === 2 ? 2 : 1).map((img, i) => (
          <img key={i} {...imgProps} src={getOptimizedUrl(img)} alt={`media-${i}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', gridColumn: count > 2 && i === 0 ? 'span 2' : 'auto' }} />
        ))}
        <ShieldAnim />
      </div>
    );
  };

  if (!story) return null;

  const initials = story?.user?.name ? story.user.name.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(12,16,32,0.88)',
        border: '1px solid rgba(212,168,80,0.18)',
        borderRadius: 20, padding: '36px 40px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        marginBottom: 24,
      }}
    >
      {/* Spotlight */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', background: isHovering ? `radial-gradient(300px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212,168,80,0.06) 0%, transparent 70%)` : 'none' }} />
      {/* Gold lines */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.18),transparent)' }} />
      <CornerAccents />

      {/* Milestone ribbon */}
      {story.isMilestone && (
        <div style={{ position: 'absolute', top: 0, right: 40, background: 'linear-gradient(135deg,#c9933a,#e8a820)', color: '#1a0f00', padding: '5px 16px', borderRadius: '0 0 10px 10px', fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, boxShadow: '0 4px 16px rgba(212,168,80,0.4)', zIndex: 10 }}>
          ✦ Family Milestone ✦
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, marginTop: story.isMilestone ? 16 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              {/* 🔥 FIXED BUG: justifyContent instead of justify-content */}
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid rgba(212,168,80,0.45)', overflow: 'hidden', background: 'linear-gradient(135deg,#1a1410,#0f0c08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {story?.user?.avatar ? (
                  <img src={story.user.avatar} alt={story?.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: '#e8c87a' }}>{initials}</span>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#4ade80', border: '2px solid #06080f', boxShadow: '0 0 6px #4ade80' }} />
            </div>

            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {story?.user?.name || 'Unknown'}
                {timeTravelBadge && (
                  <span style={{ background: 'rgba(212,168,80,0.12)', border: '1px solid rgba(212,168,80,0.3)', color: 'rgba(212,168,80,0.8)', padding: '2px 8px', borderRadius: 6, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {timeTravelBadge}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.4)' }}>
                {displayDate} {eventBadge && <span style={{ color: 'rgba(212,168,80,0.6)' }}>· {eventBadge}</span>}
              </div>
            </div>
          </div>

          {/* Edit/Delete */}
          {!isEditing && canManage && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setIsEditing(true)}
                style={{ background: 'rgba(212,168,80,0.06)', border: '1px solid rgba(212,168,80,0.2)', borderRadius: 8, padding: '6px 12px', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.12)'; e.currentTarget.style.color = '#e8c87a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.06)'; e.currentTarget.style.color = 'rgba(212,168,80,0.6)'; }}>
                Edit
              </button>
              <button onClick={() => { if (!story?._id || typeof onDelete !== 'function') return; if (window.confirm('Erase this memory from the vault?')) onDelete(story._id); }}
                style={{ background: 'rgba(220,60,60,0.06)', border: '1px solid rgba(220,60,60,0.2)', borderRadius: 8, padding: '6px 12px', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,128,128,0.6)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.12)'; e.currentTarget.style.color = '#f08080'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.06)'; e.currentTarget.style.color = 'rgba(240,128,128,0.6)'; }}>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* ── EDIT MODE ── */}
        {isEditing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 20, border: '1px solid rgba(212,168,80,0.18)' }}>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', marginBottom: 12, background: 'rgba(212,168,80,0.04)', border: '1px solid rgba(212,168,80,0.28)', borderRadius: 10, color: 'rgba(255,255,255,0.88)', fontFamily: "'Cinzel',serif", fontSize: 18, outline: 'none', boxSizing: 'border-box' }} />
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={5}
              style={{ width: '100%', padding: '12px 16px', marginBottom: 16, background: 'rgba(212,168,80,0.04)', border: '1px solid rgba(212,168,80,0.28)', borderRadius: 10, color: 'rgba(255,255,255,0.88)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button onClick={handleSaveEdit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#c9933a,#e8a820)', border: 'none', borderRadius: 10, color: '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
                Seal Edits
              </motion.button>
              <button onClick={() => setIsEditing(false)}
                style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(212,168,80,0.22)', borderRadius: 10, color: 'rgba(255,255,255,0.38)', fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <div>
            {/* Title */}
            <h3 style={{ margin: '0 0 14px', fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.95)', lineHeight: 1.3, textShadow: '0 0 30px rgba(212,168,80,0.1)' }}>
              {story.title}
            </h3>

            {/* Tone badge */}
            {story.tone && story.tone !== 'Nostalgic and Warm' && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', border: '1px solid rgba(212,168,80,0.2)', borderRadius: 6, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.5)' }}>
                  {story.tone.replace(/[^\w\s-]/gi, '').trim()}
                </span>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(212,168,80,0.2),transparent)', marginBottom: 16 }} />

            {/* Content */}
            <p style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
              {story.content}
            </p>
          </div>
        )}

        {/* Media */}
        {!isEditing && renderMediaGrid()}

        {/* ── ACTION BAR ── */}
        {!isEditing && (
          <>
            <style>{`
              @keyframes ltIconPulse {
                0%,100% { box-shadow: 0 0 10px rgba(212,168,80,0.25), inset 0 1px 0 rgba(255,255,255,0.1); }
                50%      { box-shadow: 0 0 24px rgba(212,168,80,0.55), inset 0 1px 0 rgba(255,255,255,0.15); }
              }
              @keyframes ltArchivedPulse {
                0%,100% { box-shadow: 0 0 0 2px rgba(180,130,30,0.12), 0 0 12px rgba(180,130,30,0.2); }
                50%      { box-shadow: 0 0 0 3px rgba(180,130,30,0.22), 0 0 28px rgba(180,130,30,0.45); }
              }
              @keyframes ltNeedleSpin {
                0%   { transform: rotate(0deg);   }
                100% { transform: rotate(360deg); }
              }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(212,168,80,0.1)', flexWrap: 'wrap' }}>

              {/* ── LIKE — Dimensional Shield ── */}
              <CurioBtn onClick={() => typeof onLike === 'function' && onLike(story._id)} active={isLikedByMe}>
                <IconMedallion active={isLikedByMe} activeGlow="rgba(212,168,80,0.4)" pulse={isLikedByMe}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <GoldGradDef />
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      fill={isLikedByMe ? `url(#${GOLD_GRAD_ID})` : 'none'}
                      stroke={isLikedByMe ? 'rgba(232,200,122,0.85)' : 'rgba(212,168,80,0.5)'}
                      strokeWidth="1.5" strokeLinejoin="round"
                    />
                    {isLikedByMe && (
                      <path d="M9 12l2 2 4-4"
                        stroke="rgba(26,15,0,0.85)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    )}
                  </svg>
                </IconMedallion>
                <CurioLabel count={story?.likes?.length || 0} name="Protect" active={isLikedByMe} />
              </CurioBtn>

              <BarSep />

              {/* ── COMMENT — Family Register Scroll ── */}
              <CurioBtn onClick={() => setShowComments(!showComments)} active={showComments}>
                <IconMedallion active={showComments} activeGlow="rgba(212,168,80,0.3)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 3z"
                      fill={showComments ? 'rgba(212,168,80,0.14)' : 'none'}
                      stroke={showComments ? 'rgba(212,168,80,0.85)' : 'rgba(212,168,80,0.5)'}
                      strokeWidth="1.5" strokeLinejoin="round"
                    />
                    <line x1="8" y1="9" x2="16" y2="9"
                      stroke={showComments ? 'rgba(212,168,80,0.65)' : 'rgba(212,168,80,0.3)'}
                      strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="8" y1="12" x2="13" y2="12"
                      stroke={showComments ? 'rgba(212,168,80,0.5)' : 'rgba(212,168,80,0.22)'}
                      strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </IconMedallion>
                <CurioLabel count={story?.comments?.length || 0} name="Reflect" active={showComments} />
              </CurioBtn>

              <BarSep />

              {/* ── SHARE — Compass Beacon ── */}
              <CurioBtn onClick={handleShare} active={isShared} style={isShared ? {} : {}}>
                <IconMedallion
                  active={isShared}
                  activeGlow="rgba(74,222,128,0.25)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    style={{ transformOrigin: 'center' }}>
                    <circle cx="12" cy="12" r="9"
                      stroke={isShared ? 'rgba(74,222,128,0.4)' : 'rgba(212,168,80,0.25)'}
                      strokeWidth="1" />
                    <circle cx="12" cy="12" r="2.2"
                      fill={isShared ? 'rgba(74,222,128,0.7)' : 'rgba(212,168,80,0.45)'} />
                    {/* N needle — spins on share */}
                    <path d="M12 12 L15 5.5"
                      stroke={isShared ? 'rgba(74,222,128,0.9)' : 'rgba(212,168,80,0.65)'}
                      strokeWidth="1.6" strokeLinecap="round"
                      style={{ transformOrigin: '12px 12px', animation: isShared ? 'ltNeedleSpin .7s ease-out' : 'none' }} />
                    {/* S needle */}
                    <path d="M12 12 L9 18.5"
                      stroke={isShared ? 'rgba(74,222,128,0.4)' : 'rgba(212,168,80,0.25)'}
                      strokeWidth="1.2" strokeLinecap="round" />
                    {/* Cardinal marks */}
                    <line x1="12" y1="3.5" x2="12" y2="5.5"
                      stroke={isShared ? 'rgba(74,222,128,0.4)' : 'rgba(212,168,80,0.2)'}
                      strokeWidth="1" strokeLinecap="round" />
                    <line x1="12" y1="18.5" x2="12" y2="20.5"
                      stroke={isShared ? 'rgba(74,222,128,0.3)' : 'rgba(212,168,80,0.15)'}
                      strokeWidth="1" strokeLinecap="round" />
                    <line x1="3.5" y1="12" x2="5.5" y2="12"
                      stroke={isShared ? 'rgba(74,222,128,0.3)' : 'rgba(212,168,80,0.15)'}
                      strokeWidth="1" strokeLinecap="round" />
                    <line x1="18.5" y1="12" x2="20.5" y2="12"
                      stroke={isShared ? 'rgba(74,222,128,0.3)' : 'rgba(212,168,80,0.15)'}
                      strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </IconMedallion>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', color: isShared ? '#4ade80' : 'rgba(212,168,80,0.35)', lineHeight: 1, transition: 'color .3s' }}>
                    {isShared ? 'Passed On' : 'Pass On'}
                  </span>
                </div>
              </CurioBtn>

              <BarSep />

              {/* ── DOWNLOAD — Wax Seal → ARCHIVED plate ── */}
              {images.length > 0 && (
                <CurioBtn
                  onClick={handleDownloadImage}
                  active={isDownloaded}
                  style={{ marginLeft: 'auto' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    background: isDownloaded
                      ? 'radial-gradient(circle at 35% 35%,rgba(160,110,20,0.6),rgba(100,70,10,0.4))'
                      : 'radial-gradient(circle at 35% 35%,rgba(212,168,80,0.14),rgba(212,168,80,0.05))',
                    border: `1px solid ${isDownloaded ? 'rgba(180,130,30,0.8)' : 'rgba(212,168,80,0.2)'}`,
                    transition: 'all .4s',
                    animation: isDownloaded ? 'ltArchivedPulse 3s ease-in-out infinite' : 'none',
                  }}>
                    {isDownloaded ? (
                      /* ARCHIVED plate */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="7" width="20" height="10" rx="2"
                          fill="rgba(160,110,20,0.55)" stroke="rgba(200,150,30,0.75)" strokeWidth="1" />
                        {/* Embossed lines */}
                        <line x1="4" y1="9" x2="20" y2="9"
                          stroke="rgba(212,168,80,0.3)" strokeWidth="0.5" />
                        <line x1="4" y1="15" x2="20" y2="15"
                          stroke="rgba(212,168,80,0.3)" strokeWidth="0.5" />
                        <text x="12" y="13.5" textAnchor="middle"
                          fontFamily="Space Mono, monospace" fontSize="4.5"
                          fontWeight="700" fill="rgba(232,200,122,0.95)"
                          letterSpacing="1.5">ARCHIVED</text>
                      </svg>
                    ) : (
                      /* Wax seal / download */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9"
                          stroke="rgba(212,168,80,0.35)" strokeWidth="1"
                          strokeDasharray="3 2.5" />
                        <circle cx="12" cy="12" r="5.5"
                          stroke="rgba(212,168,80,0.2)" strokeWidth="0.8" />
                        <path d="M12 8v4.5M9.5 10.5l2.5 2.5 2.5-2.5"
                          stroke="rgba(212,168,80,0.65)" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="8.5" y1="15.5" x2="15.5" y2="15.5"
                          stroke="rgba(212,168,80,0.4)" strokeWidth="1.2"
                          strokeLinecap="round" />
                      </svg>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: isDownloaded ? 9 : 13,
                      fontWeight: 700,
                      letterSpacing: isDownloaded ? '2px' : '0.5px',
                      textTransform: isDownloaded ? 'uppercase' : 'none',
                      color: isDownloaded ? '#c9933a' : 'rgba(212,168,80,0.5)',
                      lineHeight: 1, transition: 'all .35s',
                    }}>
                      {isDownloaded ? 'Sealed' : 'Archive'}
                    </span>
                    <span style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 7, letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: isDownloaded ? 'rgba(180,130,30,0.7)' : 'rgba(212,168,80,0.3)',
                      lineHeight: 1, marginTop: 3, transition: 'color .35s',
                    }}>
                      {isDownloaded ? 'Permanent' : 'Seal Image'}
                    </span>
                  </div>
                </CurioBtn>
              )}

            </div>
          </>
        )}

        {/* Comments */}
        <AnimatePresence>
          {!isEditing && showComments && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 20, overflow: 'hidden' }}>
              <StoryCommentBox storyId={story._id} comments={story.comments} onCommentSubmit={onComment} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rune footer */}
        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,0.12)', userSelect: 'none' }}>
          ✦ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ✦
        </div>
      </div>

      <StoryExportTemplate ref={exportRef} story={story} />

      <style>{`
        @keyframes shieldPop {
          0%{transform:translate(-50%,-50%) scale(0.4);opacity:0}
          15%{transform:translate(-50%,-50%) scale(1.3);opacity:1}
          30%{transform:translate(-50%,-50%) scale(1);opacity:1}
          80%{transform:translate(-50%,-50%) scale(1);opacity:1}
          100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}
        }
        @keyframes ltPulseGlow{0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)}50%{box-shadow:0 6px 40px rgba(212,168,80,0.55)}}
        @keyframes ltShine{0%,70%{left:-100%}100%{left:150%}}
        @keyframes ltDot{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}
      `}</style>
    </motion.div>
  );
}

export default StoryCard;