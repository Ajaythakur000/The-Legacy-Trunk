

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';

function Navbar() {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  
  const [myCircles, setMyCircles] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCircles = async () => {
        try {
          const res = await getMyCirclesApi(); 
          const circleList = Array.isArray(res) ? res : (res?.data || res?.circles || []);
          setMyCircles(circleList);

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
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleCircleChange = (e) => {
    const selectedId = e.target.value;
    switchActiveCircle(selectedId);
    setIsMobileMenuOpen(false);
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px',
    padding: '6px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap'
  };

  return (
    <nav
      style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Link to="/" style={{ ...linkStyle, fontSize: '18px', fontWeight: 'bold', color: '#2563eb', padding: 0 }}>
          FamilyVault
        </Link>

        {isAuthenticated && (
          <button 
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? '✖️' : '☰'}
          </button>
        )}

        {isAuthenticated ? (
          <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
              <Link to="/vault" style={linkStyle}>Vault Chat</Link>
              <Link to="/vault-stories" style={linkStyle}>Vault Stories</Link>
              <Link to="/my-stories" style={{ ...linkStyle, color: '#10b981' }}>My Stories</Link>
              <Link to="/explore" style={{ ...linkStyle, color: '#8b5cf6' }}>🌍 Explore</Link>
              <Link to="/radar" style={linkStyle}>Radar</Link>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: '#f3f4f6',
              padding: '4px 10px',
              borderRadius: '8px',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>ACTIVE:</span>
              <select 
                value={user?.activeCircleId || ''} 
                onChange={handleCircleChange}
                style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '500', maxWidth: '120px' }}
              >
                <option value="" disabled>Select Circle</option>
                {myCircles.map(circle => (
                  <option key={circle._id} value={circle._id}>
                    {circle.name || circle.circleName || 'Family Circle'}
                  </option>
                ))}
              </select>
            </div>

            {/* 🔥 NAYA PROFILE LINK WITH DP */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
              
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.2s' }} className="profile-link-hover">
                <img 
                  src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                  alt="DP" 
                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} 
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Hi, <b style={{ color: '#111827' }}>{user?.name?.split(' ')[0] || 'User'}</b>
                </span>
              </Link>

              <button 
                onClick={handleLogout} 
                style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Logout
              </button>
            </div>

          </div>
        ) : (
          <div className="desktop-menu" style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/signup" style={{ ...linkStyle, background: '#2563eb', color: 'white' }}>Signup</Link>
          </div>
        )}
      </div>

      {/* MOBILE MENU */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="mobile-menu" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          
          {/* Mobile mein bhi upar DP dikhegi */}
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none' }}>
             <img src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="DP" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
             <div>
                <div style={{ color: '#111827', fontWeight: 'bold', fontSize: '15px' }}>{user?.name}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>View Profile</div>
             </div>
          </Link>

          <Link to="/dashboard" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
          <Link to="/vault" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>Vault Chat</Link>
          <Link to="/vault-stories" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>Vault Stories</Link>
          <Link to="/my-stories" style={{ ...linkStyle, color: '#10b981' }} onClick={() => setIsMobileMenuOpen(false)}>My Stories</Link>
          <Link to="/explore" style={{ ...linkStyle, color: '#8b5cf6' }} onClick={() => setIsMobileMenuOpen(false)}>🌍 Explore</Link>
          <Link to="/radar" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>Radar</Link>

          <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>ACTIVE FAMILY:</span>
            <select 
              value={user?.activeCircleId || ''} 
              onChange={handleCircleChange}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}
            >
              <option value="" disabled>Select a Circle</option>
              {myCircles.map(circle => (
                <option key={circle._id} value={circle._id}>
                  {circle.name || circle.circleName || 'Family Circle'}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
          >
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
        @media (min-width: 1101px) {
          .mobile-menu { display: none !important; }
        }
        .profile-link-hover:hover {
          background-color: #f3f4f6;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;