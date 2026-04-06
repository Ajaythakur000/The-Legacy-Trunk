import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import StoryCommentBox from './StoryCommentBox';
import StoryExportTemplate from './StoryExportTemplate';

function StoryCard({ story, currentUser, onLike, onComment, onDelete, onEdit }) {
  const isAuthor = currentUser && story?.user?._id === currentUser._id;
  const isAdmin = currentUser && currentUser?.role === 'admin';
  const canDelete = isAuthor || isAdmin;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const [editContent, setEditContent] = useState(story.content);
  
  const [showComments, setShowComments] = useState(false);
  const [showShieldAnim, setShowShieldAnim] = useState(false);
  
  const isLikedByMe = story?.likes?.includes(currentUser?._id);
  const [isShared, setIsShared] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const exportRef = useRef();

  const images = [];
  if (story?.mediaUrls && story.mediaUrls.length > 0) {
    images.push(...story.mediaUrls);
  } else if (story?.mediaUrl) {
    images.push(story.mediaUrl);
  }

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(story._id, { title: editTitle, content: editContent });
      setIsEditing(false);
    }
  };

  const getFormattedDates = () => {
    const postDateObj = new Date(story.createdAt);
    const postDateStr = postDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let eventDateStr = null;
    let timeTravelBadge = null;

    if (story.isMilestone && story.milestoneDate) {
      const eventDateObj = new Date(story.milestoneDate);
      eventDateStr = eventDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const yearDiff = postDateObj.getFullYear() - eventDateObj.getFullYear();
      if (yearDiff > 0) {
        timeTravelBadge = `⏳ ${yearDiff} Year${yearDiff > 1 ? 's' : ''} Ago`;
      }
    }

    if (eventDateStr === postDateStr) {
      return { displayDate: postDateStr, eventBadge: null, timeTravelBadge: null };
    }
    return { displayDate: postDateStr, eventBadge: eventDateStr ? `Event: ${eventDateStr}` : null, timeTravelBadge };
  };

  const { displayDate, eventBadge, timeTravelBadge } = getFormattedDates();

  const handleShare = async () => {
    const shareData = {
      title: story.title,
      text: `Check out this memory: "${story.title}"`,
      url: `${window.location.origin}/vault-stories/${story._id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied! 📋", { style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }});
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) { console.log('Share failed', err); }
  };

  const handleDownloadImage = async () => {
      if (exportRef.current) {
          exportRef.current.generateImage();
      }
  };

  const handleDoubleTap = (e) => {
    e.preventDefault();
    if (!isLikedByMe) {
      onLike(story._id);
    }
    setShowShieldAnim(true);
    setTimeout(() => setShowShieldAnim(false), 1000);
  };

  // 🔥 CLOUDINARY SPEED OPTIMIZER (q_auto, f_auto)
  const getOptimizedUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto/');
  };

  const renderMediaGrid = () => {
    if (images.length === 0) return null;
    
    if (story?.mediaType === 'video') {
      return (
        <div style={{ marginTop: '24px', borderRadius: '4px', padding: '12px', background: '#0f172a', border: '1px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
            <video controls preload="metadata" style={{ width: '100%', maxHeight: '500px', borderRadius: '2px', background: '#000' }}>
            <source src={images[0]} />
            </video>
        </div>
      );
    }

    const count = images.length;
    
    // 🔥 FALLBACK LOGIC INTEGRATED HERE
    const imgProps = { 
      loading: "lazy", 
      decoding: "async",
      onError: (e) => { 
        e.target.onerror = null; 
        e.target.src = '/web-app-manifest-512x512.png'; 
        e.target.style.objectFit = 'contain'; 
        e.target.style.padding = '20px'; 
      }
    };

    if (count === 1) {
      return (
        <div 
          onDoubleClick={handleDoubleTap} 
          style={{ position: 'relative', marginTop: '24px', padding: '12px', background: '#0f172a', border: '1px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', cursor: 'pointer', userSelect: 'none' }}
        >
          <img 
            {...imgProps}
            src={getOptimizedUrl(images[0])} 
            alt={story.title} 
            style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block', border: '4px solid #faf9f6', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }} 
          />
          {showShieldAnim && (
             <div style={{
                 position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                 animation: 'shieldPop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', pointerEvents: 'none',
                 filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.6))'
             }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="#3b82f6" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
             </div>
          )}
        </div>
      );
    }

    const gridStyles = { display: 'grid', gap: '4px', marginTop: '24px', padding: '12px', background: '#0f172a', border: '1px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', height: '450px', cursor: 'pointer' };
    
    let layoutContent = null;
    if (count === 2) {
      layoutContent = (
        <div onDoubleClick={handleDoubleTap} style={{ ...gridStyles, gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
          <img {...imgProps} src={getOptimizedUrl(images[0])} style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid #faf9f6' }} />
          <img {...imgProps} src={getOptimizedUrl(images[1])} style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid #faf9f6' }} />
          {showShieldAnim && <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', animation:'shieldPop 1s forwards', pointerEvents:'none'}}><svg width="100" height="100" viewBox="0 0 24 24" fill="#3b82f6" stroke="rgba(255,255,255,0.5)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>}
        </div>
      );
    } else {
        layoutContent = (
            <div onDoubleClick={handleDoubleTap} style={{ ...gridStyles, gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
               <img {...imgProps} src={getOptimizedUrl(images[0])} style={{ width: '100%', height: '100%', objectFit: 'cover', gridColumn: 'span 2', border: '2px solid #faf9f6' }} />
               {showShieldAnim && <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', animation:'shieldPop 1s forwards', pointerEvents:'none'}}><svg width="100" height="100" viewBox="0 0 24 24" fill="#3b82f6" stroke="rgba(255,255,255,0.5)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>}
            </div>
        )
    }

    return layoutContent;
  };

  return (
    <div style={{ 
        background: '#fafaf9',
        border: '1px solid #e5e5e5', 
        borderRadius: '8px',
        padding: '32px 40px', 
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
        position: 'relative'
    }}>
      
      {story.isMilestone && (
        <div style={{ 
          position: 'absolute', top: '0', right: '40px', 
          background: 'linear-gradient(135deg, #d4af37, #b48512)', color: '#fff', 
          padding: '6px 14px', borderRadius: '0 0 8px 8px', 
          fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
          boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)' 
        }}>
          Family Milestone
        </div>
      )}

      {/* 👤 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', marginTop: story.isMilestone ? '12px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
              width: '50px', height: '50px', borderRadius: '50%', 
              background: '#f8fafc', border: '2px solid rgba(212, 175, 55, 0.6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: '#334155', fontWeight: 'bold', fontSize: '1.2rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
            {story?.user?.name ? story.user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Georgia, serif' }}>
              {story?.user?.name || 'Unknown User'}
              {timeTravelBadge && <span style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontFamily: 'system-ui, sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>{timeTravelBadge}</span>}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
              {displayDate} {eventBadge && <span style={{ color: '#b48512' }}> • {eventBadge}</span>}
            </div>
          </div>
        </div>
        
        {!isEditing && (isAuthor || isAdmin) && (
          <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={() => setIsEditing(true)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Edit</button>
             <button onClick={() => { if(window.confirm('Erase this memory?')) onDelete(story._id); }} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Delete</button>
          </div>
        )}
      </div>

      {/* 📜 Content */}
      {isEditing ? (
         <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '12px', fontSize: '1.2rem', fontFamily: 'Georgia, serif', border: '1px solid #cbd5e1' }} />
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={5} style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '1rem', border: '1px solid #cbd5e1', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveEdit} style={{ background: '#0f172a', color: 'white', padding: '8px 16px', border:'none', cursor:'pointer' }}>Save</button>
              <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border:'1px solid #ccc', padding: '8px 16px', cursor:'pointer' }}>Cancel</button>
            </div>
         </div>
      ) : (
        <div style={{ paddingLeft: '4px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '2rem', fontWeight: 'normal', fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>{story.title}</h3>
            {story.tone && story.tone !== 'Nostalgic and Warm' && (
                <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tone: {story.tone.replace(/[^\w\s-]/gi, '')}
                </span>
                </div>
            )}
            <p style={{ margin: '0', color: '#334155', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'system-ui, sans-serif' }}>
            {story.content}
            </p>
        </div>
      )}

      {/* 🖼️ Media */}
      {!isEditing && renderMediaGrid()}

      {/* 🛡️ LEGACY ACTION BAR */}
      {!isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                  onClick={() => onLike(story._id)} 
                  className="action-icon-btn"
                  title="Protect Memory"
              >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isLikedByMe ? "#2563eb" : "none"} stroke={isLikedByMe ? "#2563eb" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
              </button>
              <span style={{ fontWeight: '600', color: '#475569', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>{story?.likes?.length || 0}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                  onClick={() => setShowComments(!showComments)} 
                  className="action-icon-btn"
                  title="Add Reflection"
              >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={showComments ? "#38bdf8" : "none"} stroke={showComments ? "#38bdf8" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                  </svg>
              </button>
              <span style={{ fontWeight: '600', color: '#475569', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>{story?.comments?.length || 0}</span>
          </div>

          <button 
              onClick={handleShare} 
              className="action-icon-btn"
              title="Pass On Memory"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill={isShared ? "#10b981" : "none"} stroke={isShared ? "#10b981" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
             </svg>
          </button>

          {images.length > 0 && (
              <button 
                  onClick={handleDownloadImage} 
                  className="action-icon-btn"
                  style={{ marginLeft: 'auto' }}
                  title="Archive Image"
              >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isDownloaded ? "#0f172a" : "none"} stroke={isDownloaded ? "#0f172a" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                     <polyline points="7 10 12 15 17 10"></polyline>
                     <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
              </button>
          )}
        </div>
      )}

      {/* ☁️ Cloud Reflection Box */}
      {!isEditing && showComments && (
        <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 'bold' }}>
              Family Reflections
          </div>
          <StoryCommentBox storyId={story._id} comments={story.comments} onCommentSubmit={onComment} />
        </div>
      )}

      {/* 🔥 THE HIDDEN EXPORT TEMPLATE */}
      <StoryExportTemplate ref={exportRef} story={story} />

      {/* Styles */}
      <style>{`
        .action-icon-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        .action-icon-btn:hover {
            background: rgba(0,0,0,0.03);
            transform: translateY(-2px);
        }
        .action-icon-btn:active {
            transform: scale(0.9);
        }
        @keyframes shieldPop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          15% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default StoryCard;