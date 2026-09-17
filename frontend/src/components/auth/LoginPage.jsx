import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import OTPVerificationModal from './OTPVerificationModal';
import ForgotPasswordModal from './ForgotPasswordModal';

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardWrap: {
    position: 'relative', zIndex: 10,
    width: '100%', maxWidth: '420px',
  },
  card: {
    background: '#FFFFFF',
    border: 'none',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)',
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function StickerLogo() {
  return (
    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px', zIndex: 2 }}>
      <motion.div
        whileHover={{ rotate: 5, scale: 1.05 }}
        style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          background: '#D4B895',
          border: 'none',
          boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          transform: 'rotate(-4deg)',
          transition: 'transform 0.2s ease',
        }}
      >
        <img
          src="/finall_logo.png"
          alt="The Legacy Trunk"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 26 }}>
          LT
        </div>
      </motion.div>
      {/* Decorative Comic Badges */}
      <div style={{
        position: 'absolute', bottom: -10, right: -20,
        background: '#1E352F', color: '#FFF',
        border: 'none', borderRadius: '8px',
        padding: '4px 8px', fontFamily: "'Playfair Display', serif", fontSize: 14,
        transform: 'rotate(12deg)', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)'
      }}>
        SECRET!
      </div>
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 44px',
    background: '#FFFFFF',
    border: 'none',
    borderRadius: '12px', color: '#3E2723',
    fontFamily: "'Baloo 2',sans-serif", fontWeight: 600,
    fontSize: 16, outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focused ? '6px 6px 0px 0px #C89B3C' : '4px 4px 0px 0px #3E2723',
    transform: focused ? 'translate(-2px, -2px)' : 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ textAlign: 'left', marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontFamily: "'Playfair Display', serif",
        fontSize: 14, color: '#3E2723', marginBottom: 6, letterSpacing: '1px'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          width: 16, height: 16, zIndex: 2
        }}>
          {icon}
        </div>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          style={{ ...inputStyle, paddingRight: type === 'password' ? '45px' : '16px' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, zIndex: 2
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    const result = await login(form.email, form.password);

    if (!result.success) {
      if (result.errorData?.requireOtp) {
        setUnverifiedEmail(result.errorData.email || form.email);
        setShowOtpModal(true);
        return;
      }
      setError(result.message || 'Oops! Wrong details.');
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div style={S.root}>
      {showOtpModal && (
        <OTPVerificationModal email={unverifiedEmail} onSuccess={handleOtpSuccess} onClose={() => setShowOtpModal(false)} />
      )}

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}

      <motion.div
        style={S.cardWrap}
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
      >
        <div style={S.card}>
          <StickerLogo />

          <div style={{ marginBottom: 24, position: 'relative', zIndex: 2 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 32, color: '#1E352F', textShadow: '3px 3px 0px #3E2723', WebkitTextStroke: '1px #3E2723' }}>
              WELCOME BACK!
            </h2>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#3E2723' }}>
              Time to update the family scrapbook.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
            <InputField
              label="EMAIL ADDRESS" type="email" placeholder="you@family.com"
              value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg>}
            />
            <InputField
              label="PASSWORD" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            />

            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '14px' }}>
              <span
                onClick={() => setShowForgotModal(true)}
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#A0522D', cursor: 'pointer', textDecoration: 'underline' }}
              >
                FORGOT PASSWORD?
              </span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  style={{ background: '#1E352F', border: 'none', borderRadius: 8, padding: '10px', color: '#FFF', fontFamily: "'Playfair Display', serif", fontSize: 14, marginBottom: 16, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}
                >
                  ERROR: {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.45)' } : {}}
              style={{
                width: '100%', padding: '16px',
                background: loading ? '#ccc' : '#C89B3C',
                border: 'none', borderRadius: 12,
                color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 20, letterSpacing: 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)',
                transition: 'box-shadow 0.1s, transform 0.1s'
              }}
            >
              {loading ? 'LOADING...' : 'LET ME IN!'}
            </motion.button>

            <p style={{ margin: '20px 0 0', fontWeight: 700, fontSize: 15, color: '#3E2723' }}>
              New here?{' '}
              <Link to="/signup" style={{ color: '#1E352F', textDecoration: 'underline', fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
                JOIN NOW
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;