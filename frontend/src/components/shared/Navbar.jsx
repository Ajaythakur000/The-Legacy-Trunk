import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';

function Navbar() {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate = useNavigate();
  
  // Circles ko store karne ke liye state
  const [myCircles, setMyCircles] = useState([]);

  // ==========================================
  // 🔥 Fetch Real Circles from Backend
  // ==========================================
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCircles = async () => {
        try {
          const res = await getMyCirclesApi(); 
          // Safely array nikalna
          const circleList = Array.isArray(res) ? res : (res?.data || res?.circles || []);
          setMyCircles(circleList);

          // ✨ Agar family list aa gayi aur koi active nahi hai, toh pehli auto-select kar do
          if (circleList.length > 0 && !user?.activeCircleId) {
            switchActiveCircle(circleList[0]._id);
          }
        } catch (error) {
          console.error("Failed to load circles in navbar", error);
        }
      };
      fetchCircles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCircleChange = (e) => {
    const selectedId = e.target.value;
    switchActiveCircle(selectedId);
  };

  return (
    <nav
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: 16,
      }}
    >
      <Link to="/">Home</Link>

      {isAuthenticated ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/vault">Vault Chat</Link>
          <Link to="/vault-stories">Vault Stories</Link>
          <Link to="/radar">Radar</Link>

          {/* ========================================== */}
          {/* 🔥 THE ACTIVE CIRCLE SWITCHER DROPDOWN     */}
          {/* ========================================== */}
          <div style={{ marginLeft: 'auto', marginRight: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#555' }}>Active Family:</span>
            <select 
              value={user?.activeCircleId || ''} 
              onChange={handleCircleChange}
              style={{ padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              <option value="" disabled>Select a Circle</option>
              {myCircles.map(circle => (
                <option key={circle._id} value={circle._id}>
                  {circle.name || circle.circleName || 'Family Circle'}
                </option>
              ))}
            </select>
          </div>

          <span>
            Hi, <b>{user?.name || 'User'}</b>
          </span>
          <button onClick={handleLogout} style={{ marginLeft: '12px' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;