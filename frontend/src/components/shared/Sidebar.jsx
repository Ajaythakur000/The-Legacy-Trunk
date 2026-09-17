import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Zap, ScrollText, Image as ImageIcon, Trophy, MessageSquare, Route, Radar, LogOut } from 'lucide-react';

// ─── NAV DATA ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to:'/home',          icon: <Home size={18} strokeWidth={1.5} />, label:'HOME',          sub:null },
  { to:'/dashboard',     icon: <Zap size={18} strokeWidth={1.5} />, label:'DASHBOARD',     sub:'MEMORY UNIVERSE' },
  { to:'/my-stories',    icon: <ScrollText size={18} strokeWidth={1.5} />, label:'MY STORIES',    sub:null },
  { to:'/vault-stories', icon: <ImageIcon size={18} strokeWidth={1.5} />, label:'VAULT STORIES', sub:null },
  { to:'/leaderboard',   icon: <Trophy size={18} strokeWidth={1.5} />, label:'LEADERBOARD',   sub:'FAMILY CHAMPIONS' },
];

const TOOL_LINKS = [
  { to:'/vault',       icon: <MessageSquare size={18} strokeWidth={1.5} />, label:'FAMILY CHAT',  sub:null },
  { to:'/memory-lane', icon: <Route size={18} strokeWidth={1.5} />, label:'MEMORY LANE',  sub:'TIMELINE OF SOULS' },
  { to:'/radar',       icon: <Radar size={18} strokeWidth={1.5} />, label:'FAMILY RADAR', sub:'LIVE LOCATIONS' },
];

// ─── SIDEBAR LINK ─────────────────────────────────────────────────────────────
function SbLink({ to, icon, label, sub, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`lt-sb-link${active ? ' lt-active' : ''}`}>
      <div className="lt-sb-icon-wrap" style={{ color: "#3E2723" }}>
        <span className="lt-sb-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="lt-sb-lbl">{label}</div>
        {sub && <div className="lt-sb-sublbl">{sub}</div>}
      </div>
    </Link>
  );
}

// ─── COMIC LOGO RING ──────────────────────────────────────────────────────────
export function LogoRing({ size = 48 }) {
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <div style={{
        position:'absolute', inset:0,
        background:'#D4B895', border: 'none',
        borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', overflow:'hidden',
        /* animation removed */
      }}>
        {/* Jagged sunburst overlay inside */}
        <div style={{ width: '120%', height: '120%', background: '#C89B3C', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
      </div>
      <div style={{
        position:'absolute', top:4, left:4, right:4, bottom:4, borderRadius:'50%',
        background:'#FFF', border: 'none', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <img src="/finall_logo.png" alt="LT"
          style={{ width:'110%', height:'110%', objectFit:'cover', borderRadius:'50%' }}
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
        />
        <div style={{
          display:'none', alignItems:'center', justifyContent:'center',
          width:'100%', height:'100%', color:'#3E2723',
          fontFamily:"'Playfair Display', serif", fontSize:size*0.4,
        }}>LT</div>
      </div>
    </div>
  );
}

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────
export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  user,
  initials,
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`lt-sb-overlay${isSidebarOpen ? ' lt-sb-vis' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* ══════ SIDEBAR ══════ */}
      <aside className={`lt-sidebar${isSidebarOpen ? ' lt-sb-open' : ' lt-sb-closed'}`}>

        {/* ── HEAD: user card ── */}
        <div className="lt-sb-head">
          <div className="lt-sb-user" onClick={() => navigate('/profile')}>
            <div className="lt-sb-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
                : initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="lt-sb-uname">{user?.name || 'FAMILY MEMBER'}</div>
              <div className="lt-sb-urole">
                {user?.role === 'admin' ? 'ADMIN' : 'MEMBER'}
              </div>
            </div>
            <div className="lt-sb-online"/>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div style={{ flex:1, minHeight: 0, overflowY:'auto', overflowX:'hidden', paddingBottom: 20 }}>

          {/* Mobile search */}
          <div className="lt-mobile-search">
            <form onSubmit={handleSearch} className="lt-mobile-search-form">
              <span style={{ fontSize: 16 }}>🔍</span>
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH..."
                className="lt-mobile-search-input"
              />
            </form>
          </div>

          {/* Main menu */}
          <div className="lt-sb-section">
            <div className="lt-sec-label">MAIN MENU</div>
            {NAV_LINKS.map(({ to, icon, label, sub }) => (
              <SbLink key={to} to={to} icon={icon} label={label} sub={sub} active={location.pathname === to} />
            ))}
          </div>

          {/* Family tools */}
          <div className="lt-sb-section" style={{ marginTop:8 }}>
            <div className="lt-sec-label">FAMILY TOOLS</div>
            {TOOL_LINKS.map(({ to, icon, label, sub }) => (
              <SbLink key={to} to={to} icon={icon} label={label} sub={sub} active={location.pathname === to} />
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="lt-sb-foot">
          <button className="lt-sb-logout" onClick={handleLogout}>
            <div className="lt-sb-icon-wrap" style={{ border: "none", background: "transparent", color: "#FDFBF7", display: "flex", alignItems: "center", justifyContent: "center" }}><LogOut size={20} strokeWidth={1.5} /></div>
            <span className="lt-sb-lbl" style={{ color: '#FDFBF7' }}>
              LEAVE THE VAULT
            </span>
          </button>
        </div>

      </aside>

      {/* ══════ ALL SIDEBAR CSS ══════ */}
      <style>{`
        @keyframes ltComicSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ltActivePop  { 0% { transform: scale(0.95); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

        /* ── Sidebar shell ── */
        .lt-sidebar {
          position: relative; height: 100%; width: 280px; flex-shrink: 0;
          background: #FFF; border-right: 4px solid #3E2723;
          display: flex; flex-direction: column; z-index: 50; overflow-x: hidden;
          transition: width 0.2s, transform 0.2s;
          box-shadow: 8px 0px 0px rgba(23,23,25,0.1);
        }

        /* Desktop close logic */
        @media (min-width: 769px) { .lt-sidebar.lt-sb-closed { width: 0px; border-right: none; } }
        /* Mobile open/close logic */
        @media (max-width: 768px) {
          .lt-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px !important; }
          .lt-sb-closed { transform: translateX(-100%); }
          .lt-sb-open   { transform: translateX(0); }
        }

        /* ── Overlay ── */
        .lt-sb-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(23,23,25,0.8); backdrop-filter: blur(4px); z-index: 49;
        }
        .lt-sb-overlay.lt-sb-vis { display: block; }

        /* ── Head: user card ── */
        .lt-sb-head { padding: 20px 16px 16px; border-bottom: 4px solid #3E2723; background: #D4B895; }

        .lt-sb-user {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border-radius: 12px; cursor: pointer; background: #FFF;
          border: none; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
          transition: all 0.1s ease;
        }
        .lt-sb-user:hover {  box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
        .lt-sb-user:active {  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.45); }

        .lt-sb-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: #C89B3C; border: none;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 18px; color: #3E2723; flex-shrink: 0;
        }

        .lt-sb-uname {
          font-family: 'Playfair Display', serif; font-size: 16px; color: #3E2723;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .lt-sb-urole {
          font-family: 'Baloo 2', sans-serif; font-size: 11px; font-weight: 800;
          color: #3E2723; margin-top: 2px;
        }
        .lt-sb-online {
          width: 14px; height: 14px; border-radius: 50%;
          background: #00C853; border: none; flex-shrink: 0;
        }

        /* ── Section headers ── */
        .lt-sb-section { padding: 16px 16px 4px; }
        .lt-sec-label {
          font-family: 'Playfair Display', serif; font-size: 14px;
          color: #3E2723; padding: 0 8px; margin-bottom: 12px;
        }

        /* ── Nav link ── */
        .lt-sb-link {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px;
          border-radius: 12px; text-decoration: none; margin-bottom: 8px;
          background: #FFF; border: 1px solid transparent; color: #3E2723;
          transition: all 0.1s ease;
        }
        .lt-sb-link:hover {
          background: #C89B3C; border: none;
          box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); 
        }
        .lt-sb-link.lt-active {
          background: #D4B895; border: none;
          box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45); animation: ltActivePop 0.3s ease;
        }

        /* ── Icon wrap ── */
        .lt-sb-icon-wrap {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #FFF; border: none; flex-shrink: 0;
        }
        .lt-sb-icon { font-size: 18px; line-height: 1; }

        /* ── Link labels ── */
        .lt-sb-lbl { font-family: 'Playfair Display', serif; font-size: 15px; color: #3E2723; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lt-sb-sublbl { font-family: 'Baloo 2', sans-serif; font-size: 11px; font-weight: 700; color: #3E2723; margin-top: 2px; }

        /* ── Mobile search ── */
        .lt-mobile-search { display: none; padding: 16px 16px 4px; }
        @media (max-width: 768px) { .lt-mobile-search { display: block; } }
        .lt-mobile-search-form {
          display: flex; align-items: center; gap: 8px; background: #FFF;
          border: none; border-radius: 12px; padding: 10px 14px;
          box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.45);
        }
        .lt-mobile-search-input { background: transparent; border: none; outline: none; color: #3E2723; font-family: 'Playfair Display', serif; font-size: 14px; width: 100%; }
        .lt-mobile-search-input::placeholder { color: rgba(23,23,25,0.4); font-family: 'Playfair Display', serif; }

        /* ── Footer ── */
        .lt-sb-foot { padding: 16px; border-top: 1px dashed rgba(62,39,35,0.2); background: #3E2723; }
        .lt-sb-logout {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s ease;
}
.lt-sb-logout:hover { background: rgba(255,255,255,0.2);  }
        .lt-sb-logout:hover { background: #1E352F;  box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.45); }
        .lt-sb-logout:hover .lt-sb-lbl { color: #FFF !important; }

      `}</style>
    </>
  );
}
