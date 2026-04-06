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
      
      const loadingToast = toast.loading("Archiving your memory... 📥", {
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
      });

      try {
        const element = printRef.current;
        
        // Temporarily display block to capture (it remains off-screen due to negative left)
        element.style.display = 'flex'; 

        const canvas = await html2canvas(element, {
          scale: 2, // High resolution for premium look
          useCORS: true, 
          logging: false,
          backgroundColor: '#111827' // Deep Navy Vault background
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const a = document.createElement('a');
        a.href = imgData;
        // Clean filename removing spaces
        a.download = `Vault_${story?.title?.replace(/\s+/g, '_') || 'Memory'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success("Memory archived successfully! ✨", { id: loadingToast });
      } catch (err) {
        console.error("Image generation failed:", err);
        toast.error("Oops! Failed to archive memory.", { id: loadingToast });
      } finally {
        element.style.display = 'none'; // Hide it again
        setIsExporting(false);
      }
    }
  }));

  // Safely extract media and dates
  const imageUrl = story?.mediaUrls?.length > 0 ? story.mediaUrls[0] : story?.mediaUrl;
  const dateObj = new Date(story?.createdAt || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const firstLetter = story?.content ? story.content.charAt(0).toUpperCase() : '';
  const restOfContent = story?.content ? story.content.slice(1) : '';

  return (
    <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute' }}>
      {/* This is the hidden container. 
        Positioned way off screen so it doesn't mess up your feed layout.
      */}
      <div 
        ref={printRef} 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          left: '-9999px', 
          top: 0,
          width: '800px', // Fixed width for consistent poster size
          backgroundColor: '#111827', // Deep slate/navy
          color: '#e2e8f0', 
          flexDirection: 'column', 
          padding: '60px', 
          boxSizing: 'border-box',
          fontFamily: 'Georgia, serif'
        }}
      >
        {/* Elegant Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '20px' }}>
          <div style={{ fontSize: '18px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>
             Family Vault
          </div>
          <div style={{ fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
            {formattedDate}
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '48px', color: '#ffffff', margin: '0 0 40px 0', lineHeight: '1.2', textAlign: 'center', fontWeight: 'normal' }}>
          {story?.title || 'Untitled Memory'}
        </h1>

        {/* Image Frame (If image exists) */}
        {imageUrl && (story.mediaType === 'photo' || story.mediaType === 'image' || !story.mediaType) && (
          <div style={{ 
            width: '100%', 
            marginBottom: '40px', 
            padding: '16px', 
            background: '#0f172a', 
            border: '1px solid rgba(212, 175, 55, 0.5)', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src={imageUrl} 
              alt="Memory" 
              crossOrigin="anonymous" // Important for html2canvas to not taint canvas
              style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', border: '4px solid #faf9f6' }} 
            />
          </div>
        )}

        {/* Story Content with Drop Cap */}
        <div style={{ flex: 1, marginTop: '20px' }}>
          <p style={{ fontSize: '22px', lineHeight: '1.8', color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
            {firstLetter && (
              <span style={{
                float: 'left',
                fontSize: '75px',
                lineHeight: '60px',
                paddingTop: '8px',
                paddingRight: '12px',
                color: '#d4af37', // Gold drop cap
              }}>
                {firstLetter}
              </span>
            )}
            {restOfContent}
          </p>
        </div>

        {/* Signature Footer */}
        <div style={{ marginTop: '60px', textAlign: 'center', paddingTop: '30px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <span style={{ fontSize: '20px', color: '#94a3b8', fontStyle: 'italic' }}>
            — Cherished by {story?.user?.name || 'A Family Member'} —
          </span>
        </div>

      </div>
    </div>
  );
});

export default StoryExportTemplate;