import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { motion } from 'framer-motion'; // 🔥 Added framer-motion for smooth floating

function ChatWindow({ messages, currentUserId, currentUserName, familyCircleId, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const meId = String(currentUserId || '');
  const meName = String(currentUserName || '').toLowerCase().trim();

  return (
    <div
      className="vr-scrollbar"
      style={{
        flex: 1, overflowY: 'auto', padding: '28px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 10,
      }}
    >
      <div style={{ width: '100%', maxWidth: '820px', padding: '0 24px', display: 'flex', flexDirection: 'column' }}>

        {/* Loading shimmer (Smoothed out borders) */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 0' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexDirection: i % 2 === 0 ? 'row-reverse' : 'row' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(212,168,80,0.05)', border: '1px solid rgba(212,168,80,0.05)', flexShrink: 0, animation: 'vrPulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: `${120 + i * 60}px`, height: 48, borderRadius: 14, background: 'rgba(212,168,80,0.03)', border: '1px solid rgba(212,168,80,0.05)', animation: 'vrPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
              </div>
            ))}
          </div>
        )}

        {/* 🔥 PREMIUM SEAMLESS EMPTY STATE (NO BOXES) */}
        {!loading && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              textAlign: 'center', margin: '80px auto',
              position: 'relative', maxWidth: 450,
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}
          >
            {/* Subtle radial glow behind text instead of a hard box */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '200%', height: '200%',
              background: 'radial-gradient(ellipse, rgba(212,168,80,0.06) 0%, transparent 60%)',
              pointerEvents: 'none', zIndex: -1
            }} />

            {/* Floating Icon */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ 
                width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', 
                background: 'radial-gradient(circle, rgba(212,168,80,0.15) 0%, transparent 70%)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                boxShadow: '0 0 30px rgba(212,168,80,0.1)' 
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.2" style={{ width: 28, height: 28, filter: 'drop-shadow(0 0 8px rgba(212,168,80,0.6))' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </motion.div>

            <h3 style={{ margin: '0 0 10px', fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, color: '#e8c87a', letterSpacing: 2, textShadow: '0 0 20px rgba(212,168,80,0.4)' }}>
              The Vault Awaits
            </h3>
            
            <p style={{ margin: 0, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Be the first to inscribe a message into the family archives.
            </p>
            
            <div style={{ marginTop: 24, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,0.25)', userSelect: 'none' }}>
              ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ✦
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {!loading && messages.map((msg, index) => {
          let sId = String(msg?.senderId?._id || msg?.senderId || msg?.sender?._id || msg?.userId || '');
          let sName = String(msg?.senderName || msg?.sender?.name || '').toLowerCase().trim();
          const isMe = (meId && sId === meId) || (meName && sName === meName);
          return (
            <ChatMessage key={msg?._id || msg?.clientMsgId || index} msg={msg} isMe={isMe} currentUserId={meId} familyCircleId={familyCircleId} />
          );
        })}

        <div ref={bottomRef} style={{ height: 20 }} />
      </div>
    </div>
  );
}

export default ChatWindow;