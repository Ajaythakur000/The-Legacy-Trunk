import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { joinViaInviteApi } from '../../api/circleApi'; // 🔥 Magic Link API

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading } = useAuth();

  // 🔥 URL se Token nikalne ka logic
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('inviteToken');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: inviteToken ? 'member' : 'admin', // Token hai toh default member
    familyCode: '',
    relationToAdmin: '',
  });

  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = form.role === 'admin';

  // Agar inviteToken hai, toh user manually role change nahi kar sakta
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
      // 1. Prepare Clean Payload
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        relationToAdmin: isAdmin ? 'Admin' : form.relationToAdmin?.trim() || '',
        // Sirf tab familyCode bhejo jab user khud form bhar raha ho (bina token ke)
        ...(!isAdmin && !inviteToken && form.familyCode ? { familyCode: form.familyCode.trim().toUpperCase() } : {}),
      };

      // 2. Call Auth Signup
      const result = await signup(payload);

      if (!result.success) {
        setError(result.message);
        setActionLoading(false);
        return;
      }

      // 3. 🪄 MAGIC LINK: Agar token tha, toh signup ke baad turant us token ko consume kar lo
      if (inviteToken) {
        try {
          await joinViaInviteApi(inviteToken);
        } catch (inviteErr) {
          console.error("Auto-join via token failed after signup", inviteErr);
          // Token expire/invalid ho gaya hoga, par account toh ban gaya
        }
      }

      // 4. Send to Dashboard
      if (result?.data?.token) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }

    } catch (err) {
      setError("Something went wrong during signup.");
    } finally {
      setActionLoading(false);
    }
  };

  const isFormLoading = loading || actionLoading;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Create Account</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Start preserving your family legacy today.</p>
        </div>

        {/* 🪄 Smart Invite Banner */}
        {inviteToken && (
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
            ✨ You've been invited to join a Family Vault!
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', border: '1px solid #fecaca', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          <input type="password" name="password" placeholder="Create Password" value={form.password} onChange={handleChange} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />

          {/* Sirf tab dikhao jab koi Invite Token NAHI hai */}
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
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Details</div>
              
              {/* Token nahi hai toh Code maango */}
              {!inviteToken && (
                <input type="text" name="familyCode" placeholder="Family Code (e.g. TRUNK-XXXX)" value={form.familyCode} onChange={handleChange} required style={{ ...inputStyle, background: '#fff' }} onFocus={handleFocus} onBlur={handleBlur} />
              )}
              
              <input type="text" name="relationToAdmin" placeholder="Relation (e.g. Brother, Mother)" value={form.relationToAdmin} onChange={handleChange} required style={{ ...inputStyle, background: '#fff' }} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          )}

          <button type="submit" disabled={isFormLoading} style={{ background: '#0f172a', color: '#fff', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', border: 'none', transition: 'all 0.2s', opacity: isFormLoading ? 0.7 : 1, marginTop: '8px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            {isFormLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>Login here</Link>
        </p>
      </div>

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