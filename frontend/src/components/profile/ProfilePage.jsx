import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileApi } from '../../api/authApi';
import FamilyLegacyCard from './FamilyLegacyCard';
import ActivityHeatmap from './ActivityHeatmap';

function ProfilePage() {
  const { user } = useAuth(); 
  const location = useLocation(); 
  const navigate = useNavigate(); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.avatar || '');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarFile: null, 
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    familyRole: 'Family Member', // Added Family Role (UI Only for now)
  });

  const familyPoints = user?.bondPoints || 0;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') {
      setIsEditing(true);
      navigate('/profile', { replace: true }); 
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
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
      
      if (formData.avatarFile) {
        submitData.append('avatar', formData.avatarFile);
      }

      await updateUserProfileApi(submitData); 
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '60px 32px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* 🗑️ REMOVED WATERMARK TO KEEP IT CLEAN */}

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* 👑 THE SINGLE ROYAL VAULT PASSPORT CARD */}
        <div style={{ 
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: '32px', 
          border: '1px solid rgba(234, 221, 205, 0.1)', 
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)', 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          overflow: 'hidden',
          marginBottom: '40px',
          position: 'relative'
        }}>
          
          {/* LEFT: IDENTITY SECTION */}
          <div style={{ flex: '1 1 400px', padding: '50px 40px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            
            {/* ✏️ MOVED EDIT BUTTON TO LEFT SIDE TO PREVENT OVERLAP */}
            <button 
              onClick={() => setIsEditing(true)}
              title="Edit Profile Settings"
              style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.3s ease', zIndex: 20 }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              ✏️
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', marginTop: '20px' }}>
              <div style={{ width: '130px', height: '130px', borderRadius: '50%', border: '4px solid #EADDCD', padding: '4px', background: 'transparent' }}>
                <img src={user?.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: '0 0 8px 0', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>{user?.name}</h1>
                <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '1.1rem', margin: 0, letterSpacing: '0.5px' }}>{user?.email}</p>
                <div style={{ display: 'inline-block', marginTop: '12px', padding: '6px 14px', background: 'rgba(234, 221, 205, 0.1)', color: '#EADDCD', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', border: '1px solid rgba(234, 221, 205, 0.2)' }}>
                  {formData.familyRole.toUpperCase()}
                </div>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '1.15rem', fontStyle: 'italic', lineHeight: '1.7', margin: 0, borderLeft: '3px solid #EADDCD', paddingLeft: '20px' }}>
              "{user?.bio || 'Preserving our family legacy, one story at a time.'}"
            </p>
          </div>

          {/* RIGHT: STATUS SECTION */}
          <div style={{ flex: '1 1 450px', padding: '50px 40px', display: 'flex', alignItems: 'center' }}>
            <FamilyLegacyCard familyPoints={familyPoints} />
          </div>

        </div>

        {/* 🔥 THE ACTIVITY HEATMAP */}
        <ActivityHeatmap 
          activityMap={user?.activityMap || {}} 
          currentStreak={user?.currentStreak || 0}
          maxStreak={user?.maxStreak || 0}
        />
      </div>

      {/* 🛠️ THE NEW PREMIUM CENTER MODAL POP-UP */}
      {isEditing && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' 
        }}>
          
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '40px 32px', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', border: '1px solid rgba(255,255,255,0.1)',
            animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            
            {/* Modal Header */}
            <button 
              onClick={() => setIsEditing(false)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              ✕
            </button>
            <h2 style={{ margin: '0 0 32px 0', color: '#fff', fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Georgia, serif', textAlign: 'center' }}>Profile Settings</h2>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* IMAGE UPLOAD SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #EADDCD', 
                    overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#f8fafc',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'border 0.2s',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '32px', color: '#94a3b8' }}>📸</span>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', textAlign: 'center', padding: '6px 0', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Change
                  </div>
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                <span style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>Joined Vault: April 2026</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Family Role</label>
                <select name="familyRole" value={formData.familyRole} onChange={handleInputChange} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
                  <option value="Family Member">Family Member</option>
                  <option value="The Patriarch">The Patriarch</option>
                  <option value="The Matriarch">The Matriarch</option>
                  <option value="The Guardian">The Guardian</option>
                  <option value="The Explorer">The Explorer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Motto / Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" maxLength="150" style={{ ...inputStyle, resize: 'none' }} onFocus={handleFocus} onBlur={handleBlur} placeholder="Write a short quote or intro..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '14px', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', background: '#EADDCD', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(234, 221, 205, 0.3)' }} onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#fff')} onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#EADDCD')}>
                  {loading ? 'Saving...' : 'Save Vault Profile'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// PREMIUM STYLES FOR INPUTS (DARK THEME ADAPTED)
const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', background: 'rgba(0,0,0,0.2)', color: '#fff', boxSizing: 'border-box' };
const handleFocus = (e) => { e.target.style.borderColor = '#EADDCD'; e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.boxShadow = '0 0 0 2px rgba(234, 221, 205, 0.2)'; };
const handleBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; e.target.style.boxShadow = 'none'; };

export default ProfilePage;