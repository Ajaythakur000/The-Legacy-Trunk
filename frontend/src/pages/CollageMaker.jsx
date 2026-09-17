import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ── NEW POP-ART FRAMES ──
const FRAMES = [
  { id: 'none', label: 'None', sub: 'Raw cuts', swatch: { border: '3px dashed #3E2723', background: '#FFF' }, style: {} },
  { id: 'comic', label: 'Heavy Ink', sub: 'Comic book', swatch: { border: 'none', background: '#FFF' }, style: { border: '12px solid #3E2723', padding: '6px', background: '#FFF' } },
  { id: 'polaroid', label: 'Polaroid', sub: 'Classic', swatch: { border: 'none', background: '#FFF', paddingBottom: 8 }, style: { background: '#FFF', padding: '16px 16px 60px', border: 'none' } },
  { id: 'popyellow', label: 'Pop Yellow', sub: 'Loud', swatch: { border: 'none', background: '#D4B895' }, style: { background: '#D4B895', padding: '16px', border: '8px solid #3E2723' } },
  { id: 'poppink', label: 'Bubblegum', sub: 'Vivid pink', swatch: { border: 'none', background: '#1E352F' }, style: { background: '#1E352F', padding: '16px', border: '8px solid #3E2723' } },
  { id: 'cyan', label: 'Electric Blue', sub: 'Cyan blast', swatch: { border: 'none', background: '#C89B3C' }, style: { background: '#C89B3C', padding: '16px', border: '8px solid #3E2723' } },
];

const FILTERS = [
  { id: 'none',      label: 'Original',  sub: 'No filter',   css: 'none' },
  { id: 'comicbook', label: 'Print',     sub: 'High contrast', css: 'saturate(1.5) contrast(1.3)' },
  { id: 'noir',      label: 'Noir',      sub: 'B&W',         css: 'grayscale(1) contrast(1.5)' },
  { id: 'retro',     label: 'Retro',     sub: 'Faded',       css: 'sepia(0.5) contrast(1.1) saturate(1.2)' },
];

const LAYOUTS = [
  { id: '2',      label: '2 Photos', cols: '1fr 1fr', rows: '1fr',       n: 2, spans: {} },
  { id: '3',      label: '3 Photos', cols: '1fr 1fr', rows: '1fr 1fr',     n: 3, spans: { 0: '1 / span 2' } },
  { id: '4',      label: '4 Photos', cols: '1fr 1fr', rows: '1fr 1fr',     n: 4, spans: {} },
  { id: 'banner', label: 'Banner',   cols: '1fr',     rows: '1fr 1fr 1fr', n: 3, spans: {} },
  { id: 'hero',   label: 'Hero',     cols: '2fr 1fr', rows: '1fr 1fr',     n: 3, spans: { 0: 'auto / auto / 1 / span 2' } },
  { id: '5',      label: '5 Photos', cols: '1fr 1fr', rows: '1fr 1fr 1fr', n: 5, spans: { 0: '1 / span 2' } },
];

const SliderRow = ({ label, value, min, max, unit = '', onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: "'Playfair Display', serif", color: '#3E2723', fontSize: 14 }}>
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#1E352F' }} />
  </div>
);

function ImageSlot({ src, onRemove, filterCss, borderRadius, frameActive }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const dragAxis = useRef(null); 
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const clampTransform = useCallback((newX, newY, scale) => {
    if (!containerRef.current || !imgRef.current) return { x: newX, y: newY };
    const cWidth = containerRef.current.offsetWidth; const cHeight = containerRef.current.offsetHeight;
    if (cWidth === 0 || cHeight === 0) return { x: newX, y: newY };
    const nWidth = imgRef.current.naturalWidth || cWidth; const nHeight = imgRef.current.naturalHeight || cHeight;
    const cAspect = cWidth / cHeight; const nAspect = nWidth / nHeight;
    let renderedWidth, renderedHeight;
    if (nAspect > cAspect) { renderedHeight = cHeight; renderedWidth = cHeight * nAspect; } else { renderedWidth = cWidth; renderedHeight = cWidth / nAspect; }
    const maxX = Math.max(0, (renderedWidth * scale - cWidth) / 2);
    const maxY = Math.max(0, (renderedHeight * scale - cHeight) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, newX)), y: Math.max(-maxY, Math.min(maxY, newY)) };
  }, []);

  const onMouseDown = useCallback(e => { e.preventDefault(); isDragging.current = true; dragAxis.current = null; lastPos.current = { x: e.clientX, y: e.clientY }; }, []);
  const onMouseMove = useCallback(e => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x; const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (!dragAxis.current) { if (Math.abs(dx) > Math.abs(dy)) dragAxis.current = 'X'; else dragAxis.current = 'Y'; }
    const finalDx = dragAxis.current === 'X' ? dx : 0; const finalDy = dragAxis.current === 'Y' ? dy : 0;
    setTransform(t => { const clamped = clampTransform(t.x + finalDx, t.y + finalDy, t.scale); return { ...t, x: clamped.x, y: clamped.y }; });
  }, [clampTransform]);
  const onMouseUp = useCallback(() => { isDragging.current = false; dragAxis.current = null; }, []);

  useEffect(() => {
    const container = containerRef.current; if (!container) return;
    const handleWheel = (e) => {
      e.preventDefault(); const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setTransform(t => { const newScale = Math.min(3, Math.max(0.5, t.scale + delta)); const clamped = clampTransform(t.x, t.y, newScale); return { x: clamped.x, y: clamped.y, scale: newScale }; });
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [clampTransform]);

  const btnStyle = { background: '#FFF', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)' };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: frameActive ? 0 : borderRadius, cursor: 'grab', background: '#FFF' }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <img ref={imgRef} src={src} alt="" draggable={false} onLoad={() => { setTransform(t => { const clamped = clampTransform(t.x, t.y, t.scale); return { ...t, x: clamped.x, y: clamped.y }; }); }}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: filterCss, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center center', pointerEvents: 'none' }} />
      
      <div className="hide-on-capture" style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 8, zIndex: 10 }}>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setTransform(t => { const s = Math.min(3, t.scale + 0.15); const c = clampTransform(t.x, t.y, s); return {x:c.x, y:c.y, scale:s} }); }} style={btnStyle}>+</button>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setTransform(t => { const s = Math.max(0.5, t.scale - 0.15); const c = clampTransform(t.x, t.y, s); return {x:c.x, y:c.y, scale:s} }); }} style={btnStyle}>-</button>
      </div>

      <button className="hide-on-capture" onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(); }} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: '#1E352F', color: '#FFF', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontFamily: "'Playfair Display', serif", boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.45)' }}>✕</button>
    </div>
  );
}

function CollageMaker({ onClose, onSave }) {
  const [layout, setLayout]             = useState('3');
  const [slotImages, setSlotImages]     = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab]       = useState('layout');
  const [activeFilter, setActiveFilter] = useState('none');
  const [activeFrame, setActiveFrame]   = useState('none');
  const [gridGap, setGridGap]           = useState(8);
  const [borderRadius, setBorderRadius] = useState(0); // Pop art defaults to sharp corners
  const [brightness, setBrightness]     = useState(100);
  const [contrast, setContrast]         = useState(100);
  const [saturation, setSaturation]     = useState(100);
  const [vignette, setVignette]         = useState(0);

  const collageRef = useRef(null);
  const currentLayout = LAYOUTS.find(l => l.id === layout) || LAYOUTS[1];
  const currentFilter = FILTERS.find(f => f.id === activeFilter) || FILTERS[0];
  const currentFrame  = FRAMES.find(f => f.id === activeFrame) || FRAMES[0];

  const composedFilter = (() => {
    const base = currentFilter.css === 'none' ? '' : currentFilter.css;
    const adj  = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`;
    return (base ? `${base} ${adj}` : adj);
  })();

  const handleImageUpload = useCallback((slotIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return toast.error('Max 15MB allowed!');
    setSlotImages(prev => ({ ...prev, [slotIndex]: URL.createObjectURL(file) }));
    e.target.value = null;
  }, []);

  const handleSaveCollage = async () => {
    if (!Object.values(slotImages).some(Boolean)) return toast.error('Add at least one photo!');
    setIsProcessing(true);
    const tId = toast.loading('Gluing it together...');
    try {
      const bgColor = currentFrame.style.background || '#FFF';
      const canvas = await html2canvas(collageRef.current, { scale: 2, useCORS: true, backgroundColor: bgColor, ignoreElements: el => el.classList.contains('hide-on-capture') });
      canvas.toBlob(blob => {
        if (!blob) throw new Error('Canvas failed');
        onSave(new File([blob], `collage-${Date.now()}.png`, { type: 'image/png' }));
        toast.success('Collage Ready! 💥', { id: tId });
      }, 'image/png');
    } catch (err) { toast.error('Failed to make collage.', { id: tId }); } finally { setIsProcessing(false); }
  };

  const TABS = ['layout', 'filters', 'frames', 'adjust'];

  return (
    // 🔥 FIX: Strict height rules added here so the inner content can scroll
    <div style={{ display: 'flex', flexDirection: 'column', height: '85vh', maxHeight: '750px', width: '100%', background: '#FFF', overflow: 'hidden' }}>
      
      {/* ── HEADER ── */}
      <div style={{ padding: '24px', borderBottom: '6px solid #3E2723', background: '#C89B3C', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3E2723' }}>COLLAGE MAKER ✂️</div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        {/* PREVIEW */}
        <div style={{ flex: '1.5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, background: '#FDFBF7', backgroundImage: 'none',  }}>
          <div style={{ width: '100%', maxWidth: 400, aspectRatio: '1/1', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)', border: 'none', background: '#FFF' }}>
            <div ref={collageRef} style={{ width: '100%', height: '100%', transition: 'all .2s ease', ...currentFrame.style }}>
              <div style={{ width: '100%', height: '100%', display: 'grid', gap: `${gridGap}px`, gridTemplateColumns: currentLayout.cols, gridTemplateRows: currentLayout.rows, borderRadius: activeFrame === 'none' ? borderRadius : 0, overflow: 'hidden', background: '#3E2723' }}>
                {Array.from({ length: currentLayout.n }, (_, i) => (
                  <div key={i} style={{ position: 'relative', background: '#FFF', borderRadius: activeFrame !== 'none' ? 0 : borderRadius, overflow: 'hidden', gridColumn: currentLayout.spans[i] || 'auto' }}>
                    {slotImages[i] ? (
                      <ImageSlot src={slotImages[i]} filterCss={composedFilter} borderRadius={borderRadius} frameActive={activeFrame !== 'none'} onRemove={() => setSlotImages(p => ({ ...p, [i]: null }))} />
                    ) : (
                      <label className="hide-on-capture" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', background: '#D4B895', color: '#3E2723', border: '4px dashed #3E2723', fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(i, e)} style={{ display: 'none' }} />
                        <span style={{ fontSize: 32 }}>+</span> ADD PIC
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ flex: 1, borderLeft: '6px solid #3E2723', display: 'flex', flexDirection: 'column', background: '#FFF', minHeight: 0 }}>
          
          <div style={{ display: 'flex', borderBottom: '4px solid #3E2723', flexShrink: 0 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '16px 0', background: activeTab === tab ? '#3E2723' : '#FFF', color: activeTab === tab ? '#FFF' : '#3E2723', border: 'none', borderRight: '4px solid #3E2723', fontFamily: "'Playfair Display', serif", fontSize: 14, cursor: 'pointer' }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                
                {activeTab === 'layout' && (<>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 30 }}>
                    {LAYOUTS.map(l => (
                      <button key={l.id} onClick={() => setLayout(l.id)} style={{ padding: '12px', borderRadius: 12, border: 'none', background: layout === l.id ? '#D4B895' : '#FFF', color: '#3E2723', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 14, boxShadow: layout === l.id ? '4px 4px 0px 0px #3E2723' : 'none', transform: layout === l.id ? 'translate(-2px,-2px)' : 'none' }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <SliderRow label="GRID GAP" value={gridGap} min={0} max={30} unit="px" onChange={setGridGap} />
                  <SliderRow label="ROUND EDGES" value={borderRadius} min={0} max={40} unit="px" onChange={setBorderRadius} />
                </>)}

                {activeTab === 'filters' && (<>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {FILTERS.map(f => (
                      <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{ padding: '16px', borderRadius: 12, border: 'none', background: activeFilter === f.id ? '#C89B3C' : '#FFF', cursor: 'pointer', boxShadow: activeFilter === f.id ? '4px 4px 0px 0px #3E2723' : 'none', transform: activeFilter === f.id ? 'translate(-2px,-2px)' : 'none' }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#3E2723' }}>{f.label}</div>
                      </button>
                    ))}
                  </div>
                </>)}

                {activeTab === 'frames' && (<>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {FRAMES.map(f => (
                      <button key={f.id} onClick={() => setActiveFrame(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', borderRadius: 12, border: 'none', background: activeFrame === f.id ? '#1E352F' : '#FFF', cursor: 'pointer', boxShadow: activeFrame === f.id ? '4px 4px 0px 0px #3E2723' : 'none', transform: activeFrame === f.id ? 'translate(-2px,-2px)' : 'none' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, ...f.swatch }} />
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: activeFrame === f.id ? '#FFF' : '#3E2723' }}>{f.label}</div>
                      </button>
                    ))}
                  </div>
                </>)}

                {activeTab === 'adjust' && (<>
                  <SliderRow label="BRIGHTNESS" value={brightness} min={50} max={150} unit="%" onChange={setBrightness} />
                  <SliderRow label="CONTRAST" value={contrast} min={50} max={150} unit="%" onChange={setContrast} />
                  <SliderRow label="SATURATION" value={saturation} min={0} max={200} unit="%" onChange={setSaturation} />
                </>)}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ACTIONS */}
          <div style={{ padding: 24, borderTop: '6px solid #3E2723', display: 'flex', gap: 16, background: '#D4B895', flexShrink: 0 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '16px', background: '#FFF', border: 'none', borderRadius: 12, fontFamily: "'Playfair Display', serif", fontSize: 18, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>CANCEL</button>
            <button onClick={handleSaveCollage} disabled={isProcessing} style={{ flex: 2, padding: '16px', background: '#00C853', color: '#FFF', border: 'none', borderRadius: 12, fontFamily: "'Playfair Display', serif", fontSize: 18, cursor: 'pointer', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>{isProcessing ? 'SAVING...' : 'DONE! 💥'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollageMaker;