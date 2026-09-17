import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import StoryCommentBox from './StoryCommentBox';
import StoryExportTemplate from './StoryExportTemplate';
import { motion, AnimatePresence } from 'framer-motion';

// ── Comic Action Button ───────────────────────────────────────────────────────
function ComicActionBtn({ onClick, active, icon, label, color }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, x: 2, y: 2, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 12,
        background: active ? color : '#FFF',
        border: 'none',
        color: active ? '#FFF' : '#3E2723',
        fontFamily: "'Playfair Display', serif", fontSize: 16,
        cursor: 'pointer',
        boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)',
        transition: 'background 0.2s, color 0.2s'
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span> {label}
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
    const postDateStr = postDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let eventDateStr = null;
    if (story.isMilestone && story.milestoneDate) {
      eventDateStr = new Date(story.milestoneDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (eventDateStr === postDateStr) return { displayDate: postDateStr, eventBadge: null };
    return { displayDate: postDateStr, eventBadge: eventDateStr ? `EVENT: ${eventDateStr}` : null };
  };
  const { displayDate, eventBadge } = getFormattedDates();

  const handleShare = async () => {
    if (!story?._id) return;
    const shareData = { title: story.title || 'Family Memory', text: `Look at this memory: "${story.title}"`, url: `${window.location.origin}/vault-stories/${story._id}` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); toast.success('Link copied! 📋'); setIsShared(true); setTimeout(() => setIsShared(false), 2000); }
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
    const vintageFilter = isOldStory ? 'sepia(0.4) contrast(0.9) brightness(1.05)' : 'none';

    if (story?.mediaType === 'video') {
      return (
        <div className="scrapbook-tape" style={{ marginTop: 24, border: '2px solid var(--pop-black)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--comic-shadow)', background: 'var(--pop-yellow)', padding: 8 }}>
          <video controls preload="metadata" style={{ width: '100%', maxHeight: 500, background: '#000', display: 'block', borderRadius: 8, border: '1px solid var(--pop-black)', filter: vintageFilter }}>
            <source src={images[0]} />
          </video>
        </div>
      );
    }
    
    const count = images.length;
    const PopAnim = () => showPopAnim ? (
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 10 }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', fontSize: 100, filter: 'drop-shadow(4px 4px 0px var(--pop-black))', zIndex: 10 }}>
        💥
      </motion.div>
    ) : null;

    if (count === 1) {
      return (
        <div className="scrapbook-tape" onDoubleClick={handleDoubleTap} style={{ position: 'relative', marginTop: 24, background: '#FFF', padding: '12px 12px 40px', border: '2px solid var(--pop-black)', borderRadius: 8, boxShadow: 'var(--comic-shadow)', cursor: 'pointer', userSelect: 'none', transform: 'rotate(-1deg)' }}>
          <img src={getOptimizedUrl(images[0])} alt={story?.title} style={{ width: '100%', maxHeight: 580, objectFit: 'cover', display: 'block', border: '1px solid var(--pop-black)', filter: vintageFilter }} />
          <PopAnim />
        </div>
      );
    }
    return (
      <div className="scrapbook-tape" onDoubleClick={handleDoubleTap} style={{ position: 'relative', marginTop: 24, display: 'grid', gridTemplateColumns: count === 2 ? '1fr 1fr' : '1fr 1fr', gap: 12, background: 'var(--pop-cyan)', padding: 12, borderRadius: 16, border: '2px solid var(--pop-black)', boxShadow: 'var(--comic-shadow)', cursor: 'pointer' }}>
        {images.slice(0, count === 2 ? 2 : 1).map((img, i) => (
          <img key={i} src={getOptimizedUrl(img)} alt={`media-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', gridColumn: count > 2 && i === 0 ? 'span 2' : 'auto', border: '1px solid var(--pop-black)', borderRadius: 8, filter: vintageFilter }} />
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
        background: '#FFFFFF', border: 'var(--comic-border)', borderRadius: 24,
        padding: '32px', position: 'relative', boxShadow: 'var(--comic-shadow)',
        marginBottom: 24,
      }}
    >
      {/* Milestone ribbon */}
      {story.isMilestone && (
        <div style={{ position: 'absolute', top: -3, right: 30, background: 'var(--pop-yellow)', color: 'var(--pop-black)', padding: '8px 16px', border: 'var(--comic-border)', borderTop: 'none', borderRadius: '0 0 12px 12px', fontFamily: "'Playfair Display', serif", fontSize: 16, boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)', zIndex: 10 }}>
          ⭐ MILESTONE
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: story.isMilestone ? 24 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: 'var(--comic-border)', background: 'var(--pop-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)' }}>
            {story?.user?.avatar ? (
              <img src={story.user.avatar} alt={story?.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#FFF' }}>{initials}</span>
            )}
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--pop-black)', letterSpacing: 1 }}>
              {story?.user?.name || 'UNKNOWN'}
            </div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--pop-black)' }}>
              {displayDate} {eventBadge && <span style={{ background: 'var(--pop-cyan)', padding: '2px 6px', borderRadius: 4, border: '2px solid var(--pop-black)' }}>{eventBadge}</span>}
            </div>
          </div>
        </div>

        {/* Delete */}
        {canManage && (
          <button onClick={() => setShowDeleteModal(true)} style={{ background: 'var(--pop-pink)', border: 'var(--comic-border)', borderRadius: 10, padding: '8px 12px', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#FFF', cursor: 'pointer', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)' }}>
            TRASH 🗑️
          </button>
        )}
      </div>

      <div>
        {/* Title */}
        <h3 style={{ margin: '0 0 12px', fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'var(--pop-orange)' }}>
          {story.title}
        </h3>

        {/* Tone badge */}
        {story.tone && story.tone !== 'Original' && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', border: 'var(--comic-border)', borderRadius: 8, background: 'var(--pop-yellow)', fontFamily: "'Playfair Display', serif", fontSize: 14, color: 'var(--pop-black)', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)' }}>
              {story.tone.replace(/[^\w\s-]/gi, '').trim()} FLAVOR
            </span>
          </div>
        )}

        {/* Content - Handwriting Font for Nostalgia */}
        <p className="handwriting" style={{ margin: 0, background: '#F5F5F5', padding: 16, border: '2px dashed var(--pop-black)', borderRadius: 12, whiteSpace: 'pre-wrap' }}>
          {story.content}
        </p>
      </div>

      {/* Media */}
      {renderMediaGrid()}

      {/* ── ACTION BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <ComicActionBtn onClick={() => typeof onLike === 'function' && onLike(story._id)} active={isLikedByMe} icon={isLikedByMe ? '❤️' : '🤍'} label={story?.likes?.length || 0} color="#1E352F" />
        <ComicActionBtn onClick={() => setShowComments(!showComments)} active={showComments} icon="💬" label={story?.comments?.length || 0} color="#C89B3C" />
        <ComicActionBtn onClick={handleShare} active={isShared} icon="🚀" label="SHARE" color="#D4B895" />
        {images.length > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <ComicActionBtn onClick={handleDownloadImage} active={isDownloaded} icon="📸" label="POSTER" color="#00C853" />
          </div>
        )}
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
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
              style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 2 }} exit={{ scale: 0.8, rotate: 5 }} transition={{ type: 'spring', bounce: 0.6 }}
                style={{ background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, width: '100%', maxWidth: 400, padding: '40px', position: 'relative', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)', textAlign: 'center' }}
              >
                <div style={{ fontSize: 60, marginBottom: 16 }}>💣</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#FDFBF7', marginBottom: 16 }}>
                  TRASH IT?
                </div>
                <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: '#3E2723', marginBottom: 32 }}>
                  Once it's gone, it's gone forever. Are you sure?
                </p>

                <div style={{ display: 'flex', gap: 16 }}>
                  <motion.button onClick={() => setShowDeleteModal(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ flex: 1, padding: '14px', background: '#FFF', border: 'none', borderRadius: 12, color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                    NOPE
                  </motion.button>
                  <motion.button onClick={confirmDelete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ flex: 1, padding: '14px', background: '#1E352F', border: 'none', borderRadius: 12, color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                    DO IT!
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