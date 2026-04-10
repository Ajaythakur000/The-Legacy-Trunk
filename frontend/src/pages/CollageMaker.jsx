import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ── Star Canvas ───────────────────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const stars = [];
    let frame = 0, animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 100; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1 + 0.2, phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.015 + 0.003 });
    const draw = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); frame++; stars.forEach(s => { const a = 0.1 + 0.2 * Math.sin(frame * s.speed + s.phase); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(212,180,80,${a})`; ctx.fill(); }); animId = requestAnimationFrame(draw); };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

// ── Config ────────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'none',      label: 'Original',    sub: 'Pure memory',     css: 'none' },
  { id: 'ancestral', label: 'Ancestral',   sub: 'Sepia warmth',    css: 'sepia(0.65) contrast(1.1) brightness(0.88) saturate(0.9)' },
  { id: 'shadow',    label: 'Shadowgraph', sub: 'Timeless noir',   css: 'grayscale(1) contrast(1.25) brightness(0.9)' },
  { id: 'gilded',    label: 'Gilded',      sub: 'Gold tinted',     css: 'sepia(0.4) saturate(1.4) brightness(1.05) hue-rotate(5deg)' },
  { id: 'twilight',  label: 'Twilight',    sub: 'Cool dusk haze',  css: 'brightness(0.85) saturate(0.7) hue-rotate(200deg) contrast(1.1)' },
  { id: 'ember',     label: 'Ember',       sub: 'Warm fire glow',  css: 'sepia(0.3) saturate(1.8) hue-rotate(-15deg) brightness(0.95) contrast(1.15)' },
  { id: 'mist',      label: 'Vault Mist',  sub: 'Ethereal dream',  css: 'brightness(1.1) saturate(0.5) contrast(0.9)' },
  { id: 'void',      label: 'Void Dark',   sub: 'Deep shadow',     css: 'invert(0.08) saturate(0.4) brightness(0.75) contrast(1.3)' },
  { id: 'vivid',     label: 'Vivid',       sub: 'Bold colors',     css: 'saturate(1.8) contrast(1.1) brightness(1.02)' },
  { id: 'relic',     label: 'Faded Relic', sub: 'Worn & soft',     css: 'saturate(0.55) brightness(1.08) contrast(0.88)' },
];

const FRAMES = [
  {
    id: 'none',
    label: 'None',
    sub: 'Raw vault',
    swatch: { border: '1px dashed rgba(212,168,80,0.3)', background: 'rgba(12,16,32,0.6)' },
    style: {},
  },
  {
    id: 'gold',
    label: 'Royal Gold',
    sub: 'Ancestral seal',
    swatch: { border: '4px solid #e8c87a', background: '#1a1410', boxShadow: '0 0 8px rgba(212,168,80,0.4)' },
    style: { border: '8px solid #e8c87a', padding: '8px', background: '#1a1410', boxShadow: '0 0 0 1px rgba(212,168,80,0.3), inset 0 0 30px rgba(0,0,0,0.8), 0 0 40px rgba(212,168,80,0.2)' },
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    sub: 'Dark sorcery',
    swatch: { border: '3px solid #7c3aed', background: '#0d0a14', boxShadow: '0 0 8px rgba(140,80,220,0.4)' },
    style: { border: '6px solid #3d1f6e', padding: '8px', background: '#0d0a14', boxShadow: '0 0 0 2px rgba(140,80,220,0.4), 0 0 30px rgba(100,50,180,0.25)' },
  },
  {
    id: 'scroll',
    label: 'Ancient Scroll',
    sub: 'Runic border',
    swatch: { border: '3px dashed rgba(212,168,80,0.7)', background: '#0c1020' },
    style: { border: '8px dashed rgba(212,168,80,0.6)', padding: '6px', background: '#0c1020' },
  },
  {
    id: 'polaroid',
    label: 'Polaroid',
    sub: 'Timeless print',
    swatch: { border: '2px solid #ccc', background: '#f5f0e8', paddingBottom: 8 },
    style: { background: '#f5f0e8', padding: '14px 14px 52px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    sub: 'Film noir',
    swatch: { borderTop: '4px solid #333', borderBottom: '4px solid #333', background: '#000', borderLeft: '1px solid #222', borderRight: '1px solid #222' },
    style: { background: '#000', padding: '28px 6px', borderTop: '3px solid #222', borderBottom: '3px solid #222' },
  },
  {
    id: 'moonmist',
    label: 'Moonmist',
    sub: 'Ethereal glow',
    swatch: { border: '2px solid rgba(180,220,255,0.35)', background: 'rgba(10,15,30,0.9)', boxShadow: '0 0 8px rgba(100,160,255,0.2)' },
    style: { border: '2px solid rgba(180,220,255,0.2)', padding: '8px', background: 'rgba(10,15,30,0.9)', boxShadow: '0 0 40px rgba(100,160,255,0.15), inset 0 0 20px rgba(100,160,255,0.05)' },
  },
  {
    id: 'ember',
    label: 'Ember Forge',
    sub: 'Infernal seal',
    swatch: { border: '3px solid #c0392b', background: '#1a0805', boxShadow: '0 0 8px rgba(220,80,20,0.4)' },
    style: { border: '6px solid #3a1505', padding: '8px', background: '#1a0805', boxShadow: '0 0 0 2px rgba(220,80,20,0.4), 0 0 30px rgba(200,60,10,0.2)' },
  },
  // ── NEW FRAMES ──
  {
    id: 'celestial',
    label: 'Celestial',
    sub: 'Star-born light',
    swatch: { border: '3px solid rgba(160,200,255,0.6)', background: 'radial-gradient(circle at 30% 30%, #0a0f2e, #04080f)', boxShadow: '0 0 10px rgba(100,140,255,0.35)' },
    style: { border: '6px solid rgba(120,170,255,0.5)', padding: '10px', background: 'radial-gradient(circle at 30% 30%, #0a0f2e, #04080f)', boxShadow: '0 0 0 1px rgba(100,140,255,0.2), 0 0 40px rgba(80,120,255,0.25), inset 0 0 30px rgba(60,100,200,0.15)' },
  },
  {
    id: 'daguerreotype',
    label: 'Daguerreotype',
    sub: 'Victorian relic',
    swatch: { border: '4px solid #7a5c2a', background: '#1c1208', boxShadow: '0 0 0 2px #2e1f0a, 0 0 8px rgba(100,70,20,0.4)' },
    style: { border: '10px solid #7a5c2a', padding: '4px', background: '#1c1208', boxShadow: '0 0 0 3px #2e1f0a, 0 0 0 5px #5a3f14, 0 0 30px rgba(100,70,20,0.3), inset 0 0 20px rgba(0,0,0,0.7)' },
  },
  {
    id: 'neon',
    label: 'Neon Vault',
    sub: 'Cyberpunk glow',
    swatch: { border: '3px solid #00ffe1', background: '#050510', boxShadow: '0 0 10px rgba(0,255,225,0.4), inset 0 0 5px rgba(0,255,225,0.1)' },
    style: { border: '4px solid #00ffe1', padding: '8px', background: '#050510', boxShadow: '0 0 0 1px rgba(0,255,225,0.2), 0 0 40px rgba(0,255,225,0.2), inset 0 0 20px rgba(0,255,225,0.07)' },
  },
  {
    id: 'bloodmoon',
    label: 'Blood Moon',
    sub: 'Crimson ritual',
    swatch: { border: '3px solid #8b0000', background: '#0f0205', boxShadow: '0 0 10px rgba(180,0,0,0.4)' },
    style: { border: '6px solid #6b0000', padding: '8px', background: '#0f0205', boxShadow: '0 0 0 2px rgba(180,0,0,0.3), 0 0 40px rgba(150,0,0,0.2), inset 0 0 30px rgba(100,0,0,0.3)' },
  },
  {
    id: 'ivory',
    label: 'Ivory Tome',
    sub: 'Ancient parchment',
    swatch: { border: '4px solid #c8a96e', background: '#f2e8d0', boxShadow: '0 0 0 2px #8b6914' },
    style: { border: '10px solid #c8a96e', padding: '8px', background: '#f2e8d0', boxShadow: '0 0 0 3px #8b6914, 0 8px 32px rgba(0,0,0,0.4)' },
  },
  {
    id: 'mirror',
    label: 'Dark Mirror',
    sub: 'Infinite depth',
    swatch: { border: '3px solid rgba(200,200,220,0.4)', background: 'linear-gradient(135deg,#0a0a12,#141420)', boxShadow: 'inset 0 0 8px rgba(200,200,255,0.1)' },
    style: { border: '6px solid rgba(180,180,220,0.3)', padding: '8px', background: 'linear-gradient(135deg,#0a0a12,#141420)', boxShadow: '0 0 0 1px rgba(200,200,255,0.1), inset 0 0 40px rgba(180,180,255,0.06), 0 20px 60px rgba(0,0,0,0.7)' },
  },
  {
    id: 'sakura',
    label: 'Sakura Dream',
    sub: 'Petal softness',
    swatch: { border: '3px solid rgba(255,160,180,0.5)', background: 'rgba(20,8,12,0.95)', boxShadow: '0 0 10px rgba(255,100,140,0.25)' },
    style: { border: '6px solid rgba(220,100,140,0.5)', padding: '10px', background: 'rgba(18,6,10,0.95)', boxShadow: '0 0 0 2px rgba(255,100,140,0.15), 0 0 40px rgba(220,80,120,0.2), inset 0 0 20px rgba(180,60,100,0.1)' },
  },
];

const LAYOUTS = [
  { id: '2',      label: '2 Photos', cols: '1fr 1fr', rows: '1fr',       n: 2, spans: {} },
  { id: '3',      label: '3 Photos', cols: '1fr 1fr', rows: '1fr 1fr',     n: 3, spans: { 0: '1 / span 2' } },
  { id: '4',      label: '4 Photos', cols: '1fr 1fr', rows: '1fr 1fr',     n: 4, spans: {} },
  { id: 'banner', label: 'Banner',   cols: '1fr',     rows: '1fr 1fr 1fr', n: 3, spans: {} },
  { id: 'hero',   label: 'Hero',     cols: '2fr 1fr', rows: '1fr 1fr',     n: 3, spans: { 0: 'auto / auto / 1 / span 2' } },
  { id: '5',      label: '5 Photos', cols: '1fr 1fr', rows: '1fr 1fr 1fr', n: 5, spans: { 0: '1 / span 2' } },
];

// ── Section Label ─────────────────────────────────────────────────────────────
const SecLabel = ({ children }) => (
  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', marginBottom: 12 }}>
    {children}
  </div>
);

// ── Slider Row ────────────────────────────────────────────────────────────────
const SliderRow = ({ label, value, min, max, unit = '', onChange }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.6)' }}>{label}</span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#e8c87a' }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: '#e8c87a' }} />
  </div>
);

// ── Layout Icon ───────────────────────────────────────────────────────────────
const LayoutIcon = ({ id }) => {
  const dot = (extra = {}) => <div style={{ background: 'rgba(212,168,80,0.5)', borderRadius: 2, ...extra }} />;
  const wrap = (style, children) => <div style={{ display: 'grid', gap: 2, width: 28, height: 28, ...style }}>{children}</div>;
  if (id === '2')      return wrap({ gridTemplateColumns: '1fr 1fr' }, <>{dot()}{dot()}</>);
  if (id === '3')      return wrap({ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }, <>{dot({ gridColumn: '1/span 2' })}{dot()}{dot()}</>);
  if (id === '4')      return wrap({ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }, <>{dot()}{dot()}{dot()}{dot()}</>);
  if (id === 'banner') return wrap({ gridTemplateRows: '1fr 1fr 1fr' }, <>{dot()}{dot()}{dot()}</>);
  if (id === 'hero')   return wrap({ gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }, <>{dot({ gridRow: '1/span 2' })}{dot()}{dot()}</>);
  if (id === '5')      return wrap({ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' }, <>{dot({ gridColumn: '1/span 2' })}{dot()}{dot()}{dot()}{dot()}</>);
  return null;
};

// ── Frame Swatch ──────────────────────────────────────────────────────────────
const FrameSwatch = ({ frame }) => (
  <div style={{ width: 40, height: 26, borderRadius: 4, flexShrink: 0, ...frame.swatch }} />
);

// ── Image Slot with Pan + Zoom ────────────────────────────────────────────────
function ImageSlot({ src, onRemove, filterCss, borderRadius, frameActive }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const dragAxis = useRef(null); 
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const clampTransform = useCallback((newX, newY, scale) => {
    if (!containerRef.current || !imgRef.current) return { x: newX, y: newY };
    
    const cWidth = containerRef.current.offsetWidth;
    const cHeight = containerRef.current.offsetHeight;
    if (cWidth === 0 || cHeight === 0) return { x: newX, y: newY };

    const nWidth = imgRef.current.naturalWidth || cWidth;
    const nHeight = imgRef.current.naturalHeight || cHeight;

    const cAspect = cWidth / cHeight;
    const nAspect = nWidth / nHeight;

    let renderedWidth, renderedHeight;
    if (nAspect > cAspect) {
      renderedHeight = cHeight;
      renderedWidth = cHeight * nAspect;
    } else {
      renderedWidth = cWidth;
      renderedHeight = cWidth / nAspect;
    }

    const maxX = Math.max(0, (renderedWidth * scale - cWidth) / 2);
    const maxY = Math.max(0, (renderedHeight * scale - cHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    };
  }, []);

  // Mouse drag — pan
  const onMouseDown = useCallback(e => {
    e.preventDefault();
    isDragging.current = true;
    dragAxis.current = null;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback(e => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    if (!dragAxis.current) {
      if (Math.abs(dx) > Math.abs(dy)) dragAxis.current = 'X';
      else dragAxis.current = 'Y';
    }

    const finalDx = dragAxis.current === 'X' ? dx : 0;
    const finalDy = dragAxis.current === 'Y' ? dy : 0;

    setTransform(t => {
      const rawX = t.x + finalDx;
      const rawY = t.y + finalDy;
      const clamped = clampTransform(rawX, rawY, t.scale);
      return { ...t, x: clamped.x, y: clamped.y };
    });
  }, [clampTransform]);

  const onMouseUp = useCallback(() => { 
    isDragging.current = false; 
    dragAxis.current = null; 
  }, []);

  // Touch — drag on mobile
  const lastTouch = useRef(null);
  const onTouchStart = useCallback(e => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragAxis.current = null;
    }
  }, []);
  
  const onTouchMove = useCallback(e => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      if (!dragAxis.current) {
        if (Math.abs(dx) > Math.abs(dy)) dragAxis.current = 'X';
        else dragAxis.current = 'Y';
      }

      const finalDx = dragAxis.current === 'X' ? dx : 0;
      const finalDy = dragAxis.current === 'Y' ? dy : 0;

      setTransform(t => {
        const rawX = t.x + finalDx;
        const rawY = t.y + finalDy;
        const clamped = clampTransform(rawX, rawY, t.scale);
        return { ...t, x: clamped.x, y: clamped.y };
      });
    }
  }, [clampTransform]);

  const resetTransform = useCallback(() => setTransform({ x: 0, y: 0, scale: 1 }), []);

  // Native Wheel Event Listener to prevent full screen zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); 
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setTransform(t => {
        const newScale = Math.min(3, Math.max(0.5, t.scale + delta));
        const clamped = clampTransform(t.x, t.y, newScale);
        return { x: clamped.x, y: clamped.y, scale: newScale };
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [clampTransform]);

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: frameActive ? 0 : borderRadius, cursor: 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { lastTouch.current = null; dragAxis.current = null; }}
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        onLoad={() => {
          setTransform(t => {
            const clamped = clampTransform(t.x, t.y, t.scale);
            return { ...t, x: clamped.x, y: clamped.y };
          });
        }}
        style={{
          position: 'absolute',
          width: '100%', height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: filterCss,
          transition: isDragging.current ? 'none' : 'filter .3s',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* ── Control HUD — hidden on capture ── */}
      <div className="hide-on-capture" style={{ position: 'absolute', bottom: 6, left: 6, display: 'flex', gap: 4, zIndex: 10 }}>
        <button
          onMouseDown={e => { e.stopPropagation(); }}
          onClick={e => { e.stopPropagation(); setTransform(t => { const s = Math.min(3, t.scale + 0.15); const c = clampTransform(t.x, t.y, s); return {x:c.x, y:c.y, scale:s} }); }}
          style={hudBtn}
          title="Zoom In"
        >+</button>
        <button
          onMouseDown={e => { e.stopPropagation(); }}
          onClick={e => { e.stopPropagation(); setTransform(t => { const s = Math.max(0.5, t.scale - 0.15); const c = clampTransform(t.x, t.y, s); return {x:c.x, y:c.y, scale:s} }); }}
          style={hudBtn}
          title="Zoom Out"
        >−</button>
        <button
          onMouseDown={e => { e.stopPropagation(); }}
          onClick={e => { e.stopPropagation(); resetTransform(); }}
          style={hudBtn}
          title="Reset"
        >↺</button>
      </div>

      {/* ── Single Remove button — hidden on capture ── */}
      <button
        className="hide-on-capture"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{
          position: 'absolute', top: 6, right: 6, zIndex: 10,
          background: 'rgba(12,16,32,0.88)', color: '#f08080',
          border: '1px solid rgba(220,60,60,0.5)', borderRadius: '50%',
          width: 26, height: 26, cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(220,60,60,0.3)'; e.currentTarget.style.color = '#ff9090'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(12,16,32,0.88)'; e.currentTarget.style.color = '#f08080'; }}
      >✕</button>

      {/* Zoom indicator */}
      {transform.scale !== 1 && (
        <div className="hide-on-capture" style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(12,16,32,0.8)', border: '1px solid rgba(212,168,80,0.3)', borderRadius: 4, padding: '2px 7px', fontFamily: "'Space Mono', monospace", fontSize: 8, color: 'rgba(212,168,80,0.8)', letterSpacing: '1px' }}>
          {Math.round(transform.scale * 100)}%
        </div>
      )}
    </div>
  );
}

const hudBtn = {
  background: 'rgba(12,16,32,0.88)',
  border: '1px solid rgba(212,168,80,0.35)',
  borderRadius: 6,
  color: 'rgba(212,168,80,0.85)',
  width: 26, height: 26,
  cursor: 'pointer',
  fontSize: 14,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Space Mono', monospace",
  transition: 'all .2s',
  padding: 0,
};

// ── Main Component ────────────────────────────────────────────────────────────
function CollageMaker({ onClose, onSave }) {
  const [layout, setLayout]             = useState('3');
  const [slotImages, setSlotImages]     = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab]       = useState('layout');
  const [activeFilter, setActiveFilter] = useState('none');
  const [activeFrame, setActiveFrame]   = useState('none');
  const [gridGap, setGridGap]           = useState(8);
  const [borderRadius, setBorderRadius] = useState(8);
  const [brightness, setBrightness]     = useState(100);
  const [contrast, setContrast]         = useState(100);
  const [saturation, setSaturation]     = useState(100);
  const [warmth, setWarmth]             = useState(0);
  const [vignette, setVignette]         = useState(0);

  const collageRef = useRef(null);

  const currentLayout = LAYOUTS.find(l => l.id === layout)        || LAYOUTS[1];
  const currentFilter = FILTERS.find(f => f.id === activeFilter)  || FILTERS[0];
  const currentFrame  = FRAMES.find(f => f.id === activeFrame)    || FRAMES[0];

  const composedFilter = (() => {
    const base = currentFilter.css === 'none' ? '' : currentFilter.css;
    const adj  = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100}) hue-rotate(${warmth}deg)`;
    return (base ? `${base} ${adj}` : adj);
  })();

  const handleImageUpload = useCallback((slotIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return toast.error('File too large! Max 15MB.');
    setSlotImages(prev => ({ ...prev, [slotIndex]: URL.createObjectURL(file) }));
    e.target.value = null;
  }, []);

  const handleSaveCollage = async () => {
    if (!Object.values(slotImages).some(Boolean)) return toast.error('Add at least one photo! 📸');
    setIsProcessing(true);
    const tId = toast.loading('Sealing the memory scroll... 📜', {
      style: { background: 'rgba(12,16,32,0.95)', color: '#e8c87a', border: '1px solid rgba(212,168,80,0.3)', fontFamily: "'Space Mono', monospace", fontSize: 11 },
    });
    try {
      const bgMap = { polaroid: '#f5f0e8', cinematic: '#000', ivory: '#f2e8d0' };
      const bgColor = bgMap[activeFrame] || '#06080f';
      const canvas = await html2canvas(collageRef.current, {
        scale: 2, useCORS: true, backgroundColor: bgColor,
        ignoreElements: el => el.classList.contains('hide-on-capture'),
      });
      canvas.toBlob(blob => {
        if (!blob) throw new Error('Canvas failed');
        const file = new File([blob], `vault-collage-${Date.now()}.png`, { type: 'image/png' });
        toast.success('Memory scroll sealed ✦', { id: tId });
        onSave(file);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      toast.error('Failed to seal collage.', { id: tId });
    } finally {
      setIsProcessing(false);
    }
  };

  const TABS = ['layout', 'filters', 'frames', 'adjust'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ltBtnShine { 0%{left:-100%} 40%,100%{left:150%} }
        @keyframes ltBtnGlow  { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 4px 32px rgba(212,168,80,0.55)} }
        @keyframes ltDot      { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes ltFloat    { 0%{opacity:0;transform:translate(0,0) scale(1)} 20%{opacity:.5} 80%{opacity:.2} 100%{opacity:0;transform:translate(var(--tx,20px),var(--ty,-50px)) scale(.1)} }
        .cm-slot-label { display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; cursor:pointer; color:rgba(212,168,80,0.3); transition:all .25s; }
        .cm-slot-label:hover { background:rgba(212,168,80,0.07); color:rgba(212,168,80,0.7); }
        .cm-panel::-webkit-scrollbar { width:3px; }
        .cm-panel::-webkit-scrollbar-thumb { background:rgba(212,168,80,0.25); border-radius:3px; }
        .frame-btn-hover:hover { border-color:rgba(212,168,80,0.5) !important; background:rgba(212,168,80,0.07) !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', fontFamily: "'Cormorant Garamond', serif", background: '#06080f', position: 'relative', borderRadius: 20 }}>
        <StarCanvas />

        {/* Dust motes */}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, opacity: 0,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 6}px`, height: `${3 + Math.random() * 6}px`,
            background: `radial-gradient(circle, ${['rgba(212,168,80,0.5)','rgba(100,140,220,0.4)','rgba(180,140,80,0.5)'][i % 3]}, transparent 70%)`,
            animation: `ltFloat ${5 + Math.random() * 8}s ${Math.random() * 10}s ease-in-out infinite`,
          }} />
        ))}

        {/* ── HEADER ── */}
        <div style={{ position: 'relative', zIndex: 3, padding: '16px 22px', borderBottom: '1px solid rgba(212,168,80,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6,8,15,0.75)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          {/* Top shimmer line */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent)', pointerEvents: 'none' }} />
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: '#e8c87a', letterSpacing: '1.5px', textShadow: '0 0 20px rgba(212,168,80,0.3)', marginBottom: 2 }}>Vault Collage Maker</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '2.5px', color: 'rgba(212,168,80,0.4)', textTransform: 'uppercase' }}>Craft your memory mosaic</div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative', zIndex: 2 }}>

          {/* ── PREVIEW ── */}
          <div style={{ flex: '1.3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(6,8,15,0.5)' }}>
            <div style={{ width: '100%', maxWidth: 340, aspectRatio: '1/1' }}>
              <div ref={collageRef} style={{ width: '100%', height: '100%', transition: 'all .4s ease', ...currentFrame.style }}>
                <div style={{ width: '100%', height: '100%', display: 'grid', gap: `${gridGap}px`, gridTemplateColumns: currentLayout.cols, gridTemplateRows: currentLayout.rows, borderRadius: activeFrame === 'none' ? borderRadius : 0, overflow: 'hidden', transition: 'gap .3s, grid-template-columns .35s' }}>
                  {Array.from({ length: currentLayout.n }, (_, i) => (
                    <div key={i} style={{ position: 'relative', background: 'rgba(212,168,80,0.04)', borderRadius: activeFrame !== 'none' ? 0 : borderRadius, overflow: 'hidden', gridColumn: currentLayout.spans[i] || 'auto', border: slotImages[i] ? 'none' : '1px dashed rgba(212,168,80,0.18)', transition: 'border-radius .3s', minHeight: 0 }}>
                      {slotImages[i] ? (
                        <ImageSlot
                          src={slotImages[i]}
                          filterCss={composedFilter}
                          borderRadius={borderRadius}
                          frameActive={activeFrame !== 'none'}
                          onRemove={() => setSlotImages(p => ({ ...p, [i]: null }))}
                        />
                      ) : (
                        <label className="hide-on-capture cm-slot-label">
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(i, e)} style={{ display: 'none' }} />
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, marginBottom: 6 }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: '2px', textTransform: 'uppercase' }}>Add Photo</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div style={{ flex: 1, background: 'rgba(12,16,32,0.88)', borderLeft: '1px solid rgba(212,168,80,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,168,80,0.1)', flexShrink: 0 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 2px', background: activeTab === tab ? 'rgba(212,168,80,0.06)' : 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#e8c87a' : 'transparent'}`, color: activeTab === tab ? '#e8c87a' : 'rgba(255,255,255,0.3)', fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className="cm-panel" style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>

                  {/* LAYOUT */}
                  {activeTab === 'layout' && (<>
                    <SecLabel>Grid Style</SecLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 22 }}>
                      {LAYOUTS.map(l => (
                        <button key={l.id} onClick={() => setLayout(l.id)} style={{ padding: '9px 4px', borderRadius: 8, border: `1px solid ${layout === l.id ? '#e8c87a' : 'rgba(212,168,80,0.15)'}`, background: layout === l.id ? 'rgba(212,168,80,0.1)' : 'transparent', color: layout === l.id ? '#e8c87a' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: '1px', textAlign: 'center', transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                          <LayoutIcon id={l.id} />
                          {l.label}
                        </button>
                      ))}
                    </div>
                    <SliderRow label="Spacing"   value={gridGap}     min={0}  max={24} unit="px" onChange={setGridGap} />
                    <SliderRow label="Roundness" value={borderRadius} min={0}  max={40} unit="px" onChange={setBorderRadius} />
                  </>)}

                  {/* FILTERS */}
                  {activeTab === 'filters' && (<>
                    <SecLabel>Memory Essence</SecLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                      {FILTERS.map(f => (
                        <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{ padding: '9px 8px', borderRadius: 10, border: `1px solid ${activeFilter === f.id ? '#e8c87a' : 'rgba(212,168,80,0.13)'}`, background: activeFilter === f.id ? 'rgba(212,168,80,0.12)' : 'rgba(0,0,0,0.25)', color: activeFilter === f.id ? '#e8c87a' : 'rgba(255,255,255,0.55)', cursor: 'pointer', textAlign: 'center', transition: 'all .22s', boxShadow: activeFilter === f.id ? '0 0 12px rgba(212,168,80,0.1)' : 'none' }}>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: '0.5px', opacity: 0.55 }}>{f.sub}</div>
                        </button>
                      ))}
                    </div>
                  </>)}

                  {/* FRAMES */}
                  {activeTab === 'frames' && (<>
                    <SecLabel>Seal & Frame</SecLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {FRAMES.map(f => (
                        <button
                          key={f.id}
                          className="frame-btn-hover"
                          onClick={() => setActiveFrame(f.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', borderRadius: 10, width: '100%',
                            border: `1px solid ${activeFrame === f.id ? '#e8c87a' : 'rgba(212,168,80,0.1)'}`,
                            background: activeFrame === f.id ? 'rgba(212,168,80,0.1)' : 'rgba(0,0,0,0.2)',
                            cursor: 'pointer', textAlign: 'left', transition: 'all .22s',
                            boxShadow: activeFrame === f.id ? '0 0 16px rgba(212,168,80,0.12)' : 'none',
                          }}
                        >
                          <FrameSwatch frame={f} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, color: activeFrame === f.id ? '#e8c87a' : 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{f.label}</div>
                            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: '0.5px', color: 'rgba(212,168,80,0.4)' }}>{f.sub}</div>
                          </div>
                          {activeFrame === f.id && (
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: '#e8c87a' }}>✦</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>)}

                  {/* ADJUST */}
                  {activeTab === 'adjust' && (<>
                    <SecLabel>Fine Tuning</SecLabel>
                    <SliderRow label="Brightness" value={brightness} min={50}  max={150} unit="%" onChange={setBrightness} />
                    <SliderRow label="Contrast"   value={contrast}   min={50}  max={150} unit="%" onChange={setContrast} />
                    <SliderRow label="Saturation" value={saturation} min={0}   max={200} unit="%" onChange={setSaturation} />
                    <SliderRow label="Warmth"     value={warmth}     min={-30} max={30}  unit="°" onChange={setWarmth} />
                    <SliderRow label="Vignette"   value={vignette}   min={0}   max={100} unit="%" onChange={setVignette} />
                    <button
                      onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setWarmth(0); setVignette(0); }}
                      style={{ width: '100%', marginTop: 6, padding: '9px', background: 'transparent', border: '1px solid rgba(212,168,80,0.18)', borderRadius: 8, color: 'rgba(212,168,80,0.45)', fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.07)'; e.currentTarget.style.color = '#e8c87a'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(212,168,80,0.45)'; }}
                    >Reset Adjustments</button>
                  </>)}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── ACTIONS ── */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(212,168,80,0.1)', display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={onClose} disabled={isProcessing}
                style={{ flex: 1, padding: 11, background: 'transparent', color: 'rgba(212,168,80,0.65)', border: '1px solid rgba(212,168,80,0.22)', borderRadius: 10, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.07)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.45)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; }}
              >Cancel</button>

              <button onClick={handleSaveCollage} disabled={isProcessing}
                style={{ flex: 2, padding: 11, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#c9933a,#e8a820,#c9933a)', backgroundSize: '200%', color: '#1a0f00', border: 'none', borderRadius: 10, fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: isProcessing ? 'wait' : 'pointer', animation: 'ltBtnGlow 3s ease-in-out infinite', opacity: isProcessing ? 0.7 : 1 }}
                onMouseOver={e => { if (!isProcessing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ position: 'absolute', top: '-50%', left: '-100%', width: '50%', height: '200%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)', transform: 'skewX(-20deg)', animation: 'ltBtnShine 3s ease-in-out infinite', pointerEvents: 'none' }} />
                {isProcessing
                  ? <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>{[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', display: 'inline-block', animation: `ltDot .8s ${i*0.15}s ease-in-out infinite` }} />)}</span>
                  : 'Seal the Memory ✦'}
              </button>
            </div>
          </div>
        </div>

        {/* Rune footer */}
        <div style={{ position: 'relative', zIndex: 2, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '4px', color: 'rgba(212,168,80,0.1)', userSelect: 'none', textAlign: 'center', padding: '8px 0 12px' }}>
          ✦  ᚦ ᛖ  ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ  ᛏ ᚱ ᚢ ᚾ ᚲ  ✦
        </div>
      </div>
    </>
  );
}

export default CollageMaker;