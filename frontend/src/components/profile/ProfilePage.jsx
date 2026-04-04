import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileApi } from '../../api/authApi';

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

  // ==========================================
  // 💎 BOND POINTS & PREMIUM BADGE LOGIC
  // ==========================================
  const bondPoints = user?.bondPoints || 0;

  const getBadgeInfo = (points) => {
    if (points < 50) return { title: ' ֎ Fresh Spark', next: 50, color: '#059669', bg: '#d1fae5', msg: 'A new energy in the family!' };
    if (points < 200) return { title: '🔥 Active Soul', next: 200, color: '#ea580c', bg: '#ffedd5', msg: 'Keeping the family connected and alive!' };
    if (points < 500) return { title: '🏛️ Family Pillar', next: 500, color: '#4f46e5', bg: '#e0e7ff', msg: 'The strong foundation everyone relies on.' };
    return { title: '👑 Legacy Keeper', next: 'MAX', color: '#7c3aed', bg: '#ede9fe', msg: 'The ultimate guardian of family memories!' };
  };

  const badge = getBadgeInfo(bondPoints);
  
  // Progress Bar Calculation
  const progressPercent = badge.next === 'MAX' ? 100 : Math.min((bondPoints / badge.next) * 100, 100);
  // ==========================================

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfileApi(formData);
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
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px 30px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          
          {/* Decorative background banner */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', zIndex: 0 }}></div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
            
            {/* 📸 AVATAR */}
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '6px solid #fff', overflow: 'hidden', backgroundColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
              <img 
                src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* 📝 USER INFO */}
            <h1 style={{ margin: '16px 0 4px 0', fontSize: '2.2rem', color: '#111827', fontWeight: '800' }}>
              {user?.name}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem', fontWeight: '600' }}>{user?.email}</p>

            {/* BIO */}
            <p style={{ marginTop: '20px', textAlign: 'center', color: '#374151', maxWidth: '500px', lineHeight: '1.6', fontSize: '1.1rem', fontStyle: 'italic' }}>
              "{user?.bio || 'Hey there! I am using FamilyVault.'}"
            </p>

            {/* EDIT BUTTON */}
            <button 
              onClick={() => setIsEditing(true)}
              style={{ marginTop: '24px', padding: '10px 24px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* 💎 GAMIFICATION CARD (THE BOND ENGINE) */}
        <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', borderRadius: '24px', padding: '32px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '120px', opacity: 0.05, transform: 'rotate(15deg)' }}>⋆✴︎˚｡⋆</div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#9ca3af', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Legacy Status</h2>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '1', color: '#fcd34d', textShadow: '0 4px 15px rgba(252, 211, 77, 0.3)' }}>{bondPoints}</div>
              <div style={{ paddingBottom: '10px', fontSize: '1.3rem', color: '#f3f4f6', fontWeight: '600' }}>Bond Points</div>
            </div>

            {/* Premium Badge Display */}
            <div style={{ display: 'inline-block', background: badge.bg, color: badge.color, padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '1.2rem', marginBottom: '12px', border: `1px solid ${badge.color}` }}>
              {badge.title}
            </div>
            <p style={{ margin: '0 0 28px 0', color: '#d1d5db', fontSize: '1rem', fontStyle: 'italic' }}>"{badge.msg}"</p>

            {/* 📊 Premium Progress Bar */}
            {badge.next !== 'MAX' ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', fontWeight: '700', color: '#e5e7eb' }}>
                  <span>Level Progress</span>
                  <span>{bondPoints} / {badge.next}</span>
                </div>
                
                {/* The Bar Background */}
                <div style={{ width: '100%', background: 'rgba(0,0,0,0.5)', height: '14px', borderRadius: '99px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                  {/* The Animated Fill */}
                  <div style={{ 
                    width: `${progressPercent}%`, 
                    background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)', 
                    height: '100%', 
                    borderRadius: '99px', 
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                  }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', fontSize: '0.85rem', color: '#9ca3af', fontWeight: '600' }}>
                  🔒 {badge.next - bondPoints} points to unlock next rank
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(124, 58, 237, 0.2)', padding: '16px', borderRadius: '12px', color: '#ddd6fe', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
                🎉 You have reached the maximum rank! You are a true legend.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🛠️ EDIT PROFILE MODAL (Kept Exactly as You Built It) */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#111827', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', fontSize: '1.5rem', fontWeight: '800' }}>Edit Profile</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Bio (Short & Sweet)</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" maxLength="150" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', resize: 'vertical', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Profile Photo URL</label>
                <input type="text" name="avatar" value={formData.avatar} onChange={handleInputChange} placeholder="Paste an image link here..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px', display: 'block', fontStyle: 'italic' }}>*Cloudinary upload abhi backend me add karenge, tab tak koi bhi image URL daal de.</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#e5e7eb'} onMouseOut={(e) => e.target.style.background = '#f3f4f6'}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.2s' }} onMouseOver={(e) => !loading && (e.target.style.background = '#1d4ed8')} onMouseOut={(e) => !loading && (e.target.style.background = '#2563eb')}>
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