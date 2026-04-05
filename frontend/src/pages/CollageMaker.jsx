import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

function CollageMaker({ onClose, onSave }) {
  const [layout, setLayout] = useState('grid-2'); 
  const [slotImages, setSlotImages] = useState({ 0: null, 1: null, 2: null, 3: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const collageRef = useRef(null);

  const handleImageUpload = (slotIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      return toast.error("File is too large! Max 15MB.");
    }

    const url = URL.createObjectURL(file);
    setSlotImages(prev => ({ ...prev, [slotIndex]: url }));
  };

  const handleSaveCollage = async () => {
    if (!Object.values(slotImages).some(img => img !== null)) {
      return toast.error("Please add at least one photo!");
    }

    setIsProcessing(true);
    const tId = toast.loading("Creating your masterpiece... 🎨");

    try {
      const canvas = await html2canvas(collageRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        // 🔥 THE MAGIC FIX: Tell html2canvas to ignore the 'X' buttons!
        ignoreElements: (element) => element.classList.contains('hide-on-capture')
      });

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas generation failed");
        
        const file = new File([blob], `family-collage-${Date.now()}.png`, { type: 'image/png' });
        
        toast.success("Collage Ready! ✨", { id: tId });
        onSave(file); 
      }, 'image/png');

    } catch (error) {
      console.error(error);
      toast.error("Failed to create collage.", { id: tId });
    } finally {
      setIsProcessing(false);
    }
  };

  const getGridStyle = () => {
    if (layout === 'grid-2') return { gridTemplateColumns: '1fr 1fr' };
    if (layout === 'grid-3') return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
    if (layout === 'grid-4') return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
    return { gridTemplateColumns: '1fr' };
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>🎨 Build a Collage</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            {['grid-2', 'grid-3', 'grid-4'].map((type) => (
              <button 
                key={type}
                onClick={() => setLayout(type)}
                style={{ 
                  padding: '8px 16px', borderRadius: '12px', border: `2px solid ${layout === type ? '#3b82f6' : '#e2e8f0'}`, 
                  background: layout === type ? '#eff6ff' : '#fff', color: layout === type ? '#1d4ed8' : '#64748b',
                  fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {type === 'grid-2' ? '2 Photos' : type === 'grid-3' ? '3 Photos' : '4 Photos'}
              </button>
            ))}
          </div>

          <div 
            ref={collageRef} 
            style={{ 
              width: '100%', aspectRatio: '1/1', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden',
              display: 'grid', gap: '8px', padding: '8px', ...getGridStyle(), border: '2px solid #e2e8f0'
            }}
          >
            {[...Array(layout === 'grid-2' ? 2 : layout === 'grid-3' ? 3 : 4)].map((_, i) => (
              <div key={i} style={{ 
                position: 'relative', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden',
                gridColumn: (layout === 'grid-3' && i === 0) ? '1 / span 2' : 'auto' 
              }}>
                {slotImages[i] ? (
                  <>
                    <img src={slotImages[i]} alt={`slot-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button 
                      className="hide-on-capture" // 🔥 ADDED THIS CLASS SO IT HIDES DURING SCREENSHOT!
                      onClick={() => setSlotImages(prev => ({ ...prev, [i]: null }))}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '10px' }}
                    >✕</button>
                  </>
                ) : (
                  <label className="hide-on-capture" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', color: '#94a3b8' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e)} style={{ display: 'none' }} />
                    <span style={{ fontSize: '24px' }}>+</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Add Photo</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button onClick={onClose} disabled={isProcessing} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSaveCollage} disabled={isProcessing} style={{ flex: 2, padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: isProcessing ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              {isProcessing ? 'Processing...' : 'Done! Use this Image 📸'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CollageMaker;