import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// ─── Comic page transition variants ──────────────────────────────────────────
const variants = {
  vaultDoor: {
    initial: { opacity: 0, scale: 0.8, rotate: -4 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 1.1, rotate: 4 },
  },
  scroll: {
    initial: { opacity: 0, y: 100, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -100, scale: 0.9 },
  },
  goldFade: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  runeRise: {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -40, scale: 1.05 },
  },
};

// ─── Comic Action Burst on page enter ─────────────────────────────────────────
function ComicBurst() {
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

    const particles = Array.from({ length: 25 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 15 + 5;
      const colors = ['#D4B895', '#1E352F', '#C89B3C', '#3E2723'];
      return {
        x: canvas.width / 2, y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        life: 1,
      };
    });

    let frame = 0;
    let raf = null;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        p.rotation += 10;
        p.size *= 0.95;
        if (p.life <= 0) return;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Draw a rough star/burst shape
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * p.size, -Math.sin((18 + i * 72) * Math.PI / 180) * p.size);
          ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (p.size/2), -Math.sin((54 + i * 72) * Math.PI / 180) * (p.size/2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
      frame++;
      if (frame < 30) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
}

// ─── Pop-Art screen wipe on transition ───────────────────────────────────────
function ComicWipe() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.4, ease: [0.8, 0, 0.2, 1] }}
      onAnimationComplete={() => setHidden(true)}
      style={{
        position: 'fixed', inset: 0,
        background: '#D4B895',
        transformOrigin: 'top',
        pointerEvents: 'none', zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '8px solid #3E2723'
      }}
    >
      <motion.div
        initial={{ scale: 1, rotate: -10 }} animate={{ scale: 0, rotate: 10 }} transition={{ duration: 0.3 }}
        style={{ fontFamily: "'Playfair Display', serif", fontSize: 80, color: '#D4B895', textShadow: '4px 4px 0px #3E2723', WebkitTextStroke: '2px #3E2723' }}
      >
        POW!
      </motion.div>
    </motion.div>
  );
}

// ─── Main AnimatedPage ────────────────────────────────────────────────────────
function AnimatedPage({ children, variant = 'runeRise', showBurst = false, showRuneFlash = true, duration = 0.5 }) {
  const chosen = variants[variant] || variants.runeRise;

  return (
    <>
      {showRuneFlash && <ComicWipe />}
      {showBurst && <ComicBurst />}

      <motion.div
        variants={chosen}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </>
  );
}

export default AnimatedPage;