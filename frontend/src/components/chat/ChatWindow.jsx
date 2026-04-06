import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage'; 

function ChatWindow({ messages, currentUserId, currentUserName, familyCircleId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const meId = String(currentUserId || '');
  const meName = String(currentUserName || '').toLowerCase().trim();

  return (
    <div style={{
      flex: 1, 
      overflowY: 'auto', 
      padding: '32px 0',
      background: '#f8fafc', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center' // 🔥 Centers the chat stream
    }}>
      <div style={{ width: '100%', maxWidth: '800px', padding: '0 24px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Empty State */}
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '60px auto', background: '#fff', padding: '40px', borderRadius: '24px', border: '1px dashed #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.4rem' }}>Welcome to the Vault</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Start a conversation, share a photo, or drop a voice note!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            let sId = String(msg?.senderId?._id || msg?.senderId || msg?.sender?._id || msg?.userId || '');
            let sName = String(msg?.senderName || msg?.sender?.name || '').toLowerCase().trim();
            const isMe = (meId && sId === meId) || (meName && sName === meName);

            return (
              <ChatMessage 
                key={msg?._id || msg?.clientMsgId || index} 
                msg={msg} 
                isMe={isMe} 
                currentUserId={meId}
                familyCircleId={familyCircleId}
              />
            );
          })
        )}
        <div ref={bottomRef} style={{ height: '20px' }} />
      </div>
    </div>
  );
}

export default ChatWindow;