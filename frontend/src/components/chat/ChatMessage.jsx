import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { getSocket } from '../../services/socket';

function ChatMessage({ msg, isMe, currentUserId, familyCircleId }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false); // To show Delete icon on hover
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Avatar fallback with robust checking
  const avatarUrl = msg?.senderAvatar || msg?.sender?.avatar || msg?.avatar || `https://ui-avatars.com/api/?name=${msg?.senderName || 'U'}&background=random`;

  // --- Premium Audio Player Logic ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleEnded = () => setIsPlaying(false);
      audioEl.addEventListener('ended', handleEnded);
      return () => audioEl.removeEventListener('ended', handleEnded);
    }
  }, [msg?.audioUrl]);

  // --- Reactions Logic ---
  const handleReact = (emoji) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('add_reaction', {
        familyCircleId,
        messageId: msg._id,
        emoji,
        userId: currentUserId,
        userName: msg?.senderName || 'User'
      });
    }
    setShowEmojiPicker(false);
  };

  // --- Delete Logic ---
  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('delete_message', { familyCircleId, messageId: msg._id });
    }
  };

  // Group reactions for rendering
  const reactionCounts = (msg.reactions || []).reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  // Check if current user has reacted with a specific emoji (for UI highlight later if needed)
  const myReaction = (msg.reactions || []).find(r => String(r.userId) === String(currentUserId))?.emoji;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '12px',
        marginBottom: '24px',
        width: '100%',
      }}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* 👤 Avatar (Dono taraf dikhega ab) */}
      <img 
        src={avatarUrl} 
        alt="Avatar" 
        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '2px solid #fff' }} 
      />

      {/* 💬 Message Body Container */}
      <div 
        style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', position: 'relative' }}
        onMouseLeave={() => setShowEmojiPicker(false)}
      >
        
        {/* Name & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '0 4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
            {isMe ? 'You' : (msg?.senderName || 'Family Member')}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
            {msg?.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* The Bubble Wrapper (For hover effects) */}
        <div 
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}
        >
          {/* Reaction Picker Popover */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ 
                  position: 'absolute', top: '-45px', [isMe ? 'right' : 'left']: '0', 
                  background: '#fff', padding: '6px 12px', borderRadius: '20px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', gap: '8px', zIndex: 10,
                  border: '1px solid #f1f5f9'
                }}
              >
                {['❤️', '😂', '🔥', '👍'].map(emoji => (
                  <span key={emoji} onClick={() => handleReact(emoji)} style={{ cursor: 'pointer', fontSize: '18px', transition: 'transform 0.2s', background: myReaction === emoji ? '#f1f5f9' : 'transparent', borderRadius: '50%', padding: '2px' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.2)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                    {emoji}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Actual Bubble */}
          <div 
            onMouseEnter={() => !isMe && setShowEmojiPicker(true)} // Double check hover zone
            style={{
              padding: (msg?.imageUrl || msg?.audioUrl) ? '4px' : '12px 18px',
              borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: isMe ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#ffffff',
              color: isMe ? '#ffffff' : '#1e293b',
              boxShadow: isMe ? '0 4px 15px rgba(79, 70, 229, 0.25)' : '0 4px 15px rgba(0,0,0,0.06)',
              border: isMe ? 'none' : '1px solid #e2e8f0',
              fontSize: '15px',
              lineHeight: '1.5',
              wordBreak: 'break-word',
              position: 'relative',
              cursor: isMe ? 'default' : 'pointer' // hint that you can interact
            }}>
            
            {/* 🖼️ Premium Image Support */}
            {msg?.imageUrl && (
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px' }}>
                <img 
                  src={msg.imageUrl} 
                  alt="Shared" 
                  style={{ width: '100%', maxWidth: '300px', display: 'block', objectFit: 'cover' }} 
                />
              </div>
            )}

            {/* 🎤 Premium Audio Player (Sleek Custom Design) */}
            {msg?.audioUrl && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px',
                background: isMe ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                borderRadius: '12px', minWidth: '200px', margin: '4px'
              }}>
                <button onClick={togglePlay} style={{ 
                  background: isMe ? '#fff' : '#4f46e5', color: isMe ? '#4f46e5' : '#fff',
                  border: 'none', width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {isPlaying ? '⏸' : '▶️'}
                </button>
                <div style={{ flex: 1, height: '4px', background: isMe ? 'rgba(255,255,255,0.3)' : '#cbd5e1', borderRadius: '2px', position: 'relative' }}>
                  {/* Fake progress bar for visual aesthetic */}
                  <div style={{ width: isPlaying ? '100%' : '0%', height: '100%', background: isMe ? '#fff' : '#4f46e5', borderRadius: '2px', transition: 'width 2s linear' }}></div>
                </div>
                {/* Disable controls list to remove download/speed options */}
                <audio ref={audioRef} src={msg.audioUrl} controlsList="nodownload noplaybackrate" style={{ display: 'none' }} />
              </div>
            )}

            {/* 📝 Text Content */}
            {msg?.text && (
              <div style={{ padding: (msg?.imageUrl || msg?.audioUrl) ? '8px 12px' : '0' }}>
                {msg.text}
              </div>
            )}
          </div>

          {/* Action Options (Delete & Manual React) - Shown on hover */}
          {showOptions && (
             <div style={{ display: 'flex', gap: '8px', opacity: 0.7, transition: 'opacity 0.2s' }}>
                {isMe && (
                   <button onClick={handleDelete} title="Delete Message" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.2)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                     🗑️
                   </button>
                )}
                {isMe && (
                   <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add Reaction" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#94a3b8' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.2)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                     😀
                   </button>
                )}
             </div>
          )}
        </div>

        {/* Reaction Counters & Views */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginLeft: '4px' }}>
          {Object.keys(reactionCounts).length > 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <div key={emoji} onClick={() => handleReact(emoji)} style={{ cursor: 'pointer', background: myReaction === emoji ? '#e0e7ff' : '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: `1px solid ${myReaction === emoji ? '#bfdbfe' : '#e2e8f0'}`, color: myReaction === emoji ? '#2563eb' : '#475569', fontWeight: 'bold', transition: 'all 0.2s' }}>
                  {emoji} {count > 1 ? count : ''}
                </div>
              ))}
            </div>
          )}
          
          {/* Views Indicator (Read Receipt) */}
          {isMe && msg?.seenBy?.length > 1 && (
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginLeft: '4px' }}>
              ✓ Seen by {msg.seenBy.length - 1}
            </span>
          )}
        </div>

      </div>
    </motion.div>
  );
}

export default ChatMessage;