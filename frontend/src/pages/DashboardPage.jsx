import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name || 'User'} 👋</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button onClick={() => navigate('/vault')}>Go to Vault</button>
        <button onClick={() => navigate('/radar')}>Go to Radar</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default DashboardPage;