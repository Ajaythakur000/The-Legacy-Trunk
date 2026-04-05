import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoryCommentBox from './StoryCommentBox';

function StoryCard({ story, currentUser, onLike, onComment, onDelete, onEdit, isDetailView = false }) {
  const isAuthor = currentUser && story?.user?._id === currentUser._id;
  
  // 🔥 Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const [editContent, setEditContent] = useState(story.content);
  
  // 🔥 Comment Box Visibility Toggle (Reddit style)
  const [showComments, setShowComments] = useState(isDetailView);

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(story._id, { title: editTitle, content: editContent });
      setIsEditing(false);
    }
  };

  // Helper: Safely get all media URLs
  const images = [];
  if (story?.mediaUrls && story.mediaUrls.length > 0) {
    images.push(...story.mediaUrls);
  } else if (story?.mediaUrl) {
    images.push(story.mediaUrl);
  }

  // 📅 Helper: Smart Date Logic & Time Travel
  const getFormattedDates = () => {
    const postDateObj = new Date(story.createdAt);
    const postDateStr = postDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    let eventDateStr = null;
    let timeTravelBadge = null;

    if (story.isMilestone && story.milestoneDate) {
      const eventDateObj = new Date(story.milestoneDate);
      eventDateStr = eventDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Calculate year difference for the "Time Travel" badge
      const yearDiff = postDateObj.getFullYear() - eventDateObj.getFullYear();
      if (yearDiff > 0) {
        timeTravelBadge = `⏳ ${yearDiff} Year${yearDiff > 1 ? 's' : ''} Ago`;
      }
    }

    // If Post Date and Event Date are exactly the same, just return the Post Date.
    if (eventDateStr === postDateStr) {
      return { displayDate: postDateStr, eventBadge: null, timeTravelBadge: null };
    }

    return { 
      displayDate: postDateStr, 
      eventBadge: eventDateStr ? `Event: ${eventDateStr}` : null,
      timeTravelBadge
    };
  };

  const { displayDate, eventBadge, timeTravelBadge } = getFormattedDates();

  // 📤 Helper: Native Share / Download
  const handleShare = async () => {
    const shareData = {
      title: story.title,
      text: `Check out this memory: "${story.title}" on The Family Ledger.`,
      url: `${window.location.origin}/vault-stories/${story._id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard! 📋", { style: { borderRadius: '20px', background: '#334155', color: '#fff' }});
      }
    } catch (err) {
      console.log('Share failed or was cancelled.', err);
    }
  };

  // 🖼️ Helper: Advanced Cinematic Collage Layout
  const renderMediaGrid = () => {
    if (images.length === 0) return null;
    
    if (story?.mediaType === 'video') {
      return (
        <video controls style={{ width: '100%', maxHeight: isDetailView ? '600px' : '400px', borderRadius: '12px', marginTop: '20px' }}>
          <source src={images[0]} />
        </video>
      );
    }

    const count = images.length;

    if (count === 1) {
      return (
        <div style={{ marginTop: '20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img 
            src={images[0]} 
            alt={story.title} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available'; }}
            style={{ width: '100%', maxHeight: isDetailView ? '700px' : '450px', objectFit: 'cover', display: 'block', background: '#f1f5f9' }} 
          />
        </div>
      );
    }

    const gridStyles = {
      display: 'grid', gap: '8px', marginTop: '20px', borderRadius: '16px', overflow: 'hidden', height: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    };

    let layoutContent = null;
    if (count === 2) {
      layoutContent = (
        <div style={{ ...gridStyles, gridTemplateColumns: '1fr 1fr' }}>
          <img src={images[0]} alt="1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <img src={images[1]} alt="2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    } else if (count === 3) {
      layoutContent = (
        <div style={{ ...gridStyles, gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }}>
          <img src={images[0]} alt="1" style={{ width: '100%', height: '100%', objectFit: 'cover', gridRow: '1 / span 2' }} />
          <img src={images[1]} alt="2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <img src={images[2]} alt="3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    } else if (count === 4) {
      layoutContent = (
        <div style={{ ...gridStyles, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
          {images.map((img, i) => <img key={i} src={img} alt={`${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />)}
        </div>
      );
    } else if (count >= 5) {
      layoutContent = (
        <div style={{ ...gridStyles, gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
          <img src={images[0]} alt="1" style={{ width: '100%', height: '100%', objectFit: 'cover', gridColumn: '1 / span 2', gridRow: '1 / span 2' }} />
          <img src={images[1]} alt="2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <img src={images[2]} alt="3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }

    return layoutContent;
  };

  return (
    <div className="story-card" style={{ 
      position: 'relative', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)'
    }}>
      
      {/* 🌟 MILESTONE BADGE */}
      {story.isMilestone && (
        <div style={{ 
          position: 'absolute', top: '0', right: '32px', 
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', 
          padding: '8px 16px', borderRadius: '0 0 12px 12px', 
          fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px',
          boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)' 
        }}>
          🌟 FAMILY MILESTONE
        </div>
      )}

      {/* 👤 Header: User Info & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', marginTop: story.isMilestone ? '10px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(56, 189, 248, 0.3)' }}>
            {story?.user?.name ? story.user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {story?.user?.name || 'Unknown User'}
              {timeTravelBadge && (
                <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                  {timeTravelBadge}
                </span>
              )}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
              {displayDate} 
              {eventBadge && <span style={{ color: '#d97706', fontWeight: 'bold' }}> • {eventBadge}</span>}
            </div>
          </div>
        </div>
        
        {/* 🔥 Actions: Edit & Delete */}
        {isAuthor && !isEditing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button onClick={() => setIsEditing(true)} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' }}>
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={() => { if(window.confirm('Erase this memory permanently?')) onDelete(story._id); }} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' }}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📜 Content: Title & Text (Edit Mode vs Normal) */}
      {isEditing ? (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <input 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
            style={{ width: '100%', padding: '12px', marginBottom: '12px', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#3b82f6', boxSizing: 'border-box' }}
          />
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)} 
            rows={5}
            style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '1rem', color: '#334155', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#3b82f6', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSaveEdit} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}>Save Changes</button>
            <button onClick={() => { setIsEditing(false); setEditTitle(story.title); setEditContent(story.content); }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ paddingLeft: '4px' }}>
          {isDetailView ? (
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{story.title}</h3>
          ) : (
            <Link to={`/vault-stories/${story._id}`} style={{ textDecoration: 'none' }}>
              <h3 className="story-title" style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px', transition: 'color 0.2s' }}>
                {story.title}
              </h3>
            </Link>
          )}

          {/* AI Tone Badge */}
          {story.tone && story.tone !== 'Nostalgic and Warm' && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ display: 'inline-block', padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '800', borderRadius: '12px', textTransform: 'uppercase' }}>
                ✨ {story.tone.replace(/[^\w\s-]/gi, '')}
              </span>
            </div>
          )}

          <p style={{ margin: '0', color: '#334155', fontSize: '1.1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
            {story.content}
          </p>
        </div>
      )}

      {/* 🖼️ Media Section (DYNAMIC GRID/COLLAGE) */}
      {!isEditing && renderMediaGrid()}

      {/* 🔴 REDDIT-STYLE ACTION BAR */}
      {!isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', paddingTop: '16px' }}>
          
          {/* Like Pill */}
          <button 
            onClick={() => onLike(story._id)} 
            className={`action-pill ${story?.likes?.includes(currentUser?._id) ? 'active-like' : ''}`}
          >
            {story?.likes?.includes(currentUser?._id) ? '❤️' : '🤍'} 
            <span style={{ marginLeft: '6px', fontWeight: '800' }}>{story?.likes?.length || 0}</span>
          </button>

          {/* Comment Pill */}
          <button 
            onClick={() => setShowComments(!showComments)} 
            className="action-pill"
          >
            💬 <span style={{ marginLeft: '6px', fontWeight: '800' }}>{story?.comments?.length || 0}</span>
          </button>

          {/* Share Pill */}
          <button 
            onClick={handleShare} 
            className="action-pill"
          >
            📤 <span style={{ marginLeft: '6px', fontWeight: '700' }}>Share</span>
          </button>

        </div>
      )}

      {/* 💬 Comments Box (Togglable) */}
      {!isEditing && showComments && (
        <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease' }}>
          <StoryCommentBox storyId={story._id} comments={story.comments} onCommentSubmit={onComment} />
        </div>
      )}

      <style>{`
        .story-title:hover { color: #3b82f6 !important; }
        
        /* Reddit-style Pill Buttons */
        .action-pill {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 99px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-pill:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
        .action-pill.active-like {
          background: #ffe4e6;
          border-color: #fda4af;
          color: #e11d48;
        }
        .action-pill.active-like:hover {
          background: #fecdd3;
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