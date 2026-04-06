import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '12px 24px',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: isActive ? '800' : '600',
      color: isActive ? '#2563eb' : '#475569',
      background: isActive ? '#eff6ff' : 'transparent',
      borderRight: isActive ? '4px solid #2563eb' : '4px solid transparent',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <aside style={{ 
      width: '260px', 
      background: '#ffffff', 
      borderRight: '1px solid #e2e8f0', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '24px 0', 
      zIndex: 10,
      flexShrink: 0
    }}>
      <div style={{ padding: '0 24px', marginBottom: '16px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px' }}>
        MAIN MENU
      </div>
      
      <Link to="/home" style={getNavLinkStyle('/home')}>🏠 Home</Link>
      <Link to="/dashboard" style={getNavLinkStyle('/dashboard')}>⚙️ Dashboard</Link>
      <Link to="/memory-lane" style={getNavLinkStyle('/memory-lane')}>🛤️ Memory Lane</Link>
      <Link to="/my-stories" style={getNavLinkStyle('/my-stories')}>👤 My Stories</Link>
      <Link to="/leaderboard" style={getNavLinkStyle('/leaderboard')}>🏆 Leaderboard</Link>
      
      <div style={{ padding: '0 24px', margin: '32px 0 16px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px' }}>
        FAMILY TOOLS
      </div>
      
      <Link to="/vault" style={getNavLinkStyle('/vault')}>🛡️ Vault Room</Link>
      <Link to="/radar" style={getNavLinkStyle('/radar')}>📡 Family Radar</Link>
    </aside>
  );
}

export default Sidebar;