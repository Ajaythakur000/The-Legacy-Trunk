import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';

function Navbar() {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Active link highlight karne ke liye
  
  const [myCircles, setMyCircles] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 🔥 New State for Custom Family Hub Dropdown
  const [isHubOpen, setIsHubOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsHubOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleCircleChange = (circleId) => {
    switchActiveCircle(circleId);
    setIsHubOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Helper for active link styling
  const getLinkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#2563eb' : '#4b5563', // Active link blue
    fontWeight: location.pathname === path ? '700' : '600',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: location.pathname === path ? '#eff6ff' : 'transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  // Get active circle name
  const activeCircleName = myCircles.find(c => c._id === user?.activeCircleId)?.circleName 
    || myCircles.find(c => c._id === user?.activeCircleId)?.name 
    || 'Select Family';

  return (
    <nav
      style={{
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', // Softer, premium shadow
        marginBottom: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* LOGO */}
        <Link to="/" style={{ textDecoration: 'none', fontSize: '20px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span> FamilyVault
        </Link>

        {isAuthenticated && (
          <button 
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ display: 'none', background: '#f3f4f6', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
          >
            {isMobileMenuOpen ? '✖️' : '☰'}
          </button>
        )}

        {isAuthenticated ? (
          <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap' }}>
            
            {/* 🔗 THE NEW NAV LINKS (Explore removed, Home added) */}
            <div style={{ display: 'flex', gap: '4px', borderRight: '2px solid #f3f4f6', paddingRight: '16px' }}>
              <Link to="/home" style={getLinkStyle('/home')} className="nav-link-hover">🏠 Home</Link>
              <Link to="/dashboard" style={getLinkStyle('/dashboard')} className="nav-link-hover">Dashboard</Link>
              <Link to="/vault" style={getLinkStyle('/vault')} className="nav-link-hover">Vault Chat</Link>
              <Link to="/vault-stories" style={getLinkStyle('/vault-stories')} className="nav-link-hover">Vault Stories</Link>
              <Link to="/my-stories" style={getLinkStyle('/my-stories')} className="nav-link-hover">My Stories</Link>
              <Link to="/radar" style={getLinkStyle('/radar')} className="nav-link-hover">Radar</Link>
            </div>

            {/* 🏰 THE NEW "FAMILY HUB" DROPDOWN */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsHubOpen(!isHubOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: isHubOpen ? '#111827' : '#f8fafc',
                  color: isHubOpen ? '#fff' : '#111827',
                  border: '1px solid',
                  borderColor: isHubOpen ? '#111827' : '#e2e8f0',
                  padding: '8px 16px', borderRadius: '99px',
                  cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                  transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <span>🏰 {activeCircleName}</span>
                <span style={{ fontSize: '10px' }}>{isHubOpen ? '▲' : '▼'}</span>
              </button>

              {/* The Dropdown Menu */}
              {isHubOpen && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0, minWidth: '220px',
                  background: '#fff', borderRadius: '16px', padding: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6', zIndex: 50
                }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', padding: '8px 12px', letterSpacing: '0.5px' }}>SWITCH FAMILY</div>
                  
                  {myCircles.map(circle => {
                    const isActive = user?.activeCircleId === circle._id;
                    return (
                      <div 
                        key={circle._id} 
                        onClick={() => handleCircleChange(circle._id)}
                        className="hub-item-hover"
                        style={{
                          padding: '12px', borderRadius: '10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isActive ? '#eff6ff' : 'transparent',
                          color: isActive ? '#2563eb' : '#374151',
                          fontWeight: isActive ? '700' : '500',
                          transition: 'background 0.2s'
                        }}
                      >
                        {circle.name || circle.circleName || 'Family Circle'}
                        {isActive && <span style={{ color: '#2563eb', fontSize: '14px' }}>✓</span>}
                      </div>
                    );
                  })}
                  
                  {/* Option to create/join new family in future */}
                  <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '8px', paddingTop: '8px' }}>
                    <Link to="/dashboard" onClick={() => setIsHubOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#6b7280', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }} className="hub-item-hover">
                      + Manage Families
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 👤 PROFILE & LOGOUT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '4px 12px', borderRadius: '99px', background: '#f3f4f6' }} className="nav-link-hover">
                <img 
                  src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                  alt="DP" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontSize: '14px', color: '#111827', fontWeight: '700' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </Link>

              <button 
                onClick={handleLogout} 
                style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
                className="logout-hover"
              >
                Logout
              </button>
            </div>

          </div>
        ) : (
          <div className="desktop-menu" style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#374151', fontWeight: '600', padding: '8px 16px' }}>Login</Link>
            <Link to="/signup" style={{ textDecoration: 'none', background: '#111827', color: 'white', fontWeight: '600', padding: '8px 20px', borderRadius: '8px' }}>Signup</Link>
          </div>
        )}
      </div>

      {/* 📱 MOBILE MENU (Updated to match desktop features) */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="mobile-menu" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', textDecoration: 'none' }}>
             <img src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="DP" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
             <div>
                <div style={{ color: '#111827', fontWeight: '800', fontSize: '16px' }}>{user?.name}</div>
                <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>View Profile</div>
             </div>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link to="/home" style={getLinkStyle('/home')} onClick={() => setIsMobileMenuOpen(false)}>🏠 Home</Link>
            <Link to="/dashboard" style={getLinkStyle('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/vault" style={getLinkStyle('/vault')} onClick={() => setIsMobileMenuOpen(false)}>Vault Chat</Link>
            <Link to="/vault-stories" style={getLinkStyle('/vault-stories')} onClick={() => setIsMobileMenuOpen(false)}>Vault Stories</Link>
            <Link to="/my-stories" style={getLinkStyle('/my-stories')} onClick={() => setIsMobileMenuOpen(false)}>My Stories</Link>
            <Link to="/radar" style={getLinkStyle('/radar')} onClick={() => setIsMobileMenuOpen(false)}>Radar</Link>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>🏰 ACTIVE FAMILY HUB:</span>
            <select 
              value={user?.activeCircleId || ''} 
              onChange={(e) => handleCircleChange(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', fontWeight: '600', color: '#111827', outline: 'none' }}
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
            style={{ padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', width: '100%', marginTop: '8px' }}
          >
            Logout
          </button>
        </div>
      )}

      {/* 💅 CSS MAGIC FOR HOVER EFFECTS */}
      <style>{`
        @media (max-width: 1200px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
        @media (min-width: 1201px) {
          .mobile-menu { display: none !important; }
        }
        .nav-link-hover:hover { background-color: #f3f4f6 !important; }
        .hub-item-hover:hover { background-color: #f8fafc !important; }
        .logout-hover:hover { background-color: #fecaca !important; color: #dc2626 !important; }
      `}</style>
    </nav>
  );
}

export default Navbar;