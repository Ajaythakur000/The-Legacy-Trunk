import { Link, useLocation, useNavigate } from 'react-router-dom';

// ─── NAV DATA ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to:'/home',          icon:'🏛️', label:'Home',          sub:null },
  { to:'/dashboard',     icon:'✦',  label:'Dashboard',     sub:'Memory Universe' },
  { to:'/my-stories',    icon:'📜', label:'My Stories',    sub:null },
  { to:'/vault-stories', icon:'📸', label:'Vault Stories', sub:null },
  { to:'/leaderboard',   icon:'⚔️', label:'Leaderboard',   sub:'Family champions' },
];

const TOOL_LINKS = [
  { to:'/vault',       icon:'💬', label:'Family Chat',  sub:null },
  { to:'/memory-lane', icon:'🛤️', label:'Memory Lane',  sub:'Timeline of souls' },
  { to:'/radar',       icon:'📡', label:'Family Radar', sub:'Live locations' },
];

// ─── SIDEBAR LINK ─────────────────────────────────────────────────────────────
function SbLink({ to, icon, label, sub, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`lt-sb-link${active ? ' lt-active' : ''}`}>
      <div className="lt-sb-icon-wrap">
        <span className="lt-sb-icon">{icon}</span>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="lt-sb-lbl">{label}</div>
        {sub && <div className="lt-sb-sublbl">{sub}</div>}
      </div>
      {active && <div className="lt-sb-active-dot"/>}
    </Link>
  );
}

// ─── LOGO RING ────────────────────────────────────────────────────────────────
export function LogoRing({ size = 42 }) {
  const r   = size / 2;
  const rr  = r - 3;
  const pts = [0,60,120,180,240,300].map(deg => ({
    x: r + rr * Math.cos((deg - 90) * Math.PI / 180),
    y: r + rr * Math.sin((deg - 90) * Math.PI / 180),
  }));
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', animation:'ltRingSpin 18s linear infinite' }}
        viewBox={`0 0 ${size} ${size}`} fill="none"
      >
        <circle cx={r} cy={r} r={rr-1} stroke="rgba(212,168,80,0.3)" strokeWidth="0.8"/>
        <circle cx={r} cy={r} r={rr-3} stroke="rgba(212,168,80,0.12)" strokeWidth="0.5" strokeDasharray="3 7"/>
        {pts.map((p,i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i%2===0?1.8:1.3}
            fill={`rgba(212,168,80,${i%2===0?0.9:0.55})`}/>
        ))}
      </svg>
      <div style={{
        position:'absolute', top:5, left:5, right:5, bottom:5, borderRadius:'50%',
        background:'linear-gradient(135deg,#1a1410 0%,#0f0c08 100%)',
        border:'1px solid rgba(212,168,80,0.4)', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 0 16px rgba(212,168,80,0.2)',
      }}>
        <img src="/finall_logo.png" alt="LT"
          style={{ width:'110%', height:'110%', objectFit:'cover', borderRadius:'50%' }}
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
        />
        <div style={{
          display:'none', alignItems:'center', justifyContent:'center',
          width:'100%', height:'100%', color:'#e8c87a',
          fontFamily:"'Cinzel',serif", fontSize:size*0.28, fontWeight:700,
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
      <div
        className={`lt-sb-overlay${isSidebarOpen ? ' lt-sb-vis' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ══════ SIDEBAR ══════ */}
      <aside className={`lt-sidebar${isSidebarOpen ? ' lt-sb-open' : ' lt-sb-closed'}`}>

        {/* ── HEAD: user card ── */}
        <div className="lt-sb-head">
          <div
            className="lt-sb-user"
            onClick={() => navigate('/profile')}
          >
            <div className="lt-sb-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt=""
                    style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
                : initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="lt-sb-uname">{user?.name || 'Family Member'}</div>
              <div className="lt-sb-urole">
                {user?.role === 'admin' ? 'Family Oracle · Admin' : 'Family Member'}
              </div>
            </div>
            <div className="lt-sb-online"/>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div style={{ flex:1, minHeight: 0, overflowY:'auto', overflowX:'hidden' }}>

          {/* Mobile search */}
          <div className="lt-mobile-search">
            <form onSubmit={handleSearch} className="lt-mobile-search-form">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="rgba(212,168,80,0.55)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search legacy..."
                className="lt-mobile-search-input"
              />
            </form>
          </div>

          {/* Main menu */}
          <div className="lt-sb-section">
            <div className="lt-sec-label">Main Menu</div>
            {NAV_LINKS.map(({ to, icon, label, sub }) => (
              <SbLink key={to} to={to} icon={icon} label={label} sub={sub}
                active={location.pathname === to}
              />
            ))}
          </div>

          {/* Family tools */}
          <div className="lt-sb-section" style={{ marginTop:8, paddingBottom:20 }}>
            <div className="lt-sec-label">Family Tools</div>
            {TOOL_LINKS.map(({ to, icon, label, sub }) => (
              <SbLink key={to} to={to} icon={icon} label={label} sub={sub}
                active={location.pathname === to}
              />
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="lt-sb-foot">
          <button className="lt-sb-logout" onClick={handleLogout}>
            <div className="lt-sb-icon-wrap lt-logout-icon">🚪</div>
            <span className="lt-sb-lbl" style={{
              fontFamily:"'Cinzel',serif", fontSize:11,
              letterSpacing:'1px', color:'rgba(240,128,128,0.85)',
            }}>
              Leave the Vault
            </span>
          </button>
          <div className="lt-rune-footer">
            ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
          </div>
        </div>

      </aside>

      {/* ══════ ALL SIDEBAR CSS ══════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Space+Mono:wght@400&display=swap');

        /* ── Keyframes ── */
        @keyframes ltRingSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ltSbPulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ltActiveLine  {
          from { transform:scaleY(0); opacity:0; }
          to   { transform:scaleY(1); opacity:1; }
        }
        @keyframes ltShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ltGlow {
          0%,100% { box-shadow: 0 0 8px rgba(212,168,80,0.15); }
          50%     { box-shadow: 0 0 20px rgba(212,168,80,0.35); }
        }

        /* ── Sidebar shell ── */
        .lt-sidebar {
          position: relative;
          height: 100%; 
          width: 280px;
          flex-shrink: 0;
          background: linear-gradient(180deg,
            rgba(6,8,15,0.99) 0%,
            rgba(10,12,22,0.99) 50%,
            rgba(8,10,18,0.99) 100%
          );
          border-right: 1px solid rgba(212,168,80,0.18);
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow-x: hidden;
          transition: width 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1);
          box-shadow: inset 0 1px 0 rgba(212,168,80,0.12), 4px 0 40px rgba(0,0,0,0.6);
        }
        .lt-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(212,168,80,0.7) 30%,
            rgba(232,200,122,1) 50%,
            rgba(212,168,80,0.7) 70%,
            transparent
          );
        }
        .lt-sidebar::after {
          content: '';
          position: absolute;
          top: 0; right: -1px; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg,
            transparent,
            rgba(212,168,80,0.35) 20%,
            rgba(212,168,80,0.55) 50%,
            rgba(212,168,80,0.35) 80%,
            transparent
          );
        }

        /* Desktop close logic */
        @media (min-width: 769px) {
          .lt-sidebar.lt-sb-closed {
            width: 0px;
            border-right: none;
          }
        }

        /* Mobile open/close logic */
        @media (max-width: 768px) {
          .lt-sidebar {
            position: fixed; 
            top: 0; left: 0; bottom: 0;
            width: 280px !important;
          }
          .lt-sb-closed { transform: translateX(-100%); }
          .lt-sb-open   { transform: translateX(0); }
        }

        /* ── Overlay ── */
        .lt-sb-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 49;
        }
        .lt-sb-overlay.lt-sb-vis { display: block; }

        /* ── Head: user card ── */
        .lt-sb-head {
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(212,168,80,0.1);
          position: relative;
          /* Removed fixed width */
        }
        .lt-sb-head::after {
          content: '';
          position: absolute;
          bottom: 0; left: 16%; right: 16%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent, rgba(212,168,80,0.4), transparent
          );
        }

        .lt-sb-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          cursor: pointer;
          background: rgba(212,168,80,0.05);
          border: 1px solid rgba(212,168,80,0.14);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .lt-sb-user::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent, rgba(212,168,80,0.5), transparent
          );
        }
        .lt-sb-user:hover {
          background: rgba(212,168,80,0.1);
          border-color: rgba(212,168,80,0.35);
          box-shadow: 0 0 20px rgba(212,168,80,0.1);
          transform: translateY(-1px);
        }

        .lt-sb-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg,#1a1410,#0f0c08);
          border: 2px solid rgba(212,168,80,0.5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cinzel', serif;
          font-size: 14px; font-weight: 700;
          color: #e8c87a;
          box-shadow: 0 0 14px rgba(212,168,80,0.25);
          flex-shrink: 0;
        }

        .lt-sb-uname {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #e8c87a;
          text-shadow: 0 0 12px rgba(212,168,80,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lt-sb-urole {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(212,168,80,0.6);
          margin-top: 2px;
          white-space: nowrap;
        }

        .lt-sb-online {
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.8);
          animation: ltSbPulse 2s infinite;
          flex-shrink: 0;
        }

        /* ── Section headers ── */
        .lt-sb-section { padding: 16px 12px 4px; /* Removed fixed width */ }

        .lt-sec-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(212,168,80,0.55);
          padding: 0 8px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lt-sec-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(212,168,80,0.3), transparent);
        }

        /* ── Nav link ── */
        .lt-sb-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: 12px;
          text-decoration: none;
          margin-bottom: 3px;
          position: relative;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          border: 1px solid transparent;
          overflow: hidden;
        }

        .lt-sb-link:not(.lt-active) {
          color: rgba(255,255,255,0.75);
        }
        .lt-sb-link:not(.lt-active):hover {
          background: rgba(212,168,80,0.07);
          border-color: rgba(212,168,80,0.18);
          color: #e8c87a;
        }
        .lt-sb-link:not(.lt-active):hover .lt-sb-lbl {
          color: #e8c87a;
          text-shadow: 0 0 10px rgba(212,168,80,0.4);
        }
        .lt-sb-link:not(.lt-active):hover .lt-sb-icon {
          filter: drop-shadow(0 0 4px rgba(212,168,80,0.6));
          transform: scale(1.1);
        }

        .lt-sb-link.lt-active {
          background: linear-gradient(135deg,
            rgba(212,168,80,0.18) 0%,
            rgba(180,130,50,0.12) 100%
          );
          border-color: rgba(212,168,80,0.35);
          box-shadow:
            0 0 20px rgba(212,168,80,0.12),
            inset 0 0 20px rgba(212,168,80,0.04);
          animation: ltGlow 3s infinite ease-in-out;
        }
        .lt-sb-link.lt-active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: linear-gradient(180deg, #c9933a, #f0d080, #c9933a);
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px rgba(212,168,80,0.8);
          animation: ltActiveLine 0.3s ease forwards;
        }
        .lt-sb-link.lt-active::after {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent, rgba(212,168,80,0.6), transparent
          );
        }

        /* ── Icon wrap ── */
        .lt-sb-icon-wrap {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(212,168,80,0.07);
          border: 1px solid rgba(212,168,80,0.15);
          flex-shrink: 0;
          transition: all 0.25s ease;
        }
        .lt-active .lt-sb-icon-wrap {
          background: rgba(212,168,80,0.14);
          border-color: rgba(212,168,80,0.4);
          box-shadow: 0 0 12px rgba(212,168,80,0.2);
        }
        .lt-sb-icon {
          font-size: 15px;
          transition: all 0.25s ease;
          display: block;
          line-height: 1;
        }

        /* ── Link labels ── */
        .lt-sb-lbl {
          font-family: 'Cinzel', serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.8px;
          color: rgba(255,255,255,0.82);
          transition: all 0.25s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lt-active .lt-sb-lbl {
          color: #e8c87a;
          font-weight: 700;
          text-shadow: 0 0 14px rgba(212,168,80,0.55);
          background: linear-gradient(90deg, #c9933a, #f0d080, #e8c87a);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ltShimmer 4s linear infinite;
        }

        .lt-sb-sublbl {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 10.5px;
          color: rgba(212,168,80,0.5);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lt-active .lt-sb-sublbl {
          color: rgba(212,168,80,0.75);
        }

        /* Active dot */
        .lt-sb-active-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #e8c87a;
          box-shadow: 0 0 8px rgba(212,168,80,0.9);
          flex-shrink: 0;
          animation: ltSbPulse 2s infinite;
        }

        /* ── Mobile search ── */
        .lt-mobile-search {
          display: none;
          padding: 12px 12px 4px;
          /* Removed fixed width */
        }
        @media (max-width: 768px) {
          .lt-mobile-search { display: block; }
        }
        .lt-mobile-search-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(212,168,80,0.05);
          border: 1px solid rgba(212,168,80,0.2);
          border-radius: 10px;
          padding: 9px 12px;
        }
        .lt-mobile-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255,255,255,0.82);
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          width: 100%;
        }
        .lt-mobile-search-input::placeholder {
          color: rgba(212,168,80,0.35);
          font-style: italic;
        }

        /* ── Footer ── */
        .lt-sb-foot {
          padding: 12px 12px 16px;
          border-top: 1px solid rgba(212,168,80,0.1);
          position: relative;
          /* Removed fixed width */
        }
        .lt-sb-foot::before {
          content: '';
          position: absolute;
          top: 0; left: 16%; right: 16%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent, rgba(212,168,80,0.4), transparent
          );
        }

        .lt-sb-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 11px 12px;
          border-radius: 12px;
          background: rgba(240,128,128,0.06);
          border: 1px solid rgba(240,128,128,0.15);
          cursor: pointer;
          transition: all 0.25s ease;
          margin-bottom: 14px;
        }
        .lt-sb-logout:hover {
          background: rgba(240,128,128,0.12);
          border-color: rgba(240,128,128,0.35);
          box-shadow: 0 0 16px rgba(240,128,128,0.12);
          transform: translateY(-1px);
        }
        .lt-logout-icon {
          font-size: 15px;
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(240,128,128,0.1);
          border: 1px solid rgba(240,128,128,0.2);
          flex-shrink: 0;
        }

        /* Rune footer */
        .lt-rune-footer {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 3.5px;
          color: rgba(212,168,80,0.28);
          text-align: center;
          user-select: none;
        }

        /* ── Scrollbar inside sidebar ── */
        .lt-sidebar ::-webkit-scrollbar       { width: 3px; }
        .lt-sidebar ::-webkit-scrollbar-track { background: transparent; }
        .lt-sidebar ::-webkit-scrollbar-thumb {
          background: rgba(212,168,80,0.2);
          border-radius: 3px;
        }
        .lt-sidebar ::-webkit-scrollbar-thumb:hover {
          background: rgba(212,168,80,0.4);
        }
      `}</style>
    </>
  );
}