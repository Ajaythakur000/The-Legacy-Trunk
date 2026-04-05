import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';

function Navbar() {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [myCircles, setMyCircles] = useState([]);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const hubRef = useRef(null);

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
        } catch (error) { console.error("Navbar circles error", error); }
      };
      fetchCircles();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hubRef.current && !hubRef.current.contains(event.target)) setIsHubOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '700',
      padding: '10px 20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: isActive ? '#fff' : '#475569',
      background: isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
      boxShadow: isActive ? '0 8px 15px rgba(37, 99, 235, 0.25)' : 'none',
    };
  };

  const activeCircleName = myCircles.find(c => c._id === user?.activeCircleId)?.circleName || 'Select Family';

  return (
    <nav style={navBarStyle}>
      <div style={containerStyle}>
        
        <Link to="/home" style={logoStyle}>
          <div style={logoIconStyle}>🛡️</div>
          <span style={logoTextStyle}>FamilyVault</span>
        </Link>

        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            
            <div style={navPillStyle}>
              {/* ✨ Cleaned Up Navigation Links */}
              <Link to="/home" style={getNavLinkStyle('/home')}>🏠 Home</Link>
              <Link to="/dashboard" style={getNavLinkStyle('/dashboard')}>⚙️ Dashboard</Link>
              <Link to="/memory-lane" style={getNavLinkStyle('/memory-lane')}>🛤️ Memory Lane</Link>
              <Link to="/my-stories" style={getNavLinkStyle('/my-stories')}>👤 My Stories</Link>
              
              {/* 🔮 NEW ORACLE LINK */}
              <Link to="/oracle" style={getNavLinkStyle('/oracle')}>🔮 Oracle</Link>
            </div>

            {/* 🏰 Legacy Switcher */}
            <div ref={hubRef} style={{ position: 'relative' }}>
              <button onClick={() => setIsHubOpen(!isHubOpen)} style={hubButtonStyle(isHubOpen)}>
                <span style={{ fontSize: '18px' }}>🏰</span>
                <span style={hubNameStyle}>{activeCircleName}</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
              </button>
              {isHubOpen && (
                <div style={dropdownBoxStyle}>
                  <div style={dropdownHeaderStyle}>SWITCH LEGACY</div>
                  {myCircles.map(circle => (
                    <div key={circle._id} onClick={() => { switchActiveCircle(circle._id); setIsHubOpen(false); }} style={circleItemStyle(user?.activeCircleId === circle._id)}>
                      {circle.circleName}
                      {user?.activeCircleId === circle._id && <span>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 💎 Bond Badge */}
            <Link to="/profile" style={bondBadgeStyle}>
              <span style={{ fontSize: '18px' }}>💎</span>
              <span>{user?.bondPoints || 0}</span>
            </Link>

            {/* 👤 User Profile & Logout */}
            <div style={userActionsStyle}>
              <Link to="/profile" style={avatarLinkStyle}>
                <img src={user?.avatar} alt="DP" style={avatarImgStyle} />
              </Link>
              <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
}

// ==========================================
// 💅 WOW FACTOR STYLES 
// ==========================================

const navBarStyle = {
  padding: '12px 40px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
  position: 'sticky', top: 0, zIndex: 1000,
  boxShadow: '0 4px 30px rgba(0,0,0,0.02)'
};

const containerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1500px', margin: '0 auto' };
const logoStyle = { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' };
const logoIconStyle = { background: '#1e293b', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' };
const logoTextStyle = { fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' };
const navPillStyle = { display: 'flex', gap: '6px', background: '#f1f5f9', padding: '6px', borderRadius: '18px', border: '1px solid #e2e8f0' };

const dropdownBoxStyle = {
  position: 'absolute', top: '140%', right: 0, minWidth: '240px', background: '#fff', borderRadius: '20px', padding: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', zIndex: 100
};

const dropdownItemStyle = { display: 'block', padding: '12px 16px', color: '#1e293b', textDecoration: 'none', fontSize: '14px', fontWeight: '700', borderRadius: '12px' };

const hubButtonStyle = (isOpen) => ({
  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: isOpen ? '#0f172a' : '#fff', color: isOpen ? '#fff' : '#0f172a', border: '1.5px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', fontWeight: '800'
});

const hubNameStyle = { maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' };

const bondBadgeStyle = {
  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: '10px 22px', borderRadius: '16px', fontWeight: '900', boxShadow: '0 8px 20px rgba(217, 119, 6, 0.3)'
};

const userActionsStyle = { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '6px 6px 6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0' };

const avatarLinkStyle = { display: 'flex', alignItems: 'center', textDecoration: 'none' };
const avatarImgStyle = { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' };
const logoutButtonStyle = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' };
const dropdownHeaderStyle = { fontSize: '11px', color: '#94a3b8', fontWeight: '900', padding: '10px 15px', letterSpacing: '1.5px' };
const circleItemStyle = (isActive) => ({ ...dropdownItemStyle, background: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#2563eb' : '#1e293b', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' });

export default Navbar;