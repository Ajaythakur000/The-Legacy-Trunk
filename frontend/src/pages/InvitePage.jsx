import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinViaInviteApi } from '../api/circleApi';
import { motion } from 'framer-motion';

function InvitePage() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (loading) return;

    const processInvite = async () => {
      if (!isAuthenticated) {
        navigate(`/signup?inviteToken=${token}`, { replace: true });
        return;
      }

      try {
        await joinViaInviteApi(token);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setProcessing(false);
        setError(err?.response?.data?.message || 'This invite link is totally busted or expired!');
      }
    };

    processInvite();
  }, [token, isAuthenticated, loading, navigate]);

  // Comic Loading State
  if (processing || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        background: '#D4B895', backgroundImage: 'radial-gradient(#3E2723 2px, transparent 2.5px)', backgroundSize: '20px 20px',
        padding: 20 
      }}>
        <motion.div 
          animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ fontSize: '80px', textShadow: '4px 4px 0px #3E2723' }}
        >
          🎟️
        </motion.div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#FFF', textShadow: '4px 4px 0px #3E2723', WebkitTextStroke: '2px #3E2723', marginTop: '24px', textAlign: 'center' }}>
          CHECKING TICKET...
        </h2>
      </div>
    );
  }

  // Comic Error State
  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: '#FDFBF7', backgroundImage: 'radial-gradient(#3E2723 2px, transparent 2.5px)', backgroundSize: '20px 20px',
      padding: '20px' 
    }}>
      <motion.div 
        initial={{ scale: 0.8, rotate: 2 }} animate={{ scale: 1, rotate: -2 }} transition={{ type: 'spring', bounce: 0.6 }}
        style={{ 
          background: '#FFFFFF', border: '2px solid #3E2723', borderRadius: '16px', padding: '40px', 
          maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.3)' 
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💥</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#632020', textShadow: '2px 2px 0px #3E2723', WebkitTextStroke: '1px #3E2723', margin: '0 0 12px 0' }}>
          OH SNAP!
        </h2>
        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, color: '#3E2723', fontSize: '18px', lineHeight: '1.5', marginBottom: '30px' }}>
          {error} Tell the family boss to generate a fresh invite link.
        </p>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.3)' }}
            style={{ 
              background: '#8B5A2B', border: '2px solid #3E2723', color: '#3E2723', 
              padding: '16px 24px', borderRadius: '12px', fontFamily: "'Playfair Display', serif", fontSize: 20, 
              boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.3)', cursor: 'pointer', width: '100%', transition: 'box-shadow 0.1s' 
            }}
          >
            BACK TO BASE
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

export default InvitePage;