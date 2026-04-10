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
  { to:'/vault',       icon:'💬', label:'Family Chat',  sub:null,              hot:true  },
  { to:'/memory-lane', icon:'🛤️', label:'Memory Lane',  sub:'Timeline of souls', hot:false },
  { to:'/radar',       icon:'📡', label:'Family Radar', sub:'Live locations',    hot:false },
];

// ─── SIDEBAR LINK ─────────────────────────────────────────────────────────────
function SbLink({ to, icon, label, sub, badge, hot, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`lt-sb-link${active?' lt-active':''}`}>
      <div className="lt-sb-icon">{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="lt-sb-lbl">{label}</div>
        {sub && <div className="lt-sb-sublbl">{sub}</div>}
      </div>
      {badge > 0 && <span className={`lt-sb-badge${hot?' lt-hot':''}`}>{badge}</span>}
    </Link>
  );
}

// ─── LOGO RING (Exported taaki Navbar me bhi use ho sake) ────────────────────
export function LogoRing({ size = 42 }) {
  const r   = size / 2;
  const rr  = r - 3;
  const pts = [0,60,120,180,240,300].map(deg => ({
    x: r + rr * Math.cos((deg - 90) * Math.PI / 180),
    y: r + rr * Math.sin((deg - 90) * Math.PI / 180),
  }));
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', animation:'ltRingSpin 18s linear infinite' }}
        viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle cx={r} cy={r} r={rr-1} stroke="rgba(212,168,80,0.14)" strokeWidth="0.5"/>
        <circle cx={r} cy={r} r={rr-3} stroke="rgba(212,168,80,0.07)" strokeWidth="0.5" strokeDasharray="3 7"/>
        {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={i%2===0?1.8:1.3} fill={`rgba(212,168,80,${i%2===0?0.75:0.45})`}/>)}
      </svg>
      <div style={{
        position:'absolute', top:5, left:5, right:5, bottom:5, borderRadius:'50%',
        background:'linear-gradient(135deg,#1a1410 0%,#0f0c08 100%)',
        border:'1px solid rgba(212,168,80,0.3)', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 0 12px rgba(212,168,80,0.12)',
      }}>
        <img src="/finall_logo.png" alt="LT"
          style={{ width:'110%', height:'110%', objectFit:'cover', borderRadius:'50%' }}
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
        />
        <div style={{ display:'none', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', color:'#e8c87a', fontFamily:"'Cinzel',serif", fontSize:size*0.28, fontWeight:700 }}>LT</div>
      </div>
    </div>
  );
}

// ─── MAIN SIDEBAR COMPONENT ───────────────────────────────────────────────────
export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  user,
  initials,
  searchQuery,
  setSearchQuery,
  handleSearch,
  unreadCount,
  handleLogout
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`lt-sb-overlay${isSidebarOpen?' lt-sb-vis':''}`} onClick={() => setIsSidebarOpen(false)}/>

      {/* ══════ SIDEBAR ══════ */}
      <aside className={`lt-sidebar${isSidebarOpen?' lt-sb-open':' lt-sb-closed'}`}>
        <div className="lt-sb-head">
          <div className="lt-sb-user" onClick={() => {
            navigate('/profile');
            if(window.innerWidth <= 768) setIsSidebarOpen(false);
          }}>
            <div className="lt-sb-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>
                : initials}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div className="lt-sb-uname">{user?.name||'Family Member'}</div>
              <div className="lt-sb-urole">{user?.role==='admin'?'Family Oracle · Admin':'Family Member'}</div>
            </div>
            <div className="lt-sb-online"/>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div className="lt-mobile-search">
            <form onSubmit={handleSearch} className="lt-mobile-search-form">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.45)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search legacy..." className="lt-mobile-search-input"/>
            </form>
          </div>

          <div className="lt-sb-section">
            <div className="lt-sec-label">Main Menu</div>
            {NAV_LINKS.map(({to,icon,label,sub}) => (
              <SbLink key={to} to={to} icon={icon} label={label} sub={sub}
                active={location.pathname===to}
                onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}/>
            ))}
          </div>

          <div className="lt-sb-section" style={{marginTop:12, paddingBottom:20}}>
            <div className="lt-sec-label">Family Tools</div>
            {TOOL_LINKS.map(({to,icon,label,sub,hot}) => (
              <SbLink key={to} to={to} icon={icon} label={label} sub={sub} hot={hot}
                badge={hot?unreadCount:0}
                active={location.pathname===to}
                onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}/>
            ))}
          </div>
        </div>

        <div className="lt-sb-foot">
          <button className="lt-sb-logout" onClick={handleLogout}>
            <div className="lt-sb-icon">🚪</div>
            <span className="lt-sb-lbl" style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:0.5}}>Leave the Vault</span>
          </button>
          <div className="lt-rune-footer">✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦</div>
        </div>
      </aside>
    </>
  );
}