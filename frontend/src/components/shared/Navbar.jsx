import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';

function Navbar() {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  
  const [myCircles, setMyCircles] = useState([]);

  // ==========================================
  // 🔥 Fetch Real Circles from Backend
  // ==========================================
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCircles = async () => {
        try {
          const res = await getMyCirclesApi(); 
          const circleList = Array.isArray(res) ? res : (res?.data || res?.circles || []);
          setMyCircles(circleList);

          // ✨ Auto-select first circle if none active
          if (circleList.length > 0 && !user?.activeCircleId) {
            switchActiveCircle(circleList[0]._id);
          }
        } catch (error) {
          console.error("Failed to load circles in navbar", error);
        }
      };
      fetchCircles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCircleChange = (e) => {
    const selectedId = e.target.value;
    switchActiveCircle(selectedId);
  };

  // 🔥 Reusable style for links
  const linkStyle = {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: '500',
    fontSize: '15px',
    padding: '6px 10px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', // Premium shadow
        marginBottom: '24px',
        position: 'sticky', // Scroll karne par upar chipka rahega
        top: 0,
        zIndex: 100,
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <Link to="/" style={{ ...linkStyle, fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginRight: '16px', padding: 0 }}>
        FamilyVault
      </Link>

      {isAuthenticated ? (
        <>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/vault" style={linkStyle}>Vault Chat</Link>
            <Link to="/vault-stories" style={linkStyle}>Vault Stories</Link>
            {/* 🔥 YEH RAHA NAYA LINK */}
            <Link to="/my-stories" style={{ ...linkStyle, color: '#10b981' }}>My Stories</Link>
            <Link to="/radar" style={linkStyle}>Radar</Link>
          </div>

          {/* ========================================== */}
          {/* 🔥 THE ACTIVE CIRCLE SWITCHER DROPDOWN     */}
          {/* ========================================== */}
          <div style={{ 
            marginLeft: 'auto', 
            marginRight: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>ACTIVE FAMILY:</span>
            <select 
              value={user?.activeCircleId || ''} 
              onChange={handleCircleChange}
              style={{ 
                padding: '4px 8px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                background: '#fff',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <option value="" disabled>Select a Circle</option>
              {myCircles.map(circle => (
                <option key={circle._id} value={circle._id}>
                  {circle.name || circle.circleName || 'Family Circle'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Hi, <b style={{ color: '#111827' }}>{user?.name || 'User'}</b>
            </span>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '6px 16px', 
                backgroundColor: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/signup" style={{ ...linkStyle, background: '#2563eb', color: 'white' }}>Signup</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;