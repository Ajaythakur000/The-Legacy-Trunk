import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import StoryCommentBox from './StoryCommentBox';
import StoryExportTemplate from './StoryExportTemplate';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share, Printer, Trash2, Stamp } from 'lucide-react';

// ── Vintage Action Button ───────────────────────────────────────────────────────
function VintageActionBtn({ onClick, active, icon: Icon, label, color }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 4,
        background: 'transparent',
        border: '1px solid transparent',
        color: active ? color : 'rgba(62, 39, 35, 0.6)',
        fontFamily: "'Courier Prime', monospace", fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: active ? 1 : 0.7
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = color; e.currentTarget.style.opacity = 1; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = active ? color : 'rgba(62, 39, 35, 0.6)'; e.currentTarget.style.opacity = active ? 1 : 0.7; }}
    >
      <Icon size={18} strokeWidth={1.5} color="currentColor" /> {label}
    </motion.button>
  );
}

function StoryCard({ story, currentUser, onLike, onComment, onDelete }) {
  const isAuthor = Boolean(currentUser?._id && story?.user?._id && String(story.user._id) === String(currentUser._id));
  const storyCircleId = typeof story?.originCircleId === 'object' && story?.originCircleId?._id ? story.originCircleId._id : story?.originCircleId || null;
  const currentUserCircleId = typeof currentUser?.activeCircleId === 'object' && currentUser?.activeCircleId?._id ? currentUser.activeCircleId._id : currentUser?.activeCircleId || null;
  const isCircleAdmin = Boolean(currentUser?.role === 'admin' && currentUserCircleId && storyCircleId && String(currentUserCircleId) === String(storyCircleId));
  const canManage = isAuthor || isCircleAdmin;

  const [showComments, setShowComments] = useState(false);
  const [showPopAnim, setShowPopAnim] = useState(false);
  const isLikedByMe = Boolean(currentUser?._id && story?.likes?.some(id => String(id) === String(currentUser._id)));
  const [isShared, setIsShared] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const exportRef = useRef();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const images = [];
  if (story?.mediaUrls?.length > 0) images.push(...story.mediaUrls);
  else if (story?.mediaUrl) images.push(story.mediaUrl);

  useEffect(() => {
    let t; if (showPopAnim) t = setTimeout(() => setShowPopAnim(false), 800);
    return () => clearTimeout(t);
  }, [showPopAnim]);

  const confirmDelete = () => {
    if (!story?._id || typeof onDelete !== 'function') return;
    onDelete(story._id);
    setShowDeleteModal(false);
  };

  const getFormattedDates = () => {
    if (!story?.createdAt) return { displayDate: '', eventBadge: null };
    const postDateObj = new Date(story.createdAt);
    const postDateStr = postDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let eventDateStr = null;
    if (story.isMilestone && story.milestoneDate) {
      eventDateStr = new Date(story.milestoneDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (eventDateStr === postDateStr) return { displayDate: postDateStr, eventBadge: null };
    return { displayDate: postDateStr, eventBadge: eventDateStr ? `Event: ${eventDateStr}` : null };
  };
  const { displayDate, eventBadge } = getFormattedDates();

  const handleShare = async () => {
    if (!story?._id) return;
    const shareData = { title: story.title || 'Family Memory', text: `Look at this memory: "${story.title}"`, url: `${window.location.origin}/vault-stories/${story._id}` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); toast.success('Copied to clipboard'); setIsShared(true); setTimeout(() => setIsShared(false), 2000); }
    } catch {}
  };

  const handleDownloadImage = async () => {
    if (exportRef.current) { exportRef.current.generateImage(); setIsDownloaded(true); setTimeout(() => setIsDownloaded(false), 1200); }
  };

  const handleDoubleTap = (e) => {
    e.preventDefault();
    if (!isLikedByMe && story?._id && typeof onLike === 'function') onLike(story._id);
    setShowPopAnim(false);
    setTimeout(() => setShowPopAnim(true), 10);
  };

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto/');
  };

  const isOldStory = story?.createdAt && new Date() - new Date(story.createdAt) > 1000 * 60 * 60 * 24 * 365; // > 1 year
  
  const renderMediaGrid = () => {
    if (images.length === 0) return null;
    
    // Determine filter for vintage feel
    const vintageFilter = isOldStory ? 'sepia(0.5) contrast(1.1) brightness(0.95)' : 'sepia(0.2) contrast(1.05)';

    if (story?.mediaType === 'video') {
      return (
        <div style={{ marginTop: 24, padding: '12px 12px 40px', background: '#FFF', boxShadow: '2px 4px 12px rgba(0,0,0,0.08)', borderRadius: 2, transform: 'rotate(1deg)' }}>
          <video controls preload="metadata" style={{ width: '100%', maxHeight: 500, background: '#261914', display: 'block', filter: vintageFilter }}>
            <source src={images[0]} />
          </video>
        </div>
      );
    }
    
    const count = images.length;
    const PopAnim = () => showPopAnim ? (
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', color: '#B22222', zIndex: 10 }}>
        <Heart size={80} fill="#B22222" strokeWidth={1} />
      </motion.div>
    ) : null;

    if (count === 1) {
      return (
        <div onDoubleClick={handleDoubleTap} style={{ position: 'relative', marginTop: 24, background: '#FFF', padding: '16px 16px 50px', boxShadow: '2px 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', userSelect: 'none', transform: 'rotate(-1deg)' }}>
          <img src={getOptimizedUrl(images[0])} alt={story?.title} style={{ width: '100%', maxHeight: 580, objectFit: 'cover', display: 'block', filter: vintageFilter }} />
          <PopAnim />
        </div>
      );
    }
    return (
      <div onDoubleClick={handleDoubleTap} style={{ position: 'relative', marginTop: 24, display: 'grid', gridTemplateColumns: count === 2 ? '1fr 1fr' : '1fr 1fr', gap: 12, background: '#FDFBF7', padding: 16, border: '1px solid #EEDEC1', cursor: 'pointer' }}>
        {images.slice(0, count === 2 ? 2 : 1).map((img, i) => (
          <div key={i} style={{ background: '#FFF', padding: '8px 8px 30px', boxShadow: '1px 2px 6px rgba(0,0,0,0.05)', gridColumn: count > 2 && i === 0 ? 'span 2' : 'auto', transform: i % 2 === 0 ? 'rotate(-2deg)' : 'rotate(1deg)' }}>
            <img src={getOptimizedUrl(img)} alt={`media-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: vintageFilter }} />
          </div>
        ))}
        <PopAnim />
      </div>
    );
  };

  if (!story) return null;
  const initials = story?.user?.name ? story.user.name.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#FDFBF7',
        border: '1px solid rgba(62,39,35,0.1)',
        borderRadius: 4, // Sharp paper edges
        padding: '32px',
        position: 'relative',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        marginBottom: 40,
      }}
    >
      {/* Masking Tape */}
      <div style={{
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: 'translateX(-50%) rotate(-1deg)',
        width: 100,
        height: 25,
        background: 'rgba(238, 225, 200, 0.7)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 10,
        borderLeft: '2px dashed rgba(0,0,0,0.05)',
        borderRight: '2px dashed rgba(0,0,0,0.05)'
      }} />

      {/* Milestone stamp */}
      {story.isMilestone && (
        <div style={{ position: 'absolute', top: 20, right: -10, display: 'flex', alignItems: 'center', gap: 6, color: '#8B0000', fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', transform: 'rotate(15deg)', opacity: 0.8, border: '1px dashed #8B0000', padding: '4px 8px', borderRadius: 4 }}>
          <Stamp size={14} /> MILESTONE
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, borderBottom: '1px solid rgba(62,39,35,0.1)', paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid #D4B895', background: '#FDFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {story?.user?.avatar ? (
              <img src={story.user.avatar} alt={story?.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3)' }} />
            ) : (
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3E2723' }}>{initials}</span>
            )}
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', letterSpacing: 1 }}>
              {story?.user?.name || 'Unknown'}
            </div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#8C7B6B' }}>
              {displayDate} {eventBadge && <span style={{ marginLeft: 8, fontStyle: 'italic' }}>({eventBadge})</span>}
            </div>
          </div>
        </div>

        {/* Delete */}
        {canManage && (
          <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', color: '#8C7B6B', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div>
        {/* Title */}
        <h3 style={{ margin: '0 0 16px', fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3E2723', fontWeight: 400 }}>
          {story.title}
        </h3>

        {/* Tone badge */}
        {story.tone && story.tone !== 'Original' && (
          <div style={{ marginBottom: 20 }}>
            <span style={{ display: 'inline-block', padding: '4px 0', borderBottom: '1px solid #D4B895', fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#8C7B6B', textTransform: 'uppercase' }}>
              Written in {story.tone.replace(/[^\w\s-]/gi, '').trim()} ink
            </span>
          </div>
        )}

        {/* Content - Handwriting Font for Nostalgia */}
        <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontSize: 24, lineHeight: 1.6, color: '#3E2723', whiteSpace: 'pre-wrap', transform: 'rotate(-0.5deg)' }}>
          {story.content}
        </p>
      </div>

      {/* Media */}
      {renderMediaGrid()}

      {/* ── ACTION BAR (STAMPS) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40, borderTop: '1px solid rgba(62,39,35,0.1)', paddingTop: 16, flexWrap: 'wrap' }}>
        <VintageActionBtn onClick={() => typeof onLike === 'function' && onLike(story._id)} active={isLikedByMe} icon={Heart} label={story?.likes?.length || 0} color="#B22222" />
        <VintageActionBtn onClick={() => setShowComments(!showComments)} active={showComments} icon={MessageCircle} label={story?.comments?.length || 0} color="#3E2723" />
        <VintageActionBtn onClick={handleShare} active={isShared} icon={Share} label="Share" color="#3E2723" />
        {images.length > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <VintageActionBtn onClick={handleDownloadImage} active={isDownloaded} icon={Printer} label="Print" color="#3E2723" />
          </div>
        )}
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: 16 }}>
            <StoryCommentBox storyId={story._id} comments={story.comments} onCommentSubmit={onComment} />
          </motion.div>
        )}
      </AnimatePresence>

      <StoryExportTemplate ref={exportRef} story={story} />

      {/* ── CUSTOM DELETE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(253, 251, 247, 0.9)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', bounce: 0.3 }}
                style={{ background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: 4, width: '100%', maxWidth: 400, padding: '40px', position: 'relative', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}
              >
                <div style={{ fontSize: 40, marginBottom: 16, color: '#8B0000' }}><Trash2 size={48} strokeWidth={1} /></div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginBottom: 16 }}>
                  Burn this page?
                </div>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#8C7B6B', marginBottom: 32 }}>
                  Once it is destroyed, the memory cannot be recovered.
                </p>

                <div style={{ display: 'flex', gap: 16 }}>
                  <motion.button onClick={() => setShowDeleteModal(false)} whileHover={{ opacity: 0.8 }}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #D4B895', borderRadius: 4, color: '#3E2723', fontFamily: "'Courier Prime', monospace", fontSize: 14, cursor: 'pointer' }}>
                    Keep it
                  </motion.button>
                  <motion.button onClick={confirmDelete} whileHover={{ opacity: 0.8 }}
                    style={{ flex: 1, padding: '12px', background: '#8B0000', border: 'none', borderRadius: 4, color: '#FFF', fontFamily: "'Courier Prime', monospace", fontSize: 14, cursor: 'pointer' }}>
                    Destroy
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

export default StoryCard;
