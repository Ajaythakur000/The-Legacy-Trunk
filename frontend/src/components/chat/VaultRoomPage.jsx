import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMessagesApi } from '../api/messageApi';
import { getSocket } from '../services/socket';

import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import TypingIndicator from '../components/chat/TypingIndicator';

function VaultRoomPage() {
  const { user } = useAuth();

  const familyCircleId = useMemo(() => {
    return user?.familyCircleId || user?.familyCircle?._id || 'demo-family-circle';
  }, [user]);

  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);

  const bottomRef = useRef(null);

  // typing control refs
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // 1) Load history once room available
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setError('');

      try {
        const data = await getMessagesApi(familyCircleId, 50);
        const history = data?.messages || data?.data?.messages || data || [];
        setMessages(Array.isArray(history) ? history : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load messages');
      } finally {
        setLoadingHistory(false);
      }
    };

    if (familyCircleId) fetchHistory();
  }, [familyCircleId]);

  // 2) Socket listeners + room join
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !familyCircleId) {
      setIsRealtimeConnected(false);
      return;
    }

    setIsRealtimeConnected(socket.connected);

    // join room
    socket.emit('join_vault', { familyCircleId });

    const onConnect = () => {
      setIsRealtimeConnected(true);
      // reconnect pe room re-join
      socket.emit('join_vault', { familyCircleId });
    };

    const onDisconnect = () => {
      setIsRealtimeConnected(false);
    };

    const onSocketError = (payload) => {
      const msg =
        payload?.message ||
        payload?.error ||
        'Socket error occurred. Please wait and retry.';
      setError(msg);
    };

    const onReceiveMessage = (incoming) => {
      if (!incoming) return;

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            (incoming._id && m._id === incoming._id) ||
            (incoming.clientMsgId && m.clientMsgId === incoming.clientMsgId)
        );
        if (exists) return prev;
        return [...prev, incoming];
      });
    };

    const onMemberTyping = (payload) => {
      const typingName = payload?.name || payload?.senderName || 'Someone';
      const typingUserId = payload?.userId || payload?.senderId;

      if (String(typingUserId) === String(user?._id)) return;

      setTypingUsers((prev) => (prev.includes(typingName) ? prev : [...prev, typingName]));
    };

    const onMemberStopTyping = (payload) => {
      const typingName = payload?.name || payload?.senderName || 'Someone';
      const typingUserId = payload?.userId || payload?.senderId;

      if (String(typingUserId) === String(user?._id)) return;

      setTypingUsers((prev) => prev.filter((name) => name !== typingName));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('socket_error', onSocketError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('member_typing', onMemberTyping);
    socket.on('member_stop_typing', onMemberStopTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('socket_error', onSocketError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('member_typing', onMemberTyping);
      socket.off('member_stop_typing', onMemberStopTyping);

      socket.emit('leave_vault', { familyCircleId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      isTypingRef.current = false;
    };
  }, [familyCircleId, user?._id]);

  // 3) Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4) Send message
  const handleSendMessage = (text) => {
    const socket = getSocket();
    if (!socket || !socket.connected) {
      setError('Realtime disconnected. Please wait for reconnection.');
      return;
    }

    const payload = {
      familyCircleId,
      senderId: user?._id,
      senderName: user?.name || 'User',
      text,
      clientMsgId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    // optimistic append
    setMessages((prev) => [...prev, payload]);
    socket.emit('send_message', payload);

    // force typing stop after send
    if (isTypingRef.current) {
      socket.emit('typing_stop', {
        familyCircleId,
        userId: user?._id,
        name: user?.name || 'User',
      });
      isTypingRef.current = false;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // 5) Typing handler with debounce
  const handleTyping = (value) => {
    const socket = getSocket();
    if (!socket || !socket.connected) return;

    const hasText = value.trim().length > 0;

    if (hasText && !isTypingRef.current) {
      socket.emit('typing_start', {
        familyCircleId,
        userId: user?._id,
        name: user?.name || 'User',
      });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        socket.emit('typing_stop', {
          familyCircleId,
          userId: user?._id,
          name: user?.name || 'User',
        });
        isTypingRef.current = false;
      }
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Vault Room</h2>
      <p style={{ marginTop: 0, color: '#666' }}>
        Family Circle: <b>{familyCircleId}</b>
      </p>

      {!isRealtimeConnected ? (
        <p style={{ color: '#b45309', background: '#fffbeb', padding: 8, borderRadius: 8 }}>
          Realtime disconnected. Trying to reconnect...
        </p>
      ) : null}

      {loadingHistory ? <p>Loading chat history...</p> : null}
      {error ? (
        <p style={{ color: 'crimson', background: '#fef2f2', padding: 8, borderRadius: 8 }}>
          {error}
        </p>
      ) : null}

      <ChatWindow messages={messages} currentUserId={user?._id} />
      <div ref={bottomRef} />

      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={loadingHistory || !isRealtimeConnected}
      />
    </div>
  );
}

export default VaultRoomPage;