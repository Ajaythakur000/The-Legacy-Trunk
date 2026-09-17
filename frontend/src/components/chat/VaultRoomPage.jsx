

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMessagesApi } from '../../api/messageApi';
import { getSocket, connectSocket } from '../../services/socket';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(23,23,25,0.85)', backdropFilter: 'blur(6px)', padding: 20 }}>
      <motion.div initial={{ scale: 0.8, rotate: -2 }} animate={{ scale: 1, rotate: 2 }} exit={{ scale: 0.8, rotate: -2 }} transition={{ type: 'spring', bounce: 0.5 }}
        style={{ background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center', position: 'relative', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: '#D4B895', border: 'none', color: '#3E2723', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>✕</button>
        <div style={{ fontSize: 60, marginBottom: 16 }}>💣</div>
        <h3 style={{ margin: '0 0 16px', fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#D4B895', textShadow: '2px 2px 0px #3E2723', WebkitTextStroke: '1px #3E2723' }}>ERASE VAULT?</h3>
        <p style={{ margin: '0 0 32px', color: '#3E2723', fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: '18px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1, background: '#FFF', border: 'none', color: '#3E2723', padding: '14px 0', borderRadius: '12px', fontFamily: "'Playfair Display', serif", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>NOPE</motion.button>
          <motion.button onClick={() => { onConfirm(); onClose(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1, background: '#1E352F', border: 'none', color: '#FFF', padding: '14px 0', borderRadius: '12px', fontFamily: "'Playfair Display', serif", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>ERASE IT!</motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
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
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: '#FDFBF7', backgroundImage: 'none', fontFamily: "'Baloo 2', sans-serif", position: 'relative', overflow: 'hidden' }}>
      
      <AnimatePresence>
        {showClearModal && <ConfirmModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} onConfirm={executeClearChat} message="This will permanently erase ALL vault transmissions for everyone. Proceed?" />}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <header style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 36px', background: '#FFF', borderBottom: '6px solid #3E2723', boxShadow: '0px 8px 15px 0px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#D4B895', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-5deg)' }}>
            <span style={{ fontSize: 24 }}>💬</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#D4B895', letterSpacing: 1, textShadow: '2px 2px 0px #3E2723', WebkitTextStroke: '1px #3E2723' }}>
              FAMILY CHAT
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: isConnected ? '#00C853' : '#1E352F', border: 'none' }} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723' }}>
                {isConnected ? 'LIVE' : 'RECONNECTING...'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {user?.role === 'admin' && (
            <motion.button onClick={() => setShowClearModal(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ background: '#1E352F', color: '#FFF', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
              🗑️ NUKE CHAT
            </motion.button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#C89B3C', padding: '6px 16px', border: 'none', borderRadius: 12, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#3E2723' }}>
              {onlineCount} ONLINE
            </span>
            <div style={{ display: 'flex' }}>
              {onlineUsers.slice(0, 4).map((ou, idx) => (
                <img key={ou.userId} src={ou.avatar || `https://ui-avatars.com/api/?name=${ou.name}&background=FFD23F&color=171719&bold=true`} alt={ou.name} title={ou.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', marginLeft: idx === 0 ? 0 : -10, zIndex: 10 - idx, objectFit: 'cover' }} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 15, background: '#1E352F', border: 'none', borderRadius: 12, color: '#FFF', padding: '12px 24px', fontFamily: "'Playfair Display', serif", fontSize: 16, boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)' }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <ChatWindow messages={messages} currentUserId={String(user?._id)} currentUserName={user?.name} familyCircleId={familyCircleId} loading={loading} />

      <div style={{ position: 'absolute', bottom: 110, left: 28, zIndex: 20 }}>
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} disabled={!familyCircleId || loading || !isConnected} />
    </div>
  );
}

export default VaultRoomPage;