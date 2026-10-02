import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Wraps routes to ensure only authenticated users can access them
function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth(); 
  const location = useLocation();

  if (isInitializing) {
    return (
      <div style={{ 
        background: '#FDFBF7', 
        backgroundImage: 'none', 
        height: '100vh', width: '100vw' 
      }} />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;