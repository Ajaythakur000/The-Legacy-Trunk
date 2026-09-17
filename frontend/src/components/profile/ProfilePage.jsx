import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileApi } from '../../api/authApi';
import FamilyLegacyCard from './FamilyLegacyCard';
import ActivityHeatmap from './ActivityHeatmap';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const getSafeDateString = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

// ─── Comic Background Elements ─────────────────────────────────────────────────
function ComicBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', top: '15%', left: '10%', fontSize: 60, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>👤</motion.div>
      <motion.div animate={{ rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '50%', right: '5%', fontSize: 70, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>⭐</motion.div>
      <motion.div animate={{ rotate: [0, 5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', bottom: '20%', left: '8%', fontSize: 50, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>🔥</motion.div>
    </div>
  );
}

// ─── Logo Badge ────────────────────────────────────────────────────────────────
function LogoBadge({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#D4B895', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', overflow: 'hidden', /* removed spin */ }}>
        <div style={{ width: '120%', height: '120%', background: '#C89B3C', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
      </div>
      <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: '50%', background: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 26 }}>LT</div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Comic Input ───────────────────────────────────────────────────────────────
function ComicInput({ label, type = 'text', name, value, onChange, placeholder, icon, as: Tag = 'input', rows, maxLength, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', marginBottom: 6 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 16, top: Tag === 'input' ? '50%' : 20, transform: Tag === 'input' ? 'translateY(-50%)' : 'none', fontSize: 18, zIndex: 1 }}>
            {icon}
          </div>
        )}
        <Tag
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} rows={rows} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ 
            width: '100%', padding: icon ? '14px 16px 14px 44px' : '14px 16px', 
            background: '#FFF', border: 'none', borderRadius: 12, 
            color: '#3E2723', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, 
            outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            boxShadow: focused ? '6px 6px 0px 0px #C89B3C' : '4px 4px 0px 0px #3E2723',
            transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all .2s'
          }}
        >
          {children}
        </Tag>
      </div>
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, fetchFreshProfile } = useAuth();
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
    dateOfBirth: getSafeDateString(user?.dateOfBirth),
    familyRole: 'Family Member',
  });

  const familyPoints = user?.bondPoints || 0;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') { setIsEditing(true); navigate('/profile', { replace: true }); }
  }, [location, navigate]);

  useEffect(() => {
    setImagePreview(user?.avatar || '');
    setFormData(prev => ({ ...prev, name: user?.name || '', bio: user?.bio || '', dateOfBirth: getSafeDateString(user?.dateOfBirth) }));
  }, [user]);

  useEffect(() => {
    if (isEditing) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isEditing]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
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
      if (formData.avatarFile) submitData.append('avatar', formData.avatarFile);
      
      await updateUserProfileApi(submitData);
      await fetchFreshProfile();
      toast.success('Profile Updated! 💥');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      <ComicBackground />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10, padding: '0 20px' }}>

        {/* ── Page Header ── */}
        <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
          <LogoBadge size={100} />
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#FDFBF7', letterSpacing: 2, margin: '20px 0 10px' }}>
            YOUR PROFILE
          </motion.h1>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#3E2723', margin: '0 auto', background: '#C89B3C', display: 'inline-block', padding: '4px 16px', border: 'none', borderRadius: 8, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(2deg)' }}>
            The legend behind the memories
          </p>
        </div>

        {/* ── Main Card ── */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <div style={{
              background: '#FFF', border: '6px solid #3E2723', borderRadius: 24,
              display: 'flex', flexWrap: 'wrap', overflow: 'hidden', marginBottom: 32,
              boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)',
            }}
          >
            {/* ── LEFT: Profile ── */}
            <div style={{ flex: '1 1 360px', padding: '40px', borderRight: '6px solid #3E2723', position: 'relative', background: '#D4B895' }}>
              <button
                onClick={() => setIsEditing(true)} title="Edit Profile"
                style={{ position: 'absolute', top: 20, left: 20, width: 44, height: 44, borderRadius: 12, background: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px #3E2723'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px #3E2723'; }}
              >
                ✏️
              </button>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, marginTop: 20 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: 120, height: 120, borderRadius: '50%', border: 'none', objectFit: 'cover', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', background: '#FFF' }} />
                  ) : (
                    <div style={{ width: 120, height: 120, borderRadius: '50%', border: 'none', background: '#1E352F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 48, color: '#FFF', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)' }}>
                      {initials}
                    </div>
                  )}
                </div>

                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3E2723', margin: '0 0 4px', letterSpacing: 1 }}>{user?.name}</h2>
                  <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#3E2723', margin: '0 0 12px' }}>{user?.email}</p>
                  <div style={{ display: 'inline-block', padding: '4px 12px', background: '#C89B3C', border: 'none', borderRadius: 8, fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                    {formData.familyRole}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div style={{ background: '#FFF', border: '4px dashed #3E2723', borderRadius: 16, padding: 20, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -15, left: -10, fontSize: 32, transform: 'rotate(-10deg)' }}>💬</span>
                <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: '#3E2723', lineHeight: 1.6 }}>
                  {user?.bio || 'Preserving our family legacy, one story at a time.'}
                </span>
              </div>
            </div>

            {/* ── RIGHT: Legacy Card ── */}
            <div style={{ flex: '1 1 420px', padding: '40px', display: 'flex', alignItems: 'center', background: '#FFF' }}>
              <FamilyLegacyCard familyPoints={familyPoints} />
            </div>
          </div>
        </motion.div>

        {/* ── Heatmap ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <ActivityHeatmap activityMap={user?.activityMap || user?.activityMapData || {}} maxStreak={user?.maxStreak || 0} />
        </motion.div>
      </div>

      {/* ── Edit Modal ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: 20 }}
              onClick={e => { if (e.target === e.currentTarget) setIsEditing(false); }}
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -2 }} animate={{ scale: 1, rotate: 2 }} exit={{ scale: 0.8, rotate: -2 }} transition={{ type: 'spring', bounce: 0.5 }}
                style={{ background: '#D4B895', border: '6px solid #3E2723', borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)', padding: '40px' }}
              >
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#1E352F', color: '#FFF', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3E2723', margin: '0' }}>EDIT PROFILE ✏️</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Avatar picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      style={{ width: 120, height: 120, borderRadius: '50%', border: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)' }}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: '#3E2723' }}>{initials}</span>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, width: '100%', background: '#3E2723', color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 14, textAlign: 'center', padding: '4px 0' }}>CHANGE</div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>

                  <ComicInput label="FULL NAME" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your name" />
                  
                  <ComicInput label="FAMILY ROLE" name="familyRole" value={formData.familyRole} onChange={handleInputChange} as="select">
                    <option value="Family Member">Family Member</option>
                    <option value="The Patriarch">The Patriarch</option>
                    <option value="The Matriarch">The Matriarch</option>
                    <option value="The Guardian">The Guardian</option>
                    <option value="The Explorer">The Explorer</option>
                  </ComicInput>

                  <ComicInput label="BIO" name="bio" value={formData.bio} onChange={handleInputChange} as="textarea" rows={3} maxLength={150} placeholder="Who are you?" />

                  <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '16px', background: '#FFF', border: 'none', borderRadius: 12, color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                      CANCEL
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '16px', background: '#00C853', border: 'none', borderRadius: 12, color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 20, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                      {loading ? 'SAVING...' : 'SAVE CHANGES! 💥'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default ProfilePage;