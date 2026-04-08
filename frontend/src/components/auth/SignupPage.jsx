import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { joinViaInviteApi } from '../../api/circleApi';
import { motion } from 'framer-motion'; 
import OTPVerificationModal from './OTPVerificationModal';

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('inviteToken');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: inviteToken ? 'member' : 'admin',
    familyCode: '',
    relationToAdmin: '',
  });

  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // 🔥 OTP MODAL STATES
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const isAdmin = form.role === 'admin';

  useEffect(() => {
    if (inviteToken) {
      setForm((prev) => ({ ...prev, role: 'member', familyCode: '' }));
    }
  }, [inviteToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'role' && value === 'admin') {
        next.familyCode = '';
        next.relationToAdmin = 'Admin';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        relationToAdmin: isAdmin ? 'Admin' : form.relationToAdmin?.trim() || '',
        ...(!isAdmin && !inviteToken && form.familyCode ? { familyCode: form.familyCode.trim().toUpperCase() } : {}),
      };

      const result = await signup(payload);

      // 🔥 FIX: Correctly handling the requireOtp signal from successful registration
      if (result.success || (result.data && result.data.requireOtp)) {
        
        if (inviteToken) {
          try {
            await joinViaInviteApi(inviteToken);
          } catch (inviteErr) {
            console.error("Auto-join via token failed after signup", inviteErr);
          }
        }

        // 🔥 Trigger OTP Modal
        setRegisteredEmail(form.email);
        setShowOtpModal(true);
        setActionLoading(false);
        return; 
      }

      // If we reach here and it's not a success and no OTP is required
      setError(result.message || "Registration failed.");

    } catch (err) {
      setError("Something went wrong during signup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // Hard redirect to force a fresh context load
    window.location.href = '/dashboard'; 
  };

  const isFormLoading = loading || actionLoading;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {showOtpModal && (
        <OTPVerificationModal 
          email={registeredEmail} 
          onSuccess={handleOtpSuccess}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: '#fff', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}
      >
        
        <div style={{ textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            style={{
              width: '120px', 
              height: '120px',
              borderRadius: '50%',
              marginBottom: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              overflow: 'hidden', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none', 
              padding: 0 
            }}
          >
             <img 
              src="/finall_logo.png" 
              alt="The Legacy Trunk Emblem"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                display: 'block', 
                transform: 'scale(1.25)', 
              }} 
            />
          </motion.div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Create Account</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Start preserving your family legacy today.</p>
        </div>

        {inviteToken && (
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
            ✨ You've been invited to join a Family Vault!
          </div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', border: '1px solid #fecaca', textAlign: 'center' }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          <input type="password" name="password" placeholder="Create Password" value={form.password} onChange={handleChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />

          {!inviteToken && (
            <div style={{ position: 'relative' }}>
              <select name="role" value={form.role} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}>
                <option value="admin">Create a New Family (Admin)</option>
                <option value="member">Join Existing Family (Member)</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '16px', pointerEvents: 'none', fontSize: '12px' }}>▼</div>
            </div>
          )}

          {!isAdmin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Details</div>
              
              {!inviteToken && (
                <input type="text" name="familyCode" placeholder="Family Code (e.g. TRUNK-XXXX)" value={form.familyCode} onChange={handleChange} required style={{ ...inputStyle, background: '#fff' }} onFocus={handleFocus} onBlur={handleBlur} />
              )}
              
              <input type="text" name="relationToAdmin" placeholder="Relation (e.g. Brother, Mother)" value={form.relationToAdmin} onChange={handleChange} required style={{ ...inputStyle, background: '#fff' }} onFocus={handleFocus} onBlur={handleBlur} />
            </motion.div>
          )}

          <motion.button 
            type="submit" 
            disabled={isFormLoading} 
            whileHover={{ scale: isFormLoading ? 1 : 1.02 }}
            whileTap={{ scale: isFormLoading ? 1 : 0.96 }}
            style={{ background: '#0f172a', color: '#fff', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: isFormLoading ? 'not-allowed' : 'pointer', border: 'none', opacity: isFormLoading ? 0.7 : 1, marginTop: '8px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)' }}
          >
            {isFormLoading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}

// PREMIUM STYLES
const inputStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '15px',
  color: '#0f172a',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box'
};

const handleFocus = (e) => {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.background = '#fff';
  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
};

const handleBlur = (e) => {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.background = '#f8fafc';
  e.target.style.boxShadow = 'none';
};

export default SignupPage;