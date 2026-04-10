import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext'; // 🔥 IMPORTED useAuth HERE

// Layout & Shared
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AnimatedPage from './components/shared/AnimatedPage'; 
import ErrorBoundary from './components/shared/ErrorBoundary'; // 🔥 Imported the Shield

// Auth Pages
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';

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
import InvitePage from './pages/InvitePage';
import SearchResultsPage from './pages/SearchResultsPage';

function App() {
  const location = useLocation();
  const { isInitializing } = useAuth(); // 🔥 EXTRACTED isInitializing

  // 🔥 THE ULTIMATE SHIELD: Jab tak auth verify ho raha hai, puri app black rahegi
  if (isInitializing) {
    return <div style={{ background: '#06080f', minHeight: '100vh', width: '100vw' }} />;
  }

  return (
    <>
      {/* 🔥 "WOW" LEVEL PREMIUM NOTIFICATIONS SETUP */}
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
          }
        }} 
      />
      
      {/* Navbar is the Grand Layout Wrapper */}
      <Navbar>
        {/* 🔥 ErrorBoundary ab AnimatePresence ke BAHAAR hai! */}
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              
              {/* 1. INITIAL REDIRECT */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* 2. PUBLIC ROUTES */}
              <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="/signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
              <Route path="/invite/:token" element={<AnimatedPage><InvitePage /></AnimatedPage>} />
              
              {/* 3. PROTECTED PRIVATE ROUTES */}
              <Route path="/home" element={<ProtectedRoute><AnimatedPage><HomePage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><AnimatedPage><DashboardPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><AnimatedPage><ProfilePage /></AnimatedPage></ProtectedRoute>} />
              
              {/* Features */}
              <Route path="/vault" element={<ProtectedRoute><AnimatedPage><VaultRoomPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/radar" element={<ProtectedRoute><AnimatedPage><FamilyRadarPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><AnimatedPage><LeaderboardPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/memory-lane" element={<ProtectedRoute><AnimatedPage><FamilyTimelinePage /></AnimatedPage></ProtectedRoute>} />
              
              {/* Stories Engine */}
              <Route path="/vault-stories" element={<ProtectedRoute><AnimatedPage><VaultStoriesPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/vault-stories/:storyId" element={<ProtectedRoute><AnimatedPage><StoryDetailPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/my-stories" element={<ProtectedRoute><AnimatedPage><MyStoriesPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><AnimatedPage><SearchResultsPage /></AnimatedPage></ProtectedRoute>} />
              
              <Route path="/oracle" element={<ProtectedRoute><AnimatedPage><FamilyOraclePage /></AnimatedPage></ProtectedRoute>} />

              {/* 4. CATCH-ALL REDIRECT (Security) */}
              <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </Navbar>
    </>
  );
}

export default App;