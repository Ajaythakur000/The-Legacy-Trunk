import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileApi } from '../../api/authApi';
import FamilyLegacyCard from './FamilyLegacyCard';
import ActivityHeatmap from './ActivityHeatmap';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const getSafeDateString = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

// ─── Star Canvas ────────────────────────────────────────────────────────────
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
    };
    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── Dust Layer ──────────────────────────────────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute', width: m.sz, height: m.sz,
          left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%',
          background: `radial-gradient(circle, ${m.gold ? 'rgba(255,200,80,0.7)' : 'rgba(180,200,255,0.5)'} 0%, transparent 70%)`,
          animation: `ltFloat ${m.dur}s ${m.delay}s linear infinite`,
          '--tx': `${m.tx}px`, '--ty': `${m.ty}px`,
        }} />
      ))}
    </div>
  );
}

// ─── Corner Accents ──────────────────────────────────────────────────────────
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

// ─── Logo Ring ───────────────────────────────────────────────────────────────
function LogoRing({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'ltRingSpin 18s linear infinite' }} viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5" />
        <circle cx="45" cy="45" r="40" stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="3 8" />
        <circle cx="45" cy="5" r="2" fill="rgba(212,168,80,0.7)" />
        <circle cx="83" cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="83" cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="45" cy="85" r="2" fill="rgba(212,168,80,0.7)" />
        <circle cx="7" cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
        <circle cx="7" cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
      </svg>
      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#1a1410 0%,#0f0c08 100%)',
        border: '1px solid rgba(212,168,80,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#e8c87a', fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700 }}>LT</div>
      </div>
    </div>
  );
}

// ─── DarkInput ───────────────────────────────────────────────────────────────
function DarkInput({ label, type = 'text', name, value, onChange, placeholder, icon, as: Tag = 'input', rows, maxLength, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', marginBottom: 7 }}>{label}</label>
      <div style={{
        border: `1px solid ${focused ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.35)'}`,
        background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.04)',
        borderRadius: 10, position: 'relative', overflow: 'hidden',
        boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none',
        transition: 'all 0.3s',
      }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: focused ? 0.8 : 0.4, transition: 'opacity 0.3s', pointerEvents: 'none' }}>{icon}</div>
        )}
        <Tag
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} rows={rows} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '13px 16px 13px 40px' : '13px 16px',
            background: 'transparent', border: 'none', outline: 'none',
            color: 'rgba(255,255,255,0.88)', fontFamily: "'Cormorant Garamond',serif",
            fontSize: 16, resize: 'none', boxSizing: 'border-box',
          }}
        >
          {children}
        </Tag>
        <div style={{
          position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)',
          transform: focused ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.4s ease',
        }} />
      </div>
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, fetchFreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.avatar || '');
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarFile: null,
    dateOfBirth: getSafeDateString(user?.dateOfBirth),
    familyRole: 'Family Member',
  });

  const familyPoints = user?.bondPoints || 0;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') { setIsEditing(true); navigate('/profile', { replace: true }); }
  }, [location, navigate]);

  useEffect(() => {
    setImagePreview(user?.avatar || '');
    setFormData(prev => ({ ...prev, name: user?.name || '', bio: user?.bio || '', dateOfBirth: getSafeDateString(user?.dateOfBirth) }));
  }, [user]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('bio', formData.bio);
      submitData.append('dateOfBirth', formData.dateOfBirth);
      if (formData.avatarFile) submitData.append('avatar', formData.avatarFile);
      await updateUserProfileApi(submitData);
      await fetchFreshProfile();
      toast.success('Profile Updated Successfully! ✨', { style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } });
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (!user) return null;

  return (
    <div style={{ background: '#06080f', minHeight: '100vh', padding: '48px 24px 80px', fontFamily: "'Cormorant Garamond',serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ltFloat { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
        @keyframes ltRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ltShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes ltDot { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes ltPulseGlow { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.5)} }
        @keyframes ltAvatarPulse { 0%,100%{box-shadow:0 0 0 0 rgba(212,168,80,0)} 50%{box-shadow:0 0 0 6px rgba(212,168,80,0.12)} }
        input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.2); font-style:italic; }
        input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill {
          -webkit-box-shadow:0 0 0 30px #0c1020 inset !important;
          -webkit-text-fill-color:rgba(255,255,255,0.88) !important;
        }
        select option { background:#0c1020; color:rgba(255,255,255,0.88); }
        
        /* 🔥 NEW CSS: Premium Dark Scrollbar for Modal Box */
        .premium-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .premium-scroll::-webkit-scrollbar-track {
          background: rgba(12, 16, 32, 0.4);
          border-radius: 10px;
        }
        .premium-scroll::-webkit-scrollbar-thumb {
          background: rgba(212, 168, 80, 0.3);
          border-radius: 10px;
        }
        .premium-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 168, 80, 0.6);
        }
      `}</style>

      <StarCanvas />
      <DustLayer />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 44 }}>
          <LogoRing size={84} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '14px 0 6px' }}>
            <div style={{ flex: 1, maxWidth: 50, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4))' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)' }}>The Legacy Trunk</span>
            <div style={{ flex: 1, maxWidth: 50, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.4))' }} />
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 30, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 40px rgba(212,168,80,0.3)', letterSpacing: 2, margin: '4px 0 0' }}>
            Family Vault
          </h1>
          <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)', fontSize: 15, margin: '6px 0 0' }}>
            Where every memory becomes legend
          </p>
        </motion.div>

        {/* ── Main Card ── */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              background: 'rgba(12,16,32,0.85)',
              border: '1px solid rgba(212,168,80,0.22)',
              borderRadius: 20,
              display: 'flex', flexWrap: 'wrap',
              overflow: 'hidden', marginBottom: 24,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Spotlight */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
              background: isHovering ? `radial-gradient(280px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212,168,80,0.07) 0%, transparent 70%)` : 'none',
            }} />
            {/* Gold lines */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />
            <CornerAccents />

            {/* ── LEFT: Profile ── */}
            <div style={{ flex: '1 1 360px', padding: '50px 40px', borderRight: '1px solid rgba(212,168,80,0.08)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Profile"
                style={{
                  position: 'absolute', top: 20, left: 20,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(212,168,80,0.06)',
                  border: '1px solid rgba(212,168,80,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#d4a850', transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.14)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.06)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.25)'; }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 14, height: 14 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, marginTop: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {/* Orbital ring */}
                  <svg style={{ position: 'absolute', top: -10, left: -10, width: 'calc(100% + 20px)', height: 'calc(100% + 20px)', animation: 'ltRingSpin 22s linear infinite', pointerEvents: 'none' }} viewBox="0 0 130 130" fill="none">
                    <circle cx="65" cy="65" r="62" stroke="rgba(212,168,80,0.12)" strokeWidth="0.5" />
                    <circle cx="65" cy="65" r="60" stroke="rgba(212,168,80,0.07)" strokeWidth="0.5" strokeDasharray="2 6" />
                    <circle cx="65" cy="5" r="2.5" fill="rgba(212,168,80,0.7)" />
                    <circle cx="65" cy="125" r="2.5" fill="rgba(212,168,80,0.7)" />
                    <circle cx="5" cy="65" r="2" fill="rgba(212,168,80,0.5)" />
                    <circle cx="125" cy="65" r="2" fill="rgba(212,168,80,0.5)" />
                  </svg>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: 110, height: 110, borderRadius: '50%', border: '2px solid rgba(212,168,80,0.45)', objectFit: 'cover', animation: 'ltAvatarPulse 4s ease-in-out infinite' }} />
                  ) : (
                    <div style={{ width: 110, height: 110, borderRadius: '50%', border: '2px solid rgba(212,168,80,0.45)', background: 'linear-gradient(135deg,#1a1410,#0f0c08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: '#e8c87a', animation: 'ltAvatarPulse 4s ease-in-out infinite' }}>
                      {initials}
                    </div>
                  )}
                </div>

                <div>
                  <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: 1, margin: '0 0 6px', textShadow: '0 0 30px rgba(212,168,80,0.2)' }}>{user?.name}</h2>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: '1px', color: 'rgba(212,168,80,0.45)', margin: '0 0 12px' }}>{user?.email}</p>
                  <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(212,168,80,0.08)', border: '1px solid rgba(212,168,80,0.28)', borderRadius: 40, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.75)' }}>
                    {formData.familyRole}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)', margin: '0 0 22px' }} />

              {/* Bio */}
              <div style={{ borderLeft: '2px solid rgba(212,168,80,0.4)', paddingLeft: 18 }}>
                <span style={{ fontSize: 32, color: 'rgba(212,168,80,0.3)', lineHeight: 0, verticalAlign: '-0.4em', marginRight: 4, fontFamily: 'Georgia,serif' }}>"</span>
                <span style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: '1.7' }}>
                  {user?.bio || 'Preserving our family legacy, one story at a time.'}
                </span>
              </div>

              {/* Rune footer */}
              <div style={{ marginTop: 24, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none', textAlign: 'center' }}>
                ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
              </div>
            </div>

            {/* ── RIGHT: Legacy Card ── */}
            <div style={{ flex: '1 1 420px', padding: '50px 40px', display: 'flex', alignItems: 'center', zIndex: 2 }}>
              <FamilyLegacyCard familyPoints={familyPoints} />
            </div>
          </div>
        </motion.div>

        {/* ── Heatmap ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <ActivityHeatmap activityMap={user?.activityMap || user?.activityMapData || {}} maxStreak={user?.maxStreak || 0} />
        </motion.div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              /* 🔥 NEW: Poori screen lock, no scroll on body */
              position: 'fixed', inset: 0, background: 'rgba(4,6,14,0.9)', backdropFilter: 'blur(14px)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, 
              padding: '20px', overflow: 'hidden'
            }}
            onClick={e => { if (e.target === e.currentTarget) setIsEditing(false); }}
          >
            <motion.div
              className="premium-scroll"
              initial={{ scale: 0.88, y: 28, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 28, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              style={{
                /* 🔥 NEW: Box ke andar ka scroll system */
                background: 'rgba(12,16,32,0.85)',
                border: '1px solid rgba(212,168,80,0.22)',
                borderRadius: 20, width: '100%', maxWidth: 480,
                maxHeight: '90vh', overflowY: 'auto', 
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
            >
              {/* Inner padding wrapper for scroll content */}
              <div style={{ padding: '44px 36px 36px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />
                <CornerAccents />

                {/* Close btn */}
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.22)', background: 'rgba(255,255,255,0.04)', color: 'rgba(212,168,80,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.7)'; e.currentTarget.style.color = '#e8c87a'; e.currentTarget.style.background = 'rgba(212,168,80,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; e.currentTarget.style.color = 'rgba(212,168,80,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >✕</button>

                {/* Modal title */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <LogoRing size={70} />
                  <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 40px rgba(212,168,80,0.3)', margin: '14px 0 0', letterSpacing: 1 }}>Vault Profile</h2>
                  <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: '4px 0 0' }}>Inscribe your legend</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Avatar picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(212,168,80,0.4)', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#1a1410,#0f0c08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.3s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,168,80,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,168,80,0.4)'}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: '#e8c87a' }}>{initials}</span>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(4,6,14,0.85)', color: 'rgba(212,168,80,0.8)', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', textAlign: 'center', padding: '5px 0', textTransform: 'uppercase' }}>Change</div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '1px', color: 'rgba(212,168,80,0.3)', marginTop: 8 }}>Joined Vault · April 2026</span>
                  </div>

                  <DarkInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your name in the annals"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />

                  <DarkInput label="Family Role" name="familyRole" value={formData.familyRole} onChange={handleInputChange} as="select"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                  >
                    <option value="Family Member">Family Member</option>
                    <option value="The Patriarch">The Patriarch</option>
                    <option value="The Matriarch">The Matriarch</option>
                    <option value="The Guardian">The Guardian</option>
                    <option value="The Explorer">The Explorer</option>
                  </DarkInput>

                  <DarkInput label="Personal Motto / Bio" name="bio" value={formData.bio} onChange={handleInputChange} as="textarea" rows={3} maxLength={150} placeholder="A tale of who you are..."
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>}
                  />

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button type="button" onClick={() => setIsEditing(false)}
                      style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(212,168,80,0.22)', borderRadius: 10, color: 'rgba(255,255,255,0.38)', fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.5)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
                    >Cancel</button>

                    <motion.button type="submit" disabled={loading}
                      whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                      whileTap={!loading ? { scale: 0.97 } : {}}
                      style={{ flex: 1, padding: '14px', position: 'relative', overflow: 'hidden', background: loading ? 'rgba(212,168,80,0.4)' : 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)', backgroundSize: '200%', border: 'none', borderRadius: 10, color: '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', animation: !loading ? 'ltPulseGlow 3s ease-in-out infinite' : 'none' }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-20deg)', animation: !loading ? 'ltShine 3s ease-in-out infinite' : 'none' }} />
                      {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                          {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', display: 'inline-block', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                        </div>
                      ) : 'Seal the Vault'}
                    </motion.button>
                  </div>

                  {/* Rune footer */}
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none', textAlign: 'center', marginTop: 4 }}>
                    ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfilePage;