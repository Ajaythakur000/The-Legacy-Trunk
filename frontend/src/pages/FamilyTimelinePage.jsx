/* eslint-disable react-hooks/purity */
import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer } from 'lucide-react';
import api from '../api/axios';
import LegacyBookExporter from '../components/features/LegacyBookExporter';

// ─── Logo Badge ────────────────────────────────────────────────────────────────
function LogoBadge({ size = 90 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#D4B895', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', overflow: 'hidden', /* removed spin */ }}>
        <div style={{ width: '120%', height: '120%', background: '#C89B3C', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
      </div>
      <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: '50%', background: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/finall_logo.png" alt="LT" style={{ width: '110%', height: '110%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#3E2723', fontFamily: "'Playfair Display', serif", fontSize: 26 }}>LT</div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── LOADING STATE ───────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#D4B895' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ display: 'inline-block', marginBottom: 10 }}>⏳</motion.div>
      <div>DUSTING OFF OLD ALBUMS...</div>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px', background: '#FDFBF7', borderRadius: 12, boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.45)', margin: '40px auto', maxWidth: 600 }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>📜</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#3E2723', margin: '0 0 10px' }}>
        THE PAGES ARE BLANK
      </h3>
      <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: '#3E2723', margin: 0 }}>
        Mark memories as "Family Milestone" to start building your scrapbook!
      </p>
    </div>
  );
}

// ─── SCATTERED POLAROID CARD ─────────────────────────────────────────────────
function PolaroidCard({ node, index }) {
  const isEven = index % 2 === 0;
  
  // Randomize rotation slightly for organic feel
  const tilt = useMemo(() => isEven ? -(Math.random() * 3 + 2) : (Math.random() * 3 + 2), [isEven]); 
  const align = isEven ? 'flex-start' : 'flex-end';
  
  const dateObj = new Date(node.milestoneDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

  const isOldStory = new Date() - dateObj > 1000 * 60 * 60 * 24 * 365;
  const vintageFilter = isOldStory ? 'sepia(0.6) contrast(1.1) brightness(0.9)' : 'sepia(0.2) contrast(1.05)';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, rotate: 0 }} 
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: align,
        width: '100%',
        maxWidth: '500px',
        margin: '0 20px 80px 20px',
        position: 'relative'
      }}
    >
      {/* Masking Tape */}
      <div style={{
        position: 'absolute',
        top: -15,
        left: '50%',
        transform: 'translateX(-50%) rotate(-2deg)',
        width: 140,
        height: 35,
        background: 'rgba(238, 225, 200, 0.85)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        zIndex: 10,
        opacity: 0.9,
        borderLeft: '2px dashed rgba(0,0,0,0.1)',
        borderRight: '2px dashed rgba(0,0,0,0.1)'
      }} />

      {/* The Polaroid Body */}
      <div style={{
        background: '#FDFBF7',
        padding: '16px 16px 40px 16px',
        boxShadow: '8px 12px 20px rgba(0,0,0,0.5)',
        borderRadius: '4px',
        position: 'relative',
        zIndex: 5
      }}>
        
        {/* Media */}
        {node.mediaUrl ? (
          <div style={{ 
            width: '100%', 
            height: '350px', 
            background: '#261914', 
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            {node.mediaType === 'video' ? (
              <video src={node.mediaUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', filter: vintageFilter }} />
            ) : (
              <img src={node.mediaUrl} alt={node.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: vintageFilter }} />
            )}
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            height: '150px', 
            background: '#D4B895', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3E2723',
            fontSize: '40px'
          }}>
            🖋️
          </div>
        )}

        {/* Text Content */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '28px', 
            color: '#1E352F', 
            margin: '0 0 8px 0',
            lineHeight: 1.1 
          }}>
            {node.title}
          </h3>
          
          <div style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '14px', 
            color: '#C89B3C',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '16px'
          }}>
            {formattedDate}
          </div>

          <p style={{ 
            fontFamily: "'Caveat', cursive", 
            fontSize: '24px', 
            color: '#3E2723', 
            margin: '0',
            lineHeight: 1.4,
            opacity: 0.9
          }}>
            {node.content}
          </p>
        </div>

        {/* Author Tag */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: 0.7
        }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {node.user?.avatar ? <img src={node.user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 10, color: '#FDFBF7' }}>{node.user?.name?.charAt(0)}</span>}
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#3E2723' }}>
            {node.user?.name?.split(' ')[0]}
          </span>
        </div>

      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function FamilyTimelinePage() {
  const { user }    = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const exporterRef = useRef();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!user?.activeCircleId) return;
      try {
        setLoading(true);
        const res = await api.get(`/timeline/${user.activeCircleId}`);
        setMilestones(res.data);
      } catch (error) {
        console.error('Failed to load Memory Lane', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [user?.activeCircleId]);

  if (!user) return null;

  const totalPages = Math.ceil(milestones.length / itemsPerPage);
  const currentMilestones = milestones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 140, position: 'relative' }}>
      
      {/* Background Texture (already in index.css, but we can ensure no comic graphics here) */}
      
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <LogoBadge size={100} />
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#FDFBF7', margin: '20px 0 10px', letterSpacing: 2 }}>
            MEMORY LANE
          </motion.h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 20, color: '#D4B895', margin: '0 auto' }}>
            The story of our family, captured in time.
          </p>
        </div>

        {/* Hidden PDF exporter */}
        <LegacyBookExporter ref={exporterRef} milestones={milestones} circleName="Our Family"/>

        {/* Timeline Container */}
        {loading ? (
          <LoadingState/>
        ) : milestones.length === 0 ? (
          <EmptyState/>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* The memories cascading down */}
            {currentMilestones.map((node, index) => (
              <PolaroidCard key={node._id} node={node} index={index} />
            ))}
            
            {/* ── VINTAGE PAGINATION ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 40, width: '100%', maxWidth: 500 }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ background: 'transparent', border: '1px solid rgba(253,251,247,0.2)', borderRadius: 2, padding: '8px 16px', color: currentPage === 1 ? 'rgba(253,251,247,0.3)' : '#FDFBF7', cursor: currentPage === 1 ? 'default' : 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', transition: 'all 0.2s' }}
                >
                   Previous
                </button>
                
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#D4B895', fontStyle: 'italic' }}>
                  Page {currentPage} of {totalPages}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ background: 'transparent', border: '1px solid rgba(253,251,247,0.2)', borderRadius: 2, padding: '8px 16px', color: currentPage === totalPages ? 'rgba(253,251,247,0.3)' : '#FDFBF7', cursor: currentPage === totalPages ? 'default' : 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', transition: 'all 0.2s' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB: Download Memories */}
      {milestones.length > 0 && (
        <motion.button
          onClick={() => exporterRef.current?.generatePDF()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed', bottom: 40, right: 40, zIndex: 9999,
            background: '#C89B3C', border: 'none', borderRadius: '50%',
            width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '4px 6px 15px rgba(0,0,0,0.5)',
            transition: 'box-shadow 0.2s', color: '#1E352F'
          }}
          title="Print Scrapbook"
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Printer size={28} strokeWidth={1.5} color="#3E2723" /></span>
        </motion.button>
      )}

    </div>
  );
}

export default FamilyTimelinePage;
