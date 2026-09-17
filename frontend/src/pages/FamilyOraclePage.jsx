import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DOMPurify from 'dompurify';

// ── Comic Action Button ───────────────────────────────────────────────────────
function ComicButton({ onClick, disabled, loading, children }) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95, x: 2, y: 2, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' } : {}}
      style={{
        background: disabled ? '#ccc' : '#D4B895', border: 'none',
        color: '#3E2723', borderRadius: 12, padding: '12px 24px',
        fontFamily: "'Playfair Display', serif", fontSize: 18, cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '4px 4px 0px 0px #3E2723', transition: 'box-shadow 0.1s, transform 0.1s'
      }}
    >
      {loading ? 'THINKING...' : children}
    </motion.button>
  );
}

// ── Dark Input ────────────────────────────────────────────────────────────────
function ComicTextarea({ value, onChange, onKeyDown, disabled, maxLength }) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div style={{
      background: '#FFF', border: 'none', borderRadius: 16, padding: '16px',
      marginBottom: 16, transition: 'all 0.2s',
      boxShadow: focused ? '8px 8px 0px 0px #C89B3C' : '6px 6px 0px 0px #3E2723',
      transform: focused ? 'translate(-2px, -2px)' : 'none'
    }}>
      <textarea
        ref={textareaRef} value={value} onChange={onChange} onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        disabled={disabled} maxLength={maxLength}
        placeholder="E.g., What year did uncle Bob break the TV? (Press Enter)"
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: '#3E2723', fontFamily: "'Baloo 2', sans-serif", fontWeight: 700,
          fontSize: 18, lineHeight: 1.6, resize: 'none', minHeight: 80, maxHeight: 200,
        }}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function FamilyOraclePage() {
  const { user } = useAuth();
  const [question, setQuestion]   = useState('');
  const [answer, setAnswer]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const askTheOracle = async () => {
    if (!question.trim()) return;
    if (question.trim().length > 300) { setError("Too long! Keep it under 300 characters."); return; }
    if (!user?.activeCircleId) { setError("Pick a family circle first!"); return; }
    
    setError(''); setLoading(true); setAnswer('');
    
    try {
      const res = await api.post('/ai/ask-oracle', {
        circleId: user.activeCircleId,
        question: question.substring(0, 300),
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Oracle Error:', err);
      setAnswer("The AI Guru is sleeping. Try again later!");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askTheOracle(); }
  };

  const renderFormattedText = text => {
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FDFBF7;">$1</strong>').replace(/\n/g, '<br />');
    const clean = DOMPurify.sanitize(formatted, { ALLOWED_TAGS: ['strong', 'br', 'span'], ALLOWED_ATTR: ['style'] });
    return <span dangerouslySetInnerHTML={{ __html: clean }} />;
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, position: 'relative' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 80 }}>⚙️</motion.div>
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', top: '30%', right: '10%', fontSize: 60 }}>💡</motion.div>
      </div>

      <div style={{ maxWidth: 750, margin: '0 auto', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>

        {/* Title section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 80, marginBottom: 10, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>🤖</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#C89B3C', margin: '0 0 10px' }}>
            AI GURU
          </h1>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#3E2723', background: '#D4B895', display: 'inline-block', padding: '4px 16px', border: 'none', borderRadius: 8, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-2deg)' }}>
            Ask anything about your family history!
          </p>
        </motion.div>

        {/* Input card */}
        <div style={{ width: '100%', background: '#1E352F', border: '6px solid #3E2723', borderRadius: 24, padding: 24, boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)', marginBottom: 40 }}>
          <ComicTextarea value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} maxLength={300} />

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ background: '#FFF', border: 'none', borderRadius: 12, padding: '12px', marginBottom: 16, fontFamily: "'Playfair Display', serif", color: '#FDFBF7', textAlign: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#FFF' }}>
              {question.length} / 300
            </span>
            <ComicButton onClick={askTheOracle} disabled={loading || !question.trim()} loading={loading}>
              ASK THE GURU 💥
            </ComicButton>
          </div>
        </div>

        {/* Answer section */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 60, /* removed spin */ }}>🧠</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginTop: 16 }}>SEARCHING THE NEURAL NET...</div>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}

          {!loading && answer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }}
              style={{ width: '100%', background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, padding: '32px', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)', position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: -20, left: -20, background: '#D4B895', color: '#3E2723', padding: '8px 16px', border: 'none', borderRadius: 12, fontFamily: "'Playfair Display', serif", fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-10deg)' }}>
                THE GURU SAYS:
              </div>
              <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.6, color: '#3E2723', margin: '20px 0 0' }}>
                {renderFormattedText(answer)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default FamilyOraclePage;