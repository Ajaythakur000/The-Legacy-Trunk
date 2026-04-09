import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DOMPurify from 'dompurify';

// ── Animated Star Canvas ──────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId, frame = 0;
    const stars = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 140; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach(s => {
        const alpha = 0.3 + 0.5 * Math.sin(frame * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

// ── Dust Motes ────────────────────────────────────────────────────────────────
function DustMotes({ count = 18 }) {
  const motes = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      lx:    `${Math.random() * 100}%`,
      ty:    `${Math.random() * 100}%`,
      tx:    `${Math.random() * 60 - 30}px`,
      ty2:   `${-30 - Math.random() * 50}px`,
      sz:    `${4 + Math.random() * 8}px`,
      dur:   `${6 + Math.random() * 8}s`,
      delay: `${Math.random() * 10}s`,
      color: ['rgba(212,168,80,0.7)', 'rgba(100,140,220,0.5)', 'rgba(180,140,80,0.6)'][
        Math.floor(Math.random() * 3)
      ],
    }))
  ).current;

  return (
    <>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute',
          left: m.lx, top: m.ty,
          width: m.sz, height: m.sz,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${m.color}, transparent 70%)`,
          animation: `ltFloat ${m.dur} ${m.delay} ease-in-out infinite`,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 0,
          '--tx': m.tx,
          '--ty2': m.ty2,
        }} />
      ))}
    </>
  );
}

// ── Card Shell (Glassmorphism) ─────────────────────────────────────────────────
function OracleCard({ children }) {
  const cardRef = useRef(null);
  const spotRef = useRef(null);

  const onMouseMove = useCallback(e => {
    if (!cardRef.current || !spotRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    spotRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    spotRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
    spotRef.current.style.opacity = '1';
  }, []);

  const onMouseLeave = useCallback(() => {
    if (spotRef.current) spotRef.current.style.opacity = '0';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        width: '100%',
        background: 'rgba(12,16,32,0.85)',
        border: '1px solid rgba(212,168,80,0.22)',
        borderRadius: 20,
        padding: 6,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Shimmer lines */}
      <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1,
        background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:1,
        background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)', pointerEvents:'none' }}/>
      {/* Corner accents */}
      {[['top:12px','left:12px','borderTop','borderLeft'],
        ['top:12px','right:12px','borderTop','borderRight'],
        ['bottom:12px','left:12px','borderBottom','borderLeft'],
        ['bottom:12px','right:12px','borderBottom','borderRight']].map(([a,b,c,d],i)=>(
        <div key={i} style={{
          position:'absolute', width:18, height:18,
          ...Object.fromEntries([[a.split(':')[0], a.split(':')[1]],[b.split(':')[0], b.split(':')[1]]]),
          [c]: '1px solid rgba(212,168,80,0.6)',
          [d]: '1px solid rgba(212,168,80,0.6)',
          pointerEvents:'none',
        }}/>
      ))}
      {/* Mouse spotlight */}
      <div ref={spotRef} style={{
        position:'absolute', inset:0, borderRadius:20, opacity:0,
        background:'radial-gradient(circle 180px at var(--mx,50%) var(--my,50%), rgba(212,168,80,0.07), transparent)',
        transition:'opacity 0.3s', pointerEvents:'none',
      }}/>
      {children}
    </div>
  );
}

// ── Dark Input ────────────────────────────────────────────────────────────────
function DarkTextarea({ value, onChange, onKeyDown, disabled, maxLength }) {
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
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${focused ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.35)'}`,
      borderRadius: 12, padding: '14px 16px',
      marginBottom: 12, position: 'relative',
      transition: 'all 0.3s',
      boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none',
    }}>
      {/* Gold icon */}
      <svg style={{ marginTop:2, flexShrink:0 }} width="14" height="14" viewBox="0 0 14 14"
        fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="5" cy="5" r="4"/><path d="M10 10 L13 13"/>
      </svg>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        maxLength={maxLength}
        placeholder="e.g., When did Dadaji buy his first car? (Press Enter to ask)"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: 'rgba(255,255,255,0.88)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 16, lineHeight: 1.6, resize: 'none',
          minHeight: 60, maxHeight: 200,
        }}
      />
      {/* Sweep line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(212,168,80,0.8), transparent)',
        transform: focused ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.4s ease',
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

// ── Gold Button ───────────────────────────────────────────────────────────────
function GoldButton({ onClick, disabled, loading, children }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #c9933a 0%, #e8a820 50%, #c9933a 100%)',
        backgroundSize: '200%',
        color: '#1a0f00',
        border: 'none', borderRadius: 10,
        padding: '12px 24px',
        fontFamily: "'Cinzel', serif",
        fontSize: 12, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        animation: disabled ? 'none' : 'ltPulseGlow 3s ease-in-out infinite',
      }}
    >
      <div style={{
        position:'absolute', top:'-50%', left:'-100%',
        width:'50%', height:'200%',
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
        transform:'skewX(-20deg)',
        animation: 'ltShine 3s ease-in-out infinite',
        pointerEvents:'none',
      }}/>
      {loading ? (
        <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}>
          {[0,1,2].map(i=>(
            <span key={i} style={{
              width:5,height:5,borderRadius:'50%',background:'#1a0f00',
              animation:`ltDot 0.8s ease-in-out ${i*0.15}s infinite`,
              display:'inline-block',
            }}/>
          ))}
        </span>
      ) : children}
    </motion.button>
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
    if (question.trim().length > 300) {
      setError("The Oracle prefers short, concise whispers. Keep it under 300 characters.");
      return;
    }
    if (!user?.activeCircleId) {
      setError("Please select a family circle first!");
      return;
    }
    setError('');
    setLoading(true);
    setAnswer('');
    try {
      const res = await api.post('/ai/ask-oracle', {
        circleId: user.activeCircleId,
        question: question.substring(0, 300),
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Oracle Error:', err);
      setAnswer("The Oracle is currently resting. The cosmic energies are weak right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askTheOracle(); }
  };

  const renderFormattedText = text => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fef08a;">$1</strong>')
      .replace(/\n/g, '<br />');
    const clean = DOMPurify.sanitize(formatted, {
      ALLOWED_TAGS: ['strong', 'br', 'span'], ALLOWED_ATTR: ['style'],
    });
    return <span dangerouslySetInnerHTML={{ __html: clean }} />;
  };

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Space+Mono:wght@400;700&display=swap');

        @keyframes ltRingSpin  { to { transform: rotate(360deg); } }
        @keyframes ltShine     { 0% { left:-100%; } 40%,100% { left:150%; } }
        @keyframes ltPulseGlow { 0%,100% { box-shadow:0 8px 24px rgba(212,168,80,0.25); } 50% { box-shadow:0 8px 32px rgba(212,168,80,0.5); } }
        @keyframes ltDot       { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-5px); } }
        @keyframes ltFloat     {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          20%  { opacity:0.8; }
          80%  { opacity:0.4; }
          100% { opacity:0; transform:translate(var(--tx,20px),var(--ty2,-40px)) scale(0.2); }
        }
        @keyframes crystalFloat {
          0%,100% { transform:translateY(0); filter:drop-shadow(0 0 24px rgba(212,168,80,0.5)); }
          50%     { transform:translateY(-14px); filter:drop-shadow(0 0 44px rgba(212,168,80,1)); }
        }
        @keyframes orbSpin  { to { transform:rotate(360deg); } }
        @keyframes orbPulse {
          from { box-shadow:0 0 20px #d4af37, inset 0 0 10px #fef08a; transform:scale(0.95); }
          to   { box-shadow:0 0 60px #d4af37, 0 0 30px #fefce8, inset 0 0 40px #fef08a; transform:scale(1.05); }
        }
        @keyframes ltPulseText { 0%,100%{opacity:0.4;} 50%{opacity:1; text-shadow:0 0 10px #d4af37;} }
        @keyframes revealScroll {
          from { opacity:0; transform:translateY(50px) scale(0.96); filter:blur(8px); }
          to   { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }
        .oracle-crystal { animation: crystalFloat 4s ease-in-out infinite; display:block; }
        .oracle-orb     { animation: orbSpin 2.5s linear infinite, orbPulse 1.5s ease-in-out infinite alternate; }
        .oracle-orb-txt { animation: ltPulseText 2s ease-in-out infinite; }
        .answer-reveal  { animation: revealScroll 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ap1 { animation: crystalFloat 4s ease-in-out infinite; }
        .ap2 { animation: crystalFloat 3s ease-in-out infinite reverse; }
        .ap3 { animation: crystalFloat 5s ease-in-out 1s infinite; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: '#06080f',
          minHeight: '100vh',
          paddingBottom: 100,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        <StarCanvas />
        <DustMotes count={18} />

        <div style={{ maxWidth: 750, margin: '0 auto', padding: '60px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', zIndex: 2 }}>

          {/* Title section */}
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span className="oracle-crystal" style={{ fontSize:68, marginBottom:16,
              textShadow:'0 0 30px rgba(212,168,80,0.5)' }}>🔮</span>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(1.8rem,5vw,3rem)',
              fontWeight:700, color:'#e8c87a', margin:'0 0 12px',
              textShadow:'0 0 40px rgba(212,168,80,0.4)', letterSpacing:2 }}>
              The Family Oracle
            </h1>
            <p style={{ fontStyle:'italic', fontSize:'1.1rem',
              color:'rgba(255,255,255,0.38)', letterSpacing:1, margin:0 }}>
              Whisper your question. The Oracle reads your memories.
            </p>
          </div>

          {/* Input card */}
          <OracleCard>
            <div style={{ padding:'16px 16px 10px' }}>
              <DarkTextarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={300}
              />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-8 }}
                    style={{ display:'flex', alignItems:'center', gap:8,
                      background:'rgba(220,60,60,0.12)', border:'1px solid rgba(240,128,128,0.3)',
                      borderRadius:8, padding:'10px 14px', marginBottom:10 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      stroke="#f08080" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="7" r="6"/><path d="M7 4v3M7 10h.01"/>
                    </svg>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11,
                      color:'#f08080', letterSpacing:0.5 }}>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'8px 4px 6px',
                borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10,
                  letterSpacing:1,
                  color: question.length >= 300 ? '#f08080' : 'rgba(212,168,80,0.4)' }}>
                  {question.length} / 300
                </span>
                <GoldButton
                  onClick={askTheOracle}
                  disabled={loading || !question.trim()}
                  loading={loading}
                >
                  Ask the Oracle ✦
                </GoldButton>
              </div>
            </div>
          </OracleCard>

          {/* Loading orb */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ marginTop:60, display:'flex', flexDirection:'column',
                  alignItems:'center', gap:24 }}>
                <div className="oracle-orb" style={{
                  width:80, height:80, borderRadius:'50%',
                  background:'radial-gradient(circle at 30% 30%, #fefce8, #d4af37, #06080f)',
                  boxShadow:'0 0 40px #d4af37, inset 0 0 25px rgba(254,240,138,0.5)',
                }}/>
                <div className="oracle-orb-txt" style={{ fontFamily:"'Space Mono',monospace",
                  fontSize:10, letterSpacing:'3px', textTransform:'uppercase', color:'#d4af37' }}>
                  Weaving memories...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer scroll */}
          <AnimatePresence>
            {!loading && answer && (
              <motion.div
                className="answer-reveal"
                initial={{ opacity:0, y:50, scale:0.96 }}
                animate={{ opacity:1, y:0, scale:1 }}
                transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
                style={{
                  marginTop:50, width:'100%',
                  background:'rgba(12,16,32,0.85)',
                  border:'1px solid rgba(212,168,80,0.22)',
                  borderRadius:20, padding:'40px 36px',
                  position:'relative', overflow:'hidden',
                  boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,80,0.04)',
                }}
              >
                {/* shimmer lines */}
                <div style={{ position:'absolute',top:0,left:'15%',right:'15%',height:1,
                  background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)',pointerEvents:'none' }}/>
                <div style={{ position:'absolute',bottom:0,left:'15%',right:'15%',height:1,
                  background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)',pointerEvents:'none' }}/>
                {/* corners */}
                {[['top:12px','left:12px','borderTop','borderLeft'],
                  ['top:12px','right:12px','borderTop','borderRight'],
                  ['bottom:12px','left:12px','borderBottom','borderLeft'],
                  ['bottom:12px','right:12px','borderBottom','borderRight']].map(([a,b,c,d],i)=>(
                  <div key={i} style={{
                    position:'absolute', width:18, height:18, pointerEvents:'none',
                    ...Object.fromEntries([[a.split(':')[0],a.split(':')[1]],[b.split(':')[0],b.split(':')[1]]]),
                    [c]:'1px solid rgba(212,168,80,0.6)', [d]:'1px solid rgba(212,168,80,0.6)',
                  }}/>
                ))}

                <div style={{ width:80,height:2,
                  background:'linear-gradient(90deg,transparent,#d4af37,transparent)',
                  margin:'0 auto 28px' }}/>

                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.25rem',
                  lineHeight:2, color:'rgba(255,255,255,0.88)', textAlign:'center', margin:0 }}>
                  {renderFormattedText(answer)}
                </p>

                <div style={{ width:80,height:2,
                  background:'linear-gradient(90deg,transparent,#d4af37,transparent)',
                  margin:'28px auto 0' }}/>

                {/* Particles */}
                {[{cls:'ap1',top:28,left:28},{cls:'ap2',bottom:28,right:28},{cls:'ap3',top:'50%',left:20}]
                  .map(({cls,...pos},i)=>(
                  <div key={i} className={cls} style={{ position:'absolute',width:4,height:4,
                    background:'#fef08a',borderRadius:'50%',boxShadow:'0 0 10px #fef08a',
                    opacity:0.6,...pos }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rune footer */}
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'4px',
            color:'rgba(212,168,80,0.18)', userSelect:'none', textAlign:'center', marginTop:36 }}>
            ✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default FamilyOraclePage;