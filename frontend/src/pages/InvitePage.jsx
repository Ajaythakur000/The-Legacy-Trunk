import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinViaInviteApi } from '../api/circleApi';

function InvitePage() {
  const { token } = useParams(); // URL se /invite/:token nikalega
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Agar Auth state load ho rahi hai, toh wait karo
    if (loading) return;

    const processInvite = async () => {
      // 1. Agar user logged in NAHI hai -> Seedha Signup pe bhejo Magic Link ke sath
      if (!isAuthenticated) {
        navigate(`/signup?inviteToken=${token}`, { replace: true });
        return;
      }

      // 2. Agar user LOGGED IN hai -> Turant token use karke family join karwao
      try {
        await joinViaInviteApi(token);
        // Join success! Seedha dashboard bhej do
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setProcessing(false);
        setError(err?.response?.data?.message || 'This invite link is invalid or has expired.');
      }
    };

    processInvite();
  }, [token, isAuthenticated, loading, navigate]);

  // Premium Loading State
  if (processing || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui' }}>
        <div style={{ fontSize: '40px', animation: 'pulse 1.5s infinite' }}>🪄</div>
        <h2 style={{ color: '#0f172a', marginTop: '16px' }}>Opening the Vault...</h2>
        <style>{`@keyframes pulse { 0% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.9); } }`}</style>
      </div>
    );
  }

  // Premium Error State (If token expired or invalid)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗❌</div>
        <h2 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Link Expired</h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
          {error} Ask the family admin to generate a new invite link.
        </p>
        <Link to="/dashboard" style={{ display: 'inline-block', background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', transition: 'transform 0.2s' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default InvitePage;