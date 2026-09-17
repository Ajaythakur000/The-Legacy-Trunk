import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  createCircleApi, getCircleByIdApi, getMyCirclesApi,
  removeMemberFromCircleApi, generateInviteLinkApi,
  sendFamilyInviteApi, deleteCircleApi
} from '../../api/circleApi';
import UpcomingEventsWidget from './UpcomingEventsWidget';
import { Users, ShieldAlert, Sparkles, Send, Copy, Camera, MessageSquare, Map as MapIcon, X, Trash2, Mail, Link as LinkIcon, PenTool, Key } from 'lucide-react';
/* eslint-disable no-unused-vars */

// ─── Logo Badge ────────────────────────────────────────────────────────────────
function LogoBadge({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 26 }}>LT</div>
      </div>
    </div>
  );
}

// ─── Vintage Input ─────────────────────────────────────────────────────────────
function VintageInput({ type = 'text', placeholder, value, onChange, icon: IconComponent, disabled, name }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ border: focused ? '1px solid #A0522D' : '1px solid #D4B895', background: '#FFF', borderRadius: 8, position: 'relative', transition: 'all 0.2s ease', boxShadow: focused ? '2px 2px 8px rgba(0,0,0,0.05)' : 'none' }}>
      {IconComponent && <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6D4C41', display: 'flex' }}><IconComponent size={18} /></div>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: IconComponent ? '12px 16px 12px 42px' : '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: '#3E2723', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 16, boxSizing: 'border-box' }} />
    </div>
  );
}

// ─── Nav Room Card ────────────────────────────────────────────────────────────
function RoomCard({ to, icon: IconComponent, title, desc, color = '#D4B895' }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div 
        style={{ background: '#FDFBF7', border: '1px solid #EADDCD', borderRadius: 12, padding: '30px 24px', position: 'relative', boxShadow: '2px 2px 10px rgba(0,0,0,0.03)', height: '100%', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '4px 8px 20px rgba(0,0,0,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 10px rgba(0,0,0,0.03)'; }}
      >
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: color, borderRadius: '50%', opacity: 0.1, transition: 'all 0.3s ease' }} className="card-blob" />
        <div style={{ color: color, marginBottom: 16, display: 'inline-flex', padding: 12, background: '#FFF', borderRadius: '50%', border: `1px solid ${color}40` }}>
          <IconComponent size={32} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#3E2723', margin: '0 0 8px', letterSpacing: 0.5 }}>
          {title}
        </h2>
        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 500, fontSize: 15, color: '#6D4C41', margin: 0, lineHeight: 1.5 }}>
          {desc}
        </p>
        <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#D4B895', fontSize: 24, fontFamily: "'Playfair Display', serif" }}>
          →
        </div>
      </div>
    </Link>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({ m, isSelf, isAdmin, isRemoving, canRemove, onRemove, activeAction }) {
  return (
    <div 
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: isSelf ? '#F5F0E6' : '#FFF', borderRadius: 8, border: '1px solid #EADDCD', marginBottom: 12, transition: 'all 0.2s ease' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #D4B895', overflow: 'hidden', background: '#FDFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0522D' }}>
            {m.avatar ? <img src={m.avatar} alt="dp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>{m.name.charAt(0)}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', display: 'flex', alignItems: 'center', gap: 8 }}>
            {m.name}
            {isSelf && <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 11, fontWeight: 700, background: '#EADDCD', color: '#6D4C41', padding: '2px 8px', borderRadius: 4, letterSpacing: 0.5 }}>YOU</span>}
            {isAdmin && <span style={{ background: '#3E2723', color: '#D4B895', padding: '2px 8px', borderRadius: 4, fontFamily: "'Baloo 2', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}><Key size={12}/> ADMIN</span>}
          </div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, fontWeight: 500, color: '#6D4C41', marginTop: 2 }}>{m.email}</div>
        </div>
      </div>

      {canRemove && (
        <button onClick={() => onRemove(m._id, m.name)} disabled={!!activeAction}
          style={{ background: 'transparent', border: '1px solid #A0522D', color: '#A0522D', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 13, transition: 'all 0.2s', opacity: isRemoving ? 0.5 : 1 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#A0522D'; e.currentTarget.style.color = '#FFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0522D'; }}
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </button>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, style: extraStyle }) {
  return (
    <div style={{ background: '#FFF', border: '1px solid #D4B895', borderRadius: 12, padding: '32px', position: 'relative', boxShadow: '2px 2px 15px rgba(0,0,0,0.03)', ...extraStyle }}>
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
  const [, setLoadingCircles] = useState(false);
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

  useEffect(() => { loadMyCircles(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.activeCircleId && user.activeCircleId !== selectedCircleId) setSelectedCircleId(user.activeCircleId); }, [user?.activeCircleId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedCircleId) { loadCircleDetails(selectedCircleId); if (selectedCircleId !== user?.activeCircleId) switchActiveCircle(selectedCircleId); }
    else setSelectedCircle(null);
  }, [selectedCircleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateCircle = async (e) => {
    e.preventDefault(); 
    if (!newCircleName.trim()) return toast.error('Provide a name first.');
    setActiveAction('createCircle');
    try {
      const created = await createCircleApi({ circleName: newCircleName.trim() });
      toast.success(`Family "${created.circleName}" established!`);
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
      toast.success(`${memberToRemove.name} has been removed.`); 
      await loadCircleDetails(selectedCircleId); 
      setMemberToRemove(null);
    } catch (e2) { toast.error(e2?.response?.data?.message || 'Failed to remove'); } 
    finally { setActiveAction(null); }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault(); 
    if (!inviteEmail.trim()) return toast.error('Email is required.');
    setActiveAction('sendInvite');
    try { const res = await sendFamilyInviteApi(selectedCircleId, { email: inviteEmail.trim() }); toast.success(res.message); setInviteEmail(''); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to send'); }
    finally { setActiveAction(null); }
  };

  const triggerDeleteModal = () => { setDeleteConfirmText(''); setShowDeleteModal(true); };

  const confirmDeleteCircle = async () => {
    if (deleteConfirmText !== selectedCircle?.circleName) { toast.error('Confirmation name mismatch.'); return; }
    setShowDeleteModal(false); setActiveAction('deleteCircle');
    try {
      await deleteCircleApi(selectedCircleId);
      toast.success(`Family "${selectedCircle?.circleName}" has been archived forever.`);
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
    { to: '/vault-stories', icon: Camera, title: 'Vault Stories', desc: 'Preserve and organize the family photo archive.', color: '#8D6E63' },
    { to: '/vault', icon: MessageSquare, title: 'The Parlor', desc: 'Gather for secure real-time family correspondence.', color: '#A0522D' },
    { to: '/radar', icon: MapIcon, title: 'Global Radar', desc: 'Track where the family is stationed worldwide.', color: '#3E2723' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative', background: 'transparent' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* ── HERO HEADER ── */}
        <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
          <LogoBadge size={80} />
          <h1 
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 42px)', color: '#3E2723', letterSpacing: 1, margin: '24px 0 12px' }}>
            {loadingCircleDetails ? 'Consulting the Archives...' : `${familyName} Desk`}
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: '#6D4C41', margin: '0 auto 24px' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}.
          </p>

          {circles.length > 0 && (
            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: 8, padding: '2px 4px' }}>
              <span style={{ padding: '0 12px', color: '#6D4C41', fontSize: 14 }}><Users size={16} /></span>
              <select 
                value={selectedCircleId} onChange={e => setSelectedCircleId(e.target.value)}
                style={{ appearance: 'none', background: 'transparent', border: 'none', padding: '8px 30px 8px 4px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 15, color: '#3E2723', cursor: 'pointer', outline: 'none' }}
              >
                {circles.map(c => <option key={c._id} value={c._id}>{c.circleName || c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* ── ROOM CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, margin: '20px 0 40px' }}>
          {roomCards.map((card, i) => <RoomCard key={i} {...card} />)}
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>

          {/* Members Panel */}
          <SectionCard style={{ background: '#FDFBF7' }}>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EADDCD', paddingBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={24} color="#A0522D" /> The Calling Cards
                </div>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 500, fontSize: 15, color: '#6D4C41' }}>
                  {selectedCircle?.members?.length || 0} recognized members
                </div>
              </div>
            </div>

            {loadingCircleDetails ? (
              <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: '#6D4C41', padding: '40px 0' }}>Flipping through the rolodex...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

            <SectionCard style={{ background: '#F5F0E6' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#3E2723', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PenTool size={20} color="#8D6E63" /> Found a New Branch
              </div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', marginBottom: 16, marginTop: 0 }}>Establish a completely new family circle.</p>
              <form onSubmit={handleCreateCircle} style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                <VintageInput placeholder="Enter family name..." value={newCircleName} onChange={e => setNewCircleName(e.target.value)} disabled={!!activeAction} icon={PenTool} />
                <button type="submit" disabled={!!activeAction}
                  style={{ padding: '12px', background: '#3E2723', border: 'none', borderRadius: 8, color: '#D4B895', fontFamily: "'Playfair Display', serif", fontSize: 18, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2D1B15'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3E2723'}
                >
                  {activeAction === 'createCircle' ? 'Inscribing...' : 'Establish Circle'}
                </button>
              </form>
            </SectionCard>

            {isCircleAdmin ? (
              <SectionCard>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#3E2723', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={20} color="#A0522D" /> Send Dispatches
                </div>

                <div style={{ display: 'flex', background: '#F5F0E6', border: '1px solid #EADDCD', padding: 4, borderRadius: 8, marginBottom: 20, gap: 4 }}>
                  {[{ key: 'magic', label: 'Magic Link' }, { key: 'direct', label: 'By Email' }, { key: 'code', label: 'Secret Code' }].map(tab => (
                    <button key={tab.key} onClick={() => setInviteTab(tab.key)}
                      style={{ flex: 1, padding: '8px 4px', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s', background: inviteTab === tab.key ? '#FFF' : 'transparent', color: inviteTab === tab.key ? '#3E2723' : '#8D6E63', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 14, boxShadow: inviteTab === tab.key ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ minHeight: 140 }}>
                  {inviteTab === 'magic' && (
                    <div>
                      <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', marginBottom: 16, lineHeight: 1.5 }}>Generate a temporary wax-sealed link for instant access.</p>
                      <button onClick={handleGenerateInvite} disabled={!!activeAction}
                        style={{ width: '100%', padding: '12px', background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: 8, color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 16, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F0E6'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FDFBF7'}
                      >
                        <Sparkles size={18} /> Seal & Send Link
                      </button>
                    </div>
                  )}

                  {inviteTab === 'direct' && (
                    <div>
                      <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', marginBottom: 16, lineHeight: 1.5 }}>Dispatch a formal invitation letter to their inbox.</p>
                      <form onSubmit={handleSendDirectInvite} style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                        <VintageInput type="email" placeholder="relative@domain.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} disabled={!!activeAction} icon={Mail} />
                        <button type="submit" disabled={!!activeAction}
                          style={{ padding: '12px', background: '#3E2723', border: 'none', borderRadius: 8, color: '#D4B895', fontFamily: "'Playfair Display', serif", fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#2D1B15'}
                          onMouseLeave={e => e.currentTarget.style.background = '#3E2723'}
                        >
                          Send Letter
                        </button>
                      </form>
                    </div>
                  )}

                  {inviteTab === 'code' && (
                    <div>
                      <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', marginBottom: 16, lineHeight: 1.5 }}>Provide this passphrase for manual entry.</p>
                      <div style={{ background: '#F5F0E6', border: '1px dashed #A0522D', borderRadius: 8, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 22, color: '#3E2723', fontWeight: 'bold' }}>
                          {selectedCircle?.familyCode || user?.familyCode || '———'}
                        </span>
                        <button onClick={handleCopyCode}
                          style={{ background: codeCopied ? '#8D6E63' : '#FDFBF7', border: '1px solid #D4B895', borderRadius: 6, padding: '8px 12px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 13, color: codeCopied ? '#FFF' : '#3E2723', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                          <Copy size={14} /> {codeCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            ) : (
              <SectionCard style={{ background: '#FAFAFA', textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#D4B895' }}><ShieldAlert size={40} /></div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3E2723', marginBottom: 8 }}>Authorized Personnel Only</div>
                <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', margin: 0 }}>Only the family administrator can dispatch invites.</p>
              </SectionCard>
            )}

            {isCircleAdmin && selectedCircleId && (
              <SectionCard style={{ background: '#FDFBF7', border: '1px solid #A0522D20' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#A0522D', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={20} /> Archive Family
                </div>
                <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', marginBottom: 16, marginTop: 0 }}>
                  Permanently dismantle this family circle. This action is irreversible.
                </p>
                <button onClick={triggerDeleteModal} disabled={!!activeAction}
                  style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #A0522D', borderRadius: 8, color: '#A0522D', fontFamily: "'Playfair Display', serif", fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#A0522D'; e.currentTarget.style.color = '#FFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0522D'; }}
                >
                  Dismantle Circle
                </button>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      {/* ── CUSTOM DELETE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <div style={{ display: showDeleteModal ? 'flex' : 'none', position: 'fixed', inset: 0, background: 'rgba(23, 23, 25, 0.8)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}>
          <div style={{ background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: 12, width: '100%', maxWidth: 420, padding: '30px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#D4B895', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#A0522D' }}><Trash2 size={48} /></div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginBottom: 12 }}>Dismantle Vault?</div>
            <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 15, color: '#6D4C41', marginBottom: 20, lineHeight: 1.5 }}>Please type <strong>{selectedCircle?.circleName}</strong> below to authorize the permanent deletion.</p>
            <div style={{ marginBottom: 24 }}><VintageInput value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type family name..." /></div>
            <button onClick={confirmDeleteCircle} style={{ width: '100%', padding: '12px', background: '#A0522D', border: 'none', borderRadius: 8, color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 18, cursor: 'pointer' }}>Confirm Deletion</button>
          </div>
        </div>,
        document.body
      )}

      {/* ── CUSTOM REMOVE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <div style={{ display: memberToRemove ? 'flex' : 'none', position: 'fixed', inset: 0, background: 'rgba(23, 23, 25, 0.8)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}>
          <div style={{ background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: 12, width: '100%', maxWidth: 420, padding: '30px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <button onClick={() => setMemberToRemove(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#D4B895', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#3E2723' }}><Users size={48} /></div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginBottom: 12 }}>Revoke Access?</div>
            <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 15, color: '#6D4C41', marginBottom: 24, lineHeight: 1.5 }}>Are you sure you wish to revoke <strong>{memberToRemove?.name}</strong>'s access to the family circle?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setMemberToRemove(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #D4B895', borderRadius: 8, color: '#3E2723', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmRemoveMember} disabled={!!activeAction} style={{ flex: 1, padding: '12px', background: '#3E2723', border: 'none', borderRadius: 8, color: '#D4B895', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Revoke</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── INVITE MODAL ── */}
      {typeof document !== 'undefined' && createPortal(
        <div style={{ display: showInviteModal ? 'flex' : 'none', position: 'fixed', inset: 0, background: 'rgba(23, 23, 25, 0.8)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}>
          <div style={{ background: '#FDFBF7', border: '1px solid #D4B895', borderRadius: 12, width: '100%', maxWidth: 420, padding: '30px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <button onClick={() => setShowInviteModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#D4B895', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={24} color="#D4B895" /> Sealed Dispatch
            </div>
            <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 15, color: '#6D4C41', marginBottom: 24 }}>Scan this seal to join the family. Expires in 48 hours.</p>
            <div style={{ background: '#F5F0E6', border: '1px dashed #D4B895', borderRadius: 8, padding: 20, display: 'inline-block', marginBottom: 24 }}>
              <QRCodeSVG value={inviteLink} size={180} fgColor="#3E2723" bgColor="#F5F0E6" />
            </div>
            <div style={{ display: 'flex', gap: 8, border: '1px solid #EADDCD', borderRadius: 8, padding: 4, background: '#FFF' }}>
              <input type="text" value={inviteLink} readOnly style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 12px', fontFamily: "'Baloo 2', sans-serif", fontSize: 13, color: '#6D4C41', outline: 'none' }} />
              <button onClick={handleCopyLink} style={{ background: linkCopied ? '#8D6E63' : '#FDFBF7', color: linkCopied ? '#FFF' : '#3E2723', border: '1px solid #D4B895', borderRadius: 6, padding: '8px 16px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                {linkCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default DashboardPage;
