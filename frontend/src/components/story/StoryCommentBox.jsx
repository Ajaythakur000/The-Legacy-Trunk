import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, MessageSquareQuote } from 'lucide-react';

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
    <div style={{ marginTop: 24, background: 'rgba(238, 222, 193, 0.3)', borderTop: '1px solid rgba(62,39,35,0.1)', padding: '24px 16px', position: 'relative' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#8C7B6B', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>
        <MessageSquareQuote size={16} /> Notes & Whispers
      </div>

      {/* Comments list */}
      <AnimatePresence>
        {comments.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 32, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24, paddingRight: 8 }}>
            {comments.map((c, idx) => {
              const initials = c?.user?.name ? c.user.name.charAt(0).toUpperCase() : '?';
              return (
                <motion.div key={c._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  
                  {/* Mini avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #D4B895', background: '#FDFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {c?.user?.avatar ? (
                      <img src={c.user.avatar} alt={c?.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.4)' }} />
                    ) : (
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723' }}>{initials}</span>
                    )}
                  </div>
                  
                  {/* Content (Written on paper line) */}
                  <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid rgba(62,39,35,0.08)', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#8C7B6B' }}>
                        {c?.user?.name || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: '#3E2723', lineHeight: 1.4 }}>
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Jot down a thought..."
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ 
              width: '100%', padding: '8px 0', background: 'transparent', 
              border: 'none', borderBottom: focused ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.2)', 
              outline: 'none', 
              color: '#3E2723', fontFamily: "'Caveat', cursive", fontSize: 24, 
              boxSizing: 'border-box', transition: 'border-bottom 0.2s'
            }}
          />
        </div>

        <motion.button type="submit" disabled={!text.trim()}
          whileHover={text.trim() ? { opacity: 0.8 } : {}}
          whileTap={text.trim() ? { scale: 0.95 } : {}}
          style={{
            padding: '8px 16px', background: 'transparent',
            border: '1px solid', borderColor: text.trim() ? '#3E2723' : 'transparent',
            borderRadius: 4, color: text.trim() ? '#3E2723' : 'rgba(62,39,35,0.3)',
            fontFamily: "'Courier Prime', monospace", fontSize: 12, cursor: text.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            textTransform: 'uppercase'
          }}>
          <PenTool size={14} /> Ink it
        </motion.button>
      </form>
    </div>
  );
}

export default StoryCommentBox;
