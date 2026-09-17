import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function OTPVerificationModal({ email, onSuccess, onClose }) {
  const { setUser, setToken } = useAuth();
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value) || isLocked) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== '' && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (isLocked) return;
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (isLocked) return;
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some((char) => isNaN(char))) return;
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      newOtp[i] = char;
      if (inputRefs.current[i]) inputRefs.current[i].value = char;
    });
    setOtp(newOtp);
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('ENTER ALL 6 DIGITS!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/verify-otp', { email, otp: otpCode });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        if (setToken) setToken(res.data.token);
        if (setUser) setUser(res.data);
        setSuccess(true);
        setTimeout(() => onSuccess(res.data), 900);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'WRONG CODE!');
      if (err.response?.status === 429) setIsLocked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(255, 246, 229, 0.9)',
      backgroundImage: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        style={{
          background: '#FFFFFF',
          border: 'none',
          borderRadius: 16,
          padding: '40px',
          width: '100%', maxWidth: 440,
          boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -15, right: -15,
            width: 40, height: 40, borderRadius: '50%',
            background: '#D4B895', border: 'none',
            color: '#3E2723', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 20,
            boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', zIndex: 10,
          }}
        >
          X
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: success ? '#00C853' : '#3E2723', margin: '0 0 10px', textShadow: '2px 2px 0px #D4B895' }}>
            {success ? 'VERIFIED!' : 'ENTER CODE'}
          </h2>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#3E2723' }}>
            We sent a secret code to <br/>
            <span style={{ background: '#1E352F', color: '#FFF', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>{email}</span>
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#1E352F', border: 'none', borderRadius: 8, padding: '10px', color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 14, marginBottom: 20, textAlign: 'center', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 30 }}>
            {otp.map((data, index) => (
              <OtpBox
                key={index} index={index} value={data} isLocked={isLocked} success={success}
                inputRef={el => (inputRefs.current[index] = el)}
                onChange={handleChange} onKeyDown={handleKeyDown} onPaste={handlePaste}
              />
            ))}
          </div>

          <motion.button
            type="submit" disabled={loading || isLocked || success}
            whileHover={!loading && !isLocked && !success ? { scale: 1.02 } : {}}
            whileTap={!loading && !isLocked && !success ? { scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' } : {}}
            style={{
              width: '100%', padding: '16px',
              background: success ? '#00C853' : isLocked ? '#1E352F' : '#D4B895',
              border: 'none', borderRadius: 12,
              color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, letterSpacing: 2,
              cursor: loading || isLocked || success ? 'not-allowed' : 'pointer',
              boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)',
            }}
          >
            {loading ? 'CHECKING...' : success ? 'AWESOME!' : isLocked ? 'LOCKED OUT' : 'CONFIRM!'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

function OtpBox({ index, value, isLocked, success, inputRef, onChange, onKeyDown, onPaste }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text" inputMode="numeric" maxLength="1" ref={inputRef} value={value}
      disabled={isLocked || success}
      onChange={(e) => onChange(e.target, index)} onKeyDown={(e) => onKeyDown(e, index)} onPaste={onPaste}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: 48, height: 56, fontSize: 28, fontWeight: 700, textAlign: 'center',
        fontFamily: "'Playfair Display', serif",
        background: '#FFF',
        border: 'none', borderRadius: 8,
        color: success ? '#00C853' : '#3E2723', outline: 'none',
        boxShadow: focused ? '4px 4px 0px 0px #C89B3C' : '4px 4px 0px 0px #3E2723',
        transform: focused ? 'translate(-2px, -2px)' : 'none',
        transition: 'all 0.1s',
      }}
    />
  );
}

export default OTPVerificationModal;