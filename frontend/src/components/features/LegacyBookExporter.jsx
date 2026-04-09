import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast'; // 🔥 Added react-hot-toast import

const LegacyBookExporter = forwardRef(({ milestones, circleName }, ref) => {
  const printRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  // Fallback utility for images
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
      
      // 🔥 Replaced window.alert with toast.loading
      const loadingToastId = toast.loading("Binding your Legacy Book... ✦");
      
      // Temporary fix: Temporarily make the element visible to the DOM engine
      // but hidden from the user by placing it at the very bottom
      const prevPosition = printRef.current.style.position;
      const prevLeft = printRef.current.style.left;
      
      printRef.current.style.position = 'absolute';
      printRef.current.style.left = '0px';
      printRef.current.style.opacity = '0.01'; // Barely visible to the engine, not to the eye

      try {
        // Give DOM a tick to calculate dimensions
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        const element = printRef.current;
        const pages = element.querySelectorAll('.pdf-page');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i];
          await waitForImages(pageEl);
          
          // CRITICAL FIX: Add simple html2canvas options
          const canvas = await html2canvas(pageEl, {
            scale: 2, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#04060e', 
            width: 794, 
            height: 1123,
            windowWidth: 794, 
            windowHeight: 1123,
            allowTaint: true,
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }
        pdf.save(`${circleName ? circleName.replace(/\s+/g, '_') : 'Family'}_Legacy_Book.pdf`);
        
        // 🔥 Show success message when done
        toast.success("Legacy Book bound successfully! 📜", { id: loadingToastId });
        
      } catch (err) {
        console.error('PDF generation failed:', err);
        // 🔥 Show error message if it fails
        toast.error("Failed to bind Legacy Book. The Oracle encountered a glitch. ⚠️", { id: loadingToastId });
      } finally {
        // Restore hidden state
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

  // ─────────────────────────────────────────────────────────────────
  // SAFE DESIGN TOKENS
  // ─────────────────────────────────────────────────────────────────
  const BG_DEEP    = '#04060e'; 
  const GOLD       = '#d4a843';
  const GOLD_DIM   = 'rgba(212,168,67,0.45)'; 
  const GOLD_FAINT = 'rgba(212,168,67,0.12)';
  const WHITE_88   = 'rgba(255,255,255,0.88)';
  const WHITE_55   = 'rgba(255,255,255,0.55)';
  const WHITE_28   = 'rgba(255,255,255,0.28)';

  // ─────────────────────────────────────────────────────────────────
  // HELPER COMPONENTS (Simplified for HTML2Canvas)
  // ─────────────────────────────────────────────────────────────────
  const GoldRule = ({ my = 0, opacity = 0.3 }) => (
    <div style={{ width: '100%', height: 1, backgroundColor: GOLD, opacity: opacity, margin: `${my}px 0` }} />
  );

  const DoubleRule = ({ my = 0 }) => (
    <div style={{ margin: `${my}px 0` }}>
      <div style={{ width: '100%', height: 1, backgroundColor: GOLD, opacity: 0.6 }} />
      <div style={{ width: '100%', height: 3 }} />
      <div style={{ width: '100%', height: 1, backgroundColor: GOLD, opacity: 0.3 }} />
    </div>
  );

  const Corners = ({ size = 44, thickness = 2, op = 0.65 }) => {
    const s = { position: 'absolute', width: size, height: size, borderColor: GOLD, opacity: op, borderStyle: 'solid' };
    return (
      <>
        <div style={{ ...s, top: 28, left: 28, borderWidth: `${thickness}px 0 0 ${thickness}px`, borderRadius: '6px 0 0 0' }} />
        <div style={{ ...s, top: 28, right: 28, borderWidth: `${thickness}px ${thickness}px 0 0`, borderRadius: '0 6px 0 0' }} />
        <div style={{ ...s, bottom: 28, left: 28, borderWidth: `0 0 ${thickness}px ${thickness}px`, borderRadius: '0 0 0 6px' }} />
        <div style={{ ...s, bottom: 28, right: 28, borderWidth: `0 ${thickness}px ${thickness}px 0`, borderRadius: '0 0 6px 0' }} />
      </>
    );
  };

  const DiamondRow = ({ count = 5, color = GOLD_DIM }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      {Array.from({ length: count }, (_, i) => {
        const isCenter = i === Math.floor(count / 2);
        return (
          <div key={i} style={{ 
            width: isCenter ? 10 : 6, 
            height: isCenter ? 10 : 6, 
            backgroundColor: GOLD, // Used solid gold to avoid color rendering issues
            transform: 'rotate(45deg)', 
            opacity: isCenter ? 1 : 0.6,
          }} />
        );
      })}
    </div>
  );

  const toRoman = (n) => {
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let result = '';
    vals.forEach((v, i) => { while (n >= v) { result += syms[i]; n -= v; } });
    return result;
  };

  // Safe Starfield 
  const StarDots = ({ count = 60 }) => {
    const dots = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (((i * 137.508) % 794)).toFixed(1),
      y: (((i * 197.311) % 1123)).toFixed(1),
      r: i % 5 === 0 ? 1.5 : i % 3 === 0 ? 1.0 : 0.5,
      op: i % 5 === 0 ? 0.6 : i % 3 === 0 ? 0.4 : 0.2,
    }));
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {dots.map(d => (
          // Removed boxShadow as it causes rendering loops in html2canvas sometimes
          <div key={d.id} style={{ position: 'absolute', left: d.x + 'px', top: d.y + 'px', width: d.r * 2, height: d.r * 2, borderRadius: '50%', backgroundColor: GOLD, opacity: d.op }} />
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // PAGE STYLES
  // ═══════════════════════════════════════════════════════════
  const pageBase = {
    width: 794, height: 1123,
    backgroundColor: BG_DEEP, 
    color: WHITE_88,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: 'Georgia, "Times New Roman", serif',
  };

  return (
    // Moved print container out of fixed -20000px offscreen. Will manage hiding programmatically.
    <div style={{ position: 'fixed', top: 0, left: '-20000px', zIndex: -9999 }}>
      <div ref={printRef}>

        {/* ══════════════════════════════════════════════
            PAGE 1 — COVER
        ══════════════════════════════════════════════ */}
        <div className="pdf-page" style={pageBase}>
          <StarDots count={100} />

          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: `2px solid ${GOLD}`, opacity: 0.3, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, border: `1px solid ${GOLD}`, opacity: 0.1, pointerEvents: 'none' }} />

          <Corners size={64} thickness={2} op={0.8} />

          <div style={{ position: 'absolute', top: 44, left: 44, right: 44, bottom: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px' }}>

            <div style={{ width: '100%', textAlign: 'center' }}>
              <DiamondRow count={9} />
              <div style={{ height: 24 }} />
              <div style={{ fontSize: 12, letterSpacing: 8, textTransform: 'uppercase', color: GOLD, opacity: 0.7, fontFamily: 'Georgia, serif', marginBottom: 16 }}>
                THE FAMILY CHRONICLES
              </div>
              <GoldRule opacity={0.4} />
            </div>

            <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              
              <div style={{ width: 130, height: 130, marginBottom: 40, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, border: `2px solid ${GOLD}`, opacity: 0.5, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 10, border: `1px dashed ${GOLD}`, opacity: 0.3, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 16, backgroundColor: GOLD, opacity: 0.08, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '50%', left: 16, right: 16, height: 1, backgroundColor: GOLD, opacity: 0.3, transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 16, bottom: 16, width: 1, backgroundColor: GOLD, opacity: 0.3, transform: 'translateX(-50%)' }} />
                <div style={{ width: 24, height: 24, backgroundColor: GOLD, transform: 'rotate(45deg)', zIndex: 1 }} />
              </div>

              <div style={{ fontSize: 12, letterSpacing: 10, textTransform: 'uppercase', color: GOLD, opacity: 0.7, marginBottom: 20, fontFamily: 'Georgia, serif' }}>
                EST. {new Date().getFullYear()}
              </div>

              <div style={{ fontSize: 70, fontWeight: 900, color: GOLD, letterSpacing: 6, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 5 }}>
                The Legacy
              </div>
              <div style={{ fontSize: 60, fontWeight: 900, color: WHITE_88, letterSpacing: 8, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 40 }}>
                Book
              </div>

              <DoubleRule my={0} />
              <div style={{ height: 28 }} />

              <div style={{ fontSize: 26, fontStyle: 'italic', color: WHITE_55, letterSpacing: 3, lineHeight: 1.6, textAlign: 'center', padding: '0 40px' }}>
                {circleName ? `The Chronicles of the ${circleName} Family` : 'Our Family Chronicles'}
              </div>

              <div style={{ height: 30 }} />
              <GoldRule opacity={0.3} />
              <div style={{ height: 20 }} />
              <DiamondRow count={5} />
            </div>

            <div style={{ width: '100%', textAlign: 'center' }}>
              <GoldRule opacity={0.2} />
              <div style={{ height: 20 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, opacity: 0.5, marginBottom: 6 }}>Compiled on</div>
                  <div style={{ fontSize: 14, color: WHITE_88, letterSpacing: 1 }}>{today}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DiamondRow count={3} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, opacity: 0.5, marginBottom: 6 }}>Memories</div>
                  <div style={{ fontSize: 14, color: WHITE_88, letterSpacing: 1 }}>{milestones.length} Chapters</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════
            PAGE 2 — TABLE OF CONTENTS
        ══════════════════════════════════════════════ */}
        <div className="pdf-page" style={pageBase}>
          <StarDots count={60} />
          
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: `1px solid ${GOLD}`, opacity: 0.15 }} />
          <Corners size={50} thickness={1.5} op={0.6} />

          <div style={{ position: 'absolute', top: 44, left: 70, right: 70, bottom: 44, display: 'flex', flexDirection: 'column' }}>

            <div style={{ textAlign: 'center', marginBottom: 50, paddingTop: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: 8, textTransform: 'uppercase', color: GOLD, opacity: 0.6, marginBottom: 16 }}>Archive</div>
              <div style={{ fontSize: 44, fontWeight: 700, color: GOLD, letterSpacing: 4, marginBottom: 10 }}>Table of Contents</div>
              <DoubleRule my={20} />
              <DiamondRow count={5} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {milestones.map((node, idx) => {
                const dateObj = new Date(node.milestoneDate);
                const yr = dateObj.getFullYear();
                const mon = dateObj.toLocaleDateString('en-US', { month: 'long' });
                return (
                  <div key={node._id}>
                    <div style={{ display: 'flex', alignItems: 'baseline', padding: '14px 0' }}>
                      <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: GOLD, opacity: 0.6, fontFamily: 'Georgia, serif', minWidth: 95 }}>
                        Ch. {toRoman(idx + 1)}
                      </div>
                      <div style={{ flex: 1, fontSize: 16, color: WHITE_88, fontStyle: 'italic', letterSpacing: 0.5, paddingRight: 10 }}>
                        {node.title}
                      </div>
                      <div style={{ flex: 1, borderBottom: `1px dotted ${GOLD}`, opacity: 0.3, margin: '0 15px', position: 'relative', top: '-6px' }} />
                      <div style={{ textAlign: 'right', minWidth: 85 }}>
                        <span style={{ fontSize: 11, letterSpacing: 2, color: GOLD, opacity: 0.8, textTransform: 'uppercase' }}>{mon} {yr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 'auto', paddingBottom: 30, textAlign: 'center' }}>
              <GoldRule opacity={0.2} my={24} />
              <DiamondRow count={3} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CHAPTER PAGES
        ══════════════════════════════════════════════ */}
        {milestones.map((node, index) => {
          const dateObj   = new Date(node.milestoneDate);
          const fullDate  = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const yearOnly  = dateObj.getFullYear();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
          const hasImage  = node.mediaUrl && (node.mediaType === 'photo' || node.mediaType === 'image');
          const firstLetter = node.content ? node.content.charAt(0) : '';
          const restContent = node.content ? node.content.slice(1) : '';
          const roman       = toRoman(index + 1);
          const addedBy     = node.user?.name || 'A Family Member';

          return (
            <div key={node._id} className="pdf-page" style={pageBase}>
              <StarDots count={50} />

              <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: `1px solid ${GOLD}`, opacity: 0.15 }} />
              <Corners size={50} thickness={1.5} op={0.6} />

              <div style={{ position: 'absolute', top: 40, left: 60, right: 60, bottom: 40, display: 'flex', flexDirection: 'column' }}>

                <div style={{ textAlign: 'center', paddingBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: GOLD, opacity: 0.5 }} />
                    <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: GOLD, opacity: 0.5 }}>
                      {circleName || 'The Legacy Book'}
                    </div>
                    <div style={{ flex: 1, height: 1, backgroundColor: GOLD, opacity: 0.5 }} />
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '10px 0 15px' }}>
                  <div style={{ fontSize: 14, letterSpacing: 6, textTransform: 'uppercase', color: GOLD, fontFamily: 'Georgia, serif', borderBottom: `1px solid ${GOLD}`, paddingBottom: 6 }}>
                    Chapter {roman}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '5px 20px 20px' }}>
                  <div style={{ fontSize: 38, fontWeight: 700, color: '#ffffff', lineHeight: 1.3, letterSpacing: 1.5 }}>
                    {node.title}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, paddingBottom: 25 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, opacity: 0.5, marginBottom: 4 }}>Date</div>
                    <div style={{ fontSize: 13, color: WHITE_88, letterSpacing: 1, fontStyle: 'italic' }}>{fullDate}</div>
                  </div>
                  <div style={{ width: 1, height: 30, backgroundColor: GOLD, opacity: 0.3 }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, opacity: 0.5, marginBottom: 4 }}>Chronicled by</div>
                    <div style={{ fontSize: 13, color: WHITE_88, letterSpacing: 1, fontStyle: 'italic' }}>{addedBy}</div>
                  </div>
                  {node.emotion && (
                    <>
                      <div style={{ width: 1, height: 30, backgroundColor: GOLD, opacity: 0.3 }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, opacity: 0.5, marginBottom: 4 }}>Mood</div>
                        <div style={{ fontSize: 14, color: WHITE_88 }}>{node.emotion}</div>
                      </div>
                    </>
                  )}
                </div>

                <DoubleRule my={0} />

                {hasImage && (
                  <div style={{ margin: '30px 0', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', padding: 12, border: `2px solid ${GOLD}`, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                      {[{ top: -4, left: -4 }, { top: -4, right: -4 }, { bottom: -4, left: -4 }, { bottom: -4, right: -4 }].map((pos, i) => (
                        <div key={i} style={{ position: 'absolute', width: 8, height: 8, backgroundColor: GOLD, ...pos }} />
                      ))}
                      <img
                        src={node.mediaUrl}
                        alt={node.title}
                        crossOrigin="anonymous"
                        style={{ maxWidth: 620, maxHeight: 320, objectFit: 'cover', display: 'block', border: `1px solid rgba(255,255,255,0.1)` }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ flex: 1, padding: hasImage ? '10px 10px 0' : '30px 10px 0', position: 'relative' }}>
                  <p style={{
                    fontSize: hasImage ? 17 : 19,
                    lineHeight: hasImage ? 2.0 : 2.2,
                    color: WHITE_88,
                    fontFamily: 'Georgia, serif',
                    textAlign: 'justify',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {firstLetter && (
                      <span style={{
                        float: 'left',
                        fontSize: hasImage ? 70 : 90,
                        lineHeight: hasImage ? '60px' : '75px',
                        paddingTop: 8,
                        paddingRight: 12,
                        color: GOLD,
                        fontFamily: 'Georgia, serif',
                        fontWeight: 900,
                      }}>
                        {firstLetter}
                      </span>
                    )}
                    {restContent}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', paddingBottom: 10 }}>
                  <GoldRule opacity={0.2} my={20} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                    <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD, opacity: 0.4, textTransform: 'uppercase' }}>
                      {monthName} · {yearOnly}
                    </div>
                    <DiamondRow count={3} />
                    <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD, opacity: 0.4, textTransform: 'uppercase' }}>
                      Page {index + 1} of {milestones.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ══════════════════════════════════════════════
            LAST PAGE — COLOPHON / CLOSING
        ══════════════════════════════════════════════ */}
        <div className="pdf-page" style={pageBase}>
          <StarDots count={80} />
          
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: `2px solid ${GOLD}`, opacity: 0.2 }} />
          <div style={{ position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, border: `1px solid ${GOLD}`, opacity: 0.1 }} />
          <Corners size={64} thickness={2} op={0.7} />

          <div style={{ position: 'absolute', top: 44, left: 60, right: 60, bottom: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: 80, paddingBottom: 60 }}>

            <div style={{ textAlign: 'center' }}>
              <DiamondRow count={9} />
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

              <div style={{ width: 110, height: 110, marginBottom: 50, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, border: `1px solid ${GOLD}`, opacity: 0.5, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 12, border: `1px dashed ${GOLD}`, opacity: 0.2, borderRadius: '50%' }} />
                <div style={{ width: 18, height: 18, backgroundColor: GOLD, transform: 'rotate(45deg)' }} />
              </div>

              <div style={{ fontSize: 11, letterSpacing: 8, textTransform: 'uppercase', color: GOLD, opacity: 0.6, marginBottom: 25 }}>Finis Coronat Opus</div>

              <div style={{ fontSize: 50, fontWeight: 700, color: GOLD, letterSpacing: 3, marginBottom: 10, lineHeight: 1.1 }}>
                The End
              </div>
              <div style={{ fontSize: 18, fontStyle: 'italic', color: WHITE_28, letterSpacing: 3, marginBottom: 45, lineHeight: 1.6 }}>
                "The finish crowns the work."
              </div>

              <DoubleRule my={0} />
              <div style={{ height: 35 }} />

              <div style={{ fontSize: 17, fontStyle: 'italic', color: WHITE_55, letterSpacing: 1.5, lineHeight: 1.9, maxWidth: 500, textAlign: 'center' }}>
                Every story in these pages is a thread in the fabric of your family. May this book outlive us all, and may the memories within it grow more precious with every passing year.
              </div>

              <div style={{ height: 45 }} />
              <DiamondRow count={5} />
              <div style={{ height: 35 }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: GOLD, opacity: 0.5, marginBottom: 8 }}>
                  Preserved by
                </div>
                <div style={{ fontSize: 22, color: GOLD, letterSpacing: 3, fontStyle: 'italic' }}>
                  {circleName || 'Your Family'}
                </div>
                <div style={{ fontSize: 12, color: WHITE_28, letterSpacing: 2, marginTop: 4 }}>{today}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '100%' }}>
              <GoldRule opacity={0.2} my={0} />
              <div style={{ height: 18 }} />
              <DiamondRow count={7} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default LegacyBookExporter;