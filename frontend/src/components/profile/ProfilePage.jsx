import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileApi } from '../../api/authApi';

// 🔥 Nayi file yahan import kar li hai
import FamilyLegacyCard from './FamilyLegacyCard';

function ProfilePage() {
  const { user } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.avatar || '');

  // Ek ref file input ko programmatically click karne ke liye
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarFile: null, 
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });

  // ==========================================
  // 🛡️ FAMILY COLLECTIVE: BOND POINTS
  // ==========================================
  // Sirf points nikalenge, baaki saara design/logic FamilyLegacyCard handle karega
  const familyPoints = user?.bondPoints || 0;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 Image handle karne ka function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      
      // FileReader se preview dikhane ke liye URL banate hain
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
      // KYUNKI IMAGE HAI, TOH FORMDATA USE KARNA PADEGA
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('bio', formData.bio);
      submitData.append('dateOfBirth', formData.dateOfBirth);
      
      // Agar nayi image choose ki hai, toh hi bhejo
      if (formData.avatarFile) {
        submitData.append('avatar', formData.avatarFile);
      }

      await updateUserProfileApi(submitData); // API ko FormData bhejo
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
        {/* Yahan humne naya component call kiya aur points pass kar diye */}
        <FamilyLegacyCard familyPoints={familyPoints} />

      </div>

      {/* 🛠️ EDIT PROFILE MODAL */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          
          <div style={{ background: '#fff', borderRadius: '32px', width: '100%', maxWidth: '500px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease-out' }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#111827', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', fontSize: '1.8rem', fontWeight: '900' }}>Edit Profile</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 🔥 IMAGE UPLOAD SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    width: '120px', height: '120px', borderRadius: '50%', border: '4px dashed #e2e8f0', 
                    overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#f8fafc',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '24px', color: '#94a3b8' }}>📸</span>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>
                    Edit
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} // Hidden input
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>Bio (Short & Sweet)</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" maxLength="150" style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '16px', resize: 'none', outline: 'none', background: '#f8fafc' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', background: '#f8fafc' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '14px 28px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '14px 28px', background: '#111827', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontSize: '15px' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;