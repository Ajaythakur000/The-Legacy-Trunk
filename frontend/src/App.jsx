import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VaultRoomPage from './pages/VaultRoomPage';
import FamilyRadarPage from './pages/FamilyRadarPage';
import VaultStoriesPage from './pages/VaultStoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import MyStoriesPage from './pages/MyStoriesPage';
import ExploreStoriesPage from './pages/ExploreStoriesPage';
import ProfilePage from './pages/ProfilePage'; // <-- Path check kar lena apne hisaab se

function App() {
  return (
    <>
      <Navbar />
      
      {/* ✅ TOASTER KO ROUTES SE BAHAR RAKHNA HAI! */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><VaultRoomPage /></ProtectedRoute>} />
        <Route path="/vault-stories" element={<ProtectedRoute><VaultStoriesPage /></ProtectedRoute>} />
        <Route path="/radar" element={<ProtectedRoute><FamilyRadarPage /></ProtectedRoute>} />
        
        {/* 🔥 Naye Routes (Inko bhi Protected banaya hai taaki login ke bina koi na ghuse) */}
        <Route path="/explore" element={<ProtectedRoute><ExploreStoriesPage /></ProtectedRoute>} />
        <Route path="/my-stories" element={<ProtectedRoute><MyStoriesPage /></ProtectedRoute>} />
        <Route path="/vault-stories/:storyId" element={<ProtectedRoute><StoryDetailPage /></ProtectedRoute>} />

        <Route path="/profile" element={<ProfilePage />} />

        {/* ✅ Catch-All Route: Yeh hamesha SABSE AAKHRI mein aana chahiye */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </>
  );
}

export default App;