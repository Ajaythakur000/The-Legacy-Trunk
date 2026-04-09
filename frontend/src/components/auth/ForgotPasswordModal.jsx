import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPasswordApi, resetPasswordApi } from '../../api/authApi';

// ─── OTP Single Box ───────────────────────────────────────────────────────────
function RuneBox({ index, value, inputRef, onChange, onKeyDown, onPaste }) {
  const [focused, setFocused] = useState(false);
  const filled = value !== '';
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text" inputMode="numeric" maxLength="1"
        ref={inputRef} value={value}
        onChange={(e) => onChange(e.target, index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        onPaste={onPaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: 44, height: 52,
          fontSize: 20, fontWeight: 700, textAlign: 'center',
          fontFamily: "'Cinzel',serif",
          background: filled ? 'rgba(212,168,80,0.08)' : focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? 'rgba(212,168,80,0.7)' : filled ? 'rgba(212,168,80,0.45)' : 'rgba(212,168,80,0.2)'}`,
          borderRadius: 10, color: '#e8c87a', outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.1)' : 'none',
          transition: 'all 0.25s ease', cursor: 'text',
        }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.8),transparent)',
        transform: focused ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease', borderRadius: 0,
      }} />
    </div>
  );
}

// ─── Dark Input ───────────────────────────────────────────────────────────────
function DarkInput({ type = 'text', placeholder, value, onChange, required, icon, style: extra }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: focused ? 'rgba(212,168,80,0.05)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${focused ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.25)'}`,
      borderRadius: 10,
      boxShadow: focused ? '0 0 0 3px rgba(212,168,80,0.08)' : 'none',
      transition: 'all 0.3s', position: 'relative', ...extra,
    }}>
      {icon && (
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: focused ? 0.75 : 0.4, transition: 'opacity 0.3s', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      )}
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        style={{
          width: '100%', padding: `13px 16px 13px ${icon ? '40px' : '16px'}`,
          background: 'transparent', border: 'none', outline: 'none',
          color: 'rgba(255,255,255,0.88)', fontFamily: "'Cormorant Garamond',serif",
          fontSize: 16, boxSizing: 'border-box',
          letterSpacing: type === 'password' ? '3px' : 'normal',
        }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)',
        transform: focused ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.4s ease', borderRadius: 0,
      }} />
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
      {[1, 2].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: `1px solid ${step >= s ? 'rgba(212,168,80,0.8)' : 'rgba(212,168,80,0.2)'}`,
            background: step >= s ? 'rgba(212,168,80,0.15)' : 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
            color: step >= s ? '#e8c87a' : 'rgba(212,168,80,0.3)',
            transition: 'all 0.4s',
            boxShadow: step === s ? '0 0 12px rgba(212,168,80,0.2)' : 'none',
          }}>
            {step > s ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="2.5" style={{ width: 12, height: 12 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : s}
          </div>
          {i === 0 && (
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${step > 1 ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.1)'}, ${step > 1 ? 'rgba(212,168,80,0.6)' : 'rgba(212,168,80,0.1)'})`, transition: 'background 0.4s', margin: '0 6px' }} />
          )}
        </div>
      ))}
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

  // OTP box handlers
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const n = [...otpArr]; n[index] = element.value; setOtpArr(n);
    if (element.value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArr[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const chars = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (chars.some(c => isNaN(c))) return;
    const n = [...otpArr];
    chars.forEach((c, i) => { n[i] = c; if (inputRefs.current[i]) inputRefs.current[i].value = c; });
    setOtpArr(n);
    inputRefs.current[Math.min(chars.length, 5)]?.focus();
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await forgotPasswordApi(email);
      setSuccess(res.message || 'Recovery rune dispatched to your sanctum.');
      setTimeout(() => { setSuccess(''); setStep(2); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to summon recovery rune.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await resetPasswordApi({ email, otp: otpArr.join(''), newPassword });
      setSuccess(res.message || 'New vault key forged. The vault awaits.');
      setTimeout(() => onClose(), 2800);
    } catch (err) {
      setError(err.response?.data?.message || 'The rune sequence failed. Try again.');
    } finally { setLoading(false); }
  };

  const iconEmail = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" /></svg>;
  const iconLock  = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono&display=swap');
        @keyframes fpmRingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fpmShine    { 0%,70%{left:-100%} 100%{left:150%} }
        @keyframes fpmDot      { 0%,80%,100%{transform:scale(0.6);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes fpmPulse    { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.5)} }
        @keyframes fpmFloat    { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
        .fpm-input::placeholder { color:rgba(255,255,255,0.2); font-style:italic; }
        .fpm-input:-webkit-autofill { -webkit-box-shadow:0 0 0 30px #0c1020 inset !important; -webkit-text-fill-color:rgba(255,255,255,0.88) !important; }
      `}</style>

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4,6,14,0.9)',
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20,
        fontFamily: "'Cormorant Garamond',serif",
      }}>

        {/* Dust motes */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 14 }, (_, i) => {
            const sz = Math.random() * 2.5 + 1;
            return (
              <div key={i} style={{
                position: 'absolute',
                width: sz, height: sz,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                borderRadius: '50%',
                background: `radial-gradient(circle,${Math.random() > 0.3 ? 'rgba(255,200,80,0.7)' : 'rgba(180,200,255,0.5)'} 0%,transparent 70%)`,
                animation: `fpmFloat ${Math.random() * 7 + 5}s ${Math.random() * 8}s linear infinite`,
                '--tx': `${(Math.random() - 0.5) * 100}px`,
                '--ty': `${-(Math.random() * 70 + 30)}px`,
              }} />
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{
            position: 'relative',
            background: 'rgba(12,16,32,0.92)',
            border: '1px solid rgba(212,168,80,0.22)',
            borderRadius: 20,
            padding: '44px 36px 40px',
            width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            overflow: 'hidden',
          }}
        >
          {/* Gold edge lines */}
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
              position: 'absolute', top: 16, right: 16,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,168,80,0.22)',
              color: 'rgba(212,168,80,0.45)', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s', zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.7)'; e.currentTarget.style.color = '#e8c87a'; e.currentTarget.style.background = 'rgba(212,168,80,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; e.currentTarget.style.color = 'rgba(212,168,80,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            ✕
          </button>

          {/* Key icon + heading */}
          <div style={{ textAlign: 'center', marginBottom: 10, position: 'relative', zIndex: 2 }}>
            {/* Animated key SVG */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 160 }}
              style={{ marginBottom: 14 }}
            >
              <div style={{
                width: 60, height: 60, margin: '0 auto',
                borderRadius: '50%',
                background: 'rgba(212,168,80,0.08)',
                border: '1px solid rgba(212,168,80,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(212,168,80,0.1)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                  <circle cx="7.5" cy="15.5" r="5.5" />
                  <path d="M21 2l-9.6 9.6M15.5 7.5l3 3M18 5l2 2" />
                </svg>
              </div>
            </motion.div>

            {/* Brand divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, maxWidth: 40, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.4))' }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)' }}>The Legacy Trunk</span>
              <div style={{ flex: 1, maxWidth: 40, height: 1, background: 'linear-gradient(270deg,transparent,rgba(212,168,80,0.4))' }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: '#e8c87a', letterSpacing: 1, textShadow: '0 0 30px rgba(212,168,80,0.3)' }}>
                  {step === 1 ? 'Lost Your Key?' : 'Forge New Key'}
                </h2>
                <p style={{ margin: 0, fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                  {step === 1
                    ? 'Enter your email to summon a recovery rune.'
                    : 'Inscribe the rune & forge your new password.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step indicator */}
          <StepIndicator step={step} />

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(220,60,60,0.12)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f08080', fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative', zIndex: 2 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" style={{ width: 13, height: 13, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(60,168,80,0.1)', border: '1px solid rgba(60,200,80,0.3)', borderRadius: 8, padding: '10px 14px', color: '#6ee87a', fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative', zIndex: 2 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#6ee87a" strokeWidth="2" style={{ width: 13, height: 13, flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1 ── */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRequestOtp}
                style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2 }}
              >
                <div>
                  <label style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', marginBottom: 7 }}>
                    Email Address
                  </label>
                  <DarkInput
                    type="email" placeholder="name@family.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required icon={iconEmail}
                  />
                </div>

                <GoldButton loading={loading} label="Send Recovery Rune" loadingLabel="Summoning..." />
              </motion.form>

            ) : (
              // ── STEP 2 ──
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 2 }}
              >
                {/* 6-digit rune boxes */}
                <div>
                  <label style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', marginBottom: 10 }}>
                    Recovery Rune
                  </label>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {otpArr.map((val, i) => (
                      <RuneBox
                        key={i} index={i} value={val}
                        inputRef={el => (inputRefs.current[i] = el)}
                        onChange={handleOtpChange}
                        onKeyDown={handleOtpKeyDown}
                        onPaste={handleOtpPaste}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', marginBottom: 7 }}>
                    New Password
                  </label>
                  <DarkInput
                    type="password" placeholder="••••••••"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    required icon={iconLock}
                  />
                </div>

                <GoldButton loading={loading} label="Forge & Unlock Vault" loadingLabel="Forging..." />

                {/* Back link */}
                <div style={{ textAlign: 'center' }}>
                  <span
                    onClick={() => { setStep(1); setError(''); setOtpArr(new Array(6).fill('')); }}
                    style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(212,168,80,0.4)', cursor: 'pointer', transition: 'color 0.3s' }}
                    onMouseEnter={e => e.target.style.color = 'rgba(212,168,80,0.8)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(212,168,80,0.4)'}
                  >
                    ← Request a new rune
                  </span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Rune footer */}
          <div style={{ marginTop: 20, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Gold Submit Button ───────────────────────────────────────────────────────
function GoldButton({ loading, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!loading ? { scale: 0.97 } : {}}
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%', padding: '15px 20px',
        background: loading ? 'rgba(212,168,80,0.4)' : 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
        backgroundSize: '200% 100%',
        border: 'none', borderRadius: 10,
        color: loading ? 'rgba(26,15,0,0.6)' : '#1a0f00',
        fontFamily: "'Cinzel',serif",
        fontSize: 13, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 20px rgba(212,168,80,0.25)',
        animation: !loading ? 'fpmPulse 3s ease-in-out infinite' : 'none',
        marginTop: 4,
      }}
    >
      {!loading && (
        <div style={{
          position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
          transform: 'skewX(-20deg)',
          animation: 'fpmShine 3s ease-in-out infinite',
        }} />
      )}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', animation: `fpmDot 1.2s ${i * 0.2}s ease-in-out infinite`, display: 'inline-block' }} />
          ))}
        </div>
      ) : label}
    </motion.button>
  );
}

export default ForgotPasswordModal;