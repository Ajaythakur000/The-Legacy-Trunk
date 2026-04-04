import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  addMemberToCircleApi,
  createCircleApi,
  getCircleByIdApi,
  getMyCirclesApi,
  removeMemberFromCircleApi,
} from '../../api/circleApi';

function DashboardPage() {
  const { user, switchActiveCircle } = useAuth();

  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState(user?.activeCircleId || '');
  const [selectedCircle, setSelectedCircle] = useState(null);

  const [newCircleName, setNewCircleName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const [loadingCircles, setLoadingCircles] = useState(false);
  const [loadingCircleDetails, setLoadingCircleDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // 🛡️ ROLE CHECKS
  // 1. Is the logged-in user an overall 'admin' account?
  const isGlobalAdmin = user?.role === 'admin';
  
  // 2. Is the logged-in user the admin of the CURRENTLY selected circle?
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

      // Agar selectedCircleId nahi hai, toh pehla circle select kar lo
      if (!selectedCircleId && list.length > 0) {
        setSelectedCircleId(list[0]._id);
      }
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
    loadMyCircles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCircleId) {
      loadCircleDetails(selectedCircleId);
      // Optional: Agar tu chahta hai dashboard pe circle change karte hi pura app change ho jaye
      if (selectedCircleId !== user?.activeCircleId) {
        switchActiveCircle(selectedCircleId);
      }
    } else {
      setSelectedCircle(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCircleId]);

  // 🟢 ACTION: CREATE CIRCLE
  const handleCreateCircle = async (e) => {
    e.preventDefault();
    clearFlash();
    if (!newCircleName.trim()) return setError('Circle name is required');

    setActionLoading(true);
    try {
      const created = await createCircleApi({ circleName: newCircleName.trim() });
      setSuccess(`🎉 Family "${created.circleName}" created successfully!`);
      setNewCircleName('');
      await loadMyCircles();
      if (created?._id) setSelectedCircleId(created._id);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to create circle');
    } finally {
      setActionLoading(false);
    }
  };

  // 🟢 ACTION: ADD MEMBER
  const handleAddMember = async (e) => {
    e.preventDefault();
    clearFlash();
    if (!selectedCircleId) return setError('Please select a circle first');
    if (!memberEmail.trim()) return setError('Member email is required');

    setActionLoading(true);
    try {
      await addMemberToCircleApi(selectedCircleId, { email: memberEmail.trim() });
      setSuccess('✅ Member added successfully to the family.');
      setMemberEmail('');
      await loadCircleDetails(selectedCircleId);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔴 ACTION: REMOVE MEMBER
  const handleRemoveMember = async (memberId, memberName) => {
    clearFlash();
    if (!selectedCircleId) return setError('Please select a circle first');

    const ok = window.confirm(`Are you sure you want to remove ${memberName} from this family?`);
    if (!ok) return;

    setActionLoading(true);
    try {
      await removeMemberFromCircleApi(selectedCircleId, memberId);
      setSuccess(`🗑️ ${memberName} removed successfully.`);
      await loadCircleDetails(selectedCircleId);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (user?.familyCode) {
      navigator.clipboard.writeText(user.familyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const familyName = selectedCircle?.circleName || selectedCircle?.name || 'Your Family';

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 🌟 HERO BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '50px 20px', textAlign: 'center', color: '#fff', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {loadingCircleDetails ? 'Loading...' : `${familyName} Vault`}
        </h1>
        <p style={{ margin: '12px auto 0', fontSize: '1.1rem', color: '#bfdbfe', maxWidth: '600px' }}>
          Welcome, {user?.name?.split(' ')[0] || 'User'}. Choose a room to enter your family's private space.
        </p>
      </div>

      {/* 🎴 THE 4 GRAND CARDS (The Hub) */}
      <div style={{ maxWidth: '1100px', margin: '-30px auto 40px', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', position: 'relative', zIndex: 10 }}>
        
        <Link to="/vault-stories" style={{ textDecoration: 'none' }}>
          <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', height: '100%', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📸</div>
            <h2 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.2rem' }}>Vault Stories</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Share private family photos and memories.</p>
          </div>
        </Link>

        <Link to="/vault" style={{ textDecoration: 'none' }}>
          <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', height: '100%', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
            <h2 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.2rem' }}>Family Chat</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Secure, encrypted real-time messaging room.</p>
          </div>
        </Link>

        <Link to="/radar" style={{ textDecoration: 'none' }}>
          <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', height: '100%', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📡</div>
            <h2 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.2rem' }}>Live Radar</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Track family locations and activity.</p>
          </div>
        </Link>

        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '2px dashed #cbd5e1', height: '100%', position: 'relative', opacity: 0.8 }}>
          <div style={{ position: 'absolute', top: '-10px', right: '16px', background: '#f59e0b', color: '#fff', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>COMING SOON</div>
          <div style={{ fontSize: '36px', marginBottom: '12px', filter: 'grayscale(100%)' }}>🕰️</div>
          <h2 style={{ margin: '0 0 6px 0', color: '#4b5563', fontSize: '1.2rem' }}>Memory Lane</h2>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>A visual timeline of your family history.</p>
        </div>
      </div>

      {/* ⚙️ SETTINGS & MANAGEMENT SECTION */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>⚙️ Family Management</h2>
          
          {/* Circle Switcher for Admin (or Members in multiple families) */}
          {circles.length > 1 && (
            <select 
              value={selectedCircleId} 
              onChange={(e) => setSelectedCircleId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
            >
              {circles.map(c => <option key={c._id} value={c._id}>{c.circleName || c.name}</option>)}
            </select>
          )}
        </div>

        {/* ALERTS */}
        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5', fontWeight: '500' }}>{error}</div>}
        {success && <div style={{ background: '#ecfdf5', color: '#059669', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #6ee7b7', fontWeight: '500' }}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px', '@media (max-width: 800px)': { gridTemplateColumns: '1fr' } }}>
          
          {/* LEFT: MEMBER LIST */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#111827' }}>👥 Members in {familyName}</h3>
            
            {loadingCircleDetails ? <p style={{ color: '#6b7280' }}>Loading members...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedCircle?.members?.map(m => {
                  const isSelf = String(m._id) === String(user?._id);
                  const isThisMemberAdmin = String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(m._id);

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

                      {/* Remove Button (Only for Admin, and admin cannot remove themselves here) */}
                      {isCircleAdmin && !isThisMemberAdmin && (
                        <button 
                          onClick={() => handleRemoveMember(m._id, m.name)}
                          disabled={actionLoading}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background 0.2s' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: ADMIN CONTROLS (Only visible to Admins) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. ADD MEMBER (Visible to Circle Admin) */}
            {isCircleAdmin ? (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#111827' }}>✉️ Invite Member</h3>
                
                {/* Invite Code (Optional feature for admin) */}
                {user?.familyCode && (
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Code: <b style={{ color: '#111827', fontSize: '16px' }}>{user.familyCode}</b></span>
                    <button onClick={handleCopyCode} style={{ background: copied ? '#10b981' : '#e2e8f0', color: copied ? '#fff' : '#4b5563', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}

                <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Enter family member's email" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }} />
                  <button type="submit" disabled={actionLoading} style={{ background: '#111827', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
                    {actionLoading ? 'Inviting...' : 'Send Invite'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '30px', marginBottom: '8px' }}>🔒</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '1.1rem' }}>Admin Access Required</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>Only the family admin can invite new members or manage the circle.</p>
              </div>
            )}

            {/* 2. CREATE NEW CIRCLE (Visible ONLY to Global Admins) */}
            {isGlobalAdmin && (
              <div style={{ background: 'linear-gradient(to right, #f8fafc, #eff6ff)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #bfdbfe' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e3a8a' }}>➕ Create New Family Circle</h3>
                <form onSubmit={handleCreateCircle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={newCircleName} onChange={(e) => setNewCircleName(e.target.value)} placeholder="e.g. The Thakur Extended Family" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #93c5fd', width: '100%', boxSizing: 'border-box' }} />
                  <button type="submit" disabled={actionLoading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
                    {actionLoading ? 'Creating...' : 'Create Circle'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        .dash-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important; border-color: #d1d5db !important; }
      `}</style>
    </div>
  );
}

export default DashboardPage;