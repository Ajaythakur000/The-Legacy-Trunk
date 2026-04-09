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
          key="typing"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 0', height: 26,
          }}
        >
          {/* Animated dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(212,168,80,0.6)',
                animation: `vrPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                boxShadow: '0 0 4px rgba(212,168,80,0.3)',
              }} />
            ))}
          </div>
          <span style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic', fontSize: 13,
            color: 'rgba(212,168,80,0.55)',
            letterSpacing: 0.3,
          }}>
            <span style={{ color: 'rgba(212,168,80,0.8)', fontStyle: 'normal', fontFamily: "'Cinzel',serif", fontSize: 11 }}>
              {uniqueNames.join(', ')}
            </span>
            {' '}{uniqueNames.length > 1 ? 'are inscribing' : 'is inscribing'}...
          </span>
        </motion.div>
      ) : (
        <div key="empty" style={{ height: 26 }} />
      )}
    </AnimatePresence>
  );
}

export default TypingIndicator;