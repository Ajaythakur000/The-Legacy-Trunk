import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// ─── Cinematic page transition variants ──────────────────────────────────────
const variants = {
  vaultDoor: {
    initial: {
      opacity: 0,
      y: 40,
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
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: 40 }, () => {
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
    let raf = null;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.alpha -= 0.015;
        if (p.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,180,80,${p.alpha})`
          : `rgba(255,255,255,${p.alpha * 0.5})`;
        ctx.fill();
      });
      frame++;
      if (frame < 45) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

// ─── Rune flash overlay on transition ────────────────────────────────────────
function RuneFlash() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={() => setHidden(true)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(212,168,80,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 1, scale: 0.8, letterSpacing: '8px' }}
        animate={{ opacity: 0, scale: 1.5, letterSpacing: '28px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 16,
          color: 'rgba(212,168,80,0.7)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          textShadow: '0 0 20px rgba(212,168,80,0.5)',
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
  variant = 'runeRise',
  showBurst = false,
  showRuneFlash = true,
  duration = 1.2,
}) {
  const chosen = variants[variant] || variants.runeRise;
  const fastDuration = Math.min(duration, 0.28);

  return (
    <>
      {showRuneFlash && <RuneFlash />}
      {showBurst && <GoldBurst />}

      <motion.div
        variants={chosen}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: fastDuration,
          ease: [0.22, 1, 0.36, 1],
          filter: { duration: fastDuration * 0.8 },
          clipPath: { duration: fastDuration * 0.9, ease: [0.4, 0, 0.2, 1] },
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </>
  );
}

export default AnimatedPage;