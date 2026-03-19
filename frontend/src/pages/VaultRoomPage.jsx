import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMessagesApi } from '../api/messageApi';
import { getSocket } from '../services/socket';

function VaultRoomPage() {
  const { user } = useAuth();

  // IMPORTANT: no fake fallback id
  const familyCircleId = useMemo(() => {
    return user?.familyCircleId || user?.familyCircle?._id || null;
  }, [user]);

  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const bottomRef = useRef(null);

  // 1) History load (only if real familyCircleId exists)
  useEffect(() => {
    if (!familyCircleId) {
      setMessages([]);
      setError('');
      setLoadingHistory(false);
      return;
    }

    const run = async () => {
      setLoadingHistory(true);
      setError('');
      try {
        const data = await getMessagesApi(familyCircleId, 50);
        const history = data?.messages || data?.data?.messages || data || [];
        setMessages(Array.isArray(history) ? history : []);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 403) {
          setError('Access denied for this family vault');
        } else {
          setError(e?.response?.data?.message || 'Failed to load messages');
        }
      } finally {
        setLoadingHistory(false);
      }
    };

    run();
  }, [familyCircleId]);

  // 2) Socket join/listeners (only if real familyCircleId exists)
  useEffect(() => {
    if (!familyCircleId) {
      setIsConnected(false);
      return;
    }

    const socket = getSocket();
    if (!socket) {
      setIsConnected(false);
      return;
    }

    setIsConnected(!!socket.connected);

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join_vault', { familyCircleId });
    };

    const onDisconnect = () => setIsConnected(false);

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

    socket.emit('join_vault', { familyCircleId });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.emit('leave_vault', { familyCircleId });
    };
  }, [familyCircleId]);

  // 3) autoscroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4) send
  const handleSend = (e) => {
    e.preventDefault();

    if (!familyCircleId) return;

    const form = e.currentTarget;
    const input = form.elements.message;
    const text = input.value.trim();
    if (!text) return;

    const socket = getSocket();
    if (!socket || !socket.connected) {
      setError('Realtime disconnected');
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

    setMessages((prev) => [...prev, payload]); // optimistic
    socket.emit('send_message', payload);

    input.value = '';
  };

  const noFamilyCircle = !familyCircleId;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Vault Room</h1>

      <p>
        Family Circle:{' '}
        <b>{familyCircleId ? familyCircleId : 'Not linked'}</b>
      </p>

      {noFamilyCircle ? (
        <p style={{ color: '#92400e', background: '#fffbeb', padding: 8, borderRadius: 8 }}>
          Your account is not linked to any family circle yet.
        </p>
      ) : null}

      {!noFamilyCircle && !isConnected ? (
        <p style={{ color: '#92400e', background: '#fffbeb', padding: 8, borderRadius: 8 }}>
          Realtime disconnected...
        </p>
      ) : null}

      {loadingHistory ? <p>Loading messages...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      <div
        style={{
          marginTop: 12,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 12,
          minHeight: 320,
          maxHeight: 420,
          overflowY: 'auto',
          background: '#fafafa',
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>
            {noFamilyCircle ? 'No vault available.' : 'No messages yet.'}
          </p>
        ) : (
          messages.map((m, i) => {
            const isMe =
              String(m?.senderId || m?.sender?._id) === String(user?._id);

            return (
              <div
                key={m?._id || m?.clientMsgId || i}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: isMe ? '#dbeafe' : '#e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {m?.senderName || m?.sender?.name || 'Unknown'}
                  </div>
                  <div>{m?.text || m?.message || ''}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          name="message"
          placeholder={noFamilyCircle ? 'Family circle required...' : 'Type a message...'}
          style={{ flex: 1, padding: '10px 12px' }}
          disabled={noFamilyCircle || loadingHistory || !isConnected}
        />
        <button type="submit" disabled={noFamilyCircle || loadingHistory || !isConnected}>
          Send
        </button>
      </form>
    </div>
  );
}

export default VaultRoomPage;