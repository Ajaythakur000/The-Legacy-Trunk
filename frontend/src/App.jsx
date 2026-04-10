import { Navigate, Route, Routes, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Layout & Shared
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
import StoryDetailPage from './pages/StoryDetailPage';
import MyStoriesPage from './components/story/MyStoriesPage';
import FamilyTimelinePage from './pages/FamilyTimelinePage';
import FamilyOraclePage from './pages/FamilyOraclePage';
import SearchResultsPage from './pages/SearchResultsPage';

// 🔥 THE FIX: Sidebar ab kabhi nahi hatega, sirf Outlet ke andar ka content badlega
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar>
        <Outlet /> 
      </Navbar>
    </ProtectedRoute>
  );
}

function App() {
  const location = useLocation();
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <div style={{ background: '#06080f', minHeight: '100vh' }} />;
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: 'linear-gradient(145deg, #0f1322 0%, #06080f 100%)',
            color: '#e8c87a',
            border: '1px solid rgba(212,168,80,0.3)',
            borderRadius: '12px',
            padding: '14px 24px',
            fontFamily: "'Cinzel', serif",
            fontWeight: '600',
            fontSize: '13px',
            letterSpacing: '1px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(212,168,80,0.15)',
            backdropFilter: 'blur(20px)',
          },
          success: {
            style: { borderLeft: '4px solid #e8c87a' },
            iconTheme: { primary: '#e8c87a', secondary: '#06080f' },
            icon: '✦',
          },
          error: {
            style: {
              background: 'linear-gradient(145deg, #1f0b0b 0%, #0a0404 100%)',
              color: '#f08080',
              border: '1px solid rgba(220,60,60,0.3)',
              borderLeft: '4px solid #f08080',
              boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(220,60,60,0.15)',
            },
            iconTheme: { primary: '#f08080', secondary: '#0a0404' },
            icon: '⚠️',
          },
          loading: {
            style: { borderBottom: '2px solid rgba(212,168,80,0.5)' },
            iconTheme: { primary: '#e8c87a', secondary: 'transparent' },
          },
        }}
      />

      <ErrorBoundary>
        <AnimatePresence mode="wait">
          {/* 🔥 THE FIX: key=location.pathname hata diya taaki layout destroy na ho */}
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<AnimatedPage showRuneFlash={false} showBurst={false}><LoginPage /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage showRuneFlash={false} showBurst={false}><SignupPage /></AnimatedPage>} />
            <Route path="/invite/:token" element={<AnimatedPage showRuneFlash={false} showBurst={false}><InvitePage /></AnimatedPage>} />

            {/* 🔥 Protected Routes Wrapper (Sidebar stays mounted) */}
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
              <Route path="/vault" element={<AnimatedPage><VaultRoomPage /></AnimatedPage>} />
              <Route path="/radar" element={<AnimatedPage><FamilyRadarPage /></AnimatedPage>} />
              <Route path="/leaderboard" element={<AnimatedPage><LeaderboardPage /></AnimatedPage>} />
              <Route path="/memory-lane" element={<AnimatedPage><FamilyTimelinePage /></AnimatedPage>} />
              <Route path="/vault-stories" element={<AnimatedPage><VaultStoriesPage /></AnimatedPage>} />
              <Route path="/vault-stories/:storyId" element={<AnimatedPage><StoryDetailPage /></AnimatedPage>} />
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