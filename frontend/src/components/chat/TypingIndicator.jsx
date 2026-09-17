import { motion, AnimatePresence } from 'framer-motion';

function TypingIndicator({ typingUsers = [] }) {
  const names = typingUsers.map(u => {
    if (typeof u === 'object') return u?.senderName || u?.name || 'Someone';
    return u;
  }).filter(Boolean);

  const uniqueNames = [...new Set(names)];

  return (
    <AnimatePresence>
      {uniqueNames.length > 0 ? (
        <motion.div
          key="typing" initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#FFF', border: '1px solid #3E2723', borderRadius: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)' }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#632020', border: '2px solid #3E2723' }} />
            ))}
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723' }}>
            {uniqueNames.join(', ')} {uniqueNames.length > 1 ? 'ARE TYPING...' : 'IS TYPING...'}
          </span>
        </motion.div>
      ) : (
        <div key="empty" style={{ height: 42 }} />
      )}
    </AnimatePresence>
  );
}

export default TypingIndicator;