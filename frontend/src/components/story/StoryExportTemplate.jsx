import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const StoryExportTemplate = forwardRef(({ story }, ref) => {
  const printRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  useImperativeHandle(ref, () => ({
    generateImage: async () => {
      if (!printRef.current || isExporting) return;
      setIsExporting(true);

      const loadingToast = toast.loading('PRINTING POSTER... 🖨️', {
        style: {
          borderRadius: '12px', background: '#3FE0FF', color: '#171719',
          border: '4px solid #171719', fontFamily: "'Luckiest Guy', cursive", fontSize: 16,
          boxShadow: '4px 4px 0px 0px #171719'
        },
      });

      try {
        const element = printRef.current;
        element.style.display = 'flex';

        const canvas = await html2canvas(element, {
          scale: 2, useCORS: true, logging: false, backgroundColor: '#FFD23F',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `Scrapbook_${story?.title?.replace(/\s+/g, '_') || 'Memory'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success('POSTER READY! 💥', { id: loadingToast });
      } catch (err) {
        console.error('Image generation failed:', err);
        toast.error('Printer jammed! Try again.', { id: loadingToast });
      } finally {
        printRef.current.style.display = 'none';
        setIsExporting(false);
      }
    },
  }));

  const imageUrl = story?.mediaUrls?.length > 0 ? story.mediaUrls[0] : story?.mediaUrl;
  const dateObj = new Date(story?.createdAt || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Fallback to standard web-safe fonts for html2canvas
  const popFont = "Impact, 'Arial Black', sans-serif";
  const bodyFont = "Arial, sans-serif";

  return (
    <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute' }}>
      <div
        ref={printRef}
        style={{
          display: 'none', position: 'absolute', left: '-9999px', top: 0,
          width: 800, minHeight: 800,
          backgroundColor: '#FFD23F',
          backgroundImage: 'radial-gradient(#171719 3px, transparent 4px)',
          backgroundSize: '30px 30px',
          flexDirection: 'column',
          padding: '40px', boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Main white cutout box */}
        <div style={{
          background: '#FFF', border: '8px solid #171719', borderRadius: 24,
          padding: '40px', display: 'flex', flexDirection: 'column',
          boxShadow: '24px 24px 0px 0px #3FE0FF, 24px 24px 0px 8px #171719',
          position: 'relative'
        }}>

          {/* Comic Burst Decoration */}
          <div style={{ position: 'absolute', top: -30, right: -30, background: '#FF3D81', color: '#FFF', border: '6px solid #171719', borderRadius: '50%', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: popFont, fontSize: 32, transform: 'rotate(15deg)', boxShadow: '8px 8px 0px 0px #171719', zIndex: 10 }}>
            POW!
          </div>

          {/* ── HEADER ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '6px solid #171719', paddingBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid #171719', background: '#3FE0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#171719', fontFamily: popFont }}>
                LT
              </div>
              <div>
                <div style={{ fontSize: 24, color: '#171719', fontFamily: popFont, textTransform: 'uppercase' }}>
                  THE LEGACY TRUNK
                </div>
                <div style={{ fontSize: 14, color: '#FF3D81', fontWeight: 900, fontFamily: bodyFont, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Family Scrapbook
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', background: '#171719', color: '#FFF', padding: '10px 20px', borderRadius: 12, fontFamily: popFont, fontSize: 18 }}>
              {formattedDate}
            </div>
          </div>

          {/* ── TITLE ── */}
          <h1 style={{
            fontSize: 56, color: '#FFD23F', WebkitTextStroke: '2px #171719', textShadow: '6px 6px 0px #171719',
            margin: '0 0 30px', lineHeight: 1.1, textAlign: 'center', fontFamily: popFont, textTransform: 'uppercase'
          }}>
            {story?.title || 'UNTITLED MEMORY'}
          </h1>

          {/* ── IMAGE ── */}
          {imageUrl && (story?.mediaType === 'photo' || story?.mediaType === 'image' || !story?.mediaType) && (
            <div style={{ width: '100%', marginBottom: 40, padding: 16, background: '#FFF', border: '6px solid #171719', boxShadow: '12px 12px 0px 0px #FF3D81', transform: 'rotate(-2deg)' }}>
              <img src={imageUrl} alt="Memory" crossOrigin="anonymous" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', border: '4px solid #171719', display: 'block' }} />
            </div>
          )}

          {/* ── CONTENT ── */}
          <div style={{ flex: 1, background: '#F5F5F5', border: '4px dashed #171719', borderRadius: 16, padding: 24, marginBottom: 40 }}>
            <p style={{ fontSize: 24, lineHeight: 1.6, color: '#171719', margin: 0, whiteSpace: 'pre-wrap', fontFamily: bodyFont, fontWeight: 700 }}>
              {story?.content}
            </p>
          </div>

          {/* ── SIGNATURE FOOTER ── */}
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 24, color: '#171719', fontFamily: popFont, letterSpacing: 2, background: '#3FE0FF', display: 'inline-block', padding: '10px 24px', border: '4px solid #171719', borderRadius: 12, boxShadow: '6px 6px 0px 0px #171719', transform: 'rotate(2deg)' }}>
              POSTED BY: {story?.user?.name || 'A FAMILY MEMBER'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default StoryExportTemplate;