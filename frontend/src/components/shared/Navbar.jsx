import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';
import api from '../../api/axios';
import { io } from 'socket.io-client';

function Navbar() {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [myCircles, setMyCircles] = useState([]);
  
  // States for Hub
  const [isHubOpen, setIsHubOpen] = useState(false);
  const hubRef = useRef(null);

  // States for Notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // States for User Profile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showChampionModal, setShowChampionModal] = useState(false);
  
  // 🔥 DYNAMIC CHAMPION STATE
  const [championUser, setChampionUser] = useState(null);

  // Fetch Circles, Notifications & Champion
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

      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
        } catch (err) { console.error("Failed to load notifications", err); }
      };

      fetchCircles();
      fetchNotifications();

      // Socket setup
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000');
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('setup_user', user._id);
      });

      newSocket.on('new_notification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      });

      return () => newSocket.disconnect();
    }
  }, [isAuthenticated, user]);

  // 🔥 FETCH CHAMPION WHEN CIRCLE CHANGES
  useEffect(() => {
    if (user?.activeCircleId) {
      const fetchChampion = async () => {
        try {
          const res = await api.get(`/circles/${user.activeCircleId}/top-contributor`);
          setChampionUser(res.data);
        } catch (err) { console.error("Failed to fetch champion", err); }
      };
      fetchChampion();
    }
  }, [user?.activeCircleId]);

  // Handle outside clicks for Hub and Notif
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hubRef.current && !hubRef.current.contains(event.target)) setIsHubOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: 'none', fontSize: '14px', fontWeight: '700', padding: '10px 20px', borderRadius: '12px',
      display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s',
      color: isActive ? '#fff' : '#475569',
      background: isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
      boxShadow: isActive ? '0 8px 15px rgba(37, 99, 235, 0.25)' : 'none',
    };
  };

  const activeCircleName = myCircles.find(c => c._id === user?.activeCircleId)?.circleName || 'Select Family';

  // Champion Modal
  const renderChampionModal = () => (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={() => setShowChampionModal(false)} style={closeModalBtnStyle}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '50px' }}>👑</span>
          <h2 style={{ margin: '10px 0 0 0', color: '#0f172a', fontWeight: '900' }}>Family Champion</h2>
          <p style={{ color: '#64748b', margin: '5px 0' }}>The driving force of our Legacy</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <img src={championUser?.avatar || "https://via.placeholder.com/150"} alt="Champion" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #f59e0b', objectFit: 'cover' }} />
          <h3 style={{ margin: '15px 0 5px 0', fontSize: '24px', color: '#1e293b' }}>{championUser?.name || "Unknown"}</h3>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Most Active Member</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav style={navBarStyle}>
        <div style={containerStyle}>
          
          <Link to="/home" style={logoStyle}>
            <div style={logoIconStyle}>🛡️</div>
            <span style={logoTextStyle}>FamilyVault</span>
          </Link>

          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              
              <div style={navPillStyle}>
                <Link to="/home" style={getNavLinkStyle('/home')}>🏠 Home</Link>
                <Link to="/dashboard" style={getNavLinkStyle('/dashboard')}>⚙️ Dashboard</Link>
                <Link to="/memory-lane" style={getNavLinkStyle('/memory-lane')}>🛤️ Memory Lane</Link>
                <Link to="/my-stories" style={getNavLinkStyle('/my-stories')}>👤 My Stories</Link>
                <Link to="/oracle" style={getNavLinkStyle('/oracle')}>🔮 Oracle</Link>
              </div>

              {/* 🏰 Legacy Switcher */}
              <div ref={hubRef} style={{ position: 'relative' }}>
                <button onClick={() => setIsHubOpen(!isHubOpen)} style={hubButtonStyle(isHubOpen)}>
                  <span style={{ fontSize: '18px' }}>🏰</span>
                  <span style={hubNameStyle}>{activeCircleName}</span>
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
                </button>
                {/* Fixed Gap Issue here too */}
                {isHubOpen && (
                  <div style={dropdownWrapperStyle}>
                    <div style={dropdownBoxStyle}>
                      <div style={dropdownHeaderStyle}>SWITCH LEGACY</div>
                      {myCircles.map(circle => (
                        <div key={circle._id} onClick={() => { switchActiveCircle(circle._id); setIsHubOpen(false); }} style={circleItemStyle(user?.activeCircleId === circle._id)}>
                          {circle.circleName}
                          {user?.activeCircleId === circle._id && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 🔔 Notifications */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} style={iconButtonStyle}>
                  🔔 {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
                </button>
                {/* Fixed Gap Issue here too */}
                {isNotifOpen && (
                  <div style={dropdownWrapperStyle}>
                    <div style={notifDropdownStyle}>
                      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a' }}>Notifications</span>
                      </div>
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>All caught up! 🎉</div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif._id} 
                              onClick={() => markAsRead(notif._id)}
                              style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: notif.isRead ? '#fff' : '#f0f9ff', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{notif.type === 'like' ? '❤️' : notif.type === 'comment' ? '💬' : '📌'}</span>
                                <div>
                                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e293b', fontWeight: notif.isRead ? '500' : '700' }}>{notif.message}</p>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 👤 User Profile (HOVER LOGIC + CLEAN MENU) */}
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button onClick={() => navigate('/profile')} style={avatarBtnStyle}>
                  <img src={user?.avatar || "https://via.placeholder.com/40"} alt="DP" style={avatarImgStyle} />
                </button>
                
                {/* 🔥 The Invisible Bridge Wrapper to prevent hover gap issue */}
                {isProfileOpen && (
                  <div style={dropdownWrapperStyle}>
                    <div style={profileDropdownStyle}>
                      
                      {/* USER INFO HEADER */}
                      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc' }}>
                        <img src={user?.avatar || "https://via.placeholder.com/40"} alt="DP" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{user?.name || 'User'}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>{user?.email}</div>
                        </div>
                      </div>

                      {/* SIMPLE MENU ITEMS */}
                      <div style={{ padding: '8px' }}>
                        <button 
                          onClick={() => { setIsProfileOpen(false); setShowChampionModal(true); }} 
                          style={dropdownLinkStyle}
                        >
                          👑 Top Contributor
                        </button>
                        
                        <Link to="/profile?edit=true" onClick={() => setIsProfileOpen(false)} style={dropdownLinkStyle}>
                          ✏️ Edit Profile
                        </Link>
                        
                        <button style={{ ...dropdownLinkStyle, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                          🎨 Theme (Coming Soon)
                        </button>
                        
                        <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>
                        
                        <button onClick={handleLogout} style={{ ...dropdownLinkStyle, color: '#ef4444' }}>
                          🚪 Signout
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </nav>

      {/* Render Champion Modal */}
      {showChampionModal && renderChampionModal()}
    </>
  );
}

// ==========================================
// 💅 WOW FACTOR STYLES 
// ==========================================

const navBarStyle = { padding: '12px 40px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 30px rgba(0,0,0,0.02)' };
const containerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1500px', margin: '0 auto' };
const logoStyle = { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' };
const logoIconStyle = { background: '#1e293b', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' };
const logoTextStyle = { fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' };
const navPillStyle = { display: 'flex', gap: '6px', background: '#f1f5f9', padding: '6px', borderRadius: '18px', border: '1px solid #e2e8f0' };

const iconButtonStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', position: 'relative', transition: 'all 0.2s' };
const badgeStyle = { position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' };

const avatarBtnStyle = { background: 'none', border: '2px solid #e2e8f0', borderRadius: '50%', padding: '2px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex' };
const avatarImgStyle = { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' };

// 🔥 THE INVISIBLE BRIDGE (Fixes Hover Gap Issue)
const dropdownWrapperStyle = { position: 'absolute', top: '100%', right: 0, paddingTop: '12px', zIndex: 100 };

const profileDropdownStyle = { minWidth: '240px', background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const notifDropdownStyle = { width: '320px', background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const dropdownBoxStyle = { minWidth: '240px', background: '#fff', borderRadius: '20px', padding: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9' };

const dropdownLinkStyle = { display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#334155', fontSize: '14px', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', textDecoration: 'none' };

const hubButtonStyle = (isOpen) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: isOpen ? '#0f172a' : '#fff', color: isOpen ? '#fff' : '#0f172a', border: '1.5px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', fontWeight: '800' });
const hubNameStyle = { maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' };
const dropdownHeaderStyle = { fontSize: '11px', color: '#94a3b8', fontWeight: '900', padding: '10px 15px', letterSpacing: '1.5px' };
const circleItemStyle = (isActive) => ({ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', color: isActive ? '#2563eb' : '#1e293b', background: isActive ? '#eff6ff' : 'transparent', textDecoration: 'none', fontSize: '14px', fontWeight: '700', borderRadius: '12px', cursor: 'pointer' });

// Modal Styles (Blur effect)
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.3s ease' };
const modalContentStyle = { background: '#ffffff', borderRadius: '32px', padding: '40px', width: '90%', maxWidth: '400px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'scaleUp 0.3s ease' };
const closeModalBtnStyle = { position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' };

export default Navbar;