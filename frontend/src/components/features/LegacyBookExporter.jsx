import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const LegacyBookExporter = forwardRef(({ milestones, circleName }, ref) => {
  const printRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  const waitForImages = async (element) => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
    });
    await Promise.all(promises);
  };

  useImperativeHandle(ref, () => ({
    generatePDF: async () => {
      if (!printRef.current || isExporting) return;
      setIsExporting(true);
      
      const loadingToastId = toast.loading("PREPARING SCRAPBOOK... 📜", {
        style: { borderRadius: '8px', background: '#FDFBF7', color: '#3E2723', border: '1px solid #D4B895', fontFamily: "'Courier Prime', monospace", fontSize: 14, boxShadow: '2px 4px 12px rgba(0,0,0,0.08)' },
      });
      
      const prevPosition = printRef.current.style.position;
      const prevLeft = printRef.current.style.left;
      printRef.current.style.position = 'absolute';
      printRef.current.style.left = '0px';
      printRef.current.style.opacity = '0.01';

      try {
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        const element = printRef.current;
        const pages = element.querySelectorAll('.pdf-page');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i];
          await waitForImages(pageEl);
          
          const canvas = await html2canvas(pageEl, {
            scale: 2, useCORS: true, logging: false, backgroundColor: '#FDFBF7', 
            width: 794, height: 1123, windowWidth: 794, windowHeight: 1123, allowTaint: true,
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }
        pdf.save(`${circleName ? circleName.replace(/\s+/g, '_') : 'Family'}_Scrapbook.pdf`);
        toast.success("SCRAPBOOK READY! 🕊️", { id: loadingToastId });
        
      } catch (err) {
        console.error('PDF generation failed:', err);
        toast.error("BINDING FAILED! ⚠️", { id: loadingToastId });
      } finally {
        if (printRef.current) {
          printRef.current.style.position = prevPosition;
          printRef.current.style.left = prevLeft;
          printRef.current.style.opacity = '1';
        }
        setIsExporting(false);
      }
    },
  }));

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const serifFont = "'Playfair Display', serif";
  const typewriterFont = "'Courier Prime', monospace";
  const cursiveFont = "'Caveat', cursive";

  const pageBase = {
    width: 794, height: 1123,
    backgroundColor: '#FDFBF7', 
    color: '#3E2723', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
    border: '1px solid #EEDEC1'
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: '-20000px', zIndex: -9999 }}>
      <div ref={printRef}>

        {/* ══════════════════════════════════════════════
            PAGE 1 — COVER (VINTAGE)
        ══════════════════════════════════════════════ */}
        <div className="pdf-page" style={pageBase}>
          <div style={{ position: 'absolute', inset: 40, border: '2px solid #D4B895', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' }}>
            
            <div style={{ position: 'absolute', top: 60, borderBottom: '1px solid #D4B895', paddingBottom: 10, width: '50%', margin: '0 auto', fontSize: 14, fontFamily: typewriterFont, letterSpacing: 2, color: '#8C7B6B', textTransform: 'uppercase' }}>
              The Official Archive of
            </div>

            <div style={{ fontSize: 72, color: '#3E2723', fontFamily: serifFont, lineHeight: 1.2, marginTop: 100, marginBottom: 20, fontWeight: 400 }}>
              {circleName || 'Our Family'}
            </div>
            
            <div style={{ fontSize: 48, color: '#C89B3C', fontFamily: cursiveFont, lineHeight: 1, marginBottom: 80, fontWeight: 400 }}>
              Memory Scrapbook
            </div>

            <div style={{ width: 120, height: 120, borderRadius: '50%', border: '1px solid #D4B895', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, marginBottom: 40, background: '#FFF' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed #3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/finall_logo.png" alt="Logo" crossOrigin="anonymous" style={{ width: '80%', height: '80%', objectFit: 'contain', filter: 'sepia(0.8) opacity(0.8)' }} />
              </div>
            </div>

            <div style={{ marginTop: 'auto', color: '#8C7B6B', fontFamily: typewriterFont, fontSize: 14 }}>
              Compiled on {today}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CHAPTER PAGES
        ══════════════════════════════════════════════ */}
        {milestones.map((node, index) => {
          const dateObj   = new Date(node.milestoneDate);
          const fullDate  = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const hasImage  = node.mediaUrl && (node.mediaType === 'photo' || node.mediaType === 'image');
          const addedBy   = node.user?.name || 'A Family Member';

          return (
            <div key={node._id} className="pdf-page" style={pageBase}>
              <div style={{ position: 'absolute', inset: 40, padding: 40, display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #EEDEC1', paddingBottom: 20, marginBottom: 40 }}>
                  <div style={{ fontSize: 14, fontFamily: typewriterFont, color: '#8C7B6B', letterSpacing: 1 }}>
                    Entry No. {index + 1}
                  </div>
                  <div style={{ fontSize: 20, fontFamily: cursiveFont, color: '#3E2723' }}>
                    {fullDate}
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 36, fontFamily: serifFont, color: '#3E2723', lineHeight: 1.2, fontWeight: 700 }}>
                    {node.title}
                  </div>
                </div>

                {/* Image (Polaroid Style) */}
                {hasImage && (
                  <div style={{ margin: '0 auto 40px', background: '#FFF', padding: '16px 16px 40px 16px', boxShadow: '2px 4px 12px rgba(0,0,0,0.08)', transform: 'rotate(-1deg)', width: '80%' }}>
                    <img src={node.mediaUrl} alt={node.title} crossOrigin="anonymous" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'cover', display: 'block', filter: 'sepia(0.2) contrast(1.1)' }} />
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, padding: 24, position: 'relative' }}>
                  <p style={{ fontSize: 24, lineHeight: 1.8, color: '#3E2723', fontFamily: cursiveFont, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {node.content}
                  </p>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'right', borderTop: '1px solid #EEDEC1' }}>
                  <div style={{ fontSize: 14, fontFamily: typewriterFont, color: '#8C7B6B' }}>
                    Penned by {addedBy}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default LegacyBookExporter;
