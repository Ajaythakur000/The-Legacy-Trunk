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

      const loadingToast = toast.loading('Sealing the memory scroll... 📜', {
        style: {
          borderRadius: '12px',
          background: 'rgba(12,16,32,0.95)',
          color: '#e8c87a',
          border: '1px solid rgba(212,168,80,0.3)',
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: '1px',
        },
      });

      try {
        const element = printRef.current;
        element.style.display = 'flex';

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#06080f',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `Vault_${story?.title?.replace(/\s+/g, '_') || 'Memory'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success('Memory scroll sealed ✦', { id: loadingToast });
      } catch (err) {
        console.error('Image generation failed:', err);
        toast.error('The vault seal broke. Try again.', { id: loadingToast });
      } finally {
        printRef.current.style.display = 'none';
        setIsExporting(false);
      }
    },
  }));

  const imageUrl = story?.mediaUrls?.length > 0 ? story.mediaUrls[0] : story?.mediaUrl;
  const dateObj = new Date(story?.createdAt || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const firstLetter  = story?.content ? story.content.charAt(0).toUpperCase() : '';
  const restOfContent = story?.content ? story.content.slice(1) : '';

  /* ─────────────────────────────────────────────────────────
     The export poster — fully off-screen, only html2canvas
     sees it. Dimensions: 800px wide, auto height.
  ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute' }}>
      <div
        ref={printRef}
        style={{
          display: 'none',
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: 800,
          minHeight: 600,
          backgroundColor: '#06080f',
          flexDirection: 'column',
          padding: '64px 64px 56px',
          boxSizing: 'border-box',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: '#e2e8f0',
          position: 'relative',
        }}
      >
        {/*
          NOTE for html2canvas: web fonts sometimes don't load in time.
          Georgia is the serif fallback — still beautiful.
          If you need Cinzel in export, preload it before calling generateImage.
        */}

        {/* ── Decorative background layers ── */}
        {/* Outer border frame */}
        <div style={{
          position: 'absolute', inset: 20,
          border: '1px solid rgba(212,168,80,0.15)',
          pointerEvents: 'none',
        }}/>
        {/* Inner border frame */}
        <div style={{
          position: 'absolute', inset: 28,
          border: '1px solid rgba(212,168,80,0.08)',
          pointerEvents: 'none',
        }}/>

        {/* Corner ornaments — rendered as inline border divs */}
        {[
          { top: 20,    left:  20,  borderTop: '2px solid rgba(212,168,80,0.6)', borderLeft:  '2px solid rgba(212,168,80,0.6)' },
          { top: 20,    right: 20,  borderTop: '2px solid rgba(212,168,80,0.6)', borderRight: '2px solid rgba(212,168,80,0.6)' },
          { bottom: 20, left:  20,  borderBottom: '2px solid rgba(212,168,80,0.6)', borderLeft: '2px solid rgba(212,168,80,0.6)' },
          { bottom: 20, right: 20,  borderBottom: '2px solid rgba(212,168,80,0.6)', borderRight: '2px solid rgba(212,168,80,0.6)' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s, pointerEvents: 'none' }}/>
        ))}

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 44,
          borderBottom: '1px solid rgba(212,168,80,0.22)',
          paddingBottom: 22,
        }}>
          {/* Logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '1px solid rgba(212,168,80,0.4)',
              background: 'linear-gradient(135deg, #1a1410, #0f0c08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#e8c87a',
              letterSpacing: 1,
            }}>
              LT
            </div>
            <div>
              <div style={{ fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase',
                color: '#e8c87a', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                The Legacy Trunk
              </div>
              <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
                color: 'rgba(212,168,80,0.45)', marginTop: 2, fontFamily: 'Georgia, serif' }}>
                Family Memory Vault
              </div>
            </div>
          </div>

          {/* Date */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'rgba(212,168,80,0.45)', fontFamily: 'Georgia, serif' }}>
              Archived
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)',
              marginTop: 4, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              {formattedDate}
            </div>
          </div>
        </div>

        {/* ── TITLE ── */}
        <div style={{
          width: '60px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          margin: '0 auto 20px',
        }}/>
        <h1 style={{
          fontSize: 42, color: '#e8c87a',
          margin: '0 0 36px', lineHeight: 1.25,
          textAlign: 'center', fontWeight: 400,
          letterSpacing: '1px',
          textShadow: '0 0 40px rgba(212,168,80,0.3)',
          fontFamily: 'Georgia, serif',
        }}>
          {story?.title || 'Untitled Memory'}
        </h1>

        {/* ── IMAGE ── */}
        {imageUrl && (story?.mediaType === 'photo' || story?.mediaType === 'image' || !story?.mediaType) && (
          <div style={{
            width: '100%', marginBottom: 40,
            padding: 12,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(212,168,80,0.35)',
            display: 'flex', justifyContent: 'center',
          }}>
            <img
              src={imageUrl}
              alt="Memory"
              crossOrigin="anonymous"
              style={{
                maxWidth: '100%', maxHeight: 420,
                objectFit: 'contain',
                border: '3px solid rgba(212,168,80,0.25)',
              }}
            />
          </div>
        )}

        {/* ── CONTENT with Drop Cap ── */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 20, lineHeight: 1.9,
            color: 'rgba(255,255,255,0.72)',
            margin: 0,
            whiteSpace: 'pre-wrap',
            textAlign: 'justify',
            fontFamily: 'Georgia, serif',
          }}>
            {firstLetter && (
              <span style={{
                float: 'left',
                fontSize: 72, lineHeight: '56px',
                paddingTop: 6, paddingRight: 10,
                color: '#d4af37',
                fontWeight: 400,
                fontFamily: 'Georgia, serif',
              }}>
                {firstLetter}
              </span>
            )}
            {restOfContent}
          </p>
        </div>

        {/* ── SIGNATURE FOOTER ── */}
        <div style={{
          marginTop: 52, textAlign: 'center',
          paddingTop: 28,
          borderTop: '1px solid rgba(212,168,80,0.15)',
        }}>
          <div style={{
            width: 40, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(212,168,80,0.5), transparent)',
            margin: '0 auto 16px',
          }}/>
          <div style={{
            fontSize: 18, color: 'rgba(212,168,80,0.6)',
            fontStyle: 'italic', fontFamily: 'Georgia, serif',
            letterSpacing: '0.5px',
          }}>
            — Cherished by {story?.user?.name || 'A Family Member'} —
          </div>
          <div style={{
            marginTop: 14,
            fontFamily: 'Georgia, serif',
            fontSize: 10, letterSpacing: '4px',
            color: 'rgba(212,168,80,0.18)',
            userSelect: 'none',
          }}>
            ✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦
          </div>
        </div>
      </div>
    </div>
  );
});

export default StoryExportTemplate;