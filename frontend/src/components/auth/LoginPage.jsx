import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // form state
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  // input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(form.email, form.password);

    if (!result.success) {
      if (result.requireOtp || result?.data?.requireOtp) {
          setError("Your account is not verified yet. Please sign up again to trigger the OTP email.");
          return;
      }
      
      setError(result.message);
      return;
    }

    // login success -> dashboard
    navigate('/dashboard', { replace: true });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          background: '#ffffff', 
          borderRadius: '24px', 
          padding: '48px 40px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
          textAlign: 'center'
        }}
      >
        
        {/* 🔥 BRAND LOGO: Scale increased to 1.25 to completely obliterate the white edge */}
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            style={{
              width: '120px', 
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto 24px',
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
                display: 'block', // Ensures no random inline-block spacing
                transform: 'scale(1.25)', // 🔥 Ab ye pakka border ke bahar tak nikal jayega
              }} 
            />
          </motion.div>

        <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#0f172a', fontWeight: '900', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
          Welcome Back
        </h2>
        <p style={{ margin: '0 0 32px 0', color: '#64748b', fontSize: '1rem' }}>
          Access your family's private vault.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@family.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a' }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a' }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid #fca5a5' }}>
              {error}
            </motion.div>
          )}

          {/* 🔥 MOTION BUTTON */}
          <motion.button 
            type="submit" 
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{ background: '#0f172a', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '8px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {loading ? <span className="spinner">⏳</span> : 'Unlock Vault 🗝️'}
          </motion.button>
        </form>

        <p style={{ marginTop: '32px', color: '#64748b', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </motion.div>

      <style>{`
        .spinner { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default LoginPage;