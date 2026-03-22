import { Navigate, Route, Routes } from 'react-router-dom';

import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VaultRoomPage from './pages/VaultRoomPage';
import FamilyRadarPage from './pages/FamilyRadarPage';
import VaultStoriesPage from './pages/VaultStoriesPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Private */}
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
          path="/vault-stories"
          element={
            <ProtectedRoute>
              <VaultStoriesPage />
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;