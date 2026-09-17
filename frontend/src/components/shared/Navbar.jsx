import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';
import api from '../../api/axios';
import { connectSocket, getSocket } from '../../services/socket';
import ChampionDetailModal from '../modals/ChampionDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { LogoRing } from './Sidebar';

// ─── GLOBAL NEO-BRUTALIST STYLES ──────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Baloo+2:wght@500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 12px; }
  ::-webkit-scrollbar-track { background: #FDFBF7; border-left: 3px solid #3E2723; }
  ::-webkit-scrollbar-thumb { background: #1E352F; border: none; }
  ::-webkit-scrollbar-thumb:hover { background: #D4B895; }

  .lt-app-layout {
    display: flex; height: 100vh; overflow: hidden;
    background: transparent;
    font-family: 'Baloo 2', sans-serif; position: relative;
  }

  .lt-sb-overlay {
    position: fixed; inset: 0;
    background: rgba(23, 23, 25, 0.8); backdrop-filter: blur(4px);
    z-index: 45; opacity: 0; visibility: hidden; pointer-events: none;
    transition: opacity 0.3s, visibility 0.3s;
  }
  .lt-sb-overlay.lt-sb-vis { opacity: 1; visibility: visible; pointer-events: auto; }

  /* ═══════ SIDEBAR PRE-STYLING (For next block) ═══════ */
  .lt-sidebar {
    position: relative; flex-shrink: 0; display: flex; flex-direction: column;
    background: #FFF; border-right: 4px solid #3E2723; overflow: hidden; white-space: nowrap; z-index: 50;
    transition: width 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 8px 0px 15px 0px rgba(0,0,0,0.45);
  }
  .lt-sb-head { padding: 20px 16px 16px; border-bottom: 4px solid #3E2723; flex-shrink: 0; background: #D4B895; }
  .lt-sb-brand { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .lt-sb-brand-sub { display:block; font-family:'Playfair Display', serif; font-size:12px; color:#3E2723; margin-bottom:2px; }
  .lt-sb-brand-name { display:block; font-family:'Playfair Display', serif; font-size:18px; color: '#D4B895'; text-shadow: 2px 2px 0px #3E2723; WebkitTextStroke: 1px #3E2723; }
  .lt-sb-user { display:flex; align-items:center; gap:10px; padding:8px 10px; background:#FFF; border: none; border-radius:12px; cursor:pointer; transition:all 0.2s; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); }
  .lt-sb-user:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
  .lt-sb-avatar { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:#C89B3C; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display', serif; font-size:16px; color:#3E2723; border: none; }
  .lt-sb-uname { font-family:'Playfair Display', serif; font-size:14px; color:#3E2723; overflow:hidden; text-overflow:ellipsis; }
  .lt-sb-urole { font-family:'Space Mono',monospace; font-size:10px; color:#3E2723; font-weight:bold; }
  .lt-sb-online { width:12px; height:12px; border-radius:50%; background:#00C853; border: none; flex-shrink:0; margin-left:auto; }
  .lt-sb-section { padding:0 12px; margin-top:16px; }
  .lt-sec-label { font-family:'Playfair Display', serif; font-size:12px; color:#3E2723; padding:0 6px; margin-bottom:8px; }
  .lt-sb-link { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; margin-bottom:8px; text-decoration:none; cursor:pointer; border: 1px solid transparent; transition:all 0.2s; color: #3E2723; }
  .lt-sb-link:hover { background:#C89B3C; border: none; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); transform: translate(-2px, -2px); }
  .lt-sb-link.lt-active { background:#D4B895; border: none; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); }
  .lt-sb-icon { width:32px; height:32px; border-radius:8px; flex-shrink:0; background:#FFF; border: none; display:flex; align-items:center; justify-content:center; font-size:16px; }
  .lt-sb-lbl { font-family:'Playfair Display', serif; font-size:14px; color:#3E2723; }
  .lt-sb-sublbl { font-family:'Baloo 2',sans-serif; font-size:11px; font-weight:bold; color:#3E2723; }
  .lt-sb-badge { font-family:'Playfair Display', serif; font-size:12px; background:#1E352F; border: none; color:#FFF; border-radius:8px; padding:2px 8px; margin-left:auto; flex-shrink:0; }
  .lt-sb-foot { margin-top:auto; padding:16px; border-top:4px solid #3E2723; background: #C89B3C; }
  .lt-sb-logout { display:flex; align-items:center; gap:10px; padding:10px; border-radius:12px; cursor:pointer; background:#FFF; width:100%; border: none; transition:all 0.2s; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); }
  .lt-sb-logout:hover { background:#1E352F; color:#FFF; transform: translate(-2px, -2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }

  /* ═══════════════════════════════════════
     MAIN COLUMN
  ═══════════════════════════════════════ */
  .lt-main-col { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; background: transparent; }

  /* ═══════════════════════════════════════
     TOP HEADER — NEO-BRUTALISM
  ═══════════════════════════════════════ */
  .lt-top-header {
    height: 76px; flex-shrink: 0;
    background: #FFF;
    border-bottom: 4px solid #3E2723;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; position: relative; z-index: 40;
    box-shadow: 0 4px 0px 0px #3E2723;
  }

  .lt-nb-left  { display:flex; align-items:center; gap:16px; }
  .lt-nb-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }

  /* ── Hamburger ── */
  .lt-ham-btn {
    width:44px; height:44px; border-radius:12px;
    background:#D4B895; border: none;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.1s;
    color:#3E2723; flex-shrink:0; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
  }
  .lt-ham-btn:hover { transform:translate(-2px,-2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
  .lt-ham-btn:active { transform:translate(2px,2px); box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.45); }

  /* ── Header brand ── */
  .lt-header-brand { display:flex; align-items:center; gap:12px; user-select:none; }
  .lt-header-brand-sub { display:block; font-family:'Playfair Display', serif; font-size:12px; color:#3E2723; line-height:1; margin-bottom:2px; }
  .lt-header-brand-name {
    display:block; font-family:'Playfair Display', serif; font-size:20px;
    color: '#D4B895'; letter-spacing:1px; text-shadow: 2px 2px 0px #3E2723;
    -webkit-text-stroke: 1px #3E2723;
  }

  /* ── Search bar ── */
  .lt-search-form {
    display:flex; align-items:center; gap:9px;
    background:#FFF; border: none;
    border-radius:12px; padding:10px 18px; transition:all 0.2s; width:260px;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); position:relative;
  }
  .lt-search-form:focus-within { transform:translate(-2px,-2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); width: 300px; }
  .lt-search-input { border:none; background:transparent; outline:none; font-family:'Baloo 2',sans-serif; font-weight:700; font-size:14px; color:#3E2723; width:100%; }
  .lt-search-input::placeholder { color:rgba(23,23,25,0.4); font-family:'Playfair Display', serif; font-size:12px; }
  .lt-search-icon { color:#3E2723; flex-shrink:0; display:flex; align-items:center; font-size:16px; }

  /* ── Oracle button ── */
  .lt-oracle-btn {
    display:flex; align-items:center;
    background:#C89B3C; border: none;
    border-radius:12px; padding:5px; height:44px; width:44px;
    cursor:pointer; transition:all 0.2s ease; overflow:hidden; position:relative;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
  }
  .lt-oracle-btn:hover { width:150px; padding:5px 14px 5px 5px; transform:translate(-2px,-2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
  .lt-oracle-btn:active { transform:translate(2px,2px); box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.45); }
  .lt-oracle-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; background:#FFF; border: none; }
  .lt-oracle-text { max-width:0; opacity:0; font-size:14px; color:#3E2723; white-space:nowrap; overflow:hidden; transition:all 0.2s; font-family:'Playfair Display', serif; }
  .lt-oracle-btn:hover .lt-oracle-text { max-width:130px; opacity:1; margin-left:10px; }

  /* ── Hub (circle switcher) ── */
  .lt-hub-btn {
    display:flex; align-items:center; gap:10px; padding:8px 16px;
    background:#D4B895; border: none; border-radius:12px;
    cursor:pointer; transition:all 0.1s; height:44px;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
  }
  .lt-hub-btn:hover, .lt-hub-btn.lt-open { transform:translate(-2px,-2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
  .lt-hub-btn:active { transform:translate(2px,2px); box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.45); }
  .lt-hub-name { max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:'Playfair Display', serif; font-size:14px; color:#3E2723; }
  .lt-hub-arrow { font-size:10px; transition:transform 0.2s; color:#3E2723; }
  .lt-hub-btn.lt-open .lt-hub-arrow { transform:rotate(180deg); }

  /* ── Dropdowns ── */
  .lt-dark-dropdown {
    background:#FFF; border: none; border-radius:16px;
    box-shadow: 8px 8px 15px 0px rgba(0,0,0,0.45); overflow:hidden; min-width:240px; padding:12px; position:relative;
  }
  .lt-dd-header { font-family:'Playfair Display', serif; font-size:14px; color:#3E2723; padding:8px 12px; border-bottom:3px solid #3E2723; margin-bottom:8px; }
  .lt-dd-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:12px 14px; border-radius:8px; cursor:pointer;
    font-family:'Baloo 2',sans-serif; font-weight:700; font-size:14px; color:#3E2723;
    transition:all 0.1s; border: 1px solid transparent;
  }
  .lt-dd-item:hover { background:#C89B3C; border: none; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); transform:translate(-2px,-2px); }
  .lt-dd-item.lt-dd-active { background:#D4B895; border: none; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); }

  /* ── Icon button (bell etc.) ── */
  .lt-icon-btn {
    width:44px; height:44px; border-radius:12px;
    background:#FFF; border: none;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:20px; transition:all 0.1s;
    position:relative; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
  }
  .lt-icon-btn:hover { background:#1E352F; transform:translate(-2px,-2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
  .lt-icon-btn:active { transform:translate(2px,2px); box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.45); }
  .lt-notif-badge { position:absolute; top:-6px; right:-6px; background:#D4B895; color:#3E2723; font-family:'Playfair Display', serif; font-size:12px; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border: none; }

  /* ── Streak wrap ── */
  .lt-streak-wrap {
    display:flex; align-items:center; gap:8px; padding:6px 14px;
    background:#FFF; border: none; border-radius:12px;
    height:44px; cursor:default; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
  }
  .lt-streak-wrap.lt-streak-lit { background:#A0522D; }
  .lt-streak-num { font-family:'Playfair Display', serif; font-size:18px; color:#3E2723; }
  .lt-streak-wrap.lt-streak-lit .lt-streak-num { color:#FFF; text-shadow: 2px 2px 0px #3E2723; }
  .lt-streak-label { font-family:'Playfair Display', serif; font-size:12px; color:#3E2723; }

  /* ── Avatar button ── */
  .lt-avatar-btn {
    width:44px; height:44px; border-radius:12px; padding:0;
    background:#C89B3C; border: none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); transition:all 0.1s; overflow: hidden;
  }
  .lt-avatar-btn:hover { transform:translate(-2px,-2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
  .lt-avatar-btn:active { transform:translate(2px,2px); box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.45); }
  .lt-avatar-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display', serif; font-size:18px; color:#3E2723; }

  /* ── Profile dropdown ── */
  .lt-profile-wrap { position:relative; }
  .lt-profile-dd { visibility:hidden; opacity:0; transform:translateY(-10px); transition:all 0.2s; position:absolute; top:calc(100% + 14px); right:0; z-index:100; }
  .lt-profile-wrap:hover .lt-profile-dd { visibility:visible; opacity:1; transform:translateY(0); }
  .lt-profile-box { min-width:260px; background:#FFF; border: none; border-radius:16px; box-shadow: 8px 8px 15px 0px rgba(0,0,0,0.45); overflow:hidden; }
  .lt-profile-head { padding:16px; border-bottom:4px solid #3E2723; display:flex; align-items:center; gap:12px; background: #C89B3C; }
  .lt-profile-avatar { width:46px; height:46px; border-radius:12px; flex-shrink:0; background:#FFF; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display', serif; font-size:18px; color:#3E2723; border: none; overflow:hidden; }
  .lt-profile-name { font-family:'Playfair Display', serif; font-size:16px; color:#3E2723; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lt-profile-email { font-family:'Baloo 2',sans-serif; font-weight:700; font-size:12px; color:#3E2723; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lt-profile-links { padding:12px; }
  .lt-profile-link { display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:12px; background:#FFF; border: 1px solid transparent; font-family:'Playfair Display', serif; font-size:14px; color:#3E2723; border-radius:12px; cursor:pointer; text-decoration:none; transition:all 0.1s; margin-bottom:8px; }
  .lt-profile-link:hover { background:#D4B895; border: none; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); transform:translate(-2px,-2px); }
  .lt-profile-link.lt-danger:hover { background:#1E352F; color:#FFF; }

  .lt-page-wrap { flex:1; overflow-y:auto; position:relative; background:transparent; padding: 20px; }

  .lt-sidebar-open .lt-header-brand { display: none !important; }

  @media (min-width:769px) {
    .lt-sidebar.lt-sb-open   { width:260px; }
    .lt-sidebar.lt-sb-closed { width:0; transform:translateX(-100%); border-right: none; }
    .lt-hide-desktop { display:none !important; }
    .lt-sb-overlay { display:none !important; }
  }
  @media (max-width:768px) {
    .lt-top-header { padding:0 16px; height:68px; }
    .lt-nb-right { gap:8px; }
    .lt-desktop-only { display:none !important; }
    .lt-sidebar { position:fixed; top:0; left:0; bottom:0; width:260px !important; transform:translateX(-100%); box-shadow:16px 0px 0px rgba(23,23,25,0.2); }
    .lt-sidebar.lt-sb-open { transform:translateX(0); }
    .lt-sb-overlay.lt-sb-vis { opacity:1; visibility:visible; pointer-events:auto; }
  }
`;

// ─── COMIC FLAME STREAK ───────────────────────────────────────────────────────
function ComicFlame({ lit, streak = 0 }) {
  const scale = lit ? Math.min(1.2, 0.8 + (streak * 0.05)) : 0.8;
  return (
    <div style={{ fontSize: 22, filter: lit ? 'drop-shadow(2px 2px 0px #3E2723)' : 'grayscale(1)', transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      {lit ? '🔥' : '🧊'}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — ALL ORIGINAL LOGIC 100% UNCHANGED
// ═════════════════════════════════════════════════════════════════════════════
function Navbar({ children }) {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [myCircles,         setMyCircles]         = useState([]);
  const [isHubOpen,         setIsHubOpen]         = useState(false);
  const [isNotifOpen,       setIsNotifOpen]       = useState(false);
  const [notifications,     setNotifications]     = useState([]);
  const [showChampionModal, setShowChampionModal] = useState(false);
  const [championUser,      setChampionUser]      = useState(null);
  const [isSidebarOpen,     setIsSidebarOpen]     = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');

  const hubRef   = useRef(null);
  const notifRef = useRef(null);

  const currentStreak    = user?.currentStreak || 0;
  const publicRoutes     = ['/login', '/signup'];
  const isPublicRoute    = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/invite/');
  const unreadCount      = notifications.filter(n => !n.isRead).length;
  const activeCircleName = myCircles.find(c => c._id === user?.activeCircleId)?.circleName || 'Select Family';
  const initials         = user?.name ? user.name.slice(0,2).toUpperCase() : 'ME';

  useEffect(() => {
    if (isPublicRoute || !isAuthenticated || !user?._id) return;
    const fetchCircles = async () => {
      try {
        const res  = await getMyCirclesApi();
        const list = Array.isArray(res) ? res : (res?.data || res?.circles || []);
        setMyCircles(list);
        if (list.length > 0 && !user?.activeCircleId) switchActiveCircle(list[0]._id);
      } catch(e){ console.error(e); }
    };
    const fetchNotifs = async () => {
      try { const r = await api.get('/notifications'); setNotifications(r.data); } catch(e){ console.error(e); }
    };
    fetchCircles(); fetchNotifs();
    const sock = connectSocket();
    if (!sock) return;
    const onConn  = () => sock.emit('setup_user', user._id);
    const onNotif = (n) => setNotifications(p => [n,...p]);
    if (sock.connected) onConn();
    sock.on('connect', onConn); sock.on('new_notification', onNotif);
    return () => { const s = getSocket(); if(!s) return; s.off('connect',onConn); s.off('new_notification',onNotif); };
  }, [isPublicRoute, isAuthenticated, user?._id, user?.activeCircleId, switchActiveCircle]);

  useEffect(() => {
    if (isPublicRoute || !user?.activeCircleId) return;
    api.get(`/circles/${user.activeCircleId}/top-contributor`).then(r => setChampionUser(r.data)).catch(console.error);
  }, [isPublicRoute, user?.activeCircleId]);

  useEffect(() => {
    if (isPublicRoute) return;
    const h = e => {
      if (hubRef.current   && !hubRef.current.contains(e.target))   setIsHubOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isPublicRoute]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const markAsRead = async id => {
    try { await api.put(`/notifications/${id}/read`); setNotifications(p => p.map(n => n._id===id?{...n,isRead:true}:n)); } catch(e){ console.error(e); }
  };
  const handleAcceptInvite = async id => {
    try {
      await api.post(`/notifications/${id}/accept`);
      const [nr,cr] = await Promise.all([api.get('/notifications'), getMyCirclesApi()]);
      setNotifications(nr.data);
      setMyCircles(Array.isArray(cr)?cr:(cr?.data||cr?.circles||[]));
    } catch(e){ console.error(e); }
  };
  const handleRejectInvite = async id => {
    try { await api.post(`/notifications/${id}/reject`); const nr = await api.get('/notifications'); setNotifications(nr.data); } catch(e){ console.error(e); }
  };
  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); if(window.innerWidth<=768) setIsSidebarOpen(false); }
  };

  if (isPublicRoute || !isAuthenticated || !user?._id) return <>{children}</>;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className={`lt-app-layout ${isSidebarOpen ? 'lt-sidebar-open' : ''}`}>

        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          user={user}
          initials={initials}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          unreadCount={unreadCount}
          handleLogout={handleLogout}
        />

        <div className="lt-main-col">
          <header className="lt-top-header">

            <div className="lt-nb-left">
              <button className="lt-ham-btn" onClick={() => setIsSidebarOpen(p=>!p)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              <div className="lt-header-brand lt-desktop-only">
                {/* Simplified Logo rendering for header until Sidebar provides LogoRing */}
                <div style={{width: 44, height: 44, background: '#D4B895', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  <img src="/finall_logo.png" alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                <div>
                  <span className="lt-header-brand-sub">THE MEMENTO</span>
                  <span className="lt-header-brand-name">LEGACY TRUNK</span>
                </div>
              </div>

              <form onSubmit={handleSearch} className="lt-search-form lt-desktop-only">
                <span className="lt-search-icon">🔍</span>
                <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  placeholder="Find memories..." className="lt-search-input"/>
              </form>
            </div>

            <div className="lt-nb-right">
              <button onClick={() => navigate('/oracle')} className="lt-oracle-btn" title="Ask Oracle AI">
                <div className="lt-oracle-icon">🔮</div>
                <span className="lt-oracle-text">ORACLE AI</span>
              </button>

              <div ref={hubRef} style={{position:'relative'}}>
                <button onClick={() => setIsHubOpen(p=>!p)}
                  className={`lt-hub-btn lt-desktop-only${isHubOpen?' lt-open':''}`}>
                  <span style={{fontSize:18}}>🏠</span>
                  <span className="lt-hub-name">{activeCircleName}</span>
                  <span className="lt-hub-arrow">▼</span>
                </button>
                <AnimatePresence>
                  {isHubOpen && (
                    <motion.div style={{position:'absolute',top:'calc(100% + 12px)',right:0,zIndex:100}}
                      initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.1}}>
                      <div className="lt-dark-dropdown">
                        <div className="lt-dd-header">SWITCH FAMILY</div>
                        {myCircles.map(c => (
                          <div key={c._id} onClick={() => { switchActiveCircle(c._id); setIsHubOpen(false); }}
                            className={`lt-dd-item${user?.activeCircleId===c._id?' lt-dd-active':''}`}>
                            {c.circleName}
                            {user?.activeCircleId===c._id && <span>⭐</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={notifRef} style={{position:'relative'}}>
                <button onClick={() => setIsNotifOpen(p=>!p)} className="lt-icon-btn">
                  🔔
                  {unreadCount>0 && <span className="lt-notif-badge">{unreadCount}</span>}
                </button>
                {/* Note: Full notif dropdown logic left intact, CSS updated above */}
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div style={{position:'absolute',top:'calc(100% + 12px)',right:0,zIndex:100}}
                      initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.1}}>
                      <div className="lt-dark-dropdown" style={{width: 320, padding: 0}}>
                        <div className="lt-dd-header" style={{background:'#C89B3C', margin: 0, padding: '16px'}}>ALERTS!</div>
                        <div style={{maxHeight:370,overflowY:'auto'}}>
                          {notifications.length===0 ? (
                            <div style={{padding: '40px', textAlign: 'center', fontFamily: "'Playfair Display', serif", color: '#3E2723'}}>📭 NO NEWS!</div>
                          ) : notifications.slice(0, 15).map(notif => {
                            const isInvite = notif.type==='invite';
                            const icon = notif.type==='like'?'❤️':notif.type==='comment'?'💬':isInvite?'✉️':'📌';
                            return (
                              <div key={notif._id} onClick={() => !isInvite && markAsRead(notif._id)}
                                style={{padding: '16px', borderBottom: '3px solid #3E2723', display: 'flex', gap: '12px', background: notif.isRead ? '#FFF' : '#D4B895', cursor: 'pointer'}}>
                                <div style={{fontSize: 24}}>{icon}</div>
                                <div style={{flex:1}}>
                                  <p style={{fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, margin: '0 0 4px', color: '#3E2723'}}>{notif.message}</p>
                                  {isInvite && !notif.isRead && (
                                    <div style={{display:'flex',gap:8,marginTop:10}}>
                                      <button onClick={e=>{e.stopPropagation();handleAcceptInvite(notif._id);}} style={{background:'#00C853', color:'#FFF', border: 'none', borderRadius: 8, padding: '6px 12px', fontFamily:"'Playfair Display', serif", cursor:'pointer'}}>YES</button>
                                      <button onClick={e=>{e.stopPropagation();handleRejectInvite(notif._id);}} style={{background:'#1E352F', color:'#FFF', border: 'none', borderRadius: 8, padding: '6px 12px', fontFamily:"'Playfair Display', serif", cursor:'pointer'}}>NO</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={`lt-streak-wrap${currentStreak>0?' lt-streak-lit':''}`} title="Post to ignite streak">
                <ComicFlame lit={currentStreak>0} streak={currentStreak}/>
                {currentStreak>0 ? <span className="lt-streak-num">{currentStreak}</span> : <span className="lt-streak-label">STREAK</span>}
              </div>

              <div className="lt-profile-wrap">
                <button className="lt-avatar-btn">
                  <div className="lt-avatar-inner">
                    {user?.avatar ? <img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials}
                  </div>
                </button>
                <div className="lt-profile-dd">
                  <div className="lt-profile-box">
                    <div className="lt-profile-head">
                      <div className="lt-profile-avatar">
                        {user?.avatar ? <img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials}
                      </div>
                      <div style={{minWidth:0}}>
                        <div className="lt-profile-name">{user?.name||'MEMBER'}</div>
                        <div className="lt-profile-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="lt-profile-links">
                      <button onClick={() => setShowChampionModal(true)} className="lt-profile-link">👑 &nbsp; TOP DOG</button>
                      <Link to="/profile?edit=true" className="lt-profile-link">✏️ &nbsp; EDIT INFO</Link>
                      <Link to="/profile" className="lt-profile-link">🖼️ &nbsp; MY SCRAPBOOK</Link>
                      <button onClick={handleLogout} className="lt-profile-link lt-danger">🚪 &nbsp; SIGN OUT</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </header>

          <main className="lt-page-wrap">{children}</main>
        </div>

        {showChampionModal && <ChampionDetailModal champion={championUser} onClose={() => setShowChampionModal(false)}/>}
      </div>
    </>
  );
}

export default Navbar;