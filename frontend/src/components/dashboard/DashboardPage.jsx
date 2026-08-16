import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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

// ─── Comic Background Elements ─────────────────────────────────────────────────
function ComicBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 60, filter: 'drop-shadow(4px 4px 0px #171719)' }}>🏡</motion.div>
      <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', top: '40%', right: '8%', fontSize: 50, filter: 'drop-shadow(4px 4px 0px #171719)' }}>👨‍👩‍👧‍👦</motion.div>
      <motion.div animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: 70, filter: 'drop-shadow(4px 4px 0px #171719)' }}>⚙️</motion.div>
    </div>
  );
}

// ─── Logo Badge ────────────────────────────────────────────────────────────────
function LogoBadge({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#FFD23F', border: '4px solid #171719', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 0px 0px #171719', overflow: 'hidden', animation: 'spin 10s linear infinite' }}>
        <div style={{ width: '120%', height: '120%', background: '#3FE0FF', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
      </div>
      <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: '50%', background: '#FFF', border: '3px solid #171719', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 26 }}>LT</div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Comic Input ───────────────────────────────────────────────────────────────
function ComicInput({ type = 'text', placeholder, value, onChange, icon, disabled, name }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ border: '3px solid #171719', background: '#FFF', borderRadius: 12, position: 'relative', boxShadow: focused ? '6px 6px 0px 0px #3FE0FF' : '4px 4px 0px 0px #171719', transform: focused ? 'translate(-2px,-2px)' : 'none', transition: 'all 0.2s' }}>
      {icon && <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, zIndex: 1 }}>{icon}</div>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: icon ? '14px 16px 14px 44px' : '14px 16px', background: 'transparent', border: 'none', outline: 'none', color: '#171719', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, boxSizing: 'border-box' }} />
    </div>
  );
}

// ─── Nav Room Card ────────────────────────────────────────────────────────────
function RoomCard({ to, icon, title, desc, color = '#FFD23F', delay = 0 }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: 'spring', bounce: 0.5 }} whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.95 }}
        style={{ background: '#FFF', border: '4px solid #171719', borderRadius: 20, padding: '32px 28px', position: 'relative', boxShadow: '8px 8px 0px 0px #171719', height: '100%', cursor: 'pointer', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: color, borderRadius: '50%', border: '4px solid #171719', opacity: 0.2 }} />
        <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', filter: 'drop-shadow(2px 2px 0px #171719)' }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 24, color: '#171719', margin: '0 0 8px', letterSpacing: 1 }}>
          {title}
        </h2>
        <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719', margin: 0, lineHeight: 1.4 }}>
          {desc}
        </p>
        <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#171719', fontSize: 24, fontFamily: "'Luckiest Guy',cursive" }}>
          →
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({ m, isSelf, isAdmin, isRemoving, canRemove, onRemove, activeAction }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: isSelf ? '#FFD23F' : '#F5F5F5', borderRadius: 16, border: '3px solid #171719', marginBottom: 12, boxShadow: '4px 4px 0px 0px #171719' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #171719', overflow: 'hidden', background: '#3FE0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {m.avatar ? <img src={m.avatar} alt="dp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 20 }}>{m.name.charAt(0)}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 18, color: '#171719', display: 'flex', alignItems: 'center', gap: 8 }}>
            {m.name}
            {isSelf && <span style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: 12, fontWeight: 800, background: '#FFF', padding: '2px 8px', borderRadius: 6, border: '2px solid #171719' }}>YOU</span>}
            {isAdmin && <span style={{ background: '#3FE0FF', border: '2px solid #171719', color: '#171719', padding: '2px 8px', borderRadius: 6, fontFamily: "'Baloo 2',sans-serif", fontSize: 12, fontWeight: 800 }}>👑 ADMIN</span>}
          </div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: 14, fontWeight: 700, color: 'rgba(23,23,25,0.6)', marginTop: 2 }}>{m.email}</div>
        </div>
      </div>

      {canRemove && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onRemove(m._id, m.name)} disabled={!!activeAction}
          style={{ background: '#FF3D81', border: '3px solid #171719', color: '#FFF', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Luckiest Guy',cursive", fontSize: 14, boxShadow: '2px 2px 0px 0px #171719' }}
        >
          {isRemoving ? '...' : 'KICK OUT!'}
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, style: extraStyle }) {
  return (
    <div style={{ background: '#FFF', border: '6px solid #171719', borderRadius: 24, padding: '32px', position: 'relative', boxShadow: '12px 12px 0px 0px #171719', ...extraStyle }}>
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
    if (!newCircleName.trim()) return toast.error('Name it first!');
    setActiveAction('createCircle');
    try {
      const created = await createCircleApi({ circleName: newCircleName.trim() });
      toast.success(`Family "${created.circleName}" built!`);
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
      toast.success(`${memberToRemove.name} kicked out! 🥾`); 
      await loadCircleDetails(selectedCircleId); 
      setMemberToRemove(null);
    } catch (e2) { toast.error(e2?.response?.data?.message || 'Failed to remove'); } 
    finally { setActiveAction(null); }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault(); 
    if (!inviteEmail.trim()) return toast.error('Need an email!');
    setActiveAction('sendInvite');
    try { const res = await sendFamilyInviteApi(selectedCircleId, { email: inviteEmail.trim() }); toast.success(res.message); setInviteEmail(''); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to send'); }
    finally { setActiveAction(null); }
  };

  const triggerDeleteModal = () => { setDeleteConfirmText(''); setShowDeleteModal(true); };

  const confirmDeleteCircle = async () => {
    if (deleteConfirmText !== selectedCircle?.circleName) { toast.error('Wrong name. Not deleted.'); return; }
    setShowDeleteModal(false); setActiveAction('deleteCircle');
    try {
      await deleteCircleApi(selectedCircleId);
      toast.success(`Family "${selectedCircle?.circleName}" demolished! 💥`);
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
    { to: '/vault-stories', icon: '📸', title: 'VAULT STORIES', desc: 'Share your favorite messy family photos here.', color: '#FFD23F', delay: 0.1 },
    { to: '/vault', icon: '💬', title: 'FAMILY CHAT', desc: 'Secure real-time gossip and event planning.', color: '#3FE0FF', delay: 0.2 },
    { to: '/radar', icon: '📡', title: 'LIVE RADAR', desc: 'See who is where on the live family map.', color: '#00C853', delay: 0.3 },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      <ComicBackground />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* ── HERO HEADER ── */}
        <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
          <LogoBadge size={100} />
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 'clamp(32px, 5vw, 56px)', color: '#FF3D81', textShadow: '4px 4px 0px #171719', WebkitTextStroke: '2px #171719', letterSpacing: 2, margin: '20px 0 10px' }}>
            {loadingCircleDetails ? 'WAKING UP...' : `${familyName.toUpperCase()} HUB`}
          </motion.h1>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#171719', margin: '0 auto 20px', background: '#FFD23F', display: 'inline-block', padding: '4px 16px', border: '3px solid #171719', borderRadius: 8, boxShadow: '4px 4px 0px 0px #171719', transform: 'rotate(-2deg)' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Boss'}!
          </p>

          {circles.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <select 
                value={selectedCircleId} onChange={e => setSelectedCircleId(e.target.value)}
                style={{ appearance: 'none', background: '#FFF', border: '3px solid #171719', borderRadius: 12, padding: '10px 40px 10px 16px', fontFamily: "'Luckiest Guy',cursive", fontSize: 16, color: '#171719', cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}
              >
                {circles.map(c => <option key={c._id} value={c._id}>{c.circleName || c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* ── ROOM CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, margin: '20px 0 60px' }}>
          {roomCards.map((card, i) => <RoomCard key={i} {...card} />)}
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>

          {/* Members Panel */}
          <SectionCard style={{ background: '#3FE0FF' }}>
            <div style={{ marginBottom: 24, background: '#FFF', border: '4px solid #171719', padding: 16, borderRadius: 16, boxShadow: '4px 4px 0px 0px #171719', transform: 'rotate(1deg)' }}>
              <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 28, color: '#171719', marginBottom: 4 }}>
                THE CREW 👨‍👩‍👧‍👦
              </div>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719' }}>
                {familyName} · {selectedCircle?.members?.length || 0} Members
              </div>
            </div>

            {loadingCircleDetails ? (
              <div style={{ textAlign: 'center', fontFamily: "'Luckiest Guy',cursive", fontSize: 24 }}>LOADING...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {selectedCircleId && <UpcomingEventsWidget circleId={selectedCircleId} />}

            <SectionCard style={{ background: '#FFD23F' }}>
              <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 28, color: '#171719', marginBottom: 16 }}>
                START A NEW FAMILY! 🏠
              </div>
              <form onSubmit={handleCreateCircle} style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                <ComicInput placeholder="New family name..." value={newCircleName} onChange={e => setNewCircleName(e.target.value)} disabled={!!activeAction} icon="✏️" />
                <motion.button type="submit" disabled={!!activeAction} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                  style={{ padding: '14px', background: '#00C853', border: '4px solid #171719', borderRadius: 12, color: '#FFF', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}>
                  {activeAction === 'createCircle' ? 'BUILDING...' : 'BUILD IT! 🔨'}
                </motion.button>
              </form>
            </SectionCard>

            {isCircleAdmin ? (
              <SectionCard>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 28, color: '#171719', marginBottom: 20 }}>
                  INVITE THE COUSINS! 🎟️
                </div>

                <div style={{ display: 'flex', background: '#F5F5F5', border: '3px solid #171719', padding: 8, borderRadius: 16, marginBottom: 24, gap: 8 }}>
                  {[{ key: 'magic', label: 'MAGIC LINK' }, { key: 'direct', label: 'EMAIL' }, { key: 'code', label: 'CODE' }].map(tab => (
                    <button key={tab.key} onClick={() => setInviteTab(tab.key)}
                      style={{ flex: 1, padding: '10px 4px', border: '3px solid #171719', borderRadius: 10, cursor: 'pointer', transition: 'all 0.1s', background: inviteTab === tab.key ? '#FF3D81' : '#FFF', color: inviteTab === tab.key ? '#FFF' : '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 14, boxShadow: inviteTab === tab.key ? '2px 2px 0px 0px #171719' : 'none', transform: inviteTab === tab.key ? 'translate(-2px,-2px)' : 'none' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {inviteTab === 'magic' && (
                    <motion.div key="magic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719', marginBottom: 16 }}>Generate a quick link for instant entry.</p>
                      <motion.button onClick={handleGenerateInvite} disabled={!!activeAction} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        style={{ width: '100%', padding: '16px', background: '#3FE0FF', border: '4px solid #171719', borderRadius: 12, color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}>
                        GET MAGIC LINK ✨
                      </motion.button>
                    </motion.div>
                  )}

                  {inviteTab === 'direct' && (
                    <motion.div key="direct" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719', marginBottom: 16 }}>Send an invite straight to their inbox.</p>
                      <form onSubmit={handleSendDirectInvite} style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                        <ComicInput type="email" placeholder="cousin@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} disabled={!!activeAction} icon="✉️" />
                        <motion.button type="submit" disabled={!!activeAction} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                          style={{ padding: '14px', background: '#FFD23F', border: '4px solid #171719', borderRadius: 12, color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}>
                          SEND INVITE 🚀
                        </motion.button>
                      </form>
                    </motion.div>
                  )}

                  {inviteTab === 'code' && (
                    <motion.div key="code" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719', marginBottom: 16 }}>Share this code for manual entry.</p>
                      <div style={{ background: '#FFF', border: '4px dashed #171719', borderRadius: 16, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.1)' }}>
                        <span style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 28, color: '#FF3D81', letterSpacing: 2 }}>
                          {selectedCircle?.familyCode || user?.familyCode || '———'}
                        </span>
                        <motion.button onClick={handleCopyCode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ background: codeCopied ? '#00C853' : '#171719', border: '3px solid #171719', borderRadius: 10, padding: '10px 16px', fontFamily: "'Luckiest Guy',cursive", fontSize: 16, color: '#FFF', cursor: 'pointer' }}>
                          {codeCopied ? 'COPIED!' : 'COPY'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>
            ) : (
              <SectionCard style={{ background: '#F5F5F5', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 24, color: '#171719', marginBottom: 8 }}>ADMINS ONLY!</div>
                <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719', margin: 0 }}>Only the family boss can invite new members.</p>
              </SectionCard>
            )}

            {isCircleAdmin && selectedCircleId && (
              <SectionCard style={{ background: '#FF3D81' }}>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 24, color: '#FFF', marginBottom: 12 }}>DANGER ZONE 💣</div>
                <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#FFF', marginBottom: 20, marginTop: 0 }}>
                  Delete this family entirely. This cannot be undone!
                </p>
                <motion.button onClick={triggerDeleteModal} disabled={!!activeAction} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                  style={{ width: '100%', padding: '14px', background: '#171719', border: '4px solid #171719', borderRadius: 12, color: '#FFF', fontFamily: "'Luckiest Guy',cursive", fontSize: 18, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #FFF' }}>
                  DESTROY VAULT! 💥
                </motion.button>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      {/* ── CUSTOM DELETE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}>
              <motion.div initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 2 }} exit={{ scale: 0.8, rotate: 5 }} transition={{ type: 'spring', bounce: 0.6 }} style={{ background: '#FFF', border: '6px solid #171719', borderRadius: 24, width: '100%', maxWidth: 420, padding: '40px', position: 'relative', boxShadow: '16px 16px 0px 0px #171719', textAlign: 'center' }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', border: '4px solid #171719', background: '#FFD23F', color: '#171719', cursor: 'pointer', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, boxShadow: '4px 4px 0px 0px #171719' }}>✕</button>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 32, color: '#FF3D81', marginBottom: 16 }}>NUKING VAULT? 💣</div>
                <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: '#171719', marginBottom: 24 }}>Type <strong>{selectedCircle?.circleName}</strong> to confirm.</p>
                <div style={{ marginBottom: 24 }}><ComicInput value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type name here..." /></div>
                <motion.button onClick={confirmDeleteCircle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', padding: '16px', background: '#FF3D81', border: '4px solid #171719', borderRadius: 12, color: '#FFF', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}>NUKE IT!</motion.button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}>
              <motion.div initial={{ scale: 0.8, rotate: 5 }} animate={{ scale: 1, rotate: -2 }} exit={{ scale: 0.8, rotate: -5 }} transition={{ type: 'spring', bounce: 0.6 }} style={{ background: '#FFF', border: '6px solid #171719', borderRadius: 24, width: '100%', maxWidth: 420, padding: '40px', position: 'relative', boxShadow: '16px 16px 0px 0px #171719', textAlign: 'center' }}>
                <button onClick={() => setMemberToRemove(null)} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', border: '4px solid #171719', background: '#FFD23F', color: '#171719', cursor: 'pointer', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, boxShadow: '4px 4px 0px 0px #171719' }}>✕</button>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🥾</div>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 32, color: '#FF3D81', marginBottom: 16 }}>KICK OUT?</div>
                <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: '#171719', marginBottom: 32 }}>Are you sure you want to boot <strong>{memberToRemove.name}</strong> out of the family?</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <motion.button onClick={() => setMemberToRemove(null)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1, padding: '14px', background: '#FFF', border: '4px solid #171719', borderRadius: 12, color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}>NOPE</motion.button>
                  <motion.button onClick={confirmRemoveMember} disabled={!!activeAction} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1, padding: '14px', background: '#FF3D81', border: '4px solid #171719', borderRadius: 12, color: '#FFF', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}>BYE!</motion.button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}>
              <motion.div initial={{ scale: 0.8, rotate: -2 }} animate={{ scale: 1, rotate: 2 }} exit={{ scale: 0.8, rotate: -2 }} transition={{ type: 'spring', bounce: 0.6 }} style={{ background: '#FFF', border: '6px solid #171719', borderRadius: 24, width: '100%', maxWidth: 420, padding: '40px', position: 'relative', boxShadow: '16px 16px 0px 0px #171719', textAlign: 'center' }}>
                <button onClick={() => setShowInviteModal(false)} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', border: '4px solid #171719', background: '#FFD23F', color: '#171719', cursor: 'pointer', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, boxShadow: '4px 4px 0px 0px #171719' }}>✕</button>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 32, color: '#3FE0FF', marginBottom: 16, textShadow: '2px 2px 0px #171719', WebkitTextStroke: '1px #171719' }}>MAGIC TICKET 🎟️</div>
                <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#171719', marginBottom: 24 }}>Scan to join the family! Valid for 48 hours.</p>
                <div style={{ background: '#FFD23F', border: '4px solid #171719', borderRadius: 16, padding: 20, display: 'inline-block', marginBottom: 24, boxShadow: '8px 8px 0px 0px #171719', transform: 'rotate(-2deg)' }}>
                  <div style={{ background: '#FFF', padding: 12, borderRadius: 8, border: '3px solid #171719' }}>
                    <QRCodeSVG value={inviteLink} size={180} fgColor="#171719" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, border: '4px solid #171719', borderRadius: 12, padding: 6, background: '#F5F5F5' }}>
                  <input type="text" value={inviteLink} readOnly style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, outline: 'none', color: '#171719' }} />
                  <motion.button onClick={handleCopyLink} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: linkCopied ? '#00C853' : '#171719', color: '#FFF', border: '3px solid #171719', borderRadius: 8, padding: '10px 20px', fontFamily: "'Luckiest Guy',cursive", fontSize: 16, cursor: 'pointer' }}>
                    {linkCopied ? 'COPIED!' : 'COPY'}
                  </motion.button>
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