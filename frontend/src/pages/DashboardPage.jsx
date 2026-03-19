import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || 'User'} 👋</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link to="/vault">
          <button>Go to Vault Room</button>
        </Link>
        <Link to="/radar">
          <button>Go to Family Radar</button>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;