import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

// --- PREMIUM CONFIRM MODAL ---
function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(4,6,14,0.92)', backdropFilter: 'blur(16px)'
    }}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 28 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        style={{
          background: 'rgba(12,16,32,0.95)',
          border: '1px solid rgba(220,60,60,0.3)', 
          borderRadius: '20px', padding: '44px 36px 32px', maxWidth: '440px', width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 50px rgba(220,60,60,0.15)',
          textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(220,60,60,0.8),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(220,60,60,0.3),transparent)' }} />

        <div style={{
          width: '68px', height: '68px', margin: '0 auto 24px',
          borderRadius: '50%', background: 'rgba(220,60,60,0.08)',
          border: '1px solid rgba(220,60,60,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(220,60,60,0.2)', position: 'relative'
        }}>
           <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1px dashed rgba(220,60,60,0.25)', animation: 'vrSpin 12s linear infinite' }} />
           <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="1.5" style={{ width: 34, height: 34, filter: 'drop-shadow(0 0 8px rgba(240,128,128,0.6))' }}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
        </div>

        <h3 style={{ margin: '0 0 12px 0', fontFamily: "'Cinzel', serif", fontSize: '24px', fontWeight: 700, color: '#f08080', letterSpacing: '2px', textShadow: '0 0 30px rgba(220,60,60,0.5)' }}>
          ERASE MEMORY?
        </h3>
        
        <p style={{ margin: '0 0 36px 0', color: 'rgba(255,255,255,0.7)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '18px', lineHeight: 1.6 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={onClose} style={{
            flex: 1, background: 'transparent', border: '1px solid rgba(212,168,80,0.3)',
            color: 'rgba(212,168,80,0.7)', padding: '14px 0', borderRadius: '10px',
            fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer', transition: 'all 0.2s'
          }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(212,168,80,0.08)'; e.currentTarget.style.color = '#e8c87a'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.6)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(212,168,80,0.7)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.3)'; }}>
            KEEP
          </button>

          <button onClick={() => { onConfirm(); onClose(); }} style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%)', backgroundSize: '200%',
            border: 'none', color: '#fff', padding: '14px 0', borderRadius: '10px',
            fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '1.5px', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(220,60,60,0.4)', transition: 'all 0.2s',
            animation: 'vrPulseGlowRed 3s ease-in-out infinite'
          }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{
              position:'absolute', top:'-50%', left:'-100%', width:'50%', height:'200%',
              background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', transform:'skewX(-20deg)',
              animation: 'vrShine 3s ease-in-out infinite', pointerEvents:'none',
            }}/>
            ERASE
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ChatMessage({ msg, isMe, currentUserId, familyCircleId }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false); 
  const audioRef = useRef(null);

  const avatarUrl = msg?.senderAvatar || msg?.sender?.avatar || msg?.avatar
    || `https://ui-avatars.com/api/?name=${msg?.senderName || 'U'}&background=1a1410&color=e8c87a&bold=true`;

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
    
    toast.success(`Sealed with ${emoji}`, { 
      icon: emoji, 
      style: { 
        background: 'rgba(12,16,32,0.85)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212,168,80,0.2)', color: '#e8c87a',
        fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '1px'
      } 
    });
  };

  const executeDelete = () => {
    const socket = getSocket();
    if (socket?.connected) socket.emit('delete_message', { familyCircleId, messageId: msg._id });
    toast('Memory Erased 💥', { 
      icon: '💥', 
      style: { background: 'rgba(12,16,32,0.9)', border: '1px solid rgba(220,60,60,0.3)', color: '#f08080', fontFamily: "'Cinzel', serif", letterSpacing: '1px' } 
    }); 
  };

  const handleDeleteClick = () => {
      setShowClearModal(true);
  }

  const reactionCounts = (msg.reactions || []).reduce((acc, curr) => { acc[curr.emoji] = (acc[curr.emoji] || 0) + 1; return acc; }, {});
  const myReaction = (msg.reactions || []).find(r => String(r.userId) === String(currentUserId))?.emoji;
  const timeStr = msg?.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <>
      <AnimatePresence>
        {showClearModal && (
           <ConfirmModal 
             isOpen={showClearModal} 
             onClose={() => setShowClearModal(false)}
             onConfirm={executeDelete}
             message="Permanently erase this transmission from the vault?"
           />
        )}
      </AnimatePresence>

      {/* 🔥 OUTER WRAPPER: Handles 100% width and left/right alignment, BUT NO HOVER EVENTS HERE */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ 
          display: 'flex', 
          justifyContent: isMe ? 'flex-end' : 'flex-start', // Aligns the inner content left or right
          marginBottom: 24, 
          width: '100%' 
        }}
      >
        
        {/* 🔥 INNER WRAPPER: Tightly hugs the Avatar + Message. Hover events go HERE! */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: isMe ? 'row-reverse' : 'row', 
            alignItems: 'flex-end', 
            gap: 12, 
            maxWidth: '85%' // Prevents it from stretching all the way across
          }}
          onMouseEnter={() => setShowOptions(true)}
          onMouseLeave={() => { setShowOptions(false); setShowEmojiPicker(false); }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={avatarUrl} alt="Avatar" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${isMe ? 'rgba(212,168,80,0.4)' : 'rgba(255,255,255,0.1)'}`, boxShadow: isMe ? '0 0 10px rgba(212,168,80,0.1)' : '0 2px 6px rgba(0,0,0,0.4)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#4ade80', border: '1.5px solid #06080f', boxShadow: '0 0 6px #4ade80' }} />
          </div>

          {/* Message Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', position: 'relative' }}>

            {/* Name & Time Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '0 6px' }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: isMe ? 'rgba(232,200,122,0.9)' : 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
                {isMe ? 'You' : (msg?.senderName || 'Family Member')}
              </span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>
                {timeStr}
              </span>
            </div>

            {/* Chat Bubble Row */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>

              {/* INSTAGRAM STYLE FLOATING EMOJI PICKER */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      position: 'absolute', top: -58, [isMe ? 'right' : 'left']: 0, zIndex: 30,
                      background: 'rgba(8,10,18,0.85)', backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(212,168,80,0.2)',
                      padding: '8px 16px', borderRadius: '30px', 
                      display: 'flex', gap: 12,
                      boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,80,0.05)',
                    }}
                  >
                    {['❤️', '😂', '🔥', '👍', '😢', '✨'].map(emoji => (
                      <span key={emoji} onClick={() => handleReact(emoji)}
                        style={{ 
                            cursor: 'pointer', fontSize: 20, transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                            background: myReaction === emoji ? 'rgba(212,168,80,0.15)' : 'transparent', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '34px',
                            boxShadow: myReaction === emoji ? '0 0 10px rgba(212,168,80,0.2)' : 'none'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.3) translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.background = myReaction === emoji ? 'rgba(212,168,80,0.15)' : 'transparent'; }}
                      >{emoji}</span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SEAMLESS FLOATING BUBBLE */}
              <div
                onMouseEnter={() => !isMe && setShowEmojiPicker(true)}
                style={{
                  padding: (msg?.imageUrl || msg?.audioUrl) ? 4 : '12px 18px',
                  borderRadius: isMe ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                  background: isMe
                    ? 'linear-gradient(135deg, rgba(212,168,80,0.15) 0%, rgba(180,130,40,0.05) 100%)' 
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  border: isMe ? '1px solid rgba(212,168,80,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  color: isMe ? '#fdf8e8' : 'rgba(255,255,255,0.8)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                  fontSize: 15, lineHeight: 1.6,
                  wordBreak: 'break-word',
                  fontFamily: "'Cormorant Garamond',serif",
                  position: 'relative', overflow: 'hidden',
                  cursor: isMe ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Inner top shimmer */}
                {isMe && <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent)' }} />}

                {/* Image */}
                {msg?.imageUrl && (
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
                    {!imgLoaded && <div style={{ width: 240, height: 160, background: 'rgba(212,168,80,0.05)', borderRadius: 16, animation: 'vrPulse 1.5s ease-in-out infinite' }} />}
                    <img src={msg.imageUrl} alt="Shared" onLoad={() => setImgLoaded(true)} style={{ width: '100%', maxWidth: 280, display: imgLoaded ? 'block' : 'none', objectFit: 'cover', borderRadius: 'inherit' }} />
                  </div>
                )}

                {/* Audio player */}
                {msg?.audioUrl && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 12px', margin: 4,
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: 14, minWidth: 200,
                    border: isMe ? '1px solid rgba(212,168,80,0.1)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <button onClick={togglePlay} style={{
                      background: isMe ? 'rgba(212,168,80,0.15)' : 'rgba(255,255,255,0.05)',
                      border: isMe ? '1px solid rgba(212,168,80,0.2)' : '1px solid rgba(255,255,255,0.1)',
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#e8c87a', transition: 'all 0.2s',
                    }}>
                      {isPlaying
                        ? <svg viewBox="0 0 24 24" fill="#e8c87a" style={{ width: 10, height: 10 }}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                        : <svg viewBox="0 0 24 24" fill="#e8c87a" style={{ width: 12, height: 12, marginLeft: 2 }}><polygon points="5,3 19,12 5,21" /></svg>
                      }
                    </button>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
                      {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} style={{
                          width: 2, borderRadius: 1,
                          background: isPlaying ? `rgba(212,168,80,${0.4 + Math.sin(i * 0.8) * 0.4})` : 'rgba(212,168,80,0.15)',
                          height: isPlaying ? `${30 + Math.sin(i * 0.9 + Date.now() * 0.01) * 20}%` : `${20 + Math.sin(i * 0.7) * 30}%`,
                          transition: 'height 0.1s ease',
                        }} />
                      ))}
                    </div>
                    <audio ref={audioRef} src={msg.audioUrl} controlsList="nodownload noplaybackrate" style={{ display: 'none' }} />
                  </div>
                )}

                {/* Text */}
                {msg?.text && (
                  <div style={{ padding: (msg?.imageUrl || msg?.audioUrl) ? '8px 10px' : 0 }}>
                    {msg.text}
                  </div>
                )}
              </div>

              {/* Hover Actions (Reaction & Delete) */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, x: isMe ? 8 : -8, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: isMe ? 8 : -8, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    <button onClick={() => setShowEmojiPicker(p => !p)} title="React"
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(12,16,32,0.6)', border: '1px solid rgba(212,168,80,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: 'rgba(212,168,80,0.6)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.15)'; e.currentTarget.style.color = '#e8c87a'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(12,16,32,0.6)'; e.currentTarget.style.color = 'rgba(212,168,80,0.6)'; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
                    </button>
                    {isMe && (
                      <button onClick={handleDeleteClick} title="Erase" 
                        style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(12,16,32,0.6)', border: '1px solid rgba(220,60,60,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: 'rgba(220,60,60,0.6)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.15)'; e.currentTarget.style.color = '#f08080'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(12,16,32,0.6)'; e.currentTarget.style.color = 'rgba(220,60,60,0.6)'; }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reaction Pills & Seen Status */}
            {(Object.keys(reactionCounts).length > 0 || (isMe && msg?.seenBy?.length > 1)) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '0 6px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                  <div key={emoji} onClick={() => handleReact(emoji)}
                    style={{
                      cursor: 'pointer',
                      background: myReaction === emoji ? 'rgba(212,168,80,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${myReaction === emoji ? 'rgba(212,168,80,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      padding: '2px 8px', borderRadius: '12px', fontSize: 12,
                      color: myReaction === emoji ? '#e8c87a' : 'rgba(255,255,255,0.5)',
                      fontWeight: 600, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {emoji}{count > 1 ? <span style={{fontSize: '10px', marginLeft: '4px', opacity: 0.8}}>{count}</span> : ''}
                  </div>
                ))}
                {isMe && msg?.seenBy?.length > 1 && (
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(212,168,80,0.3)', letterSpacing: 1 }}>
                    ✓✓ {msg.seenBy.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </>
  );
}

export default ChatMessage;