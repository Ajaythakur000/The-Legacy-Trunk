import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import OTPVerificationModal from './OTPVerificationModal';
import ForgotPasswordModal from './ForgotPasswordModal';

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: '100vh',
    background: '#06080f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Cormorant Garamond', serif",
  },
  canvas: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: 0,
  },
  dustLayer: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: 1, overflow: 'hidden',
  },
  cardWrap: {
    position: 'relative', zIndex: 10,
    width: '100%', maxWidth: '420px',
  },
  card: {
    background: 'rgba(12,16,32,0.85)',
    border: '1px solid rgba(212,168,80,0.22)',
    borderRadius: '20px',
    padding: '44px 40px 40px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      sp: Math.random() * 0.008 + 0.002,
      ph: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${alpha})`;
        ctx.fill();
      });
      const grd = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width * 0.6);
      grd.addColorStop(0, 'rgba(212,150,40,0.04)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={S.canvas} />;
}

function DustLayer() {
  const motes = Array.from({ length: 18 }, (_, i) => {
    const sz = Math.random() * 3 + 1.5;
    const gold = Math.random() > 0.3;
    const dur = Math.random() * 8 + 6;
    const delay = Math.random() * 10;
    const tx = (Math.random() - 0.5) * 120;
    const ty = -(Math.random() * 80 + 40);
    return { id: i, sz, gold, dur, delay, tx, ty, x: Math.random() * 100, y: Math.random() * 100 };
  });

  return (
    <div style={S.dustLayer}>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute',
          width: m.sz, height: m.sz,
          left: `${m.x}%`, top: `${m.y}%`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${m.gold ? 'rgba(255,200,80,0.7)' : 'rgba(180,200,255,0.5)'} 0%, transparent 70%)`,
          animation: `ltFloat ${m.dur}s ${m.delay}s linear infinite`,
          '--tx': `${m.tx}px`, '--ty': `${m.ty}px`,
        }} />
      ))}
      <style>{`
        @keyframes ltFloat {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          15%  { opacity:1; }
          85%  { opacity:0.7; }
          100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.2); }
        }
        @keyframes ltRingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes ltShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes ltDotPulse {
          0%,80%,100%{transform:scale(0.6);opacity:0.5}
          40%{transform:scale(1);opacity:1}
        }
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}

function CornerAccents() {
  const base = {
    position: 'absolute', width: 18, height: 18,
    borderColor: 'rgba(212,168,80,0.5)', borderStyle: 'solid',
  };
  return (
    <>
      <div style={{ ...base, top: 12, left: 12, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' }} />
      <div style={{ ...base, top: 12, right: 12, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' }} />
      <div style={{ ...base, bottom: 12, left: 12, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' }} />
      <div style={{ ...base, bottom: 12, right: 12, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

function LogoRing() {
  return (
    <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 6px', zIndex: 2 }}>
      <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%', animation:'ltRingSpin 18s linear infinite' }} viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5"/>
        <circle cx="45" cy="45" r="40" stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="3 8"/>
        <circle cx="45" cy="5"  r="2"   fill="rgba(212,168,80,0.7)"/>
        <circle cx="83" cy="27" r="1.5" fill="rgba(212,168,80,0.5)"/>
        <circle cx="83" cy="63" r="1.5" fill="rgba(212,168,80,0.5)"/>
        <circle cx="45" cy="85" r="2"   fill="rgba(212,168,80,0.7)"/>
        <circle cx="7"  cy="63" r="1.5" fill="rgba(212,168,80,0.5)"/>
        <circle cx="7"  cy="27" r="1.5" fill="rgba(212,168,80,0.5)"/>
      </svg>
      <div style={{
        position:'absolute', top:8, left:8, right:8, bottom:8,
        borderRadius:'50%',
        background:'linear-gradient(135deg,#1a1410 0%,#0f0c08 100%)',
        border:'1px solid rgba(212,168,80,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center',
        overflow:'hidden',
      }}>
        <img
          src="/finall_logo.png"
          alt="The Legacy Trunk"
          style={{ width:'110%', height:'110%', objectFit:'cover', borderRadius:'50%' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{ display:'none', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', color:'#e8c87a', fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700 }}>
          LT
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);

  const inputStyle = {
    width: '100%', padding: '13px 16px 13px 40px',
    background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? 'rgba(212,168,80,0.55)' : 'rgba(212,168,80,0.18)'}`,
    borderRadius: 10, color: 'rgba(255,255,255,0.88)',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16, outline: 'none',
    transition: 'border-color 0.3s, background 0.3s',
    boxSizing: 'border-box',
    letterSpacing: type === 'password' ? '3px' : 'normal',
    boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none',
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <label style={{
        display: 'block',
        fontFamily: "'Space Mono', monospace",
        fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase',
        color: 'rgba(212,168,80,0.55)', marginBottom: 7,
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          width: 14, height: 14, opacity: focused ? 0.7 : 0.4, transition: 'opacity 0.3s',
          pointerEvents: 'none',
        }}>
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div style={{
          position:'absolute', bottom:0, left:'10%', right:'10%', height:1,
          background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)',
          transform: focused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.4s ease',
          borderRadius: 0,
        }}/>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const cardRef = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (!result.success) {
      if (result.errorData?.requireOtp) {
        setUnverifiedEmail(result.errorData.email || form.email);
        setShowOtpModal(true);
        return;
      }
      setError(result.message || 'Invalid credentials. The vault remains sealed.');
      return;
    }
    setFlashSuccess(true);
    setTimeout(() => navigate('/dashboard', { replace: true }), 600);
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    window.location.href = '/dashboard';
  };

  return (
    <div style={S.root}>
      {/* Animations keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono&display=swap');
        @keyframes ltFloat {
          0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)}
        }
        @keyframes ltRingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes ltShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes ltDot { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes ltPulseGlow {
          0%,100% { box-shadow: 0 4px 20px rgba(212,168,80,0.25); }
          50%      { box-shadow: 0 6px 40px rgba(212,168,80,0.5); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); font-style: italic; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px #0c1020 inset !important;
          -webkit-text-fill-color: rgba(255,255,255,0.88) !important;
        }
      `}</style>

      {showOtpModal && (
        <OTPVerificationModal
          email={unverifiedEmail}
          onSuccess={handleOtpSuccess}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}

      <StarCanvas />
      <DustLayer />

      <motion.div
        style={S.cardWrap}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={cardRef}
          style={{
            ...S.card,
            boxShadow: flashSuccess
              ? '0 0 60px rgba(212,168,80,0.3), 0 0 0 1px rgba(212,168,80,0.4)'
              : '0 20px 60px rgba(0,0,0,0.6)',
            transition: 'box-shadow 0.4s',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringCard(true)}
          onMouseLeave={() => setIsHoveringCard(false)}
        >
          {/* Gold line accents top/bottom */}
          <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }}/>
          <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }}/>

          {/* Spotlight effect */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, bottom:0, borderRadius:20,
            pointerEvents:'none', zIndex:0, overflow:'hidden',
            background: isHoveringCard ? `radial-gradient(260px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212,168,80,0.07) 0%, transparent 70%)` : 'none',
            transition: 'opacity 0.3s',
          }}/>

          {/* Success flash overlay */}
          <AnimatePresence>
            {flashSuccess && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(212,168,80,0.08)', borderRadius:20, pointerEvents:'none', zIndex:1 }}
              />
            )}
          </AnimatePresence>

          <CornerAccents />

          {/* Logo */}
          <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.2, type:'spring', stiffness:160 }}>
            <LogoRing />
          </motion.div>

          {/* Divider with brand name */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }} style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:14 }}>
              <div style={{ flex:1, maxWidth:50, height:1, background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.4))' }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(212,168,80,0.6)' }}>
                The Legacy Trunk
              </span>
              <div style={{ flex:1, maxWidth:50, height:1, background:'linear-gradient(270deg,transparent,rgba(212,168,80,0.4))' }}/>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} style={{ position:'relative', zIndex:2, marginBottom:28 }}>
            <h2 style={{ margin:'0 0 8px', fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color:'#e8c87a', letterSpacing:1, textShadow:'0 0 40px rgba(212,168,80,0.3)' }}>
              Welcome Back
            </h2>
            <p style={{ margin:0, fontStyle:'italic', fontSize:16, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
              Access your family's private vault.<br/>
              <span style={{ fontSize:13, opacity:0.7 }}>The Oracle awaits your return.</span>
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            style={{ display:'flex', flexDirection:'column', gap:14, position:'relative', zIndex:2 }}
          >
            <InputField
              label="Email Address"
              type="email"
              placeholder="name@family.com"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{width:14,height:14}}>
                  <rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/>
                </svg>
              }
            />
            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{width:14,height:14}}>
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />

            <div style={{ textAlign:'right', marginTop:-6 }}>
              <span
                onClick={() => setShowForgotModal(true)}
                style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:1, color:'rgba(212,168,80,0.4)', cursor:'pointer', transition:'color 0.3s' }}
                onMouseEnter={e=>e.target.style.color='rgba(212,168,80,0.8)'}
                onMouseLeave={e=>e.target.style.color='rgba(212,168,80,0.4)'}
              >
                Forgot the key?
              </span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ background:'rgba(220,60,60,0.12)', border:'1px solid rgba(220,60,60,0.3)', borderRadius:8, padding:'10px 14px', color:'#f08080', fontFamily:"'Space Mono',monospace", fontSize:11, letterSpacing:0.5, display:'flex', alignItems:'center', gap:8 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" style={{width:14,height:14,flexShrink:0}}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale:1.02, y:-1 } : {}}
              whileTap={!loading ? { scale:0.97 } : {}}
              style={{
                position:'relative', overflow:'hidden',
                width:'100%', padding:'15px 20px',
                background: loading ? 'rgba(212,168,80,0.4)' : 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
                backgroundSize: '200% 100%',
                border:'none', borderRadius:10,
                color: loading ? 'rgba(26,15,0,0.6)' : '#1a0f00',
                fontFamily:"'Cinzel',serif",
                fontSize:14, fontWeight:700,
                letterSpacing:2, textTransform:'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop:6,
                boxShadow:'0 4px 20px rgba(212,168,80,0.25)',
                animation: !loading ? 'ltPulseGlow 3s ease-in-out infinite' : 'none',
              }}
            >
              <div style={{
                position:'absolute', top:0, left:'-100%', width:'60%', height:'100%',
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
                transform:'skewX(-20deg)',
                animation: !loading ? 'ltShine 3s ease-in-out infinite' : 'none',
              }}/>
              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:5 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width:5, height:5, borderRadius:'50%', background:'#1a0f00',
                      animation:`ltDot 1.2s ${i*0.2}s ease-in-out infinite`,
                      display:'inline-block',
                    }}/>
                  ))}
                </div>
              ) : 'Unlock the Vault'}
            </motion.button>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'2px 0' }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase' }}>or</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
            </div>

            {/* Sign up link */}
            <p style={{ margin:0, fontStyle:'italic', fontSize:15, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>
              No account yet?{' '}
              <Link to="/signup" style={{ color:'rgba(212,168,80,0.75)', fontWeight:600, textDecoration:'none', transition:'color 0.3s' }}
                onMouseEnter={e=>e.target.style.color='#e8c87a'}
                onMouseLeave={e=>e.target.style.color='rgba(212,168,80,0.75)'}
              >
                Begin your legacy
              </Link>
            </p>
          </motion.form>

          {/* Rune decoration */}
          <div style={{
            marginTop:18, position:'relative', zIndex:2,
            fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:4,
            color:'rgba(212,168,80,0.18)', userSelect:'none',
          }}>
            ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;