import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { joinViaInviteApi } from '../../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';
import OTPVerificationModal from './OTPVerificationModal';

// ─── Logo Component ──────────────────────────────────────────────────────────
function StickerLogo() {
  return (
    <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 16px', zIndex: 2 }}>
      <motion.div
        whileHover={{ rotate: -5, scale: 1.05 }}
        style={{
          width: '100%', height: '100%', borderRadius: '50%', background: '#D4B895',
          border: 'none', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          transform: 'rotate(4deg)', transition: 'transform 0.2s ease',
        }}
      >
        <img src="/finall_logo.png" alt="The Legacy Trunk" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 26 }}>LT</div>
      </motion.div>
      <div style={{
        position: 'absolute', top: -10, left: -20, background: '#C89B3C', color: '#3E2723',
        border: 'none', borderRadius: '8px', padding: '4px 8px',
        fontFamily: "'Playfair Display', serif", fontSize: 14, transform: 'rotate(-12deg)', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)'
      }}>
        NEW!
      </div>
    </div>
  );
}

// ─── Comic Input Field ───────────────────────────────────────────────────────
function ComicInput({ type = 'text', name, placeholder, value, onChange, required, icon, label }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div style={{ textAlign: 'left', marginBottom: '12px' }}>
      {label && <label style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', marginBottom: 4, letterSpacing: '1px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, zIndex: 2 }}>
            {icon}
          </div>
        )}
        <input
          type={type === 'password' && showPassword ? 'text' : type} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: `14px ${type === 'password' ? '45px' : '16px'} 14px ${icon ? '44px' : '16px'}`,
            background: '#FFFFFF', border: 'none', borderRadius: '12px',
            color: '#3E2723', fontFamily: "'Baloo 2',sans-serif", fontWeight: 600, fontSize: 16, outline: 'none', boxSizing: 'border-box',
            boxShadow: focused ? '6px 6px 0px 0px #D4B895' : '4px 4px 0px 0px #3E2723',
            transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all 0.2s ease',
          }}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 2 }}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Comic Select Field ──────────────────────────────────────────────────────
function ComicSelect({ label, name, value, onChange, icon, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ textAlign: 'left', marginBottom: '12px' }}>
      {label && <label style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', marginBottom: 4, letterSpacing: '1px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, zIndex: 2 }}>{icon}</div>}
        <select
          name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: `14px 36px 14px ${icon ? '44px' : '16px'}`,
            background: '#FFFFFF', border: 'none', borderRadius: '12px',
            color: '#3E2723', fontFamily: "'Baloo 2',sans-serif", fontWeight: 600, fontSize: 16, outline: 'none', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
            boxShadow: focused ? '6px 6px 0px 0px #D4B895' : '4px 4px 0px 0px #3E2723',
            transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all 0.2s ease',
          }}
        >
          {options.map(o => ( <option key={o.value} value={o.value}>{o.label}</option> ))}
        </select>
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#3E2723', fontSize: 14, fontWeight: 'bold' }}>▼</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('inviteToken');

  const [form, setForm] = useState({ name: '', email: '', password: '', role: inviteToken ? 'member' : 'admin', familyCode: '', relationToAdmin: '' });
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const isAdmin = form.role === 'admin';
  const isFormLoading = loading || actionLoading;

  useEffect(() => { if (inviteToken) setForm(prev => ({ ...prev, role: 'member', familyCode: '' })); }, [inviteToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'role' && value === 'admin') { next.familyCode = ''; next.relationToAdmin = 'Admin'; }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setActionLoading(true);
    try {
      const payload = {
        name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role,
        relationToAdmin: isAdmin ? 'Admin' : form.relationToAdmin?.trim() || '',
        ...(!isAdmin && !inviteToken && form.familyCode ? { familyCode: form.familyCode.trim().toUpperCase() } : {}),
      };
      const result = await signup(payload);
      if (result.success || (result.data && result.data.requireOtp)) {
        if (inviteToken) { try { await joinViaInviteApi(inviteToken); } catch (err) { console.error('Auto-join failed', err); } }
        setRegisteredEmail(form.email); setShowOtpModal(true); setActionLoading(false); return;
      }
      setError(result.message || 'Registration failed.');
    } catch { setError('Something went wrong during signup.'); } finally { setActionLoading(false); }
  };

  const handleOtpSuccess = () => { setShowOtpModal(false); window.location.href = '/dashboard'; };

  const iconUser = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
  const iconEmail = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" /></svg>;
  const iconLock = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
  const iconRole = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  const iconKey = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><circle cx="7.5" cy="15.5" r="4.5" /><path d="M21 2l-9.6 9.6M15 8l2 2" /></svg>;
  const iconHeart = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      
      {showOtpModal && <OTPVerificationModal email={registeredEmail} onSuccess={handleOtpSuccess} onClose={() => setShowOtpModal(false)} />}

      <motion.div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px' }}
        initial={{ scale: 0.8, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
      >
        <div style={{ background: '#FFFFFF', border: 'none', borderRadius: '16px', padding: '30px 40px', position: 'relative', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)' }}>
          
          <StickerLogo />

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 32, fontFamily: "'Playfair Display', serif", color: '#A0522D' }}>START A SCRAPBOOK</h2>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#3E2723' }}>Gather the family. Post the memories.</p>
          </div>

          <AnimatePresence>
            {inviteToken && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: '#C89B3C', border: 'none', borderRadius: 8, padding: '10px', marginBottom: 16, textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                YOU HAVE A SECRET INVITE!
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: '#1E352F', border: 'none', borderRadius: 8, padding: '10px', marginBottom: 16, textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#FFF', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
                ERROR: {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <ComicInput label="FULL NAME" name="name" placeholder="E.g. Cool Uncle Joe" value={form.name} onChange={handleChange} required icon={iconUser} />
            <ComicInput label="EMAIL ADDRESS" type="email" name="email" placeholder="you@family.com" value={form.email} onChange={handleChange} required icon={iconEmail} />
            <ComicInput label="PASSWORD" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required icon={iconLock} />

            {!inviteToken && (
              <ComicSelect label="WHAT'S THE PLAN?" name="role" value={form.role} onChange={handleChange} icon={iconRole}
                options={[{ value: 'admin', label: 'Start a New Family (Admin)' }, { value: 'member', label: 'Join Existing Family (Member)' }]} />
            )}

            <AnimatePresence>
              {!isAdmin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ background: '#D4B895', border: '3px dashed #3E2723', borderRadius: 12, padding: 16, marginTop: 10, marginBottom: 10 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#3E2723', marginBottom: 10, textAlign: 'center' }}>MEMBER DETAILS</div>
                    {!inviteToken && <ComicInput label="FAMILY CODE" name="familyCode" placeholder="TRUNK-XXXX" value={form.familyCode} onChange={handleChange} required icon={iconKey} />}
                    <ComicInput label="RELATION TO ADMIN" name="relationToAdmin" placeholder="E.g. Brother, Son..." value={form.relationToAdmin} onChange={handleChange} required icon={iconHeart} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={isFormLoading}
              whileHover={!isFormLoading ? { scale: 1.02 } : {}} whileTap={!isFormLoading ? { scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' } : {}}
              style={{
                width: '100%', padding: '16px', marginTop: 10,
                background: isFormLoading ? '#ccc' : '#A0522D', border: 'none', borderRadius: 12,
                color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, letterSpacing: 2,
                cursor: isFormLoading ? 'not-allowed' : 'pointer', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', transition: 'box-shadow 0.1s, transform 0.1s'
              }}>
              {isFormLoading ? 'PACKING BAGS...' : 'JOIN THE FAMILY!'}
            </motion.button>

            <p style={{ margin: '20px 0 0', fontWeight: 700, fontSize: 15, color: '#3E2723', textAlign: 'center' }}>
              Already a member? <Link to="/login" style={{ color: '#FDFBF7', textDecoration: 'underline', fontFamily: "'Playfair Display', serif", fontSize: 18 }}>LOG IN HERE</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;