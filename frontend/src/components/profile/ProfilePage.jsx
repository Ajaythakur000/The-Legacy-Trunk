import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileApi } from '../../api/authApi';
import FamilyLegacyCard from './FamilyLegacyCard';

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
  });

  const familyPoints = user?.bondPoints || 0;

  // Auto-open Edit Modal
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
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* 🏆 PREMIUM PROFILE CARD */}
        <div style={{ background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <div style={{ height: '160px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}></div>
          
          <div style={{ padding: '0 40px 40px', marginTop: '-80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', background: '#f3f4f6' }}>
              <img src={user?.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', margin: '20px 0 5px' }}>{user?.name}</h1>
            <p style={{ color: '#6b7280', fontWeight: '600', fontSize: '1.1rem' }}>{user?.email}</p>
            
            <p style={{ marginTop: '20px', textAlign: 'center', color: '#4b5563', maxWidth: '600px', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.6' }}>
              "{user?.bio || 'Preserving our family legacy, one story at a time.'}"
            </p>

            <button 
              onClick={() => setIsEditing(true)}
              style={{ marginTop: '30px', padding: '12px 30px', background: '#111827', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* 💎 THE IMPORTED FAMILY LEGACY CARD */}
        <FamilyLegacyCard familyPoints={familyPoints} />

      </div>

      {/* 🛠️ EDIT PROFILE MODAL (FIXED SCROLL & UI) */}
      {isEditing && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, 
          padding: '20px', 
          overflowY: 'auto' // 🔥 THIS FIXES THE SCROLL ISSUE
        }}>
          
          <div style={{ 
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '450px', 
            padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
            animation: 'fadeIn 0.2s ease-out', position: 'relative',
            marginTop: 'auto', marginBottom: 'auto' // Helps center vertically if taller than screen
          }}>
            
            {/* ✕ CLOSE BUTTON */}
            <button 
              onClick={() => setIsEditing(false)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              ✕
            </button>

            <h2 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Edit Profile</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 🔥 IMAGE UPLOAD SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #e2e8f0', 
                    overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#f8fafc',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'border 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '24px', color: '#94a3b8' }}>📸</span>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(15, 23, 42, 0.6)', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: '11px', fontWeight: '600' }}>
                    Change
                  </div>
                </div>
                <input 
                  type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" maxLength="150" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'none', outline: 'none', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontSize: '14px', transition: 'background 0.2s' }} onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#1e293b')} onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#0f172a')}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;