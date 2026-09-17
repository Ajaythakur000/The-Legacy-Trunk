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
      
      const loadingToastId = toast.loading("PRINTING THE COMIC BOOK! 🖨️", {
        style: { borderRadius: '12px', background: '#C89B3C', color: '#3E2723', border: 'none', fontFamily: "'Playfair Display', serif", fontSize: 16, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' },
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
        pdf.save(`${circleName ? circleName.replace(/\s+/g, '_') : 'Family'}_Comic_Book.pdf`);
        toast.success("COMIC PRINTED! 💥", { id: loadingToastId });
        
      } catch (err) {
        console.error('PDF generation failed:', err);
        toast.error("PRINTER JAMMED! ⚠️", { id: loadingToastId });
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
  const popFont = "Impact, 'Arial Black', sans-serif";
  const bodyFont = "Arial, sans-serif";

  const pageBase = {
    width: 794, height: 1123,
    backgroundColor: '#D4B895', 
    backgroundImage: 'none',
    backgroundSize: '30px 30px',
    color: '#3E2723', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: '-20000px', zIndex: -9999 }}>
      <div ref={printRef}>

        {/* ══════════════════════════════════════════════
            PAGE 1 — COVER (POP ART)
        ══════════════════════════════════════════════ */}
        <div className="pdf-page" style={pageBase}>
          <div style={{ position: 'absolute', inset: 40, background: '#FFF', border: '12px solid #3E2723', borderRadius: 24, boxShadow: '24px 24px 15px 0px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' }}>
            
            <div style={{ position: 'absolute', top: -40, left: -40, background: '#C89B3C', color: '#3E2723', border: '8px solid #3E2723', borderRadius: '50%', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: popFont, fontSize: 36, transform: 'rotate(-15deg)', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)', zIndex: 10 }}>
              VOL. 1
            </div>

            <div style={{ fontSize: 24, fontFamily: popFont, color: #FDFBF7, borderBottom: '6px solid #3E2723', paddingBottom: 10, marginBottom: 40, width: '100%', textTransform: 'uppercase' }}>
              THE OFFICIAL ARCHIVE OF
            </div>

            <div style={{ fontSize: 90, color: #FDFBF7, fontFamily: popFont, lineHeight: 1, marginBottom: 20, textTransform: 'uppercase' }}>
              {circleName || 'OUR FAMILY'}
            </div>
            
            <div style={{ fontSize: 60, color: '#C89B3C', fontFamily: popFont, lineHeight: 1, marginBottom: 80, textTransform: 'uppercase' }}>
              COMIC BOOK
            </div>

            <div style={{ marginTop: 'auto', background: '#3E2723', color: '#FFF', padding: '16px 32px', borderRadius: 16, fontFamily: popFont, fontSize: 24 }}>
              PRINTED ON: {today}
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
              <div style={{ position: 'absolute', inset: 40, background: '#FFF', border: '8px solid #3E2723', borderRadius: 24, boxShadow: '20px 20px 15px 0px rgba(0,0,0,0.45)', padding: 40, display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '6px solid #3E2723', paddingBottom: 20, marginBottom: 40 }}>
                  <div style={{ fontSize: 32, fontFamily: popFont, color: #FDFBF7 }}>
                    PANEL #{index + 1}
                  </div>
                  <div style={{ fontSize: 20, fontFamily: popFont, color: '#3E2723', background: '#D4B895', padding: '8px 16px', border: 'none', borderRadius: 12 }}>
                    {fullDate}
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 60, fontFamily: popFont, color: #FDFBF7, lineHeight: 1.1, textTransform: 'uppercase' }}>
                    {node.title}
                  </div>
                </div>

                {/* Image */}
                {hasImage && (
                  <div style={{ margin: '0 auto 40px', background: '#1E352F', padding: 16, border: '6px solid #3E2723', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)', transform: 'rotate(-2deg)' }}>
                    <img src={node.mediaUrl} alt={node.title} crossOrigin="anonymous" style={{ maxWidth: 600, maxHeight: 400, objectFit: 'cover', display: 'block', border: 'none' }} />
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, background: '#F5F5F5', border: '4px dashed #3E2723', borderRadius: 16, padding: 24, position: 'relative' }}>
                  <p style={{ fontSize: 24, lineHeight: 1.6, color: '#3E2723', fontFamily: bodyFont, fontWeight: 700, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {node.content}
                  </p>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontFamily: popFont, color: '#FFF', background: '#3E2723', display: 'inline-block', padding: '10px 24px', borderRadius: 12 }}>
                    CAPTURED BY: {addedBy}
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