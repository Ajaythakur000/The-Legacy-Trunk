import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function StoryCommentBox({ storyId, comments = [], onCommentSubmit }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCommentSubmit(storyId, text);
    setText('');
  };

  return (
    <div style={{ marginTop: 24, background: '#D4B895', border: 'none', borderRadius: 16, padding: '24px', position: 'relative', boxShadow: 'inset 4px 4px 0px rgba(255,255,255,0.4)' }}>
      
      {/* Title */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3E2723', marginBottom: 16, textTransform: 'uppercase' }}>
        💬 FAMILY CHATTER
      </div>

      {/* Comments list */}
      <AnimatePresence>
        {comments.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 8 }}>
            {comments.map((c, idx) => {
              const initials = c?.user?.name ? c.user.name.charAt(0).toUpperCase() : '?';
              return (
                <motion.div key={c._id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Mini avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#C89B3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)' }}>
                    {c?.user?.avatar ? (
                      <img src={c.user.avatar} alt={c?.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723' }}>{initials}</span>
                    )}
                  </div>
                  {/* Comic Speech Bubble */}
                  <div style={{ flex: 1, background: '#FFF', border: 'none', borderRadius: 16, borderTopLeftRadius: 0, padding: '12px 16px', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', position: 'relative' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: #FDFBF7, marginBottom: 4 }}>
                      {c?.user?.name || 'SOMEONE'}
                    </div>
                    <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#3E2723', lineHeight: 1.4 }}>
                      {c.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <input
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Say something..."
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ 
              width: '100%', padding: '14px 16px', background: '#FFF', 
              border: 'none', borderRadius: 12, outline: 'none', 
              color: '#3E2723', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, 
              boxSizing: 'border-box', boxShadow: focused ? '6px 6px 0px 0px #C89B3C' : '4px 4px 0px 0px #3E2723',
              transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all 0.2s'
            }}
          />
        </div>

        <motion.button type="submit" disabled={!text.trim()}
          whileHover={text.trim() ? { scale: 1.05 } : {}}
          whileTap={text.trim() ? { scale: 0.95, x: 2, y: 2, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' } : {}}
          style={{
            padding: '14px 20px', background: text.trim() ? '#00C853' : '#ccc',
            border: 'none', borderRadius: 12, color: text.trim() ? '#FFF' : '#3E2723',
            fontFamily: "'Playfair Display', serif", fontSize: 16, cursor: text.trim() ? 'pointer' : 'not-allowed',
            boxShadow: text.trim() ? '4px 4px 0px 0px #3E2723' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>
          SEND
        </motion.button>
      </form>
    </div>
  );
}

export default StoryCommentBox;