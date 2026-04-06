import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';
import api from '../../api/axios';
import { io } from 'socket.io-client';
import ChampionDetailModal from '../modals/ChampionDetailModal'; 
import { motion } from 'framer-motion';

// 🔥 Layout Wrapper
function Navbar({ children }) {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [myCircles, setMyCircles] = useState([]);
  
  const [isHubOpen, setIsHubOpen] = useState(false);
  const hubRef = useRef(null);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const [showChampionModal, setShowChampionModal] = useState(false);
  const [championUser, setChampionUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔥 STREAK LOGIC
  // Current streak backend se aayegi. Jab user login hai, hum assume kar rahe hain aaj visit ho gaya (always filled).
  const currentStreak = user?.currentStreak || 0;

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

  const handleAcceptInvite = async (id) => {
    try {
      await api.post(`/notifications/${id}/accept`);
      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data);
      const circlesRes = await getMyCirclesApi();
      setMyCircles(Array.isArray(circlesRes) ? circlesRes : (circlesRes?.data || circlesRes?.circles || []));
    } catch (err) { console.error("Failed to accept invite", err); }
  };

  const handleRejectInvite = async (id) => {
    try {
      await api.post(`/notifications/${id}/reject`);
      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data);
    } catch (err) { console.error("Failed to reject invite", err); }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeCircleName = myCircles.find(c => c._id === user?.activeCircleId)?.circleName || 'Select Family';

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: 'none', fontSize: '15px', fontWeight: '600', padding: '12px 20px', borderRadius: '12px',
      display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
      color: isActive ? '#fff' : '#94a3b8',
      background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
      borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent'
    };
  };

  if (!isAuthenticated) { return <>{children}</>; }

  return (
    <div className="app-layout">
      
      {/* 📱 MOBILE OVERLAY */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* 🌑 DARK SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/web-app-manifest-192x192.png" 
            alt="Memento Logo" 
            style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#F9F3E8', padding: '2px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
          />
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
            Memento
          </div>
        </div>
        
        <div className="mobile-search-container">
           <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>🔍</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search legacy..." className="mobile-search-input" />
           </form>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px', marginTop: '10px' }}>
          <Link to="/home" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/home')}><span>🏠</span> Home</Link>
          <Link to="/dashboard" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/dashboard')}><span>⚙️</span> Dashboard</Link>
          <Link to="/memory-lane" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/memory-lane')}><span>🛤️</span> Memory Lane</Link>
          <Link to="/my-stories" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/my-stories')}><span>👤</span> My Stories</Link>
          <Link to="/vault-stories" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/vault-stories')}><span>📸</span> Vault Stories</Link>
          <Link to="/vault" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/vault')}><span>💬</span> Family Chat</Link>
          <Link to="/leaderboard" onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)} style={getNavLinkStyle('/leaderboard')}><span>🏆</span> Leaderboard</Link>
        </nav>
      </aside>

      {/* ☀️ MAIN CONTENT AREA */}
      <div className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hamburger-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            <Link to="/home" className={`header-brand ${isSidebarOpen ? 'hide-on-desktop' : ''}`}>
                <img src="/web-app-manifest-192x192.png" alt="Logo" style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F9F3E8', padding: '2px', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                <span className="header-brand-text">Memento</span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="global-search-form desktop-only">
            <span style={{ color: '#64748b', fontSize: '16px' }}>🔍</span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your legacy..." className="global-search-input" />
          </form>

          {/* Right: Actions */}
          <div className="header-actions">
            
            <motion.button 
              onClick={() => navigate('/oracle')} 
              className="oracle-ai-btn"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="oracle-icon-wrapper"><span className="oracle-sparkle">🔮</span></div>
              <span className="oracle-btn-text">Ask Oracle AI</span>
            </motion.button>

            <div ref={hubRef} style={{ position: 'relative' }}>
              <button onClick={() => setIsHubOpen(!isHubOpen)} className="hub-button" style={hubButtonStyle(isHubOpen)}>
                <span style={{ fontSize: '16px' }}>🏰</span>
                <span style={hubNameStyle} className="desktop-only">{activeCircleName}</span>
                <span className="desktop-only" style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
              </button>
              {isHubOpen && (
                <div style={dropdownWrapperStyle}><div style={dropdownBoxStyle}><div style={dropdownHeaderStyle}>SWITCH LEGACY</div>
                    {myCircles.map(circle => (<div key={circle._id} onClick={() => { switchActiveCircle(circle._id); setIsHubOpen(false); }} style={circleItemStyle(user?.activeCircleId === circle._id)}>{circle.circleName}{user?.activeCircleId === circle._id && <span>✓</span>}</div>))}
                </div></div>
              )}
            </div>

            {/* 🔔 Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <motion.button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className="icon-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
              >
                🔔 {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
              </motion.button>
              
              {isNotifOpen && (
                <div style={dropdownWrapperStyle} className="notif-dropdown-wrapper">
                  <div style={notifDropdownStyle} className="notif-dropdown-box">
                    <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}><span style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>Notifications</span>{unreadCount > 0 && <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{unreadCount} New</span>}</div>
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (<div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}><div style={{ fontSize: '30px', marginBottom: '8px' }}>📭</div><div style={{ fontWeight: '600' }}>All caught up!</div></div>) : 
                        (notifications.map(notif => {
                          const isInvite = notif.type === 'invite';
                          let icon = notif.type === 'like' ? '❤️' : notif.type === 'comment' ? '💬' : isInvite ? '✉️' : '📌';
                          return (<div key={notif._id} onClick={() => !isInvite && markAsRead(notif._id)} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: notif.isRead ? '#fff' : '#f0f9ff', cursor: isInvite && !notif.isRead ? 'default' : 'pointer', display: 'flex', gap: '14px', alignItems: 'flex-start' }}><div style={{ fontSize: '18px', background: '#fff', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div><div style={{ flex: 1 }}><p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a', fontWeight: notif.isRead ? '500' : '700', lineHeight: '1.4' }}>{notif.message}</p><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                {isInvite && !notif.isRead && (
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleAcceptInvite(notif._id); }} className="notif-btn-accept">Accept</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleRejectInvite(notif._id); }} className="notif-btn-decline">Decline</button>
                                  </div>
                                )}
                              </div></div>);
                        }))}
                    </div>
                </div></div>
              )}
            </div>

            {/* 🔥 THE LEGACY FLAME (STREAK INDICATOR) - Placed correctly! */}
            <div 
              title="Your active legacy streak!"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '99px',
                background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)', // Always filled gold
                border: '1px solid #facc15',
                boxShadow: '0 0 10px rgba(234, 179, 8, 0.4)', // Glowing effect
                color: '#a16207',
                fontWeight: '800', fontSize: '14px',
                transition: 'all 0.3s ease', cursor: 'default'
              }}
            >
              <svg 
                width="18" height="18" viewBox="0 0 24 24" 
                fill="#eab308" // Solid fill
                stroke="#ca8a04" 
                strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
              <span>{currentStreak}</span>
            </div>

            {/* 👤 Profile */}
            <div className="profile-dropdown-container" style={{ position: 'relative' }}>
              <motion.button 
                onClick={() => navigate('/profile')} 
                className="avatar-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={user?.avatar || "https://via.placeholder.com/40"} alt="DP" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </motion.button>
              
              <div className="profile-dropdown-menu" style={dropdownWrapperStyle}>
                 <div style={profileDropdownStyle} className="profile-dropdown-box">
                     <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc' }}><img src={user?.avatar || "https://via.placeholder.com/40"} alt="DP" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /><div style={{ overflow: 'hidden' }}><div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div><div style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div></div></div>
                  <div style={{ padding: '8px' }}>
                    <button onClick={() => setShowChampionModal(true)} style={dropdownLinkStyle}>👑 Top Contributor</button>
                    <Link to="/profile?edit=true" style={dropdownLinkStyle}>✏️ Edit Profile</Link>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>
                    <button onClick={handleLogout} style={{ ...dropdownLinkStyle, color: '#ef4444' }}>🚪 Signout</button>
                  </div>
              </div></div>
            </div>

          </div>
        </header>
        <main className="page-wrapper">{children}</main>
      </div>

      {showChampionModal && (
        <ChampionDetailModal 
          champion={championUser} 
          onClose={() => setShowChampionModal(false)} 
        />
      )}

      {/* 🔥 RESPONSIVE CSS MAGIC 🔥 */}
      <style>{`
        /* Master Layout */
        .app-layout { display: flex; height: 100vh; overflow: hidden; background: #f8fafc; font-family: system-ui, -apple-system, sans-serif; position: relative; }
        
        /* Main Area */
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; min-width: 0; }
        .top-header { height: 76px; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226,232,240,0.8); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; z-index: 40; box-sizing: border-box; width: 100%; }
        .page-wrapper { flex: 1; overflow-y: auto; position: relative; }
        .header-actions { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }

        /* Hamburger */
        .hamburger-btn { background: transparent; border: none; color: #334155; cursor: pointer; padding: 10px; border-radius: 12px; display: flex; align-items: center; transition: background 0.2s; z-index: 60; }
        .hamburger-btn:hover { background: #f1f5f9; color: #0f172a; }

        /* BRAND LOGO IN HEADER */
        .header-brand { display: flex; align-items: center; gap: 10px; margin-left: 8px; text-decoration: none; cursor: pointer; transition: opacity 0.3s; }
        .header-brand-text { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; transition: color 0.2s ease; }
        .header-brand:hover .header-brand-text { color: #3b82f6; }

        /* Desktop Search Bar */
        .global-search-form { display: flex; align-items: center; background: #f1f5f9; border-radius: 99px; padding: 10px 20px; border: 2px solid transparent; transition: all 0.3s ease; width: 240px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .global-search-form:focus-within { background: #fff; border-color: #3b82f6; width: 340px; box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
        .global-search-input { border: none; background: transparent; outline: none; padding: 0 0 0 10px; width: 100%; font-size: 14px; font-weight: 500; color: #0f172a; }
        .global-search-input::placeholder { color: #94a3b8; }
        .mobile-search-container { display: none; }

        /* Oracle Button */
        .oracle-ai-btn { background: rgba(241, 245, 249, 0.6); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 99px; padding: 4px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: flex-start; gap: 0px; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .oracle-icon-wrapper { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.4s ease; background: transparent; }
        .oracle-sparkle { font-size: 32px; color: #64748b; transition: all 0.4s ease; filter: grayscale(100%) opacity(0.5); }
        .oracle-btn-text { max-width: 0; opacity: 0; font-weight: 800; font-size: 14px; white-space: nowrap; color: white; transition: all 0.4s ease; overflow: hidden; }
        
        .oracle-ai-btn:hover { width: 175px; padding: 4px 20px 4px 6px; background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); background-size: 200% 200%; border-color: transparent; animation: gradientShift 4s ease infinite; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 8px 15px -5px rgba(0,0,0,0.1); }
        .oracle-ai-btn:hover .oracle-icon-wrapper { background: rgba(255,255,255,0.2); }
        .oracle-ai-btn:hover .oracle-sparkle { filter: grayscale(0%) opacity(1) drop-shadow(0 0 10px rgba(255,255,255,0.9)); color: white; transform: scale(1.3); }
        .oracle-ai-btn:hover .oracle-btn-text { max-width: 150px; opacity: 1; margin-left: 12px; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        /* Notification buttons */
        .notif-btn-accept { flex: 1; background: #10b981; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px; transition: all 0.2s ease; }
        .notif-btn-accept:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); }
        .notif-btn-decline { flex: 1; background: #fff; color: #ef4444; border: 1px solid #fecaca; padding: 10px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px; transition: all 0.2s ease; }
        .notif-btn-decline:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; transform: translateY(-2px); }

        .icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 50%; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 19px; position: relative; color: #475569; }
        .avatar-btn { background: transparent; border: 2px solid #e2e8f0; border-radius: 50%; width: 46px; height: 46px; padding: 2px; cursor: pointer; display: flex; }
        
        .profile-dropdown-menu { visibility: hidden; opacity: 0; transform: translateY(-10px); transition: all 0.2s ease; }
        .profile-dropdown-container:hover .profile-dropdown-menu { visibility: visible; opacity: 1; transform: translateY(0); }

        /* ==========================================
           📱 MOBILE RESPONSIVENESS (PWA MAGIC)
           ========================================== */
        
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 45; opacity: 0; transition: opacity 0.3s ease; }
        .sidebar { background: #0f172a; color: #fff; display: flex; flex-direction: column; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease; white-space: nowrap; overflow: hidden; z-index: 50; }

        @media (min-width: 769px) {
          .sidebar-open { width: 260px; transform: translateX(0); }
          .sidebar-closed { width: 0px; transform: translateX(-100%); }
          .hide-on-desktop { display: none !important; }
        }

        /* 📱 PHONE VIEW (< 768px) */
        @media (max-width: 768px) {
          .top-header { padding: 0 12px; height: 64px; }
          .header-actions { gap: 10px; }
          .desktop-only { display: none !important; }

          .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 260px !important; transform: translateX(-100%); box-shadow: 10px 0 30px rgba(0,0,0,0.2); }
          .sidebar-open { transform: translateX(0); }
          .sidebar-overlay.visible { display: block; opacity: 1; }

          .oracle-ai-btn { width: 40px; height: 40px; padding: 2px; }
          .oracle-icon-wrapper { width: 34px; height: 34px; }
          .oracle-sparkle { font-size: 24px; }
          .icon-btn, .avatar-btn { width: 40px; height: 40px; }

          .notif-dropdown-wrapper { right: -50px; }
          .notif-dropdown-box { width: 300px; }
          .profile-dropdown-box { width: 220px; }

          .mobile-search-container { display: block; padding: 0 16px; margin-top: 10px; margin-bottom: 10px; }
          .mobile-search-form { display: flex; align-items: center; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px; }
          .mobile-search-input { border: none; background: transparent; outline: none; padding-left: 8px; width: 100%; color: #fff; font-size: 14px; }
          .mobile-search-input::placeholder { color: #94a3b8; }
        }
      `}</style>
    </div>
  );
}

const badgeStyle = { position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '19px', height: '19px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' };
const dropdownWrapperStyle = { position: 'absolute', top: '100%', right: 0, paddingTop: '12px', zIndex: 100 };
const profileDropdownStyle = { minWidth: '240px', background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const notifDropdownStyle = { width: '340px', background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const dropdownBoxStyle = { minWidth: '240px', background: '#fff', borderRadius: '20px', padding: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9' };
const dropdownLinkStyle = { display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#334155', fontSize: '14px', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', textDecoration: 'none' };
const hubButtonStyle = (isOpen) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: isOpen ? '#f1f5f9' : 'transparent', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', transition: 'background 0.2s' });
const hubNameStyle = { maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' };
const dropdownHeaderStyle = { fontSize: '11px', color: '#94a3b8', fontWeight: '900', padding: '10px 15px', letterSpacing: '1.5px' };
const circleItemStyle = (isActive) => ({ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', color: isActive ? '#2563eb' : '#1e293b', background: isActive ? '#eff6ff' : 'transparent', textDecoration: 'none', fontSize: '14px', fontWeight: '700', borderRadius: '12px', cursor: 'pointer' });

export default Navbar;