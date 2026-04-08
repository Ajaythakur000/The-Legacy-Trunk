import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext'; // 🔥 SECURITY FIX: Context imported

function OTPVerificationModal({ email, onSuccess, onClose }) {
  const { setUser } = useAuth(); // 🔥 To fix Race Condition
  
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false); // 🔥 LOGIC FIX: UI Lockout State
  
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value) || isLocked) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (isLocked) return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (isLocked) return;
    
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6).split("");
    if (pastedData.some(char => isNaN(char))) return;
    
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

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the royal seal.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post('/users/verify-otp', { email, otp: otpCode });
      
      if (res.data.token) {
        // 🔥 SECURITY FIX: Race Condition Resolved!
        // Immediately save token AND user data to LocalStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        
        // Immediately update React Context so app knows user is logged in
        if (setUser) setUser(res.data);
        
        onSuccess(res.data); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Key. Please try again.");
      
      // 🔥 LOGIC FIX: If Backend sends 429 Lockout, Disable UI
      if (err.response?.status === 429) {
        setIsLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        style={modalStyle}
      >
        <button onClick={onClose} style={closeButtonStyle}>✕</button>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: 'transparent',
              border: 'none', padding: 0
            }}
          >
             <img 
              src="/finall_logo.png" 
              alt="Memento Emblem"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(1.25)' }} 
            />
          </motion.div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            Unlock Your Vault
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
            We've sent a secure access key to <br/>
            <strong style={{ color: '#0f172a' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={errorStyle}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={el => inputRefs.current[index] = el}
                value={data}
                disabled={isLocked} // 🔥 Disable if locked out
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={(e) => { 
                  if(isLocked) return;
                  e.target.style.borderColor = '#8C6D46'; 
                  e.target.style.background = '#fff'; 
                  e.target.style.boxShadow = '0 4px 15px rgba(140, 109, 70, 0.15)'; 
                }}
                onBlur={(e) => { 
                  if(isLocked) return;
                  e.target.style.borderColor = '#EADDCD'; 
                  e.target.style.background = '#F9F3E8'; 
                  e.target.style.boxShadow = 'none'; 
                }}
                style={{
                  ...otpBoxStyle,
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? 'not-allowed' : 'text'
                }}
              />
            ))}
          </div>

          <motion.button 
            type="submit" 
            disabled={loading || isLocked} // 🔥 Disable button if locked out
            whileHover={{ scale: (loading || isLocked) ? 1 : 1.02 }}
            whileTap={{ scale: (loading || isLocked) ? 1 : 0.96 }}
            style={{ 
              ...verifyBtnStyle, 
              opacity: (loading || isLocked) ? 0.7 : 1,
              cursor: (loading || isLocked) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Unlocking...' : isLocked ? 'Vault Locked 🔒' : 'Verify & Enter'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// 🔥 PREMIUM STYLES
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalStyle = { background: '#fff', padding: '40px 32px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', position: 'relative', border: '1px solid rgba(226, 232, 240, 0.8)' };
const closeButtonStyle = { position: 'absolute', top: '20px', right: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };
const otpBoxStyle = { width: '45px', height: '55px', fontSize: '24px', fontWeight: '900', textAlign: 'center', border: '2px solid #EADDCD', borderRadius: '12px', background: '#F9F3E8', color: '#4A332A', outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'system-ui, sans-serif' };
const verifyBtnStyle = { width: '100%', background: '#0f172a', color: '#fff', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', border: 'none', boxShadow: '0 8px 25px rgba(15, 23, 42, 0.25)', transition: 'all 0.3s ease' };
const errorStyle = { background: '#fdf2f8', color: '#be185d', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '700', border: '1px solid #fbcfe8', textAlign: 'center' };

export default OTPVerificationModal;