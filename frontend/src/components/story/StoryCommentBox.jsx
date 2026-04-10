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
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,168,80,0.15)', borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      {/* Gold top line */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4),transparent)' }} />

      {/* Section label */}
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)', marginBottom: 16 }}>
        ✦ Family Reflections
      </div>

      {/* Comments list */}
      <AnimatePresence>
        {comments.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 16, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,168,80,0.2) transparent' }}>
            {comments.map((c, idx) => {
              const initials = c?.user?.name ? c.user.name.charAt(0).toUpperCase() : '?';
              return (
                <motion.div key={c._id || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* Mini avatar */}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.3)', background: 'linear-gradient(135deg,#1a1410,#0f0c08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {c?.user?.avatar ? (
                      <img src={c.user.avatar} alt={c?.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: '#e8c87a' }}>{initials}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, background: 'rgba(212,168,80,0.04)', border: '1px solid rgba(212,168,80,0.1)', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'rgba(212,168,80,0.8)', marginBottom: 4, fontWeight: 600 }}>
                      {c?.user?.name || 'Anonymous'}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontStyle: 'italic' }}>
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          flex: 1, border: `1px solid ${focused ? 'rgba(212,168,80,0.55)' : 'rgba(212,168,80,0.2)'}`,
          borderRadius: 10, background: focused ? 'rgba(212,168,80,0.04)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
          boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.07)' : 'none',
        }}>
          <input
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Add your reflection…"
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ width: '100%', padding: '11px 16px', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.88)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontStyle: 'italic', boxSizing: 'border-box' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent)', transform: focused ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.4s ease' }} />
        </div>

        <motion.button type="submit" disabled={!text.trim()}
          whileHover={text.trim() ? { scale: 1.04, y: -1 } : {}}
          whileTap={text.trim() ? { scale: 0.96 } : {}}
          style={{
            padding: '11px 20px', position: 'relative', overflow: 'hidden',
            background: text.trim() ? 'linear-gradient(135deg,#c9933a,#e8a820)' : 'rgba(212,168,80,0.15)',
            border: 'none', borderRadius: 10,
            color: text.trim() ? '#1a0f00' : 'rgba(212,168,80,0.3)',
            fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s', whiteSpace: 'nowrap',
            boxShadow: text.trim() ? '0 4px 16px rgba(212,168,80,0.25)' : 'none',
          }}>
          {text.trim() && <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', transform: 'skewX(-20deg)', animation: 'ltShine 3s ease-in-out infinite' }} />}
          Inscribe
        </motion.button>
      </form>

      <style>{`
        @keyframes ltShine{0%,70%{left:-100%}100%{left:150%}}
        input::placeholder{color:rgba(255,255,255,0.2);font-style:italic;}
      `}</style>
    </div>
  );
}

export default StoryCommentBox;