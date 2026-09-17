import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../../services/socket';

function ChatMessage({ msg, isMe, currentUserId, familyCircleId }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const audioRef = useRef(null);

  const avatarUrl = msg?.senderAvatar || msg?.sender?.avatar || msg?.avatar || `https://ui-avatars.com/api/?name=${msg?.senderName || 'U'}&background=FFD23F&color=171719&bold=true`;

  const togglePlay = () => {
    if (audioRef.current) { isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }
  };

  useEffect(() => {
    const el = audioRef.current; if (!el) return;
    const onEnded = () => setIsPlaying(false);
    el.addEventListener('ended', onEnded);
    return () => el.removeEventListener('ended', onEnded);
  }, [msg?.audioUrl]);

  const handleReact = (emoji) => {
    const socket = getSocket();
    if (socket?.connected) socket.emit('add_reaction', { familyCircleId, messageId: msg._id, emoji, userId: currentUserId, userName: msg?.senderName || 'User' });
    setShowEmojiPicker(false);
  };

  const executeDelete = () => {
    const socket = getSocket();
    if (socket?.connected) socket.emit('delete_message', { familyCircleId, messageId: msg._id });
    toast.success('Message Deleted! 💥'); 
  };

  const reactionCounts = (msg.reactions || []).reduce((acc, curr) => { acc[curr.emoji] = (acc[curr.emoji] || 0) + 1; return acc; }, {});
  const myReaction = (msg.reactions || []).find(r => String(r.userId) === String(currentUserId))?.emoji;
  const timeStr = msg?.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Comic colors for chat bubbles
  const bubbleColor = isMe ? '#D4B895' : '#FFF';

  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
      style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 24, width: '100%' }}>
      
      <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 16, maxWidth: '85%' }}
        onMouseEnter={() => setShowOptions(true)} onMouseLeave={() => { setShowOptions(false); setShowEmojiPicker(false); }}>
        
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={avatarUrl} alt="Avatar" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #3E2723', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)' }} />
        </div>

        {/* Message Column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', position: 'relative' }}>

          {/* Name Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723' }}>
              {isMe ? 'YOU' : (msg?.senderName || 'FAMILY')}
            </span>
            <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 12, color: 'rgba(23,23,25,0.5)' }}>
              {timeStr}
            </span>
          </div>

          {/* Chat Bubble */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>

            {/* INSTAGRAM STYLE FLOATING EMOJI PICKER */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  style={{ position: 'absolute', top: -50, [isMe ? 'right' : 'left']: 0, zIndex: 30, background: '#FFF', border: '2px solid #3E2723', padding: '8px 12px', borderRadius: 20, display: 'flex', gap: 8, boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.3)' }}>
                  {['❤️', '😂', '🔥', '👍', '😢', '✨'].map(emoji => (
                    <span key={emoji} onClick={() => handleReact(emoji)} style={{ cursor: 'pointer', fontSize: 24, transition: 'transform 0.1s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                      {emoji}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE BUBBLE */}
            <div onMouseEnter={() => !isMe && setShowEmojiPicker(true)}
              style={{
                padding: (msg?.imageUrl || msg?.audioUrl) ? 6 : '12px 16px',
                borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: bubbleColor, border: '2px solid #3E2723',
                color: '#3E2723', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.3)',
                fontSize: 18, lineHeight: 1.5, wordBreak: 'break-word', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700,
                position: 'relative', overflow: 'hidden'
              }}>
              
              {/* Image */}
              {msg?.imageUrl && (
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0', border: '1px solid #3E2723' }}>
                  {!imgLoaded && <div style={{ width: 240, height: 160, background: '#F5F5F5' }} />}
                  <img src={msg.imageUrl} alt="Shared" onLoad={() => setImgLoaded(true)} style={{ width: '100%', maxWidth: 280, display: imgLoaded ? 'block' : 'none', objectFit: 'cover' }} />
                </div>
              )}

              {/* Audio player */}
              {msg?.audioUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#FFF', border: '1px solid #3E2723', borderRadius: 12, margin: 4 }}>
                  <button onClick={togglePlay} style={{ background: '#632020', border: '1px solid #3E2723', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }}>
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <audio ref={audioRef} src={msg.audioUrl} controlsList="nodownload noplaybackrate" style={{ display: 'none' }} />
                </div>
              )}

              {/* Text */}
              {msg?.text && <div style={{ padding: (msg?.imageUrl || msg?.audioUrl) ? '8px 10px' : 0 }}>{msg.text}</div>}
            </div>

            {/* Hover Actions */}
            <AnimatePresence>
              {showOptions && (
                <motion.div initial={{ opacity: 0, x: isMe ? 8 : -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isMe ? 8 : -8 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => setShowEmojiPicker(p => !p)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF', border: '1px solid #3E2723', cursor: 'pointer', fontSize: 16, boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.3)' }}>😀</button>
                  {isMe && <button onClick={executeDelete} style={{ width: 36, height: 36, borderRadius: '50%', background: '#632020', border: '1px solid #3E2723', cursor: 'pointer', fontSize: 16, boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.3)', color: '#FFF' }}>🗑️</button>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reaction Pills & Seen Status */}
          {(Object.keys(reactionCounts).length > 0 || (isMe && msg?.seenBy?.length > 1)) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexDirection: isMe ? 'row-reverse' : 'row' }}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <div key={emoji} onClick={() => handleReact(emoji)} style={{ cursor: 'pointer', background: '#FFF', border: '1px solid #3E2723', padding: '4px 10px', borderRadius: 16, fontSize: 14, fontWeight: 700, fontFamily: "'Baloo 2',sans-serif", color: '#3E2723', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.3)' }}>
                  {emoji} {count > 1 && count}
                </div>
              ))}
              {isMe && msg?.seenBy?.length > 1 && (
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#00C853' }}>
                  ✓✓ SEEN BY {msg.seenBy.length - 1}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ChatMessage;