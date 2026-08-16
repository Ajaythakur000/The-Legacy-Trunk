import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Slide content definitions ────────────────────────────────────────────────
const SLIDES = [
  {
    icon: '📸',
    title: 'WELCOME TO THE SCRAPBOOK!',
    text: "More than just an app — it's the digital messy drawer of your family's best (and most embarrassing) memories.",
    extra: (
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {[
          { label: 'FAMILY VAULT', icon: '🏠' },
          { label: 'MEMORIES', icon: '🖼️' },
          { label: 'BONDING', icon: '🤝' },
        ].map((f, i) => (
          <div key={i} style={{ flex: 1, padding: '12px 8px', background: '#FFFFFF', border: '3px solid #171719', borderRadius: 12, textAlign: 'center', boxShadow: '4px 4px 0px 0px #171719' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 12, letterSpacing: 1, color: '#171719' }}>{f.label}</div>
          </div>
        ))}
      </div>
    ),
    color: '#FFD23F',
  },
  {
    icon: '🔒',
    title: 'TOP SECRET & PRIVATE',
    text: 'No ads. No weird tracking. Your family inside jokes and photos stay strictly between the people you actually like.',
    extra: (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0', padding: 16, background: '#3FE0FF', border: '4px solid #171719', borderRadius: 12, boxShadow: '6px 6px 0px 0px #171719' }}>
        {[['0', 'ADS EVER'], ['100%', 'ENCRYPTED'], ['∞', 'MEMORIES']].map(([num, lbl], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 28, color: '#171719', lineHeight: 1, textShadow: '2px 2px 0px #FFF' }}>{num}</div>
            <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 12, letterSpacing: 1, color: '#171719', marginTop: 4 }}>{lbl}</div>
          </div>
        ))}
      </div>
    ),
    color: '#3FE0FF',
  },
  {
    icon: '🏆',
    title: 'BE THE CHAMPION!',
    text: 'Every memory you drop earns you Family Bond Points. Climb the leaderboard and claim your crown as the ultimate family historian!',
    extra: (
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {[
          { label: 'EARN PTS', icon: '⭐' },
          { label: 'RANK UP', icon: '🚀' },
          { label: 'CROWN', icon: '👑' },
        ].map((f, i) => (
          <div key={i} style={{ flex: 1, padding: '12px 8px', background: '#FF3D81', border: '3px solid #171719', borderRadius: 12, textAlign: 'center', boxShadow: '4px 4px 0px 0px #171719' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 12, letterSpacing: 1, color: '#FFF' }}>{f.label}</div>
          </div>
        ))}
      </div>
    ),
    color: '#FF3D81',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
function VaultGateway({ onClose }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hasSeenThisSession = sessionStorage.getItem('vault_gateway_seen_session');
    
    if (!hasSeenThisSession) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleFinish = useCallback(() => {
    setDone(true);
    setIsVisible(false);
    sessionStorage.setItem('vault_gateway_seen_session', 'true');
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 500); 
  }, [onClose]);

  const handleNext = () => { if (step < SLIDES.length - 1) setStep(s => s + 1); };
  const isLast = step === SLIDES.length - 1;

  if (!shouldRender) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(255, 246, 229, 0.95)',
      backgroundImage: 'radial-gradient(#171719 2px, transparent 2.5px)',
      backgroundSize: '20px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 20,
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
      transition: 'opacity 0.3s ease',
      fontFamily: "'Baloo 2', sans-serif",
      overflow: 'hidden',
    }}>
      
      <motion.div
        initial={{ scale: 0.8, y: 40, rotate: -2 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 480,
          background: '#FFFFFF',
          border: '4px solid #171719',
          borderRadius: 24,
          padding: '40px',
          boxShadow: '16px 16px 0px 0px #171719',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* SUCCESS STATE */}
          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 80, marginBottom: 10 }}>🎉</div>
                <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 36, color: '#FF7B00', textShadow: '2px 2px 0px #171719', WebkitTextStroke: '1px #171719', marginBottom: 8 }}>YOU'RE IN!</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#171719' }}>Let the fun begin!</div>
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <>
              {/* Icon / Avatar */}
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', position: 'relative' }}>
                <motion.div
                  key={step} initial={{ scale: 0.5, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: Math.random() * 10 - 5 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', background: SLIDES[step].color, border: '4px solid #171719', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: '6px 6px 0px 0px #171719' }}
                >
                  {SLIDES[step].icon}
                </motion.div>
              </div>

              {/* Slide content */}
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  <h2 style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 28, color: '#171719', textAlign: 'center', margin: '0 0 12px' }}>
                    {SLIDES[step].title}
                  </h2>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#171719', textAlign: 'center', lineHeight: 1.5, margin: 0, minHeight: 60 }}>
                    {SLIDES[step].text}
                  </p>
                  {SLIDES[step].extra}
                </motion.div>
              </AnimatePresence>

              {/* Comic Progress Bar */}
              <div style={{ width: '100%', height: 12, background: '#FFF', border: '3px solid #171719', borderRadius: 6, margin: '24px 0 20px', position: 'relative', overflow: 'hidden', boxShadow: '2px 2px 0px 0px #171719' }}>
                <motion.div
                  animate={{ width: `${((step + 1) / SLIDES.length) * 100}%`, background: SLIDES[step].color }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  style={{ height: '100%', borderRight: '3px solid #171719' }}
                />
              </div>

              {/* Buttons */}
              <AnimatePresence mode="wait">
                {!isLast ? (
                  <motion.div key="step-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 16 }}>
                    <motion.button onClick={handleFinish} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#FFF', border: '4px solid #171719', color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 16, cursor: 'pointer', boxShadow: '4px 4px 0px 0px #171719' }}
                    >
                      SKIP
                    </motion.button>
                    <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 0px 0px #171719' }}
                      style={{ flex: 2, padding: '14px', borderRadius: 12, background: SLIDES[step].color, border: '4px solid #171719', color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 20, cursor: 'pointer', boxShadow: '6px 6px 0px 0px #171719', transition: 'box-shadow 0.1s' }}
                    >
                      NEXT!
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="enter-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
                    <motion.button onClick={handleFinish} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 0px 0px #171719' }}
                      style={{ width: '100%', padding: '18px', borderRadius: 12, background: '#FFD23F', border: '4px solid #171719', color: '#171719', fontFamily: "'Luckiest Guy',cursive", fontSize: 24, letterSpacing: 1, cursor: 'pointer', boxShadow: '6px 6px 0px 0px #171719', transition: 'box-shadow 0.1s' }}
                    >
                      LET'S GO! 🚀
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default VaultGateway;