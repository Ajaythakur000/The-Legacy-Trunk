import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react'; 
import { motion, AnimatePresence } from 'framer-motion'; // 🔥 IMPORTED FRAMER MOTION
import {
  createCircleApi,
  getCircleByIdApi,
  getMyCirclesApi,
  removeMemberFromCircleApi,
  generateInviteLinkApi,
  sendFamilyInviteApi, 
  deleteCircleApi      
} from '../../api/circleApi';

import UpcomingEventsWidget from '../../components/dashboard/UpcomingEventsWidget';
import VaultGateway from "../modals/VaultGateway";

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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const [inviteTab, setInviteTab] = useState('magic'); 

  // 🔥 VAULT GATEWAY STATE
  const [showGateway, setShowGateway] = useState(false);

  const isGlobalAdmin = user?.role === 'admin';
  const isCircleAdmin = useMemo(() => {
    if (!selectedCircle || !user?._id) return false;
    return String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(user._id);
  }, [selectedCircle, user]);

  const clearFlash = () => {
    setError('');
    setSuccess('');
  };

  const loadMyCircles = async () => {
    setLoadingCircles(true);
    try {
      const data = await getMyCirclesApi();
      const list = Array.isArray(data) ? data : [];
      setCircles(list);
    } catch (e) {
      console.error('Failed to load circles', e);
    } finally {
      setLoadingCircles(false);
    }
  };

  const loadCircleDetails = async (circleId) => {
    if (!circleId) {
      setSelectedCircle(null);
      return;
    }
    setLoadingCircleDetails(true);
    try {
      const data = await getCircleByIdApi(circleId);
      setSelectedCircle(data);
    } catch (e) {
      console.error('Failed to load circle details', e);
    } finally {
      setLoadingCircleDetails(false);
    }
  };

  useEffect(() => {
    const hasSeenGateway = localStorage.getItem('vault_gateway_seen');
    if (!hasSeenGateway) {
      setShowGateway(true);
    }
    loadMyCircles();
  }, []);

  const handleCloseGateway = () => {
    localStorage.setItem('vault_gateway_seen', 'true');
    setShowGateway(false);
  };

  useEffect(() => {
    if (user?.activeCircleId && user.activeCircleId !== selectedCircleId) {
      setSelectedCircleId(user.activeCircleId);
    }
  }, [user?.activeCircleId]);

  useEffect(() => {
    if (selectedCircleId) {
      loadCircleDetails(selectedCircleId);
      if (selectedCircleId !== user?.activeCircleId) {
        switchActiveCircle(selectedCircleId);
      }
    } else {
      setSelectedCircle(null);
    }
  }, [selectedCircleId]);

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    clearFlash();
    if (!newCircleName.trim()) return setError('Circle name is required');

    setActiveAction('createCircle'); 
    try {
      const created = await createCircleApi({ circleName: newCircleName.trim() });
      setSuccess(`🎉 Family "${created.circleName}" created successfully!`);
      setNewCircleName('');
      await loadMyCircles();
      if (created?._id) setSelectedCircleId(created._id);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to create circle');
    } finally {
      setActiveAction(null);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    clearFlash();
    if (!selectedCircleId) return setError('Please select a circle first');

    const ok = window.confirm(`Are you sure you want to remove ${memberName} from this family?`);
    if (!ok) return;

    setActiveAction(`remove_${memberId}`); 
    try {
      await removeMemberFromCircleApi(selectedCircleId, memberId);
      setSuccess(`🗑️ ${memberName} removed successfully.`);
      await loadCircleDetails(selectedCircleId);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to remove member');
    } finally {
      setActiveAction(null);
    }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault();
    clearFlash();
    if (!inviteEmail.trim()) return setError('Please enter an email address.');

    setActiveAction('sendInvite'); 
    try {
      const res = await sendFamilyInviteApi(selectedCircleId, { email: inviteEmail.trim() });
      setSuccess(`📨 ${res.message}`);
      setInviteEmail('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send invite. Ensure the user is registered.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleDeleteCircle = async () => {
    clearFlash();
    const confirmName = window.prompt(`DANGER ZONE: Are you sure you want to delete "${selectedCircle?.circleName}" permanently?\n\nType the family name to confirm:`);
    
    if (confirmName !== selectedCircle?.circleName) {
      if (confirmName !== null) setError('Family name did not match. Deletion cancelled.');
      return;
    }

    setActiveAction('deleteCircle'); 
    try {
      await deleteCircleApi(selectedCircleId);
      setSuccess(`🗑️ Family "${selectedCircle?.circleName}" has been deleted.`);
      
      const data = await getMyCirclesApi();
      const list = Array.isArray(data) ? data : [];
      setCircles(list);
      
      if (list.length > 0) {
        setSelectedCircleId(list[0]._id);
      } else {
        setSelectedCircleId('');
        setSelectedCircle(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete family circle.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleGenerateInvite = async () => {
    clearFlash();
    setActiveAction('generateLink'); 
    try {
      const data = await generateInviteLinkApi(selectedCircleId);
      const fullUrl = `${window.location.origin}/invite/${data.token}`;
      setInviteLink(fullUrl);
      setShowInviteModal(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate invite link');
    } finally {
      setActiveAction(null);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    const code = selectedCircle?.familyCode || user?.familyCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const familyName = selectedCircle?.circleName || selectedCircle?.name || 'Your Family';

  const activeTabStyle = { background: '#fff', color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontWeight: '700', borderRadius: '8px', padding: '8px 12px', flex: 1, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };
  const inactiveTabStyle = { background: 'transparent', color: '#64748b', fontWeight: '600', borderRadius: '8px', padding: '8px 12px', flex: 1, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '50px 20px', textAlign: 'center', color: '#fff', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {loadingCircleDetails ? 'Loading...' : `${familyName} Vault`}
        </h1>
        <p style={{ margin: '12px auto 0', fontSize: '1.1rem', color: '#bfdbfe', maxWidth: '600px' }}>
          Welcome, {user?.name?.split(' ')[0] || 'User'}. Choose a room to enter your family's private space.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '-30px auto 40px', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', position: 'relative', zIndex: 10 }}>
        
        {/* 🔥 ANIMATED CARDS */}
        <Link to="/vault-stories" style={{ textDecoration: 'none' }}>
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(0,0,0,0.08)', borderColor: '#d1d5db' }} 
            whileTap={{ scale: 0.98 }} 
            style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', height: '100%', transition: 'border-color 0.2s' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📸</div>
            <h2 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.2rem' }}>Vault Stories</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Share private family photos and memories.</p>
          </motion.div>
        </Link>

        <Link to="/vault" style={{ textDecoration: 'none' }}>
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(0,0,0,0.08)', borderColor: '#d1d5db' }} 
            whileTap={{ scale: 0.98 }} 
            style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', height: '100%', transition: 'border-color 0.2s' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
            <h2 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.2rem' }}>Family Chat</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Secure, encrypted real-time messaging room.</p>
          </motion.div>
        </Link>

        <Link to="/radar" style={{ textDecoration: 'none' }}>
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(0,0,0,0.08)', borderColor: '#d1d5db' }} 
            whileTap={{ scale: 0.98 }} 
            style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', height: '100%', transition: 'border-color 0.2s' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📡</div>
            <h2 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.2rem' }}>Live Radar</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Track family locations and activity.</p>
          </motion.div>
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>⚙️ Family Management</h2>
          
          {circles.length > 0 && (
            <select 
              value={selectedCircleId} 
              onChange={(e) => setSelectedCircleId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: '600', color: '#374151', cursor: 'pointer', outline: 'none' }}
            >
              {circles.map(c => <option key={c._id} value={c._id}>{c.circleName || c.name}</option>)}
            </select>
          )}
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5', fontWeight: '500' }}>{error}</div>}
        {success && <div style={{ background: '#ecfdf5', color: '#059669', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #6ee7b7', fontWeight: '500' }}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#111827' }}>👥 Members in {familyName}</h3>
            
            {loadingCircleDetails ? <p style={{ color: '#6b7280' }}>Loading members...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedCircle?.members?.map(m => {
                  const isSelf = String(m._id) === String(user?._id);
                  const isThisMemberAdmin = String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(m._id);
                  const isRemovingThis = activeAction === `remove_${m._id}`;

                  return (
                    <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isSelf ? '#eff6ff' : '#f8fafc', borderRadius: '12px', border: `1px solid ${isSelf ? '#bfdbfe' : '#f1f5f9'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={m.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="DP" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                            {m.name} {isSelf && <span style={{ color: '#2563eb' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {m.email} 
                            {isThisMemberAdmin && <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }}>👑 Admin</span>}
                          </div>
                        </div>
                      </div>

                      {isCircleAdmin && !isThisMemberAdmin && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveMember(m._id, m.name)}
                          disabled={!!activeAction} 
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background 0.2s', opacity: isRemovingThis ? 0.6 : 1 }}
                        >
                          {isRemovingThis ? '...' : 'Remove'}
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {selectedCircleId && (
              <UpcomingEventsWidget circleId={selectedCircleId} />
            )}
            
            {isCircleAdmin ? (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#111827' }}>➕ Invite Members</h3>
                
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '20px', gap: '4px' }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setInviteTab('magic')} style={inviteTab === 'magic' ? activeTabStyle : inactiveTabStyle}>🪄 Magic Link</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setInviteTab('direct')} style={inviteTab === 'direct' ? activeTabStyle : inactiveTabStyle}>📨 Direct</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setInviteTab('code')} style={inviteTab === 'code' ? activeTabStyle : inactiveTabStyle}>🔑 Code</motion.button>
                </div>

                {inviteTab === 'magic' && (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>Generate a secure link or QR code to let members join instantly.</p>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerateInvite} 
                      disabled={!!activeAction} 
                      style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '14px', transition: 'all 0.2s', opacity: activeAction === 'generateLink' ? 0.7 : 1 }}
                    >
                      {activeAction === 'generateLink' ? 'Generating...' : 'Generate Magic Invite'}
                    </motion.button>
                  </div>
                )}

                {inviteTab === 'direct' && (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>Send a join request directly to a registered user's notification bell.</p>
                    <form onSubmit={handleSendDirectInvite} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="email" placeholder="User's email..." 
                        value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} 
                        required 
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                      />
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        disabled={!!activeAction} 
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: activeAction === 'sendInvite' ? 0.7 : 1 }}
                      >
                        {activeAction === 'sendInvite' ? '...' : 'Send'}
                      </motion.button>
                    </form>
                  </div>
                )}

                {inviteTab === 'code' && (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>Share this short code for manual signups on the registration page.</p>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '1px' }}>
                        {selectedCircle?.familyCode || user?.familyCode || '---'}
                      </span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyCode} 
                        style={{ background: codeCopied ? '#10b981' : '#e2e8f0', color: codeCopied ? '#fff' : '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background 0.2s' }}
                      >
                        {codeCopied ? 'Copied!' : 'Copy Code'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '30px', marginBottom: '8px' }}>🔒</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '1.1rem' }}>Admin Access Required</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Only the family admin can invite members or manage settings.</p>
              </div>
            )}

            {isCircleAdmin && selectedCircleId && (
              <div style={{ background: '#fef2f2', borderRadius: '20px', padding: '20px', border: '1px dashed #f87171' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#b91c1c' }}>🚨 Danger Zone</h3>
                <p style={{ color: '#7f1d1d', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>Permanently delete this family circle. This action cannot be undone.</p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteCircle} 
                  disabled={!!activeAction}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s', opacity: activeAction === 'deleteCircle' ? 0.7 : 1 }}
                >
                  {activeAction === 'deleteCircle' ? 'Deleting...' : 'Delete Family Vault'}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🪄 ANIMATED MAGIC INVITE MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.4 }}
              style={{ background: '#fff', borderRadius: '32px', width: '100%', maxWidth: '400px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center', position: 'relative' }}
            >
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: '#e2e8f0' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowInviteModal(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </motion.button>
              <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Scan to Join</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Have them scan this QR code or share the link below. Valid for 48 hours.</p>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '24px', display: 'inline-block', border: '2px dashed #cbd5e1', marginBottom: '24px' }}>
                <QRCodeSVG value={inviteLink} size={180} fgColor="#0f172a" />
              </div>

              <div style={{ background: '#f1f5f9', borderRadius: '12px', display: 'flex', padding: '6px', border: '1px solid #e2e8f0' }}>
                <input type="text" value={inviteLink} readOnly style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px', fontSize: '13px', color: '#475569', outline: 'none' }} />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink} 
                  style={{ background: linkCopied ? '#10b981' : '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  {linkCopied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎬 VAULT GATEWAY COMPONENT */}
      {showGateway && <VaultGateway onClose={handleCloseGateway} />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default DashboardPage;