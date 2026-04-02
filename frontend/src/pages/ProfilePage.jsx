import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfileApi } from '../api/authApi'; // Path apne hisaab se check kar lena


function ProfilePage() {
  const { user } = useAuth(); // Context se user data liya
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfileApi(formData);
      // 🔥 Update success hone par page reload kar denge taaki naya data aa jaye
      // (Ideal tareeka context update karna hai, par reload fast win hai)
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
  

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* 🏆 PROFILE CARD */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          
          {/* Decorative background banner */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', zIndex: 0 }}></div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
            
            {/* 📸 AVATAR */}
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '6px solid #fff', overflow: 'hidden', backgroundColor: '#e5e7eb', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <img 
                src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* 📝 USER INFO */}
            <h1 style={{ margin: '16px 0 4px 0', fontSize: '2rem', color: '#111827', fontWeight: '800' }}>
              {user?.name}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>{user?.email}</p>

            {/* 🔥 AURA BADGE (Placeholder for Day 3) */}
            <div style={{ marginTop: '16px', background: '#fef3c7', color: '#d97706', padding: '8px 16px', borderRadius: '999px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fde68a' }}>
              <span>🌱</span> Aura Points: 0
            </div>

            {/* BIO */}
            <p style={{ marginTop: '24px', textAlign: 'center', color: '#4b5563', maxWidth: '500px', lineHeight: '1.6', fontSize: '1.1rem', fontStyle: 'italic' }}>
              "{user?.bio || 'Hey there! I am using FamilyVault.'}"
            </p>

            {/* BUTTON */}
            <button 
              onClick={() => setIsEditing(true)}
              style={{ marginTop: '30px', padding: '10px 24px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              ✏️ Edit Profile
            </button>

          </div>
        </div>
      </div>

      {/* 🛠️ EDIT PROFILE MODAL (Popup) */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ marginTop: 0, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>Edit Profile</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Bio (Short & Sweet)</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" maxLength="150" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', resize: 'vertical' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Profile Photo URL</label>
                <input type="text" name="avatar" value={formData.avatar} onChange={handleInputChange} placeholder="Paste an image link here..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }} />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>*Cloudinary upload abhi backend me add karenge, tab tak koi bhi image URL daal de.</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
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