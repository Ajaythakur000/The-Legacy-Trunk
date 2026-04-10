import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children }) {
  // 🔥 FIX: isInitializing ko context se nikala
  const { isAuthenticated, isInitializing } = useAuth(); 
  const location = useLocation();

  // 🔥 MAIN LOGIC: Jab tak auth verify ho raha hai, blank royal dark screen dikhao
  // Isse purane user ka dashboard kabhi flash nahi hoga!
  if (isInitializing) {
    return <div style={{ background: '#06080f', height: '100vh', width: '100vw' }} />;
  }

  // Verification khatam hone ke baad agar authenticated nahi hai, toh seedha Login pe bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Sab sahi hai toh page dikhao
  return children;
}

export default ProtectedRoute;