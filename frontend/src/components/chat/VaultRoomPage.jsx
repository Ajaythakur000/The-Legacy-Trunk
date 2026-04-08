import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMessagesApi } from '../../api/messageApi';
// 🔥 FIX: Import connectSocket as well to handle the race condition
import { getSocket, connectSocket } from '../../services/socket';

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
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const familyCircleId = useMemo(() => user?.activeCircleId || null, [user?.activeCircleId]);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // FETCH CHAT HISTORY
  useEffect(() => {
    if (!familyCircleId) {
      setMessages([]);
      setTypingUsers([]);
      setOnlineUsers([]);
      setOnlineCount(0);
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

  // 🔥 THE BULLETPROOF SOCKET CONNECTION MANAGER
  useEffect(() => {
    if (!familyCircleId) return;

    // 🔥 FIX 1: Race Condition Resolver
    let socket = getSocket();
    if (!socket) {
      const token = localStorage.getItem('token');
      if (token) {
        socket = connectSocket(token);
      } else {
        setIsConnected(false);
        return;
      }
    }

    const onReceiveMessage = (msg) => {
      if (!msg) return;
      setMessages((prev) => {
        const exists = prev.some((m) => 
          (msg.clientMsgId && m.clientMsgId === msg.clientMsgId) || 
          (msg._id && m._id === msg._id)
        );
        return exists ? prev : [...prev, msg];
      });
    };

    const onReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map(msg => 
        msg._id === messageId ? { ...msg, reactions } : msg
      ));
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
    };

    const onVaultChatCleared = () => setMessages([]);

    const onOnlineUsersUpdate = (data) => {
      if (data && data.users) {
        setOnlineCount(data.count);
        setOnlineUsers(data.users);
      }
    };

    const onMemberTyping = (p) => {
      const uid = String(p?.senderId || p?.userId || '');
      const uname = p?.senderName || p?.name || 'Someone';
      if (!uid || uid === String(user?._id)) return;
      setTypingUsers((prev) => (prev.includes(uname) ? prev : [...prev, uname]));
    };

    const onMemberStopTyping = (p) => {
      const uname = p?.senderName || p?.name || 'Someone';
      setTypingUsers((prev) => prev.filter((n) => n !== uname));
    };

    // 🔥 FIX 2: Dynamic Reconnect & Room Restorer
    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('join_vault', { familyCircleId }); // Force Re-join!
    };

    const handleDisconnect = () => setIsConnected(false);

    // Initial state check
    setIsConnected(socket.connected);
    if (socket.connected) {
      socket.emit('join_vault', { familyCircleId });
    }

    // Attach listeners safely
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
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('message_reaction_updated', onReactionUpdated);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('vault_chat_cleared', onVaultChatCleared);
      socket.off('vault_online_users', onOnlineUsersUpdate);
      socket.off('member_typing', onMemberTyping);
      socket.off('member_stop_typing', onMemberStopTyping);
      
      if (socket.connected) {
        socket.emit('leave_vault', { familyCircleId });
      }
    };
  }, [familyCircleId, user?._id]);

  const handleSendMessage = (mediaObject) => {
    const socket = getSocket();
    if (!socket || !socket.connected || !familyCircleId) return;

    const { text = '', imageUrl = '', audioUrl = '' } = mediaObject || {};

    const payload = {
      familyCircleId,
      text,
      imageUrl,
      audioUrl,
      clientMsgId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    socket.emit('send_message', payload);

    if (isTypingRef.current) {
      socket.emit('typing_stop', { familyCircleId });
      isTypingRef.current = false;
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (val) => {
    const socket = getSocket();
    if (!socket || !socket.connected || !familyCircleId) return;

    const hasText = val.trim().length > 0;
    const payload = { familyCircleId };

    if (hasText) {
      if (!isTypingRef.current) {
        socket.emit('typing_start', payload);
        isTypingRef.current = true;
      }
    } else {
      socket.emit('typing_stop', payload);
      isTypingRef.current = false;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        socket.emit('typing_stop', payload);
        isTypingRef.current = false;
      }
    }, 1000); 
  };

  const handleClearChat = () => {
    const confirmDelete = window.confirm("🚨 DANGER: This will permanently delete ALL messages for EVERYONE in the family. Are you absolutely sure?");
    if (confirmDelete) {
      const socket = getSocket();
      socket.emit('clear_vault_chat', { familyCircleId });
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 32px', borderBottom: '1px solid #e2e8f0', background: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 2px 10px rgba(59,130,246,0.1)' }}>
            💬
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Family Vault
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444', boxShadow: isConnected ? '0 0 8px #10b981' : 'none' }}></span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: isConnected ? '#059669' : '#dc2626' }}>
                {isConnected ? 'Secured Connection' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           {user?.role === 'admin' && (
             <button 
               onClick={handleClearChat}
               title="Erase All Chat History"
               style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
               onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
             >
               🗑️ Clear Vault
             </button>
           )}

           <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '6px 16px', borderRadius: '99px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginRight: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {onlineCount} Online
              </span>
              <div style={{ display: 'flex' }}>
                {onlineUsers.slice(0, 4).map((ou, idx) => (
                  <img 
                    key={ou.userId}
                    src={ou.avatar || `https://ui-avatars.com/api/?name=${ou.name}&background=random`} 
                    alt={ou.name} 
                    title={ou.name}
                    style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', 
                      marginLeft: idx === 0 ? '0' : '-10px', zIndex: 10 - idx, objectFit: 'cover' 
                    }} 
                  />
                ))}
                {onlineUsers.length > 4 && (
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', 
                    marginLeft: '-10px', zIndex: 0, background: '#e2e8f0', color: '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold'
                  }}>
                    +{onlineUsers.length - 4}
                  </div>
                )}
              </div>
           </div>
        </div>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 32px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #fecaca' }}>
          ⚠️ {error}
        </div>
      )}

      <ChatWindow 
        messages={messages} 
        currentUserId={String(user?._id)} 
        currentUserName={user?.name}
        familyCircleId={familyCircleId} 
      />
      
      <div style={{ background: '#f8fafc', padding: '0 32px', display: 'flex', justifyContent: 'center' }}>
         <div style={{ width: '100%', maxWidth: '800px', padding: '0 24px' }}>
           <TypingIndicator typingUsers={typingUsers} />
         </div>
      </div>

      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={!familyCircleId || loading || !isConnected}
      />
    </div>
  );
}

export default VaultRoomPage;