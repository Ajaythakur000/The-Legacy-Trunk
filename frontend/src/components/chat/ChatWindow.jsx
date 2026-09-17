
import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { motion } from 'framer-motion'; 

function ChatWindow({ messages, currentUserId, currentUserName, familyCircleId, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const meId = String(currentUserId || '');
  const meName = String(currentUserName || '').toLowerCase().trim();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
      <div style={{ width: '100%', maxWidth: '860px', padding: '0 24px', display: 'flex', flexDirection: 'column' }}>

        {/* Loading Comic Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 0' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexDirection: i % 2 === 0 ? 'row-reverse' : 'row' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFF', border: 'none' }} />
                <div style={{ width: `${150 + i * 60}px`, height: 60, borderRadius: 16, background: '#FFF', border: 'none', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
            style={{ textAlign: 'center', margin: '80px auto', background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, padding: '40px', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)', maxWidth: 450 }}
          >
            <div style={{ fontSize: 60, marginBottom: 16 }}>🦗</div>
            <h3 style={{ margin: '0 0 10px', fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#C89B3C' }}>
              CRICKETS CHIRPING!
            </h3>
            <p style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: '#3E2723' }}>
              No one has said anything yet. Be the first to start the gossip!
            </p>
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