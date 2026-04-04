import { useEffect, useRef } from 'react';

function ChatWindow({ messages, currentUserId, currentUserName }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const meId = String(currentUserId || '');
  // Naam ko lowercase me check karenge taaki AJAY aur ajay match ho jayein
  const meName = String(currentUserName || '').toLowerCase().trim();

  return (
    <div style={{
      height: '60vh', overflowY: 'auto', padding: '24px',
      background: '#f8fafc', borderRadius: '24px',
      border: '1px solid #e2e8f0'
    }}>
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '20%', color: '#94a3b8' }}>
          <p style={{ fontWeight: '600' }}>No legacy shared yet. Start the talk!</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          // 1. ID nikalne ka try karo
          let sId = String(msg?.senderId?._id || msg?.senderId || msg?.sender?._id || msg?.userId || '');
          
          // 2. Naam nikalne ka try karo
          let sName = String(msg?.senderName || msg?.sender?.name || '').toLowerCase().trim();

          // 🔥 BRAHMAASTRA: Agar ID match kare YA Naam match kare, toh apna message (Right)
          const isMe = (meId && sId === meId) || (meName && sName === meName);

          return (
            <div
              key={msg?._id || msg?.clientMsgId || index}
              style={{
                display: 'flex', flexDirection: 'column', 
                alignItems: isMe ? 'flex-end' : 'flex-start', 
                marginBottom: '16px'
              }}
            >
              <div style={{ maxWidth: '75%' }}>
                {/* Doosron ka Naam Left me dikhega */}
                {!isMe && (
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginLeft: '12px', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {msg?.senderName || msg?.sender?.name || 'Family Member'}
                  </div>
                )}

                <div style={{
                  padding: '12px 18px',
                  borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: isMe ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#fff',
                  color: isMe ? '#fff' : '#1e293b',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  fontSize: '15px'
                }}>
                  {msg?.text || msg?.message}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;