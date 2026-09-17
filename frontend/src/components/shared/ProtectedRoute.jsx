import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth(); 
  const location = useLocation();

  // Show the comic halftone background while verifying auth status
  if (isInitializing) {
    return (
      <div style={{ 
        background: '#FDFBF7', 
        backgroundImage: 'radial-gradient(#3E2723 2px, transparent 2.5px)', 
        backgroundSize: '20px 20px', 
        height: '100vh', width: '100vw' 
      }} />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Render the page if authenticated
  return children;
}

export default ProtectedRoute;