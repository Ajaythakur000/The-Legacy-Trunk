import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const LegacyBookExporter = forwardRef(({ milestones, circleName }, ref) => {
  const printRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  useImperativeHandle(ref, () => ({
    generatePDF: async () => {
      if (!printRef.current || isExporting) return;
      setIsExporting(true);

      const toast = window.alert("Binding your Memories... Please wait a few seconds. 📖✨");

      try {
        const element = printRef.current;
        element.style.display = 'block'; 

        const pages = element.querySelectorAll('.pdf-page');
        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i];
          
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true, 
            logging: false,
           
            backgroundColor: '#000000'
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          if (i > 0) pdf.addPage(); 
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }

        pdf.save(`${circleName || 'Family'}_Legacy_Book.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Oops! Failed to generate the Legacy Book. Try again.");
      } finally {
        printRef.current.style.display = 'none'; 
        setIsExporting(false);
      }
    }
  }));

  // ==========================================
  // 📖 THE ROYAL EDITION LAYOUT (Hidden)
  // ==========================================
  return (
    <div style={{ overflow: 'hidden', height: 0 }}>
      <div ref={printRef} style={{ display: 'none', position: 'absolute', left: '-9999px', top: 0 }}>
        
       
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
              <div style={{ width: '80px', height: '2px', background: '#d4af37', margin: '0 auto 60px auto' }}></div>
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
              
              {/* Glowing Corner Ornaments */}
              <div style={{ position: 'absolute', top: '30px', left: '30px', width: '40px', height: '40px', borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37', opacity: 0.6 }}></div>
              <div style={{ position: 'absolute', top: '30px', right: '30px', width: '40px', height: '40px', borderTop: '2px solid #d4af37', borderRight: '2px solid #d4af37', opacity: 0.6 }}></div>
              <div style={{ position: 'absolute', bottom: '30px', left: '30px', width: '40px', height: '40px', borderBottom: '2px solid #d4af37', borderLeft: '2px solid #d4af37', opacity: 0.6 }}></div>
              <div style={{ position: 'absolute', bottom: '30px', right: '30px', width: '40px', height: '40px', borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37', opacity: 0.6 }}></div>

              {/* The Inner "Book Page" Frame */}
              <div style={{
                border: '1px solid rgba(212, 175, 55, 0.15)', // NEW: Very subtle gold border against dark bg
                backgroundColor: 'transparent',
                width: '100%', height: '100%',
                padding: '50px 60px', boxSizing: 'border-box', position: 'relative',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)' // NEW: Darker inner shadow
              }}>
                
                {/* 📰 Elegant Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                  <div style={{ fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37' /* NEW: Glowing gold chapter number */, fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>
                    Chapter {index + 1}
                  </div>
                  {/* Glowing Gold Divider */}
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)', margin: '0 20px' }}></div>
                  <div style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8' /* NEW: Adjusted Date color */, fontWeight: '500', fontFamily: 'system-ui, sans-serif' }}>
                    {formattedDate}
                  </div>
                </div>

                {/* 🏆 Refined Elegant Title */}
                <h2 style={{ fontSize: '42px', fontFamily: 'Georgia, serif', color: '#ffffff' /* NEW: Title in bright white to pop */, margin: '0 0 40px 0', lineHeight: '1.3', textAlign: 'center', fontWeight: 'normal' }}>
                  {node.title}
                </h2>

                {/* 🖼️ Premium Image Frame (Museum Vault Style) */}
                {node.mediaUrl && (node.mediaType === 'photo' || node.mediaType === 'image') && (
                  <div style={{ 
                    width: '100%', height: '360px', marginBottom: '45px', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '12px', background: '#0f172a' /* NEW: Deep Navy Matting Area */, 
                    border: '1px solid rgba(212, 175, 55, 0.4)' /* NEW: Thin Gold Leaf Frame */, 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)' /* NEW: Adjusted shadow */
                  }}>
                    <img src={node.mediaUrl} alt={node.title} style={{ 
                      maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', 
                      border: '4px solid #faf9f6' /* NEW: Keep a cream inner mount edge for classic photo feel */, 
                      boxShadow: '0 0 10px rgba(0,0,0,0.3)' /* NEW: Deeper shadow */ 
                    }} crossOrigin="anonymous" />
                  </div>
                )}

                {/* ✍️ Elevated Story Text with Golden Drop Cap */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <p style={{ 
                    fontSize: '20px', lineHeight: '2.2', color: '#e2e8f0' /* NEW: Main text color adjusted */, 
                    fontFamily: 'Georgia, serif', textAlign: 'justify', margin: 0,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {/* The massive first letter (Golden Drop Cap) */}
                    <span style={{
                      float: 'left',
                      fontSize: '65px',
                      lineHeight: '50px',
                      paddingTop: '8px',
                      paddingRight: '12px',
                      color: '#d4af37' /* NEW: Glowing Gold Drop Cap */,
                      fontFamily: 'Georgia, serif',
                    }}>
                      {firstLetter}
                    </span>
                    {restOfContent}
                  </p>
                </div>

                {/* 🦶 Signature Footer */}
                <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '30px' }}>
                  {/* Fading Slate Divider */}
                  <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent)', margin: '0 auto 20px auto' }}></div>
                  <span style={{ fontSize: '16px', color: '#94a3b8' /* NEW: Footer text color adjusted */, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
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