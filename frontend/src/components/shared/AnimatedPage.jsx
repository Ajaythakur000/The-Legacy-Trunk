import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

// ─── Cinematic page transition variants ──────────────────────────────────────
const variants = {

  // Option 1: VAULT DOOR — page seals in like an ancient vault opening
  vaultDoor: {
    initial: {
      opacity: 0,
      y: 40, // Thoda aur deep se aayega
      clipPath: 'inset(0 50% 0 50%)',
      filter: 'brightness(2) blur(6px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0 0% 0 0%)',
      filter: 'brightness(1) blur(0px)',
    },
    exit: {
      opacity: 0,
      y: -30,
      clipPath: 'inset(0 50% 0 50%)',
      filter: 'brightness(2) blur(6px)',
    },
  },

  // Option 2: ANCIENT SCROLL — unfurls from top like a parchment
  scroll: {
    initial: {
      opacity: 0,
      scaleY: 0.5,
      y: -50,
      transformOrigin: 'top center',
      filter: 'sepia(1) brightness(2.5)',
    },
    animate: {
      opacity: 1,
      scaleY: 1,
      y: 0,
      transformOrigin: 'top center',
      filter: 'sepia(0) brightness(1)',
    },
    exit: {
      opacity: 0,
      scaleY: 0.5,
      y: 50,
      transformOrigin: 'bottom center',
      filter: 'sepia(1) brightness(2.5)',
    },
  },

  // Option 3: GOLD FADE — elegant gold shimmer dissolve
  goldFade: {
    initial: {
      opacity: 0,
      y: 20,
      filter: 'brightness(3) saturate(0)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'brightness(1) saturate(1)',
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: 'brightness(3) saturate(0)',
    },
  },

  // Option 4: RUNE RISE — rises from the depths like ancient runes awakening
  runeRise: {
    initial: {
      opacity: 0,
      y: 60,
      scale: 0.94,
      filter: 'blur(10px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 1.05,
      filter: 'blur(8px)',
    },
  },

};

// ─── Gold particle burst on page enter ──────────────────────────────────────
function GoldBurst() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 40 }, () => { // Thode particles badha diye
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      return {
        x: canvas.width / 2, y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: Math.random() * 3 + 1,
        alpha: 1,
        gold: Math.random() > 0.2,
      };
    });

    let frame = 0;
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // Gravity thodi slow kar di
        p.alpha -= 0.015; // Fade out thoda slow kar diya
        if (p.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,180,80,${p.alpha})`
          : `rgba(255,255,255,${p.alpha * 0.5})`;
        ctx.fill();
      });
      frame++;
      if (frame < 120) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 9999,
      }}
    />
  );
}

// ─── Rune flash overlay on transition ────────────────────────────────────────
function RuneFlash() {
  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }} // Flash ka time double kar diya
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(212,168,80,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 1, scale: 0.8, letterSpacing: '8px' }}
        animate={{ opacity: 0, scale: 1.5, letterSpacing: '28px' }}
        transition={{ duration: 1.5, ease: 'easeOut' }} // Text aaram se dissolve hoga
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 16, color: 'rgba(212,168,80,0.7)',
          userSelect: 'none', whiteSpace: 'nowrap',
          textShadow: '0 0 20px rgba(212,168,80,0.5)' // Glow add kiya
        }}
      >
        ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ✦
      </motion.div>
    </motion.div>
  );
}

// ─── Main AnimatedPage ────────────────────────────────────────────────────────
function AnimatedPage({
  children,
  variant = 'runeRise',   // 'vaultDoor' | 'scroll' | 'goldFade' | 'runeRise'
  showBurst = false,       // gold particle burst on enter
  showRuneFlash = true,    // rune text dissolves on enter
  duration = 1.2,          // 🔥 DURATION INCREASED FOR PREMIUM FEEL 🔥
}) {
  const chosen = variants[variant] || variants.runeRise;

  return (
    <>
      {/* Overlay effects */}
      {showRuneFlash && <RuneFlash />}
      {showBurst && <GoldBurst />}

      {/* Page content */}
      <motion.div
        variants={chosen}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1], // Aur smooth easing curve
          filter: { duration: duration * 0.9 },
          clipPath: { duration: duration * 1.2, ease: [0.4, 0, 0.2, 1] },
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </>
  );
}

export default AnimatedPage;