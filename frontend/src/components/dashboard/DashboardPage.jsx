import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  createCircleApi, getCircleByIdApi, getMyCirclesApi,
  removeMemberFromCircleApi, generateInviteLinkApi,
  sendFamilyInviteApi, deleteCircleApi
} from '../../api/circleApi';
import UpcomingEventsWidget from './UpcomingEventsWidget';
import VaultGateway from "../modals/VaultGateway";

// ─── Star Canvas ─────────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.2,
      sp: Math.random() * 0.007 + 0.002,
      ph: Math.random() * Math.PI * 2,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,180,80,${alpha})`;
        ctx.fill();
      });
      const grd = ctx.createRadialGradient(canvas.width / 2, 0, 0, canvas.width / 2, 0, canvas.height * 0.8);
      grd.addColorStop(0, 'rgba(212,130,40,0.06)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const animate = (ts) => { draw(ts * 0.001); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── Dust Layer ───────────────────────────────────────────────────────────────
function DustLayer() {
  const motes = Array.from({ length: 24 }, (_, i) => ({
    id: i, sz: Math.random() * 4 + 1.5,
    gold: Math.random() > 0.3,
    dur: Math.random() * 10 + 6,
    delay: Math.random() * 14,
    tx: (Math.random() - 0.5) * 160,
    ty: -(Math.random() * 120 + 40),
    x: Math.random() * 100, y: Math.random() * 100,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {motes.map(m => (
        <div key={m.id} style={{
          position: 'absolute', width: m.sz, height: m.sz,
          left: `${m.x}%`, top: `${m.y}%`, borderRadius: '50%',
          background: `radial-gradient(circle,${m.gold ? 'rgba(255,200,80,0.8)' : 'rgba(180,200,255,0.5)'} 0%,transparent 70%)`,
          animation: `ltFloat ${m.dur}s ${m.delay}s linear infinite`,
          '--tx': `${m.tx}px`, '--ty': `${m.ty}px`,
        }} />
      ))}
    </div>
  );
}

// ─── Corner Accents ───────────────────────────────────────────────────────────
function CornerAccents({ size = 18, inset = 12, opacity = 0.5 }) {
  const base = { position: 'absolute', width: size, height: size, borderColor: `rgba(212,168,80,${opacity})`, borderStyle: 'solid' };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' }} />
      <div style={{ ...base, top: inset, right: inset, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' }} />
      <div style={{ ...base, bottom: inset, left: inset, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' }} />
      <div style={{ ...base, bottom: inset, right: inset, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

// ─── Logo Ring ────────────────────────────────────────────────────────────────
function LogoRing({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'ltRingSpin 18s linear infinite' }} viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" stroke="rgba(212,168,80,0.2)" strokeWidth="0.5" />
        <circle cx="45" cy="45" r="40" stroke="rgba(212,168,80,0.1)" strokeWidth="0.5" strokeDasharray="3 8" />
        <circle cx="45" cy="5" r="2.5" fill="rgba(212,168,80,0.9)" />
        <circle cx="83" cy="27" r="2" fill="rgba(212,168,80,0.6)" />
        <circle cx="83" cy="63" r="2" fill="rgba(212,168,80,0.6)" />
        <circle cx="45" cy="85" r="2.5" fill="rgba(212,168,80,0.9)" />
        <circle cx="7" cy="63" r="2" fill="rgba(212,168,80,0.6)" />
        <circle cx="7" cy="27" r="2" fill="rgba(212,168,80,0.6)" />
      </svg>
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1410,#0f0c08)', border: '1px solid rgba(212,168,80,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#e8c87a', fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700 }}>LT</div>
      </div>
    </div>
  );
}

// ─── DarkInput ────────────────────────────────────────────────────────────────
function DarkInput({ type = 'text', placeholder, value, onChange, icon, disabled, name }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ border: `1px solid ${focused ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.22)'}`, background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.03)', borderRadius: 10, position: 'relative', overflow: 'hidden', boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none', transition: 'all 0.3s' }}>
      {icon && <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: focused ? 0.8 : 0.35, transition: 'opacity 0.3s', pointerEvents: 'none' }}>{icon}</div>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: icon ? '12px 16px 12px 40px' : '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.88)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)', transform: focused ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.4s ease' }} />
    </div>
  );
}

// ─── Nav Room Card ────────────────────────────────────────────────────────────
function RoomCard({ to, icon, title, desc, glowColor = 'rgba(212,168,80,0.3)', delay = 0 }) {
  const cardRef = useRef(null);
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          background: 'rgba(12,16,32,0.88)',
          border: '1px solid rgba(212,168,80,0.22)',
          borderRadius: 20, padding: '32px 28px',
          position: 'relative', overflow: 'hidden',
          boxShadow: hovering
            ? `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${glowColor}`
            : '0 10px 40px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.4s',
          height: '100%', cursor: 'pointer',
        }}
      >
        {/* Spotlight */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20, background: hovering ? `radial-gradient(200px at ${spotPos.x}px ${spotPos.y}px, rgba(212,168,80,0.09) 0%, transparent 70%)` : 'none' }} />

        {/* Gold lines */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.2),transparent)' }} />
        <CornerAccents size={14} inset={10} opacity={0.4} />

        {/* Icon */}
        <motion.div
          animate={hovering ? { scale: 1.15, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 40, marginBottom: 16, filter: hovering ? `drop-shadow(0 0 12px ${glowColor})` : 'none', display: 'inline-block' }}
        >
          {icon}
        </motion.div>

        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: '#e8c87a', margin: '0 0 8px', letterSpacing: 1, textShadow: hovering ? '0 0 20px rgba(212,168,80,0.5)' : 'none', transition: 'text-shadow 0.3s' }}>
          {title}
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
          {desc}
        </p>

        {/* Arrow */}
        <motion.div
          animate={hovering ? { x: 4, opacity: 1 } : { x: 0, opacity: 0 }}
          style={{ position: 'absolute', bottom: 20, right: 20, color: 'rgba(212,168,80,0.7)', fontSize: 18 }}
        >
          →
        </motion.div>

        {/* Rune watermark */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: 'rgba(212,168,80,0.08)', whiteSpace: 'nowrap', userSelect: 'none' }}>
          ✦ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({ m, isSelf, isAdmin, isRemoving, canRemove, onRemove, activeAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px',
        background: isSelf ? 'rgba(212,168,80,0.08)' : 'rgba(255,255,255,0.02)',
        borderRadius: 14,
        border: `1px solid ${isSelf ? 'rgba(212,168,80,0.3)' : 'rgba(212,168,80,0.1)'}`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', border: `1.5px solid ${isSelf ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.25)'}`, overflow: 'hidden', background: '#1a1410' }}>
            <img src={m.avatar || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} alt="dp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {isSelf && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#4ade80', border: '2px solid #06080f', boxShadow: '0 0 6px #4ade80' }} />}
        </div>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {m.name}
            {isSelf && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(212,168,80,0.7)', letterSpacing: '1px' }}>(You)</span>}
            {isAdmin && (
              <span style={{ background: 'rgba(212,168,80,0.15)', border: '1px solid rgba(212,168,80,0.35)', color: 'rgba(212,168,80,0.85)', padding: '1px 7px', borderRadius: 4, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1px' }}>
                👑 Admin
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(212,168,80,0.35)', letterSpacing: '0.5px', marginTop: 2 }}>{m.email}</div>
        </div>
      </div>

      {canRemove && (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => onRemove(m._id, m.name)}
          disabled={!!activeAction}
          style={{ background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.25)', color: '#f08080', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s', opacity: isRemoving ? 0.5 : 1 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.2)'; e.currentTarget.style.color = '#ff6b6b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.1)'; e.currentTarget.style.color = '#f08080'; }}
        >
          {isRemoving ? '...' : 'Remove'}
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, style: extraStyle }) {
  return (
    <div style={{
      background: 'rgba(12,16,32,0.88)',
      border: '1px solid rgba(212,168,80,0.18)',
      borderRadius: 20, padding: '28px 32px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      ...extraStyle,
    }}>
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.2),transparent)' }} />
      <CornerAccents />
      {children}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function DashboardPage() {
  const { user, switchActiveCircle } = useAuth();

  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState(user?.activeCircleId || '');
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [newCircleName, setNewCircleName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loadingCircles, setLoadingCircles] = useState(false);
  const [loadingCircleDetails, setLoadingCircleDetails] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteTab, setInviteTab] = useState('magic');
  
  const [memberToRemove, setMemberToRemove] = useState(null);

  const isCircleAdmin = useMemo(() => {
    if (!selectedCircle || !user?._id) return false;
    return String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(user._id);
  }, [selectedCircle, user]);

  const loadMyCircles = async () => {
    setLoadingCircles(true);
    try { const data = await getMyCirclesApi(); setCircles(Array.isArray(data) ? data : []); }
    catch (e) { console.error(e); }
    finally { setLoadingCircles(false); }
  };

  const loadCircleDetails = async (circleId) => {
    if (!circleId) { setSelectedCircle(null); return; }
    setLoadingCircleDetails(true);
    try { const data = await getCircleByIdApi(circleId); setSelectedCircle(data); }
    catch (e) { console.error(e); }
    finally { setLoadingCircleDetails(false); }
  };

  useEffect(() => { loadMyCircles(); }, []);
  useEffect(() => { if (user?.activeCircleId && user.activeCircleId !== selectedCircleId) setSelectedCircleId(user.activeCircleId); }, [user?.activeCircleId]);
  useEffect(() => {
    if (selectedCircleId) { loadCircleDetails(selectedCircleId); if (selectedCircleId !== user?.activeCircleId) switchActiveCircle(selectedCircleId); }
    else setSelectedCircle(null);
  }, [selectedCircleId]);

  const handleCreateCircle = async (e) => {
    e.preventDefault(); 
    if (!newCircleName.trim()) return toast.error('Circle name is required');
    setActiveAction('createCircle');
    try {
      const created = await createCircleApi({ circleName: newCircleName.trim() });
      toast.success(`Family "${created.circleName}" created!`);
      setNewCircleName(''); await loadMyCircles();
      if (created?._id) setSelectedCircleId(created._id);
    } catch (e2) { toast.error(e2?.response?.data?.message || 'Failed to create circle'); }
    finally { setActiveAction(null); }
  };

  const handleRemoveClick = (memberId, memberName) => {
    if (!selectedCircleId) return toast.error('Select a circle first');
    setMemberToRemove({ id: memberId, name: memberName });
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !selectedCircleId) return;
    setActiveAction(`remove_${memberToRemove.id}`);
    try { 
      await removeMemberFromCircleApi(selectedCircleId, memberToRemove.id); 
      toast.success(`${memberToRemove.name} removed.`); 
      await loadCircleDetails(selectedCircleId); 
      setMemberToRemove(null);
    } catch (e2) { 
      toast.error(e2?.response?.data?.message || 'Failed to remove'); 
    } finally { 
      setActiveAction(null); 
    }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault(); 
    if (!inviteEmail.trim()) return toast.error('Enter an email address');
    setActiveAction('sendInvite');
    try { const res = await sendFamilyInviteApi(selectedCircleId, { email: inviteEmail.trim() }); toast.success(res.message); setInviteEmail(''); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to send invite'); }
    finally { setActiveAction(null); }
  };

  const triggerDeleteModal = () => {
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const confirmDeleteCircle = async () => {
    if (deleteConfirmText !== selectedCircle?.circleName) { 
      toast.error('Name mismatch. Vault not deleted.'); 
      return; 
    }
    setShowDeleteModal(false);
    setActiveAction('deleteCircle');
    try {
      await deleteCircleApi(selectedCircleId);
      toast.success(`Family "${selectedCircle?.circleName}" deleted.`);
      const data = await getMyCirclesApi(); const list = Array.isArray(data) ? data : []; setCircles(list);
      if (list.length > 0) setSelectedCircleId(list[0]._id); else { setSelectedCircleId(''); setSelectedCircle(null); }
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
    finally { setActiveAction(null); }
  };

  const handleGenerateInvite = async () => {
    setActiveAction('generateLink');
    try { const data = await generateInviteLinkApi(selectedCircleId); const fullUrl = `${window.location.origin}/invite/${data.token}`; setInviteLink(fullUrl); setShowInviteModal(true); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to generate link'); }
    finally { setActiveAction(null); }
  };

  const handleCopyLink = () => { if (inviteLink) { navigator.clipboard.writeText(inviteLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); } };
  const handleCopyCode = () => {
    const code = selectedCircle?.familyCode || user?.familyCode;
    if (code) { navigator.clipboard.writeText(code); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }
  };

  const familyName = selectedCircle?.circleName || selectedCircle?.name || 'Your Family';

  const roomCards = [
    { to: '/vault-stories', icon: '📸', title: 'Vault Stories', desc: 'Share private family photos and memories sealed forever.', glowColor: 'rgba(212,168,80,0.3)', delay: 0.1 },
    { to: '/vault', icon: '💬', title: 'Family Chat', desc: 'Secure encrypted real-time messaging between family.', glowColor: 'rgba(100,180,255,0.25)', delay: 0.2 },
    { to: '/radar', icon: '📡', title: 'Live Radar', desc: 'Track family locations and live activity in real time.', glowColor: 'rgba(100,255,150,0.2)', delay: 0.3 },
  ];

  return (
    <div style={{ background: '#06080f', minHeight: '100vh', paddingBottom: 80, fontFamily: "'Cormorant Garamond',serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ltFloat{0%{opacity:0;transform:translate(0,0) scale(1)}15%{opacity:1}85%{opacity:0.7}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)}}
        @keyframes ltRingSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ltShine{0%,70%{left:-100%}100%{left:150%}}
        @keyframes ltDot{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}
        @keyframes ltPulseGlow{0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)}50%{box-shadow:0 6px 40px rgba(212,168,80,0.55)}}
        @keyframes ltScrollRune{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes ltBeam{0%,100%{opacity:0;transform:scaleX(0)}50%{opacity:1;transform:scaleX(1)}}
        input::placeholder{color:rgba(255,255,255,0.2);font-style:italic;}
        input:-webkit-autofill,select:-webkit-autofill{-webkit-box-shadow:0 0 0 30px #0c1020 inset!important;-webkit-text-fill-color:rgba(255,255,255,0.88)!important;}
        
        .premium-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background: rgba(10,14,26,0.9);
          border: 1px solid rgba(212,168,80,0.4);
          color: #e8c87a;
          font-family: 'Cinzel', serif;
          font-size: 13px;
          letter-spacing: 1px;
          padding: 8px 32px 8px 16px;
          border-radius: 20px;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(212,168,80,0.05);
        }
        
        .premium-select:hover {
          border-color: rgba(212,168,80,0.7);
          box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 15px rgba(212,168,80,0.2) inset;
          background: rgba(12,16,32,0.95);
        }
        
        .premium-select:focus {
          border-color: #e8c87a;
          box-shadow: 0 0 0 2px rgba(212,168,80,0.2), 0 8px 30px rgba(0,0,0,0.8);
        }

        .premium-select option {
          background: #080a14;
          color: #e8c87a;
          font-family: 'Cinzel', serif;
          padding: 12px;
          border-bottom: 1px solid rgba(212,168,80,0.1);
        }
        
        .select-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        
        .select-wrapper::after {
          content: '▼';
          position: absolute;
          right: 14px;
          color: rgba(212,168,80,0.6);
          font-size: 10px;
          pointer-events: none;
        }

        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:rgba(212,168,80,0.05);} ::-webkit-scrollbar-thumb{background:rgba(212,168,80,0.25);border-radius:2px;}
      `}</style>

      <VaultGateway onClose={() => {}} />
      <StarCanvas />
      <DustLayer />

      {/* Rune ticker */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 26, zIndex: 50, overflow: 'hidden', borderBottom: '1px solid rgba(212,168,80,0.1)', background: 'rgba(6,8,15,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ltScrollRune 35s linear infinite', whiteSpace: 'nowrap' }}>
          {Array(4).fill('✦ ᚦ ᛖ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ᛏ ᚱ ᚢ ᚾ ᚲ · The Legacy Trunk · Family Vault · Sealed for Eternity · Bond Points · ').map((t, i) => (
            <span key={i} style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '3px', color: 'rgba(212,168,80,0.22)', padding: '0 24px' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── HERO HEADER ── */}
      <div style={{ position: 'relative', paddingTop: 26, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,130,40,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', padding: '52px 20px 60px', position: 'relative', zIndex: 10 }}
        >
          <LogoRing size={96} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '18px 0 10px' }}>
            <div style={{ flex: 1, maxWidth: 70, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5))' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)' }}>The Legacy Trunk</span>
            <div style={{ flex: 1, maxWidth: 70, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.5))' }} />
          </div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#e8c87a', textShadow: '0 0 80px rgba(212,168,80,0.5), 0 0 30px rgba(212,168,80,0.25)', letterSpacing: 3, margin: '0 0 12px' }}
          >
            {loadingCircleDetails ? 'The Vault Awakens…' : `${familyName} Vault`}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.38)', margin: '0 auto 24px', maxWidth: 500 }}
          >
            Welcome back, <span style={{ color: 'rgba(212,168,80,0.75)', fontStyle: 'normal', fontFamily: "'Cinzel',serif" }}>{user?.name?.split(' ')[0] || 'Guardian'}</span>. Your legacy awaits.
          </motion.p>

          {circles.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 12px #4ade80', flexShrink: 0, display: 'inline-block' }} />
              
              <div className="select-wrapper">
                <select 
                  className="premium-select"
                  value={selectedCircleId} 
                  onChange={e => setSelectedCircleId(e.target.value)}
                >
                  {circles.map(c => <option key={c._id} value={c._id}>{c.circleName || c.name}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28 }}>
            <div style={{ flex: 1, maxWidth: 150, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25))' }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: 7, color: 'rgba(212,168,80,0.2)' }}>✦ ᚦ ᛖ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦</span>
            <div style={{ flex: 1, maxWidth: 150, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.25))' }} />
          </div>
        </motion.div>

        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4),rgba(212,168,80,0.4),transparent)', animation: 'ltBeam 4s ease-in-out infinite' }} />
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>

        {/* ── ROOM CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, margin: '48px 0' }}>
          {roomCards.map((card, i) => <RoomCard key={i} {...card} />)}
        </div>

        {/* ── SECTION HEADER ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(212,168,80,0.3),transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.6)" strokeWidth="1.5" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: '#e8c87a', letterSpacing: 2, textShadow: '0 0 20px rgba(212,168,80,0.3)' }}>Family Management</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.6)" strokeWidth="1.5" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
          </div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,rgba(212,168,80,0.3),transparent)' }} />
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

          {/* Members Panel */}
          <SectionCard>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 20px rgba(212,168,80,0.3)', marginBottom: 4 }}>
                Family Members
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', color: 'rgba(212,168,80,0.4)' }}>
                {familyName} · {selectedCircle?.members?.length || 0} members
              </div>
            </div>

            {loadingCircleDetails ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '20px 0' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8c87a', display: 'inline-block', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedCircle?.members?.map(m => {
                  const isSelf = String(m._id) === String(user?._id);
                  const isAdm = String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(m._id);
                  return (
                    <MemberRow key={m._id} m={m} isSelf={isSelf} isAdmin={isAdm}
                      isRemoving={activeAction === `remove_${m._id}`}
                      canRemove={isCircleAdmin && !isAdm}
                      onRemove={handleRemoveClick} activeAction={activeAction} />
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {selectedCircleId && <UpcomingEventsWidget circleId={selectedCircleId} />}

            <SectionCard>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 20px rgba(212,168,80,0.3)', marginBottom: 4 }}>
                Create a New Vault
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', color: 'rgba(212,168,80,0.4)', marginBottom: 20 }}>
                Found a new family circle
              </div>
              <form onSubmit={handleCreateCircle} style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <DarkInput
                    placeholder="Family name…"
                    value={newCircleName}
                    onChange={e => setNewCircleName(e.target.value)}
                    disabled={!!activeAction}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.8)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                  />
                </div>
                <motion.button type="submit" disabled={!!activeAction}
                  whileHover={!activeAction ? { scale: 1.03, y: -1 } : {}}
                  whileTap={!activeAction ? { scale: 0.97 } : {}}
                  style={{ padding: '0 18px', position: 'relative', overflow: 'hidden', background: activeAction ? 'rgba(212,168,80,0.3)' : 'linear-gradient(135deg,#c9933a,#e8a820)', border: 'none', borderRadius: 10, color: '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: activeAction ? 'not-allowed' : 'pointer', animation: !activeAction ? 'ltPulseGlow 3s ease-in-out infinite' : 'none', whiteSpace: 'nowrap' }}>
                  {activeAction === 'createCircle' ? '...' : '+ Found'}
                </motion.button>
              </form>
            </SectionCard>

            {isCircleAdmin ? (
              <SectionCard>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 20px rgba(212,168,80,0.3)', marginBottom: 4 }}>
                    Summon Members
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', color: 'rgba(212,168,80,0.4)' }}>
                    Invite family to join the vault
                  </div>
                </div>

                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,168,80,0.15)', padding: 4, borderRadius: 12, marginBottom: 20, gap: 3 }}>
                  {[
                    { key: 'magic', label: '🪄 Magic Link' },
                    { key: 'direct', label: '📨 Direct' },
                    { key: 'code', label: '🔑 Code' },
                  ].map(tab => (
                    <button key={tab.key} onClick={() => setInviteTab(tab.key)}
                      style={{
                        flex: 1, padding: '8px 10px', border: 'none', borderRadius: 9, cursor: 'pointer', transition: 'all 0.25s',
                        background: inviteTab === tab.key ? 'rgba(212,168,80,0.15)' : 'transparent',
                        borderColor: inviteTab === tab.key ? 'rgba(212,168,80,0.35)' : 'transparent',
                        borderWidth: 1, borderStyle: 'solid',
                        fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1px',
                        color: inviteTab === tab.key ? 'rgba(212,168,80,0.9)' : 'rgba(212,168,80,0.38)',
                        boxShadow: inviteTab === tab.key ? '0 0 12px rgba(212,168,80,0.1)' : 'none',
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {inviteTab === 'magic' && (
                    <motion.div key="magic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.38)', marginBottom: 16, marginTop: 0 }}>
                        Generate a secure link or QR code for instant entry.
                      </p>
                      <motion.button onClick={handleGenerateInvite} disabled={!!activeAction}
                        whileHover={!activeAction ? { scale: 1.02, y: -1 } : {}}
                        whileTap={!activeAction ? { scale: 0.97 } : {}}
                        style={{ width: '100%', padding: '14px', position: 'relative', overflow: 'hidden', background: activeAction === 'generateLink' ? 'rgba(212,168,80,0.4)' : 'linear-gradient(135deg,#c9933a,#e8a820)', border: 'none', borderRadius: 12, color: '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: activeAction ? 'not-allowed' : 'pointer', animation: !activeAction ? 'ltPulseGlow 3s ease-in-out infinite' : 'none' }}>
                        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-20deg)', animation: !activeAction ? 'ltShine 3s ease-in-out infinite' : 'none' }} />
                        {activeAction === 'generateLink' ? (
                          <span style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                            {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', display: 'inline-block', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                          </span>
                        ) : '✦ Generate Magic Invite'}
                      </motion.button>
                    </motion.div>
                  )}

                  {inviteTab === 'direct' && (
                    <motion.div key="direct" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.38)', marginBottom: 16, marginTop: 0 }}>
                        Send a direct summons to any registered member.
                      </p>
                      <form onSubmit={handleSendDirectInvite} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <DarkInput type="email" placeholder="their@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} disabled={!!activeAction}
                            icon={<svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.8)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" /></svg>} />
                        </div>
                        <motion.button type="submit" disabled={!!activeAction}
                          whileHover={!activeAction ? { scale: 1.03 } : {}} whileTap={!activeAction ? { scale: 0.97 } : {}}
                          style={{ padding: '0 18px', background: 'rgba(212,168,80,0.15)', border: '1px solid rgba(212,168,80,0.35)', borderRadius: 10, color: 'rgba(212,168,80,0.85)', fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: activeAction ? 'not-allowed' : 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                          {activeAction === 'sendInvite' ? '...' : 'Send ✦'}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}

                  {inviteTab === 'code' && (
                    <motion.div key="code" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.38)', marginBottom: 16, marginTop: 0 }}>
                        Share this ancient code for manual vault entry.
                      </p>
                      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(212,168,80,0.35)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', letterSpacing: 4, textShadow: '0 0 20px rgba(212,168,80,0.4)' }}>
                          {selectedCircle?.familyCode || user?.familyCode || '———'}
                        </span>
                        <motion.button onClick={handleCopyCode}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ background: codeCopied ? 'rgba(74,222,128,0.15)' : 'rgba(212,168,80,0.1)', border: `1px solid ${codeCopied ? 'rgba(74,222,128,0.4)' : 'rgba(212,168,80,0.3)'}`, borderRadius: 8, padding: '6px 14px', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1.5px', color: codeCopied ? '#4ade80' : 'rgba(212,168,80,0.75)', cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase' }}>
                          {codeCopied ? '✓ Copied' : 'Copy'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>
            ) : (
              <SectionCard>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 14, filter: 'drop-shadow(0 0 12px rgba(212,168,80,0.3))' }}>🔒</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: '#e8c87a', marginBottom: 8 }}>Admin Access Required</div>
                  <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>Only the vault master can summon new members or manage settings.</p>
                </div>
              </SectionCard>
            )}

            {isCircleAdmin && selectedCircleId && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px dashed rgba(220,38,38,0.3)', borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(220,38,38,0.4),transparent)' }} />
                <CornerAccents size={14} inset={10} opacity={0.3} />
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, color: '#f08080', marginBottom: 6, letterSpacing: 1 }}>⚠ Danger Zone</div>
                <p style={{ fontStyle: 'italic', fontSize: 14, color: 'rgba(240,128,128,0.55)', marginBottom: 18, marginTop: 0, lineHeight: 1.6 }}>
                  Permanently erase this family vault. This cannot be undone.
                </p>
                <motion.button onClick={triggerDeleteModal} disabled={!!activeAction}
                  whileHover={!activeAction ? { scale: 1.02 } : {}} whileTap={!activeAction ? { scale: 0.97 } : {}}
                  style={{ width: '100%', padding: '12px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, color: '#f08080', fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: activeAction ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: activeAction === 'deleteCircle' ? 0.6 : 1 }}
                  onMouseEnter={e => { if (!activeAction) { e.currentTarget.style.background = 'rgba(220,38,38,0.25)'; e.currentTarget.style.color = '#ff6b6b'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#f08080'; }}>
                  {activeAction === 'deleteCircle' ? (
                    <span style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                      {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#f08080', display: 'inline-block', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                    </span>
                  ) : '⚔ Destroy This Vault'}
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ textAlign: 'center', marginTop: 60, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 6, color: 'rgba(212,168,80,0.12)', userSelect: 'none' }}>
          ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
        </motion.div>
      </div>

      {/* ── CUSTOM DELETE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,14,0.92)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}
              onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
            >
              <motion.div
                initial={{ scale: 0.88, y: 28, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.88, y: 28, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                style={{ background: 'rgba(18,10,10,0.98)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 24, width: '100%', maxWidth: 420, padding: '44px 36px', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(220,60,60,0.15)', textAlign: 'center' }}
              >
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(220,60,60,0.6),transparent)' }} />
                <CornerAccents />

                <button onClick={() => setShowDeleteModal(false)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(220,60,60,0.22)', background: 'rgba(255,255,255,0.04)', color: 'rgba(220,60,60,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,60,60,0.7)'; e.currentTarget.style.color = '#f08080'; e.currentTarget.style.background = 'rgba(220,60,60,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,60,60,0.22)'; e.currentTarget.style.color = 'rgba(220,60,60,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                  ✕
                </button>

                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: '#f08080', textShadow: '0 0 30px rgba(220,60,60,0.3)', marginBottom: 6 }}>
                  Destroy Vault
                </div>
                <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 24, marginTop: 0 }}>
                  This action is irreversible. Type <strong style={{ color: '#e8c87a', fontStyle: 'normal' }}>{selectedCircle?.circleName}</strong> to confirm.
                </p>

                <div style={{ marginBottom: 24, textAlign: 'left' }}>
                  <DarkInput 
                    value={deleteConfirmText} 
                    onChange={(e) => setDeleteConfirmText(e.target.value)} 
                    placeholder="Type vault name here..." 
                  />
                </div>

                <motion.button onClick={confirmDeleteCircle}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,rgba(220,38,38,0.8),rgba(185,28,28,0.8))', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 12, color: '#ffffff', fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                  Confirm Destruction
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── CUSTOM REMOVE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {memberToRemove && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,14,0.92)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}
              onClick={e => { if (e.target === e.currentTarget) setMemberToRemove(null); }}
            >
              <motion.div
                initial={{ scale: 0.88, y: 28, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.88, y: 28, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                style={{ background: 'rgba(18,10,10,0.98)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 24, width: '100%', maxWidth: 420, padding: '44px 36px', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(220,60,60,0.15)', textAlign: 'center' }}
              >
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(220,60,60,0.6),transparent)' }} />
                <CornerAccents />

                <button onClick={() => setMemberToRemove(null)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(220,60,60,0.22)', background: 'rgba(255,255,255,0.04)', color: 'rgba(220,60,60,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,60,60,0.7)'; e.currentTarget.style.color = '#f08080'; e.currentTarget.style.background = 'rgba(220,60,60,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,60,60,0.22)'; e.currentTarget.style.color = 'rgba(220,60,60,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                  ✕
                </button>

                <div style={{ fontSize: '32px', marginBottom: '12px', filter: 'drop-shadow(0 0 12px rgba(220,38,38,0.4))' }}>⚠️</div>
                
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: '#f08080', textShadow: '0 0 30px rgba(220,60,60,0.3)', marginBottom: 12 }}>
                  Sever Ties?
                </div>
                <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 32, marginTop: 0, lineHeight: 1.5 }}>
                  Are you sure you want to banish <strong style={{ color: '#e8c87a', fontStyle: 'normal' }}>{memberToRemove.name}</strong> from the vault? This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => setMemberToRemove(null)}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    Cancel
                  </button>
                  
                  <motion.button 
                    onClick={confirmRemoveMember}
                    disabled={!!activeAction}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,rgba(220,38,38,0.8),rgba(185,28,28,0.8))', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '10px', color: '#ffffff', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, cursor: activeAction ? 'not-allowed' : 'pointer', boxShadow: '0 0 20px rgba(220,38,38,0.2)' }}
                  >
                    {activeAction ? '...' : 'Remove'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── INVITE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,14,0.92)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}
              onClick={e => { if (e.target === e.currentTarget) setShowInviteModal(false); }}
            >
              <motion.div
                initial={{ scale: 0.88, y: 28, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.88, y: 28, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                style={{ background: 'rgba(12,16,32,0.98)', border: '1px solid rgba(212,168,80,0.28)', borderRadius: 24, width: '100%', maxWidth: 420, padding: '44px 36px', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(212,168,80,0.15)', textAlign: 'center' }}
              >
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.8),transparent)' }} />
                <CornerAccents />

                <button onClick={() => setShowInviteModal(false)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.22)', background: 'rgba(255,255,255,0.04)', color: 'rgba(212,168,80,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.7)'; e.currentTarget.style.color = '#e8c87a'; e.currentTarget.style.background = 'rgba(212,168,80,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; e.currentTarget.style.color = 'rgba(212,168,80,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                  ✕
                </button>

                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 30px rgba(212,168,80,0.3)', marginBottom: 6 }}>
                  Vault Entry Portal
                </div>
                <p style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 24, marginTop: 0 }}>
                  Scan to enter the family vault. Valid for 48 hours.
                </p>

                {/* QR Code */}
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,168,80,0.25)', borderRadius: 18, padding: 20, display: 'inline-block', marginBottom: 24, position: 'relative' }}>
                  <CornerAccents size={12} inset={8} opacity={0.5} />
                  <div style={{ background: '#fff', padding: 12, borderRadius: 8, display: 'inline-block' }}>
                    <QRCodeSVG value={inviteLink} size={170} fgColor="#06080f" />
                  </div>
                </div>

                {/* Link copy */}
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,168,80,0.2)', borderRadius: 12, display: 'flex', overflow: 'hidden' }}>
                  <input type="text" value={inviteLink} readOnly
                    style={{ flex: 1, background: 'transparent', border: 'none', padding: '11px 14px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(212,168,80,0.5)', outline: 'none', letterSpacing: '0.5px' }} />
                  <motion.button onClick={handleCopyLink}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ background: linkCopied ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg,#c9933a,#e8a820)', border: 'none', padding: '0 20px', color: linkCopied ? '#4ade80' : '#1a0f00', fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                    {!linkCopied && <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-20deg)', animation: 'ltShine 3s ease-in-out infinite' }} />}
                    {linkCopied ? '✓ Copied!' : 'Copy ✦'}
                  </motion.button>
                </div>

                <div style={{ marginTop: 18, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,0.15)', userSelect: 'none' }}>
                  ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default DashboardPage;