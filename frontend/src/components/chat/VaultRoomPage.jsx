import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMessagesApi } from '../../api/messageApi';
import { getSocket, connectSocket } from '../../services/socket';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';

// --- PREMIUM CONFIRM MODAL (UPGRADED) ---
function ModalCorners({ size = 20, inset = 12, opacity = 0.5, color = '220,60,60' }) {
  const base = { position: 'absolute', width: size, height: size, borderColor: `rgba(${color},${opacity})`, borderStyle: 'solid', pointerEvents: 'none' };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' }} />
      <div style={{ ...base, top: inset, right: inset, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' }} />
      <div style={{ ...base, bottom: inset, left: inset, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' }} />
      <div style={{ ...base, bottom: inset, right: inset, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

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
        <ModalCorners color="220,60,60" opacity={0.6} />

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
          ERASE VAULT?
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
            CANCEL
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
            CONFIRM
          </button>
        </div>
        <div style={{ marginTop: '28px', fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '4px', color: 'rgba(220,60,60,0.3)', userSelect: 'none' }}>
          ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ✦
        </div>
      </motion.div>
    </div>
  );
}


function VaultRoomPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const [showClearModal, setShowClearModal] = useState(false);

  const familyCircleId = useMemo(() => user?.activeCircleId || null, [user?.activeCircleId]);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!familyCircleId) { setMessages([]); setTypingUsers([]); setOnlineUsers([]); setOnlineCount(0); return; }
    const fetchHistory = async () => {
      setLoading(true); setError('');
      try {
        const data = await getMessagesApi(familyCircleId, 50);
        const history = data?.messages || data?.data?.messages || data || [];
        setMessages(Array.isArray(history) ? history : []);
      } catch (err) { setError(err?.response?.data?.message || 'Failed to load vault transmissions.'); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [familyCircleId]);

  useEffect(() => {
    if (!familyCircleId) return;
    let socket = getSocket();
    if (!socket) {
      const token = localStorage.getItem('token');
      if (token) socket = connectSocket(token);
      else { setIsConnected(false); return; }
    }

    const onReceiveMessage = (msg) => {
      if (!msg) return;
      setMessages((prev) => {
        const exists = prev.some(m => (msg.clientMsgId && m.clientMsgId === msg.clientMsgId) || (msg._id && m._id === msg._id));
        return exists ? prev : [...prev, msg];
      });
    };
    const onReactionUpdated = ({ messageId, reactions }) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    const onMessageDeleted = ({ messageId }) => setMessages(prev => prev.filter(m => m._id !== messageId));
    const onVaultChatCleared = () => setMessages([]);
    const onOnlineUsersUpdate = (data) => { if (data?.users) { setOnlineCount(data.count); setOnlineUsers(data.users); } };
    const onMemberTyping = (p) => {
      const uid = String(p?.senderId || p?.userId || '');
      const uname = p?.senderName || p?.name || 'Someone';
      if (!uid || uid === String(user?._id)) return;
      setTypingUsers(prev => prev.includes(uname) ? prev : [...prev, uname]);
    };
    const onMemberStopTyping = (p) => { const uname = p?.senderName || p?.name || 'Someone'; setTypingUsers(prev => prev.filter(n => n !== uname)); };
    const handleConnect = () => { setIsConnected(true); socket.emit('join_vault', { familyCircleId }); };
    const handleDisconnect = () => setIsConnected(false);

    setIsConnected(socket.connected);
    if (socket.connected) socket.emit('join_vault', { familyCircleId });

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('message_reaction_updated', onReactionUpdated);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('vault_chat_cleared', onVaultChatCleared);
    socket.on('vault_online_users', onOnlineUsersUpdate);
    socket.on('member_typing', onMemberTyping);
    socket.on('member_stop_typing', onMemberStopTyping);

    return () => {
      socket.off('connect', handleConnect); socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', onReceiveMessage); socket.off('message_reaction_updated', onReactionUpdated);
      socket.off('message_deleted', onMessageDeleted); socket.off('vault_chat_cleared', onVaultChatCleared);
      socket.off('vault_online_users', onOnlineUsersUpdate); socket.off('member_typing', onMemberTyping);
      socket.off('member_stop_typing', onMemberStopTyping);
      if (socket.connected) socket.emit('leave_vault', { familyCircleId });
    };
  }, [familyCircleId, user?._id]);

  const handleSendMessage = (mediaObject) => {
    const socket = getSocket();
    if (!socket || !socket.connected || !familyCircleId) return;
    const { text = '', imageUrl = '', audioUrl = '' } = mediaObject || {};
    socket.emit('send_message', { familyCircleId, text, imageUrl, audioUrl, clientMsgId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    if (isTypingRef.current) { socket.emit('typing_stop', { familyCircleId }); isTypingRef.current = false; }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (val) => {
    const socket = getSocket();
    if (!socket || !socket.connected || !familyCircleId) return;
    const hasText = val.trim().length > 0;
    if (hasText) { if (!isTypingRef.current) { socket.emit('typing_start', { familyCircleId }); isTypingRef.current = true; } }
    else { socket.emit('typing_stop', { familyCircleId }); isTypingRef.current = false; }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { if (isTypingRef.current) { socket.emit('typing_stop', { familyCircleId }); isTypingRef.current = false; } }, 1000);
  };

  const executeClearChat = () => {
     const socket = getSocket(); 
     socket.emit('clear_vault_chat', { familyCircleId }); 
  };

  return (
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: '#06080f', fontFamily: "'Cormorant Garamond', serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes vrFloat { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.2)} }
        @keyframes vrPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes vrGlow  { 0%,100%{box-shadow:0 0 6px rgba(212,168,80,.3)} 50%{box-shadow:0 0 18px rgba(212,168,80,.7)} }
        @keyframes vrSpin  { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes vrSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vrShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes vrPulseGlowRed { 0%,100%{box-shadow:0 4px 20px rgba(220,60,60,0.25)} 50%{box-shadow:0 6px 30px rgba(220,60,60,0.5)} }

        .vr-scrollbar::-webkit-scrollbar{width:4px} .vr-scrollbar::-webkit-scrollbar-track{background:transparent} .vr-scrollbar::-webkit-scrollbar-thumb{background:rgba(212,168,80,.2);border-radius:2px}
        .vr-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(212,168,80,.4)}
      `}</style>

      <AnimatePresence>
        {showClearModal && (
           <ConfirmModal 
             isOpen={showClearModal} 
             onClose={() => setShowClearModal(false)}
             onConfirm={executeClearChat}
             message="This will permanently erase ALL vault transmissions for everyone. Proceed?"
           />
        )}
      </AnimatePresence>

      <StarFieldBg />
      <DustMotes count={14} />

      {/* ── HEADER (SEAMLESS, NO HARD BORDERS) ── */}
      <header style={{
        position: 'relative', zIndex: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 36px',
        background: 'linear-gradient(to bottom, rgba(6,8,15,0.9) 0%, rgba(6,8,15,0) 100%)', // Smooth fade out
        backdropFilter: 'blur(4px)', // Gentle blur so it doesn't look like a hard box
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(212,168,80,0.1), transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'vrGlow 4s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.5" style={{ width: 24, height: 24 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', letterSpacing: 2, textShadow: '0 0 30px rgba(212,168,80,0.5)' }}>
              Family Vault
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isConnected ? '#4ade80' : '#f87171',
                boxShadow: isConnected ? '0 0 12px #4ade80' : '0 0 12px #f87171',
                animation: isConnected ? 'vrPulse 2s ease-in-out infinite' : 'none',
              }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: isConnected ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)' }}>
                {isConnected ? 'Secured Connection' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowClearModal(true)} 
              style={{
                background: 'transparent', // Removed the boxy background
                color: 'rgba(240,128,128,0.8)', border: 'none',
                cursor: 'pointer', fontFamily: "'Space Mono',monospace",
                fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.textShadow = '0 0 10px rgba(248,113,113,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,128,128,0.8)'; e.currentTarget.style.textShadow = 'none'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              Erase Vault
            </button>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.4)', marginRight: 4 }}>
              {onlineCount} Online
            </span>
            <div style={{ display: 'flex' }}>
              {onlineUsers.slice(0, 4).map((ou, idx) => (
                <img key={ou.userId} src={ou.avatar || `https://ui-avatars.com/api/?name=${ou.name}&background=1a1410&color=e8c87a`} alt={ou.name} title={ou.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #06080f', marginLeft: idx === 0 ? 0 : -10, zIndex: 10 - idx, objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} />
              ))}
              {onlineUsers.length > 4 && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #06080f', marginLeft: -10, background: '#1a1410', color: '#e8c87a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
                  +{onlineUsers.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error banner seamlessly integrated */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 15, background: 'rgba(220,60,60,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 30, color: '#f08080', padding: '8px 20px', fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" style={{ width: 12, height: 12, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <ChatWindow messages={messages} currentUserId={String(user?._id)} currentUserName={user?.name} familyCircleId={familyCircleId} loading={loading} />

      <div style={{ position: 'absolute', bottom: 100, left: 28, zIndex: 20 }}>
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} disabled={!familyCircleId || loading || !isConnected} />
    </div>
  );
}

// ── Star Field ────────────────────────────────────────────────────────────────
function StarFieldBg() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, sp: Math.random() * 0.005 + 0.001, ph: Math.random() * Math.PI * 2 }));
    const resize = () => { canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth; canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { const a = 0.15 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)); ctx.beginPath(); ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(212,180,80,${a})`; ctx.fill(); });
    };
    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

// ── Dust Motes ────────────────────────────────────────────────────────────────
function DustMotes({ count = 18 }) {
  const motes = useRef(Array.from({ length: count }, (_, i) => ({ id: i, sz: Math.random() * 3 + 1, gold: Math.random() > 0.2, dur: Math.random() * 10 + 6, delay: Math.random() * 12, tx: (Math.random() - 0.5) * 150, ty: -(Math.random() * 80 + 40), x: Math.random() * 100, y: Math.random() * 100 }))).current;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {motes.map(m => (
        <div key={m.id} style={{ position: 'absolute', width: m.sz, height: m.sz, left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%', background: `radial-gradient(circle,${m.gold ? 'rgba(255,200,80,.7)' : 'rgba(180,200,255,.5)'} 0%,transparent 70%)`, animation: `vrFloat ${m.dur}s ${m.delay}s linear infinite`, '--tx': `${m.tx}px`, '--ty': `${m.ty}px` }} />
      ))}
    </div>
  );
}

export default VaultRoomPage;