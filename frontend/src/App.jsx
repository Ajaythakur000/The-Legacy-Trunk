import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VaultRoomPage from './pages/VaultRoomPage';
import FamilyRadarPage from './pages/FamilyRadarPage';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <VaultRoomPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/radar"
          element={
            <ProtectedRoute>
              <FamilyRadarPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;