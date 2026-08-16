import { useState } from 'react';
import Confetti from 'react-confetti';
import { createStoryApi } from '../api/storyApi';
import { useAuth } from '../context/AuthContext';
import StoryComposer from '../components/story/StoryComposer';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Decorative Comic Stickers ─────────────────────────────────────────────
function ComicStickers() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 60, filter: 'drop-shadow(4px 4px 0px #171719)' }}>📸</motion.div>
      <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', top: '40%', right: '8%', fontSize: 50, filter: 'drop-shadow(4px 4px 0px #171719)' }}>✂️</motion.div>
      <motion.div animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: 70, filter: 'drop-shadow(4px 4px 0px #171719)' }}>📌</motion.div>
    </div>
  );
}

function VaultStoriesPage() {
  const { user, fetchFreshProfile } = useAuth();
  const activeCircleId = user?.activeCircleId || null;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePostStory = async (formData) => {
    setError(''); setSuccess(''); setUploading(true);
    try {
      await createStoryApi(formData);
      await fetchFreshProfile();
      setSuccess('Memory pasted into the scrapbook! 📌 Check the Home page.');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to paste memory');
      throw e;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px', position: 'relative', overflowX: 'hidden' }}>
      
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} gravity={0.3} numberOfPieces={400}
            colors={['#FFD23F', '#FF3D81', '#3FE0FF', '#171719', '#FFF']} />
        </div>
      )}

      <ComicStickers />

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 100, height: 100, margin: '0 auto 20px', background: '#3FE0FF', border: '4px solid #171719', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, boxShadow: '6px 6px 0px 0px #171719', transform: 'rotate(-5deg)' }}>
            📖
          </div>
          <h1 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 48, color: '#FF3D81', textShadow: '4px 4px 0px #171719', WebkitTextStroke: '2px #171719', letterSpacing: 2, margin: '0 0 10px' }}>
            ADD A MEMORY
          </h1>
          <p style={{ fontWeight: 800, fontSize: 18, color: '#171719', margin: '0 0 20px', background: '#FFD23F', display: 'inline-block', padding: '4px 12px', border: '3px solid #171719', borderRadius: 8, transform: 'rotate(2deg)', boxShadow: '4px 4px 0px 0px #171719' }}>
            Glue it down before you forget it!
          </p>

          {activeCircleId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', background: '#00C853', border: '3px solid #171719', borderRadius: 12, fontFamily: "'Luckiest Guy',cursive", fontSize: 16, color: '#FFF', boxShadow: '4px 4px 0px 0px #171719' }}>
                <span style={{ fontSize: 20 }}>🎯</span> FAMILY SELECTED
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* ── ALERTS ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: '#FF3D81', border: '4px solid #171719', borderRadius: 12, padding: '16px', marginBottom: 20, fontFamily: "'Luckiest Guy',cursive", fontSize: 18, color: '#FFF', boxShadow: '6px 6px 0px 0px #171719', textAlign: 'center' }}>
              ⚠️ {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: '#00C853', border: '4px solid #171719', borderRadius: 12, padding: '16px', marginBottom: 20, fontFamily: "'Luckiest Guy',cursive", fontSize: 18, color: '#FFF', boxShadow: '6px 6px 0px 0px #171719', textAlign: 'center' }}>
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NO VAULT ── */}
        {!activeCircleId ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#FFF', border: '6px solid #171719', borderRadius: 24, padding: '60px 40px', textAlign: 'center', boxShadow: '16px 16px 0px 0px #171719' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🤷‍♂️</div>
            <h3 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 32, color: '#FF7B00', margin: '0 0 10px', textShadow: '2px 2px 0px #171719', WebkitTextStroke: '1px #171719' }}>NO FAMILY SELECTED!</h3>
            <p style={{ fontWeight: 700, color: '#171719', fontSize: 18, margin: 0 }}>Pick a family circle from the top menu so we know where to paste this.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.4 }}>
            <StoryComposer activeCircleId={activeCircleId} onPostStory={handlePostStory} uploading={uploading} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default VaultStoriesPage;