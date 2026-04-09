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
      setError('All 6 runes must be inscribed to unseal the vault.');
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
      setError(err.response?.data?.message || 'Invalid rune sequence. Please try again.');
      if (err.response?.status === 429) setIsLocked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono&display=swap');
        @keyframes otpRingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes otpShine { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes otpDot { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes otpPulse { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.5)} }
        @keyframes otpFloat {
          0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)}
        }
        @keyframes otpSuccessGlow {
          0%{box-shadow:0 0 0 0 rgba(212,168,80,0.4)} 70%{box-shadow:0 0 0 12px rgba(212,168,80,0)} 100%{box-shadow:0 0 0 0 rgba(212,168,80,0)}
        }
        .otp-input::placeholder { color: rgba(255,255,255,0.15); }
        .otp-input::-webkit-outer-spin-button,
        .otp-input::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4, 6, 14, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
        fontFamily: "'Cormorant Garamond', serif",
      }}>
        {/* Floating dust motes */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 12 }, (_, i) => {
            const sz = Math.random() * 2.5 + 1;
            const gold = Math.random() > 0.3;
            return (
              <div key={i} style={{
                position: 'absolute',
                width: sz, height: sz,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${gold ? 'rgba(255,200,80,0.7)' : 'rgba(180,200,255,0.5)'} 0%, transparent 70%)`,
                animation: `otpFloat ${Math.random() * 7 + 5}s ${Math.random() * 8}s linear infinite`,
                '--tx': `${(Math.random() - 0.5) * 100}px`,
                '--ty': `${-(Math.random() * 70 + 30)}px`,
              }} />
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{
            position: 'relative',
            background: 'rgba(12,16,32,0.92)',
            border: `1px solid ${success ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.22)'}`,
            borderRadius: 20,
            padding: '44px 36px 40px',
            width: '100%', maxWidth: 420,
            boxShadow: success
              ? '0 0 60px rgba(212,168,80,0.2), 0 20px 60px rgba(0,0,0,0.6)'
              : '0 20px 60px rgba(0,0,0,0.6)',
            transition: 'border-color 0.5s, box-shadow 0.5s',
            overflow: 'hidden',
          }}
        >
          {/* Top gold line */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />

          {/* Corner accents */}
          {[
            { top: 12, left: 12, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' },
            { top: 12, right: 12, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' },
            { bottom: 12, left: 12, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' },
            { bottom: 12, right: 12, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 18, height: 18, borderColor: 'rgba(212,168,80,0.5)', borderStyle: 'solid', ...s }} />
          ))}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(212,168,80,0.25)',
              color: 'rgba(212,168,80,0.5)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s', zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.7)'; e.currentTarget.style.color = '#e8c87a'; e.currentTarget.style.background = 'rgba(212,168,80,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.25)'; e.currentTarget.style.color = 'rgba(212,168,80,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            ✕
          </button>

          {/* Logo ring */}
          <div style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 10px', zIndex: 2 }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'otpRingSpin 18s linear infinite' }} viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="42" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5" />
              <circle cx="45" cy="45" r="40" stroke="rgba(212,168,80,0.08)" strokeWidth="0.5" strokeDasharray="3 8" />
              <circle cx="45" cy="5"  r="2"   fill="rgba(212,168,80,0.7)" />
              <circle cx="83" cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
              <circle cx="83" cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
              <circle cx="45" cy="85" r="2"   fill="rgba(212,168,80,0.7)" />
              <circle cx="7"  cy="63" r="1.5" fill="rgba(212,168,80,0.5)" />
              <circle cx="7"  cy="27" r="1.5" fill="rgba(212,168,80,0.5)" />
            </svg>
            <div style={{
              position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#1a1410 0%,#0f0c08 100%)',
              border: '1px solid rgba(212,168,80,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src="/finall_logo.png"
                alt="The Legacy Trunk"
                style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#e8c87a', fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700 }}>LT</div>
            </div>
          </div>

          {/* Brand line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14, position: 'relative', zIndex: 2 }}>
            <div style={{ flex: 1, maxWidth: 40, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4))' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)' }}>The Legacy Trunk</span>
            <div style={{ flex: 1, maxWidth: 40, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.4))' }} />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 2 }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', letterSpacing: 1, textShadow: '0 0 40px rgba(212,168,80,0.3)' }}>
              {success ? 'Vault Unsealed' : 'Inscribe the Runes'}
            </h2>
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
              {success ? (
                <span style={{ color: 'rgba(212,168,80,0.7)' }}>The Oracle welcomes you home.</span>
              ) : (
                <>
                  A sacred key was sent to<br />
                  <span style={{ color: 'rgba(212,168,80,0.75)', fontWeight: 600, fontStyle: 'normal', fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 1 }}>{email}</span>
                </>
              )}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(220,60,60,0.12)',
                  border: '1px solid rgba(220,60,60,0.3)',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#f08080',
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11, letterSpacing: 0.5,
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 18, position: 'relative', zIndex: 2,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" style={{ width: 13, height: 13, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP form */}
          <form onSubmit={handleVerify} style={{ position: 'relative', zIndex: 2 }}>

            {/* OTP boxes */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {otp.map((data, index) => (
                <OtpBox
                  key={index}
                  index={index}
                  value={data}
                  isLocked={isLocked}
                  success={success}
                  inputRef={el => (inputRefs.current[index] = el)}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {/* Verify button */}
            <motion.button
              type="submit"
              disabled={loading || isLocked || success}
              whileHover={!loading && !isLocked && !success ? { scale: 1.02, y: -1 } : {}}
              whileTap={!loading && !isLocked && !success ? { scale: 0.97 } : {}}
              style={{
                position: 'relative', overflow: 'hidden',
                width: '100%', padding: '15px 20px',
                background: success
                  ? 'linear-gradient(135deg,#2a6a3a 0%,#3da84e 100%)'
                  : isLocked
                    ? 'rgba(220,60,60,0.3)'
                    : loading
                      ? 'rgba(212,168,80,0.4)'
                      : 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
                backgroundSize: '200% 100%',
                border: 'none', borderRadius: 10,
                color: loading ? 'rgba(26,15,0,0.6)' : '#1a0f00',
                fontFamily: "'Cinzel',serif",
                fontSize: 13, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase',
                cursor: loading || isLocked || success ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(212,168,80,0.25)',
                animation: !loading && !isLocked && !success ? 'otpPulse 3s ease-in-out infinite' : 'none',
                transition: 'background 0.4s',
              }}
            >
              {!loading && !success && (
                <div style={{
                  position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                  background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
                  transform: 'skewX(-20deg)',
                  animation: 'otpShine 3s ease-in-out infinite',
                }} />
              )}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', animation: `otpDot 1.2s ${i * 0.2}s ease-in-out infinite`, display: 'inline-block' }} />
                  ))}
                </div>
              ) : success ? (
                <span style={{ color: '#fff' }}>✦ &nbsp; Vault Opened &nbsp; ✦</span>
              ) : isLocked ? (
                <span style={{ color: '#f08080' }}>Vault Locked</span>
              ) : (
                'Verify & Enter'
              )}
            </motion.button>
          </form>

          {/* Rune footer */}
          <div style={{ marginTop: 20, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── OTP Box sub-component ────────────────────────────────────────────────────
function OtpBox({ index, value, isLocked, success, inputRef, onChange, onKeyDown, onPaste }) {
  const [focused, setFocused] = useState(false);
  const filled = value !== '';

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="otp-input"
        type="text"
        inputMode="numeric"
        maxLength="1"
        ref={inputRef}
        value={value}
        disabled={isLocked || success}
        onChange={(e) => onChange(e.target, index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        onPaste={onPaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: 46, height: 56,
          fontSize: 22, fontWeight: 700,
          textAlign: 'center',
          fontFamily: "'Cinzel',serif",
          background: success
            ? 'rgba(60,168,80,0.12)'
            : filled
              ? 'rgba(212,168,80,0.08)'
              : focused
                ? 'rgba(212,168,80,0.05)'
                : 'rgba(255,255,255,0.03)',
          border: `1px solid ${
            success
              ? 'rgba(60,200,80,0.5)'
              : focused
                ? 'rgba(212,168,80,0.7)'
                : filled
                  ? 'rgba(212,168,80,0.45)'
                  : 'rgba(212,168,80,0.2)'
          }`,
          borderRadius: 10,
          color: success ? '#6ee87a' : '#e8c87a',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.1)' : success && filled ? '0 0 0 3px rgba(60,200,80,0.12), 0 0 12px rgba(60,200,80,0.15)' : 'none',
          transition: 'all 0.25s ease',
          cursor: isLocked ? 'not-allowed' : 'text',
          opacity: isLocked ? 0.5 : 1,
        }}
      />
      {/* Bottom sweep line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.8),transparent)',
        transform: focused ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease', borderRadius: 0,
      }} />
    </div>
  );
}

export default OTPVerificationModal;