import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { joinViaInviteApi } from '../../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';
import OTPVerificationModal from './OTPVerificationModal';

// ─── Star Canvas ──────────────────────────────────────────────────────────────
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
      const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
      grd.addColorStop(0, 'rgba(212,150,40,0.04)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── Dust Layer ───────────────────────────────────────────────────────────────
function DustLayer() {
  const motes = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      sz: Math.random() * 3 + 1.5,
      gold: Math.random() > 0.3,
      dur: Math.random() * 8 + 6,
      delay: Math.random() * 10,
      tx: (Math.random() - 0.5) * 120,
      ty: -(Math.random() * 80 + 40),
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
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
    </div>
  );
}

// ─── Corner Accents ───────────────────────────────────────────────────────────
function CornerAccents() {
  const base = { position: 'absolute', width: 18, height: 18, borderColor: 'rgba(212,168,80,0.5)', borderStyle: 'solid' };
  return (
    <>
      <div style={{ ...base, top: 12, left: 12, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' }} />
      <div style={{ ...base, top: 12, right: 12, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' }} />
      <div style={{ ...base, bottom: 12, left: 12, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' }} />
      <div style={{ ...base, bottom: 12, right: 12, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

// ─── Logo Ring ────────────────────────────────────────────────────────────────
function LogoRing() {
  return (
    <div style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 6px', zIndex: 2 }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'ltRingSpin 18s linear infinite' }} viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5" />
        <circle cx="45" cy="45" r="40" stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="3 8" />
        <circle cx="45" cy="5"  r="2"   fill="rgba(212,168,80,0.7)" />
        <circle cx="83" cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="83" cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="45" cy="85" r="2"   fill="rgba(212,168,80,0.7)" />
        <circle cx="7"  cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="7"  cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
      </svg>
      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#1a1410 0%,#0f0c08 100%)',
        border: '1px solid rgba(212,168,80,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src="/finall_logo.png"
          alt="The Legacy Trunk"
          style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#e8c87a', fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700 }}>
          LT
        </div>
      </div>
    </div>
  );
}

// ─── Dark Input Field ─────────────────────────────────────────────────────────
function DarkInput({ label, type = 'text', name, placeholder, value, onChange, required, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ textAlign: 'left' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.35)'}`,
        borderRadius: 10,
        boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none',
        transition: 'border-color 0.3s, background 0.3s, box-shadow 0.3s',
      }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: focused ? 0.75 : 0.45, transition: 'opacity 0.3s', pointerEvents: 'none', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        )}
        <input
          type={type} name={name} placeholder={placeholder}
          value={value} onChange={onChange} required={required}
          style={{
            width: '100%',
            padding: `13px 16px 13px ${icon ? '40px' : '16px'}`,
            background: 'transparent', border: 'none', outline: 'none',
            color: 'rgba(255,255,255,0.88)',
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 16, boxSizing: 'border-box',
            letterSpacing: type === 'password' ? '3px' : 'normal',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div style={{
          position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)',
          transform: focused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.4s ease', borderRadius: 0,
        }} />
      </div>
    </div>
  );
}

// ─── Dark Select ──────────────────────────────────────────────────────────────
function DarkSelect({ label, name, value, onChange, icon, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ textAlign: 'left' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.35)'}`,
        borderRadius: 10,
        boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none',
        transition: 'border-color 0.3s, background 0.3s, box-shadow 0.3s',
      }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: focused ? 0.75 : 0.45, transition: 'opacity 0.3s', pointerEvents: 'none', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        )}
        <select
          name={name} value={value} onChange={onChange}
          style={{
            width: '100%',
            padding: `13px 36px 13px ${icon ? '40px' : '16px'}`,
            background: 'transparent', border: 'none', outline: 'none',
            color: 'rgba(255,255,255,0.88)',
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 16, boxSizing: 'border-box',
            appearance: 'none', cursor: 'pointer',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#0c1020', color: '#e8c87a' }}>{o.label}</option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(212,168,80,0.5)', fontSize: 10 }}>▼</div>
        <div style={{
          position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)',
          transform: focused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.4s ease', borderRadius: 0,
        }} />
      </div>
    </div>
  );
}

// ─── Shared style helpers ─────────────────────────────────────────────────────
const labelStyle = {
  display: 'block',
  fontFamily: "'Space Mono',monospace",
  fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase',
  color: 'rgba(212,168,80,0.55)', marginBottom: 7,
};

// ─── Main Component ───────────────────────────────────────────────────────────
function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading } = useAuth();
  const cardRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('inviteToken');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: inviteToken ? 'member' : 'admin',
    familyCode: '',
    relationToAdmin: '',
  });

  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const isAdmin = form.role === 'admin';
  const isFormLoading = loading || actionLoading;

  useEffect(() => {
    if (inviteToken) setForm(prev => ({ ...prev, role: 'member', familyCode: '' }));
  }, [inviteToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'role' && value === 'admin') {
        next.familyCode = '';
        next.relationToAdmin = 'Admin';
      }
      return next;
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        relationToAdmin: isAdmin ? 'Admin' : form.relationToAdmin?.trim() || '',
        ...(!isAdmin && !inviteToken && form.familyCode ? { familyCode: form.familyCode.trim().toUpperCase() } : {}),
      };
      const result = await signup(payload);
      if (result.success || (result.data && result.data.requireOtp)) {
        if (inviteToken) {
          try { await joinViaInviteApi(inviteToken); } catch (err) { console.error('Auto-join failed', err); }
        }
        setRegisteredEmail(form.email);
        setShowOtpModal(true);
        setActionLoading(false);
        return;
      }
      setError(result.message || 'Registration failed.');
    } catch {
      setError('Something went wrong during signup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    window.location.href = '/dashboard';
  };

  // SVG icons
  const iconUser = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
  const iconEmail = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" /></svg>;
  const iconLock = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
  const iconRole = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  const iconKey = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><circle cx="7.5" cy="15.5" r="4.5" /><path d="M21 2l-9.6 9.6M15 8l2 2" /></svg>;
  const iconHeart = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden', fontFamily: "'Cormorant Garamond',serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono&display=swap');
        @keyframes ltFloat { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
        @keyframes ltRingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes ltShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes ltDot { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes ltPulseGlow { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.5)} }
        input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.2); font-style:italic; }
        select option { background:#0c1020; color:#e8c87a; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0 30px #0c1020 inset !important;
          -webkit-text-fill-color:rgba(255,255,255,0.88) !important;
        }
      `}</style>

      {showOtpModal && (
        <OTPVerificationModal
          email={registeredEmail}
          onSuccess={handleOtpSuccess}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      <StarCanvas />
      <DustLayer />

      <motion.div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={cardRef}
          style={{
            background: 'rgba(12,16,32,0.85)',
            border: '1px solid rgba(212,168,80,0.22)',
            borderRadius: 20,
            padding: '40px 38px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringCard(true)}
          onMouseLeave={() => setIsHoveringCard(false)}
        >
          {/* Gold edge lines */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />

          {/* Spotlight */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20,
            pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
            background: isHoveringCard ? `radial-gradient(260px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212,168,80,0.07) 0%, transparent 70%)` : 'none',
          }} />

          <CornerAccents />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 160 }}
            style={{ textAlign: 'center' }}
          >
            <LogoRing />
          </motion.div>

          {/* Brand divider */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ flex: 1, maxWidth: 50, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4))' }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)' }}>The Legacy Trunk</span>
              <div style={{ flex: 1, maxWidth: 50, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.4))' }} />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px', fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, color: '#e8c87a', letterSpacing: 1, textShadow: '0 0 40px rgba(212,168,80,0.3)' }}>
              Begin Your Legacy
            </h2>
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
              Preserve your family's story for eternity.
            </p>
          </motion.div>

          {/* Invite banner */}
          <AnimatePresence>
            {inviteToken && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(212,168,80,0.1)',
                  border: '1px solid rgba(212,168,80,0.35)',
                  borderRadius: 10, padding: '11px 16px',
                  marginBottom: 20, textAlign: 'center',
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11, letterSpacing: 1,
                  color: '#e8c87a', position: 'relative', zIndex: 2,
                }}
              >
                ✦ &nbsp; You've been invited to join a Family Vault &nbsp; ✦
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(220,60,60,0.12)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f08080', fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative', zIndex: 2 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 13, position: 'relative', zIndex: 2 }}
          >
            <DarkInput label="Full Name" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required icon={iconUser} />
            <DarkInput label="Email Address" type="email" name="email" placeholder="name@family.com" value={form.email} onChange={handleChange} required icon={iconEmail} />
            <DarkInput label="Password" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required icon={iconLock} />

            {!inviteToken && (
              <DarkSelect
                label="Your Role"
                name="role"
                value={form.role}
                onChange={handleChange}
                icon={iconRole}
                options={[
                  { value: 'admin', label: 'Create a New Family  (Admin)' },
                  { value: 'member', label: 'Join Existing Family  (Member)' },
                ]}
              />
            )}

            {/* Member extra fields */}
            <AnimatePresence>
              {!isAdmin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    background: 'rgba(212,168,80,0.04)',
                    border: '1px dashed rgba(212,168,80,0.2)',
                    borderRadius: 12, padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.5)', marginBottom: 2 }}>
                      ✦ &nbsp; Member Details
                    </div>

                    {!inviteToken && (
                      <DarkInput
                        label="Family Code"
                        name="familyCode"
                        placeholder="TRUNK-XXXX"
                        value={form.familyCode}
                        onChange={handleChange}
                        required
                        icon={iconKey}
                      />
                    )}

                    <DarkInput
                      label="Relation to Admin"
                      name="relationToAdmin"
                      placeholder="e.g. Brother, Mother, Son..."
                      value={form.relationToAdmin}
                      onChange={handleChange}
                      required
                      icon={iconHeart}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isFormLoading}
              whileHover={!isFormLoading ? { scale: 1.02, y: -1 } : {}}
              whileTap={!isFormLoading ? { scale: 0.97 } : {}}
              style={{
                position: 'relative', overflow: 'hidden',
                width: '100%', padding: '15px 20px',
                background: isFormLoading ? 'rgba(212,168,80,0.4)' : 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
                backgroundSize: '200% 100%',
                border: 'none', borderRadius: 10,
                color: isFormLoading ? 'rgba(26,15,0,0.6)' : '#1a0f00',
                fontFamily: "'Cinzel',serif",
                fontSize: 14, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase',
                cursor: isFormLoading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                boxShadow: '0 4px 20px rgba(212,168,80,0.25)',
                animation: !isFormLoading ? 'ltPulseGlow 3s ease-in-out infinite' : 'none',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
                transform: 'skewX(-20deg)',
                animation: !isFormLoading ? 'ltShine 3s ease-in-out infinite' : 'none',
              }} />
              {isFormLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite`, display: 'inline-block' }} />
                  ))}
                </div>
              ) : 'Forge Your Legacy'}
            </motion.button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Login link */}
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Already a keeper?{' '}
              <Link to="/login"
                style={{ color: 'rgba(212,168,80,0.75)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#e8c87a'}
                onMouseLeave={e => e.target.style.color = 'rgba(212,168,80,0.75)'}
              >
                Unlock your vault
              </Link>
            </p>
          </motion.form>

          {/* Rune footer */}
          <div style={{ marginTop: 16, position: 'relative', zIndex: 2, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none', textAlign: 'center' }}>
            ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;