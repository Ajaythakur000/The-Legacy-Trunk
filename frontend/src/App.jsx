import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion'; // 🔥 FRAMER MOTION IMPORT

// Layout & Shared
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AnimatedPage from './components/shared/AnimatedPage'; 

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
  const location = useLocation(); //  Route track karne ke liye

  return (
    <>
      {/* Notifications setup */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Navbar is the Grand Layout Wrapper */}
      <Navbar>
        {/* 🔥 ANIMATE PRESENCE: Wait for old page to fade out before showing new page */}
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
      </Navbar>
    </>
  );
}

export default App;