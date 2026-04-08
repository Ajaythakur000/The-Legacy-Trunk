import { useState } from 'react';
import Confetti from 'react-confetti'; 
import { createStoryApi } from '../api/storyApi';
import { useAuth } from '../context/AuthContext';

import StoryComposer from '../components/story/StoryComposer';

function VaultStoriesPage() {
  const { user, fetchFreshProfile } = useAuth(); // 🔴 IMPORTANT FIX
  const activeCircleId = user?.activeCircleId || null;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePostStory = async (formData) => {
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      await createStoryApi(formData);

      // 🔴 IMPORTANT FIX: points/streak/navbar instant sync after post
      await fetchFreshProfile();
      
      setSuccess('Memory securely locked! 🔐 Check the Home page to view it.');
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000); 
    } catch (e) {
      console.error('createStory failed:', e?.response?.data || e);
      setError(e?.response?.data?.message || e?.message || 'Failed to save memory');
      throw e; 
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '60px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99999, pointerEvents: 'none' }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} gravity={0.3} numberOfPieces={400} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '50px', animation: 'fadeInDown 0.8s ease' }}>
        <h1 style={{ 
          fontSize: '3.5rem', fontWeight: '900', margin: '0 0 12px 0', 
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px', lineHeight: '1.2'
        }}>
          Weave a Memory 📜
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#64748b', margin: '0 auto', maxWidth: '500px', lineHeight: '1.5' }}>
          Every family has a story. Save yours for the generations to come, or share it with the world.
        </p>
        
        {activeCircleId && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '8px 20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '99px', fontSize: '0.9rem', color: '#1d4ed8', fontWeight: '700', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.1)' }}>
            <span>🏰</span> Active Vault: Encrypted & Safe
          </div>
        )}
      </div>
      
      {!activeCircleId ? (
        <div style={{ textAlign: 'center', background: '#fef2f2', padding: '40px', borderRadius: '24px', border: '1px solid #fca5a5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔐</span>
          <h3 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '1.5rem' }}>No Vault Selected</h3>
          <p style={{ color: '#b91c1c', margin: 0, fontSize: '1.1rem' }}>Please select a Family Circle from the top navigation to post stories.</p>
        </div>
      ) : (
        <>
          {error && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #ef4444', marginBottom: '24px', fontWeight: '600' }}>{error}</div>}
          {success && <div style={{ color: '#15803d', background: '#f0fdf4', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #22c55e', marginBottom: '24px', fontWeight: '600' }}>{success}</div>}

          <div style={{ animation: 'fadeInUp 0.8s ease 0.1s both' }}>
            <StoryComposer 
              activeCircleId={activeCircleId} 
              onPostStory={handlePostStory} 
              uploading={uploading} 
            />
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default VaultStoriesPage;