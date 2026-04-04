import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMessagesApi } from '../../api/messageApi';
import { getSocket } from '../../services/socket';

import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

function VaultRoomPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const familyCircleId = useMemo(() => user?.activeCircleId || null, [user?.activeCircleId]);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch History
  useEffect(() => {
    if (!familyCircleId) {
      setMessages([]);
      setTypingUsers([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMessagesApi(familyCircleId, 50);
        const history = data?.messages || data?.data?.messages || data || [];
        setMessages(Array.isArray(history) ? history : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load chat history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [familyCircleId]);

  // 2. Realtime Socket System
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !familyCircleId) {
      setIsConnected(false);
      return;
    }

    const onReceiveMessage = (msg) => {
      if (!msg) return;
      
      setMessages((prev) => {
        // 🔥 DOUBLE MESSAGE KILLER LOGIC
        const exists = prev.some((m) => 
          (msg.clientMsgId && m.clientMsgId === msg.clientMsgId) || 
          (msg._id && m._id === msg._id)
        );
        return exists ? prev : [...prev, msg];
      });
    };

    const onMemberTyping = (p) => {
      const uid = String(p?.senderId || p?.userId || '');
      const uname = p?.senderName || p?.name || 'Someone';
      
      // Khud ki typing status ignore karo
      if (!uid || uid === String(user?._id)) return;
      
      setTypingUsers((prev) => (prev.includes(uname) ? prev : [...prev, uname]));
    };

    const onMemberStopTyping = (p) => {
      const uname = p?.senderName || p?.name || 'Someone';
      setTypingUsers((prev) => prev.filter((n) => n !== uname));
    };

    setIsConnected(socket.connected);
    socket.emit('join_vault', { familyCircleId, userId: user?._id, name: user?.name });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('receive_message', onReceiveMessage);
    socket.on('member_typing', onMemberTyping);
    socket.on('member_stop_typing', onMemberStopTyping);

    return () => {
      socket.off('receive_message');
      socket.off('member_typing');
      socket.off('member_stop_typing');
      socket.emit('leave_vault', { familyCircleId });
    };
  }, [familyCircleId, user?._id, user?.name]);

  // 3. Send Message Action
  
  const handleSendMessage = (text) => {
    const socket = getSocket();
    if (!socket || !socket.connected || !familyCircleId) return;

    const payload = {
      familyCircleId,
      senderId: String(user?._id),
      senderName: user?.name || 'User',
      text,
      clientMsgId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    // 🛑 YAHAN SE 'setMessages' HATA DIYA HAI!
    // Ab tera frontend khud se message chipkayega nahi.
    // Jab backend socket se message wapas aayega, tabhi screen pe dikhega. (Zero Double Messages!)

    socket.emit('send_message', payload);

    // Bhejte hi typing indicator band
    if (isTypingRef.current) {
      socket.emit('typing_stop', {
        familyCircleId,
        senderId: String(user?._id),
        senderName: user?.name || 'User',
      });
      isTypingRef.current = false;
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  // 4. Typing Control Logic
 // 🔥 UPDATED TYPING LOGIC
  const handleTyping = (val) => {
    const socket = getSocket();
    if (!socket || !socket.connected || !familyCircleId) return;

    const hasText = val.trim().length > 0;

    // Payload me dono variants daal diye, backend jo chahe use kar le!
    const payload = {
      familyCircleId,
      senderId: String(user?._id),
      userId: String(user?._id),
      senderName: user?.name || 'User',
      name: user?.name || 'User'
    };

    if (hasText) {
      if (!isTypingRef.current) {
        socket.emit('typing_start', payload);
        isTypingRef.current = true;
      }
    } else {
      // Input khali hote hi STOP bhej do
      socket.emit('typing_stop', payload);
      isTypingRef.current = false;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // 1 second tak kuch na likhe toh auto-stop
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        socket.emit('typing_stop', payload);
        isTypingRef.current = false;
      }
    }, 1000); 
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* 🌟 Premium Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '0 8px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Vault Chat
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Circle ID: <span style={{ fontFamily: 'monospace', color: '#334155' }}>{familyCircleId || 'None'}</span>
          </p>
        </div>
        
        {/* Live Status Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: isConnected ? '#ecfdf5' : '#fef2f2',
          padding: '6px 12px', borderRadius: '99px',
          border: `1px solid ${isConnected ? '#a7f3d0' : '#fecaca'}`
        }}>
          <span style={{ 
            width: '8px', height: '8px', borderRadius: '50%', 
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 8px #10b981' : 'none'
          }}></span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: isConnected ? '#059669' : '#dc2626' }}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontWeight: '600' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Chat Components */}
      <ChatWindow 
        messages={messages} 
        currentUserId={String(user?._id)} 
        currentUserName={user?.name} 
      />
      
      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={!familyCircleId || loading || !isConnected}
      />
    </div>
  );
}

export default VaultRoomPage;