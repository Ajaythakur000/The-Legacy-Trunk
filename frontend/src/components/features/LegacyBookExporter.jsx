import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const LegacyBookExporter = forwardRef(({ milestones, circleName }, ref) => {
  const printRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  // 🔥 GOLDEN RULE 3: Image Preloading Tracker
  const waitForImages = async (element) => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve error to prevent hanging
      });
    });
    await Promise.all(promises);
  };

  useImperativeHandle(ref, () => ({
    generatePDF: async () => {
      if (!printRef.current || isExporting) return;
      setIsExporting(true);

      const toast = window.alert("Binding your Memories... Please wait a few seconds. 📖✨");

      try {
        const element = printRef.current;
        
        const pages = element.querySelectorAll('.pdf-page');
        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i];
          
          // Ensure images inside this page are fully loaded before capturing
          await waitForImages(pageEl);
          
          // 🔥 GOLDEN RULE 4: Explicit Dimensions for html2canvas
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true, 
            logging: false,
            backgroundColor: '#111827', // Matching dark theme bg
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          if (i > 0) pdf.addPage(); 
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }

        pdf.save(`${circleName ? circleName.replace(/\s+/g, '_') : 'Family'}_Legacy_Book.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Oops! Failed to generate the Legacy Book. Try again.");
      } finally {
        setIsExporting(false);
      }
    }
  }));

  // ==========================================
  // 📖 THE ROYAL EDITION LAYOUT (Hidden)
  // ==========================================
  return (
    // 🔥 GOLDEN RULE 1: Off-screen Rendering instead of display:none or height: 0
    <div style={{ position: 'fixed', top: 0, left: '-20000px', zIndex: -9999 }}>
      <div ref={printRef}>
        
        <div className="pdf-page" style={{ 
          width: '794px', height: '1123px', backgroundColor: '#020617', color: '#f8fafc', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
          padding: '40px', boxSizing: 'border-box', border: '15px solid #0f172a' 
        }}>
            <div style={{ 
              border: '2px solid rgba(212, 175, 55, 0.5)', 
              padding: '100px 60px', textAlign: 'center', 
              width: '85%', height: '85%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }}>
              <div style={{ fontSize: '70px', marginBottom: '30px' }}>🛡️</div>
              <h1 style={{ fontSize: '58px', fontWeight: '900', fontFamily: 'Georgia, serif', margin: '0 0 20px 0', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '6px' }}>
                The Legacy Book
              </h1>
              <h3 style={{ fontSize: '26px', color: '#94a3b8', fontStyle: 'italic', margin: '0 0 60px 0', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
                {circleName ? `The Chronicles of ${circleName}` : "Our Family Chronicles"}
              </h3>
              {/* Used solid color instead of gradient just to be safe */}
              <div style={{ width: '80px', height: '2px', backgroundColor: '#d4af37', margin: '0 auto 60px auto' }}></div>
              <p style={{ fontSize: '16px', color: '#64748b', fontFamily: 'system-ui, sans-serif', letterSpacing: '3px', textTransform: 'uppercase' }}>
                Created On<br/><br/>
                <strong style={{ color: '#e2e8f0', fontSize: '20px', letterSpacing: '1px' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </strong>
              </p>
            </div>
        </div>

        {/* 📄 PAGE 2 Onwards: THE DARK "LEGACY VAULT" LAYOUT */}
        {milestones.map((node, index) => {
          const dateObj = new Date(node.milestoneDate);
          const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

          const firstLetter = node.content ? node.content.charAt(0) : '';
          const restOfContent = node.content ? node.content.slice(1) : '';

          return (
            <div key={node._id} className="pdf-page" style={{ 
              width: '794px', height: '1123px', 
              backgroundColor: '#111827', 
              color: '#e2e8f0', 
              padding: '40px', boxSizing: 'border-box', position: 'relative' 
            }}>
              
              <div style={{ position: 'absolute', top: '30px', left: '30px', width: '40px', height: '40px', borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37', opacity: 0.6 }}></div>
              <div style={{ position: 'absolute', top: '30px', right: '30px', width: '40px', height: '40px', borderTop: '2px solid #d4af37', borderRight: '2px solid #d4af37', opacity: 0.6 }}></div>
              <div style={{ position: 'absolute', bottom: '30px', left: '30px', width: '40px', height: '40px', borderBottom: '2px solid #d4af37', borderLeft: '2px solid #d4af37', opacity: 0.6 }}></div>
              <div style={{ position: 'absolute', bottom: '30px', right: '30px', width: '40px', height: '40px', borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37', opacity: 0.6 }}></div>

              <div style={{
                border: '1px solid rgba(212, 175, 55, 0.15)', 
                backgroundColor: 'transparent',
                width: '100%', height: '100%',
                padding: '50px 60px', boxSizing: 'border-box', position: 'relative',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)' 
              }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                  <div style={{ fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>
                    Chapter {index + 1}
                  </div>
                  {/* 🔥 GOLDEN RULE 2: No linear-gradient on 1px elements! Changed to solid backgroundColor with opacity */}
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(212, 175, 55, 0.3)', margin: '0 20px' }}></div>
                  <div style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '500', fontFamily: 'system-ui, sans-serif' }}>
                    {formattedDate}
                  </div>
                </div>

                <h2 style={{ fontSize: '42px', fontFamily: 'Georgia, serif', color: '#ffffff', margin: '0 0 40px 0', lineHeight: '1.3', textAlign: 'center', fontWeight: 'normal' }}>
                  {node.title}
                </h2>

                {node.mediaUrl && (node.mediaType === 'photo' || node.mediaType === 'image') && (
                  <div style={{ 
                    width: '100%', height: '360px', marginBottom: '45px', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '12px', background: '#0f172a', 
                    border: '1px solid rgba(212, 175, 55, 0.4)', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)' 
                  }}>
                    <img src={node.mediaUrl} alt={node.title} style={{ 
                      maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', 
                      border: '4px solid #faf9f6', 
                      boxShadow: '0 0 10px rgba(0,0,0,0.3)' 
                    }} crossOrigin="anonymous" />
                  </div>
                )}

                <div style={{ flex: 1, position: 'relative' }}>
                  <p style={{ 
                    fontSize: '20px', lineHeight: '2.2', color: '#e2e8f0', 
                    fontFamily: 'Georgia, serif', textAlign: 'justify', margin: 0,
                    whiteSpace: 'pre-wrap'
                  }}>
                    <span style={{
                      float: 'left',
                      fontSize: '65px',
                      lineHeight: '50px',
                      paddingTop: '8px',
                      paddingRight: '12px',
                      color: '#d4af37',
                      fontFamily: 'Georgia, serif',
                    }}>
                      {firstLetter}
                    </span>
                    {restOfContent}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '30px' }}>
                  {/* 🔥 GOLDEN RULE 2: Replaced gradient with solid color */}
                  <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.3)', margin: '0 auto 20px auto' }}></div>
                  <span style={{ fontSize: '16px', color: '#94a3b8', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                    — Added by {node.user?.name || 'A Family Member'} —
                  </span>
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