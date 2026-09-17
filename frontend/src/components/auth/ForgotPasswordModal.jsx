import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPasswordApi, resetPasswordApi } from '../../api/authApi';

// ─── Comic Single OTP Box ───────────────────────────────────────────────────
function ComicRuneBox({ index, value, inputRef, onChange, onKeyDown, onPaste }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text" inputMode="numeric" maxLength="1" ref={inputRef} value={value}
      onChange={(e) => onChange(e.target, index)} onKeyDown={(e) => onKeyDown(e, index)} onPaste={onPaste}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: 48, height: 56, fontSize: 28, fontWeight: 700, textAlign: 'center',
        fontFamily: "'Playfair Display', serif", background: '#FFF', border: '1px solid #3E2723', borderRadius: 8,
        color: '#3E2723', outline: 'none',
        boxShadow: focused ? '4px 4px 0px 0px #632020' : '4px 4px 0px 0px #3E2723',
        transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all 0.1s', cursor: 'text',
      }}
    />
  );
}

// ─── Comic Dark Input ─────────────────────────────────────────────────────────
function ComicDarkInput({ type = 'text', placeholder, value, onChange, required, icon }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      {icon && <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, zIndex: 2 }}>{icon}</div>}
      <input
        type={type === 'password' && showPassword ? 'text' : type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: `14px ${type === 'password' ? '45px' : '16px'} 14px ${icon ? '44px' : '16px'}`,
          background: '#FFF', border: '1px solid #3E2723', borderRadius: '12px', color: '#3E2723',
          fontFamily: "'Baloo 2',sans-serif", fontWeight: 600, fontSize: 16, outline: 'none', boxSizing: 'border-box',
          boxShadow: focused ? '4px 4px 0px 0px #8B5A2B' : '4px 4px 0px 0px #3E2723', transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all 0.2s ease',
        }}
      />
      {type === 'password' && (
        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 2 }}>{showPassword ? '🙈' : '👁️'}</button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [otpArr, setOtpArr] = useState(new Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const inputRefs = useRef([]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const n = [...otpArr]; n[index] = element.value; setOtpArr(n);
    if (element.value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (e, index) => { if (e.key === 'Backspace' && !otpArr[index] && index > 0) inputRefs.current[index - 1]?.focus(); };
  const handleOtpPaste = (e) => {
    e.preventDefault(); const chars = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (chars.some(c => isNaN(c))) return;
    const n = [...otpArr]; chars.forEach((c, i) => { n[i] = c; if (inputRefs.current[i]) inputRefs.current[i].value = c; });
    setOtpArr(n); inputRefs.current[Math.min(chars.length, 5)]?.focus();
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await forgotPasswordApi(email.trim());
      setSuccess(res.message || 'Code sent to your email!');
      setTimeout(() => { setSuccess(''); setStep(2); }, 2000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to send code.'); } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    
    const finalOtp = otpArr.join('');
    const finalEmail = email.trim();
    const finalPassword = newPassword.trim();

    // 🔥 DEBUG LOGGER (Check Browser Console - F12)
    console.log("🚀 SENDING TO BACKEND:", { email: finalEmail, otp: finalOtp, newPassword: finalPassword });

    try {
      const res = await resetPasswordApi({ email: finalEmail, otp: finalOtp, newPassword: finalPassword });
      setSuccess(res.message || 'Password changed! You can login now.');
      setTimeout(() => onClose(), 2800);
    } catch (err) { 
      setError(err.response?.data?.message || 'Wrong code. Try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const iconEmail = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" /></svg>;
  const iconLock  = <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 246, 229, 0.9)', backgroundImage: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
      
      <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5 }}
        style={{ background: '#FFFFFF', border: '2px solid #3E2723', borderRadius: 16, padding: '40px', width: '100%', maxWidth: 440, boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: -15, right: -15, width: 40, height: 40, borderRadius: '50%', background: '#632020', border: '2px solid #3E2723', color: '#FFF', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)', zIndex: 10 }}>X</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, margin: '0 auto 10px', borderRadius: '50%', background: '#D4B895', border: '2px solid #3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)', transform: 'rotate(-10deg)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3M18 5l2 2" /></svg>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#A0522D', margin: '0 0 10px', textShadow: '2px 2px 0px #3E2723', WebkitTextStroke: '1px #3E2723' }}>
            {step === 1 ? 'LOST YOUR KEY?' : 'NEW PASSWORD'}
          </h2>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#3E2723' }}>{step === 1 ? 'Enter your email to get a reset code.' : 'Enter the code & pick a new password.'}</p>
        </div>

        <AnimatePresence mode="wait">
          {error && <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: '#632020', border: '1px solid #3E2723', borderRadius: 8, padding: '10px', color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 14, marginBottom: 16, textAlign: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)' }}>ERROR: {error}</motion.div>}
          {success && <motion.div key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: '#00C853', border: '1px solid #3E2723', borderRadius: 8, padding: '10px', color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 14, marginBottom: 16, textAlign: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)' }}>SUCCESS: {success}</motion.div>}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form key="step1" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }} onSubmit={handleRequestOtp}>
              <ComicDarkInput type="email" placeholder="name@family.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={iconEmail} />
              <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.3)' } : {}}
                style={{ width: '100%', padding: '16px', background: loading ? '#ccc' : '#8B5A2B', border: '2px solid #3E2723', borderRadius: 12, color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.3)' }}>
                {loading ? 'SENDING...' : 'SEND THE CODE!'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} onSubmit={handleResetPassword}>
              <label style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', marginBottom: 6, textAlign: 'center' }}>ENTER CODE</label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {otpArr.map((val, i) => <ComicRuneBox key={i} index={i} value={val} inputRef={el => (inputRefs.current[i] = el)} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown} onPaste={handleOtpPaste} />)}
              </div>
              <ComicDarkInput type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required icon={iconLock} />
              <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.3)' } : {}}
                style={{ width: '100%', padding: '16px', background: loading ? '#ccc' : '#D4B895', border: '2px solid #3E2723', borderRadius: 12, color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.3)', marginBottom: 16 }}>
                {loading ? 'SAVING...' : 'CHANGE PASSWORD!'}
              </motion.button>
              <div style={{ textAlign: 'center' }}>
                <span onClick={() => { setStep(1); setError(''); setOtpArr(new Array(6).fill('')); }} style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#632020', cursor: 'pointer', textDecoration: 'underline' }}>← BACK TO EMAIL</span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordModal;