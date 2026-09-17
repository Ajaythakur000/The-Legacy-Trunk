import { Navigate, Route, Routes, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AnimatedPage from './components/shared/AnimatedPage';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Auth Pages
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import InvitePage from './pages/InvitePage';

// Core Pages
import HomePage from './components/Feed/HomePage';
import DashboardPage from './components/dashboard/DashboardPage';
import ProfilePage from './components/profile/ProfilePage';

// Feature Pages
import VaultRoomPage from './components/chat/VaultRoomPage';
import FamilyRadarPage from './components/radar/FamilyRadarPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Stories Pages
import VaultStoriesPage from './pages/VaultStoriesPage';
import MyStoriesPage from './components/story/MyStoriesPage';
import FamilyTimelinePage from './pages/FamilyTimelinePage';
import FamilyOraclePage from './pages/FamilyOraclePage';
import SearchResultsPage from './pages/SearchResultsPage';

function ProtectedLayout() {
  const location = useLocation(); 
  return (
    <ProtectedRoute>
      <Navbar>
        <AnimatePresence mode="wait">
          <div key={location.pathname} style={{ width: '100%', height: '100%' }}> 
            <Outlet /> 
          </div>
        </AnimatePresence>
      </Navbar>
    </ProtectedRoute>
  );
}

function App() {
  const location = useLocation();
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <div style={{ background: '#FDFBF7', minHeight: '100vh', backgroundImage: 'none',  }} />;
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#3E2723',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 24px',
            fontFamily: "'Playfair Display', serif",
            fontSize: '16px',
            letterSpacing: '1px',
            boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.45)',
          },
          success: {
            style: { background: '#00C853', color: '#FFF' },
            iconTheme: { primary: '#FFF', secondary: '#00C853' },
            icon: 'BAM! 💥',
          },
          error: {
            style: { background: '#1E352F', color: '#FFF' },
            iconTheme: { primary: '#FFF', secondary: '#1E352F' },
            icon: 'OOPS! ⚠️',
          },
          loading: {
            style: { background: '#C89B3C', color: '#3E2723' },
            iconTheme: { primary: '#3E2723', secondary: 'transparent' },
          },
        }}
      />

      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <Routes location={location}> 
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<AnimatedPage showRuneFlash={false} showBurst={false}><LoginPage /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage showRuneFlash={false} showBurst={false}><SignupPage /></AnimatedPage>} />
            <Route path="/invite/:token" element={<AnimatedPage showRuneFlash={false} showBurst={false}><InvitePage /></AnimatedPage>} />

            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
              <Route path="/vault" element={<AnimatedPage><VaultRoomPage /></AnimatedPage>} />
              <Route path="/radar" element={<AnimatedPage><FamilyRadarPage /></AnimatedPage>} />
              <Route path="/leaderboard" element={<AnimatedPage><LeaderboardPage /></AnimatedPage>} />
              <Route path="/memory-lane" element={<AnimatedPage><FamilyTimelinePage /></AnimatedPage>} />
              <Route path="/vault-stories" element={<AnimatedPage><VaultStoriesPage /></AnimatedPage>} />
              <Route path="/my-stories" element={<AnimatedPage><MyStoriesPage /></AnimatedPage>} />
              <Route path="/search" element={<AnimatedPage><SearchResultsPage /></AnimatedPage>} />
              <Route path="/oracle" element={<AnimatedPage><FamilyOraclePage /></AnimatedPage>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </ErrorBoundary>
    </>
  );
}

export default App;