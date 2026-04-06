import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Shared
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Auth Pages
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';

// Core Pages
import HomePage from './pages/HomePage';
import DashboardPage from './components/dashboard/DashboardPage';
import ProfilePage from './components/profile/ProfilePage';

// Feature Pages
import VaultRoomPage from './components/chat/VaultRoomPage';
import FamilyRadarPage from './components/radar/FamilyRadarPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Stories Pages
import VaultStoriesPage from './pages/VaultStoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import MyStoriesPage from './pages/MyStoriesPage';
import FamilyTimelinePage from './pages/FamilyTimelinePage';

import FamilyOraclePage from './pages/FamilyOraclePage';
import InvitePage from './pages/InvitePage';

// 1. Upar import add karo
import SearchResultsPage from './pages/SearchResultsPage';

function App() {
  return (
    <>
      {/* Notifications setup */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* 🔥 NEW: Navbar is now the Grand Layout Wrapper */}
      <Navbar>
        <Routes>
          {/* 1. INITIAL REDIRECT */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/invite/:token" element={<InvitePage />} />
          
          {/* 3. PROTECTED PRIVATE ROUTES */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* Features */}
          <Route path="/vault" element={<ProtectedRoute><VaultRoomPage /></ProtectedRoute>} />
          <Route path="/radar" element={<ProtectedRoute><FamilyRadarPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/memory-lane" element={<ProtectedRoute><FamilyTimelinePage /></ProtectedRoute>} />
          

          
          {/* Stories Engine */}
          <Route path="/vault-stories" element={<ProtectedRoute><VaultStoriesPage /></ProtectedRoute>} />
          <Route path="/vault-stories/:storyId" element={<ProtectedRoute><StoryDetailPage /></ProtectedRoute>} />
          <Route path="/my-stories" element={<ProtectedRoute><MyStoriesPage /></ProtectedRoute>} />

              <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />

        
          <Route path="/oracle" element={<FamilyOraclePage />} />

          {/* 4. CATCH-ALL REDIRECT (Security) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Navbar>
    </>
  );
}

export default App;