import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Plus, Scissors, Check, Settings2, Image as ImageIcon, LayoutGrid } from 'lucide-react';

const FRAMES = [
  { id: 'none', label: 'Raw Cuts', sub: 'No border', swatch: { border: '1px dashed #8C7B6B', background: 'transparent' }, style: {} },
  { id: 'vintage', label: 'Vintage Frame', sub: 'Classic matting', swatch: { border: '4px solid #EEDEC1', background: '#FDFBF7' }, style: { border: '12px solid #EEDEC1', padding: '12px', background: '#FDFBF7' } },
  { id: 'polaroid', label: 'Polaroid', sub: 'Nostalgic', swatch: { border: '2px solid #FFF', borderBottom: '8px solid #FFF', background: '#F5F5F5' }, style: { background: '#FFF', padding: '16px 16px 64px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } },
  { id: 'kraft', label: 'Kraft Paper', sub: 'Scrapbook feel', swatch: { background: '#D4B895' }, style: { background: '#D4B895', padding: '16px', border: '1px dashed #8C7B6B' } },
  { id: 'darkwood', label: 'Mahogany', sub: 'Elegant dark wood', swatch: { background: '#3E2723', border: '1px solid #C89B3C' }, style: { background: '#3E2723', padding: '16px', border: '2px solid #C89B3C' } },
];

const FILTERS = [
  { id: 'none',      label: 'Original',  css: 'none' },
  { id: 'comicbook', label: 'Vivid',     css: 'saturate(1.5) contrast(1.3)' },
  { id: 'noir',      label: 'Noir',      css: 'grayscale(1) contrast(1.5)' },
  { id: 'retro',     label: 'Sepia',     css: 'sepia(0.6) contrast(1.1) saturate(1.2)' },
];

const LAYOUTS = [
  { id: '2',      label: 'Split',   cols: '1fr 1fr', rows: '1fr',       n: 2, spans: {} },
  { id: '3',      label: 'Trio',    cols: '1fr 1fr', rows: '1fr 1fr',     n: 3, spans: { 0: '1 / span 2' } },
  { id: '4',      label: 'Grid',    cols: '1fr 1fr', rows: '1fr 1fr',     n: 4, spans: {} },
  { id: 'banner', label: 'Strip',   cols: '1fr',     rows: '1fr 1fr 1fr', n: 3, spans: {} },
  { id: 'hero',   label: 'Hero',    cols: '2fr 1fr', rows: '1fr 1fr',     n: 3, spans: { 0: 'auto / auto / 1 / span 2' } },
  { id: '5',      label: 'Mosaic',  cols: '1fr 1fr', rows: '1fr 1fr 1fr', n: 5, spans: { 0: '1 / span 2' } },
];

const SliderRow = ({ label, value, min, max, unit = '', onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: "'Courier Prime', monospace", color: '#8C7B6B', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#3E2723', height: 4 }} />
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

  const btnStyle = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, width: 28, height: 28, cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: 16, color: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: frameActive ? 0 : borderRadius, cursor: 'grab', background: '#EEDEC1' }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <img ref={imgRef} src={src} alt="" draggable={false} onLoad={() => { setTransform(t => { const clamped = clampTransform(t.x, t.y, t.scale); return { ...t, x: clamped.x, y: clamped.y }; }); }}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: filterCss, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center center', pointerEvents: 'none' }} />
      
      <div className="hide-on-capture" style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 6, zIndex: 10 }}>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setTransform(t => { const s = Math.min(3, t.scale + 0.15); const c = clampTransform(t.x, t.y, s); return {x:c.x, y:c.y, scale:s} }); }} style={btnStyle}>+</button>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setTransform(t => { const s = Math.max(0.5, t.scale - 0.15); const c = clampTransform(t.x, t.y, s); return {x:c.x, y:c.y, scale:s} }); }} style={btnStyle}>-</button>
      </div>

      <button className="hide-on-capture" onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(); }} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(62,39,35,0.8)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
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
  const [borderRadius, setBorderRadius] = useState(0); 
  const [brightness, setBrightness]     = useState(100);
  const [contrast, setContrast]         = useState(100);
  const [saturation, setSaturation]     = useState(100);

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
    const tId = toast.loading('Developing photo...');
    try {
      const bgColor = currentFrame.style.background || '#FFF';
      const canvas = await html2canvas(collageRef.current, { scale: 2, useCORS: true, backgroundColor: bgColor, ignoreElements: el => el.classList.contains('hide-on-capture') });
      canvas.toBlob(blob => {
        if (!blob) throw new Error('Canvas failed');
        onSave(new File([blob], `collage-${Date.now()}.png`, { type: 'image/png' }));
        toast.success('Photo Developed.', { id: tId });
      }, 'image/png');
    } catch (err) { toast.error('Failed to develop photo.', { id: tId }); } finally { setIsProcessing(false); }
  };

  const TABS = [
    { id: 'layout', label: 'Layout', icon: LayoutGrid },
    { id: 'filters', label: 'Filters', icon: ImageIcon },
    { id: 'frames', label: 'Frames', icon: Scissors },
    { id: 'adjust', label: 'Adjust', icon: Settings2 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '85vh', maxHeight: '750px', width: '100%', background: '#FDFBF7', overflow: 'hidden' }}>
      
      {/* ── HEADER ── */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(62,39,35,0.1)', background: '#FDFBF7', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Camera size={24} color="#3E2723" />
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', fontStyle: 'italic' }}>The Darkroom Studio</div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        {/* PREVIEW (Dark Wood Desk) */}
        <div style={{ flex: '1.5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, background: '#2D1A11', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")', boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: 400, aspectRatio: '1/1', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: 'transparent' }}>
            <div ref={collageRef} style={{ width: '100%', height: '100%', transition: 'all .3s ease', ...currentFrame.style }}>
              <div style={{ width: '100%', height: '100%', display: 'grid', gap: `${gridGap}px`, gridTemplateColumns: currentLayout.cols, gridTemplateRows: currentLayout.rows, borderRadius: activeFrame === 'none' ? borderRadius : 0, overflow: 'hidden', background: '#1A0F0A' }}>
                {Array.from({ length: currentLayout.n }, (_, i) => (
                  <div key={i} style={{ position: 'relative', background: '#EEDEC1', borderRadius: activeFrame !== 'none' ? 0 : borderRadius, overflow: 'hidden', gridColumn: currentLayout.spans[i] || 'auto' }}>
                    {slotImages[i] ? (
                      <ImageSlot src={slotImages[i]} filterCss={composedFilter} borderRadius={borderRadius} frameActive={activeFrame !== 'none'} onRemove={() => setSlotImages(p => ({ ...p, [i]: null }))} />
                    ) : (
                      <label className="hide-on-capture" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', background: 'transparent', color: 'rgba(62,39,35,0.4)', border: '1px dashed rgba(62,39,35,0.2)', transition: 'all 0.2s' }}>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(i, e)} style={{ display: 'none' }} />
                        <Plus size={24} style={{ marginBottom: 8 }} />
                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Attach Photo</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS (Manila Folder Style) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FDFBF7', minHeight: 0 }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#EEDEC1', borderBottom: '1px solid rgba(62,39,35,0.2)', flexShrink: 0, padding: '10px 10px 0 10px', gap: 4 }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '12px 0', background: activeTab === tab.id ? '#FDFBF7' : 'rgba(253,251,247,0.4)', color: activeTab === tab.id ? '#3E2723' : '#8C7B6B', border: '1px solid rgba(62,39,35,0.2)', borderBottom: activeTab === tab.id ? '1px solid #FDFBF7' : '1px solid rgba(62,39,35,0.2)', borderRadius: '6px 6px 0 0', fontFamily: "'Courier Prime', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s', marginBottom: activeTab === tab.id ? -1 : 0 }}>
                  <Icon size={16} strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '30px 24px', flex: 1, overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                
                {activeTab === 'layout' && (<>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
                    {LAYOUTS.map(l => (
                      <button key={l.id} onClick={() => setLayout(l.id)} style={{ padding: '16px 12px', borderRadius: 4, border: activeLayout(l.id) ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.2)', background: activeLayout(l.id) ? 'rgba(62,39,35,0.05)' : 'transparent', color: '#3E2723', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: 13, transition: 'all 0.2s' }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <SliderRow label="Gutter Width" value={gridGap} min={0} max={40} unit="px" onChange={setGridGap} />
                  <SliderRow label="Corner Curve" value={borderRadius} min={0} max={40} unit="px" onChange={setBorderRadius} />
                </>)}

                {activeTab === 'filters' && (<>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {FILTERS.map(f => (
                      <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{ padding: '20px 12px', borderRadius: 4, border: activeFilter === f.id ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.2)', background: activeFilter === f.id ? 'rgba(62,39,35,0.05)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: '#3E2723', textTransform: 'uppercase' }}>{f.label}</div>
                      </button>
                    ))}
                  </div>
                </>)}

                {activeTab === 'frames' && (<>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {FRAMES.map(f => (
                      <button key={f.id} onClick={() => setActiveFrame(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderRadius: 4, border: activeFrame === f.id ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.2)', background: activeFrame === f.id ? 'rgba(62,39,35,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 2, ...f.swatch }} />
                        <div style={{ textAlign: 'left' }}>
                           <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#3E2723', textTransform: 'uppercase' }}>{f.label}</div>
                           <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#8C7B6B', fontStyle: 'italic', marginTop: 4 }}>{f.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>)}

                {activeTab === 'adjust' && (<>
                  <SliderRow label="Exposure" value={brightness} min={50} max={150} unit="%" onChange={setBrightness} />
                  <SliderRow label="Contrast" value={contrast} min={50} max={150} unit="%" onChange={setContrast} />
                  <SliderRow label="Color Depth" value={saturation} min={0} max={200} unit="%" onChange={setSaturation} />
                </>)}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ACTIONS */}
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(62,39,35,0.1)', display: 'flex', gap: 16, background: '#FDFBF7', flexShrink: 0 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(62,39,35,0.3)', borderRadius: 4, color: '#3E2723', fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSaveCollage} disabled={isProcessing} style={{ flex: 2, padding: '14px', background: '#3E2723', color: '#FDFBF7', border: 'none', borderRadius: 4, fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s' }}>
              <Check size={16} /> {isProcessing ? 'Developing...' : 'Add to Scrapbook'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function activeLayout(id) { return layout === id; }
}

export default CollageMaker;
