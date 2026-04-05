import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';
import LegacyBookExporter from '../components/features/LegacyBookExporter'; // (Make sure path is correct)

function FamilyTimelinePage() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 PDF Exporter Reference
  const exporterRef = useRef();

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!user?.activeCircleId) return;
      try {
        setLoading(true);
        const res = await api.get(`/timeline/${user.activeCircleId}`);
        setMilestones(res.data);
      } catch (error) {
        console.error("Failed to load Memory Lane", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [user?.activeCircleId]);

  if (!user) return null;

  // Har row ki fixed height taaki snake ki curve ekdum perfect flow kare
  const ROW_HEIGHT = 250; 

  // 🔥 Smooth Scroll Function
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="starry-bg" style={{ backgroundColor: '#020617', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', overflowX: 'hidden' }}>
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* 🎇 Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px', animation: 'fadeInDown 1s ease', position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '3.8rem', fontWeight: '900', margin: '0 0 10px 0', background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.3))' }}>
            Memory Lane
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '20px' }}>
            Hover over the magical nodes to unlock our legacy.
          </p>
        </div>

        {/* 🛠️ THE HIDDEN EXPORTER COMPONENT */}
        <LegacyBookExporter ref={exporterRef} milestones={milestones} circleName="Our Family" />
        
        {/* ⏳ Loading / Empty States */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8', padding: '50px', fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>
            Unlocking the family vault... 🕰️
          </div>
        ) : milestones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px dashed #334155', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ color: '#cbd5e1' }}>The Lane is Empty</h3>
            <p style={{ color: '#64748b' }}>Mark stories as "Family Milestone" to see them appear here.</p>
          </div>
        ) : (
          
          <div style={{ position: 'relative', padding: '20px 0' }} className="timeline-container">
            
            {/* 🐍 THE PERMANENT NEON SNAKE UI */}
            {milestones.map((node, index) => {
              const isEven = index % 2 === 0; 
              
              const dateObj = new Date(node.milestoneDate);
              const year = dateObj.getFullYear();
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              
              const isLastItem = index === milestones.length - 1;

              return (
                <div key={node._id} className="snake-row" style={{ 
                  position: 'relative', width: '100%', height: `${ROW_HEIGHT}px`,
                  overflow: 'visible' 
                }}>
                  
                  {/* 〰️ THE PERMANENT THICK SOLID SVG LINE */}
                  {!isLastItem && (
                    <svg className="snake-svg" style={{ 
                      position: 'absolute', top: '50%', left: 0, width: '100%', height: '100%', 
                      zIndex: 0, pointerEvents: 'none',
                      animation: 'fadeInLine 1s ease-in forwards',
                      overflow: 'visible' 
                    }} viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d={isEven 
                          ? "M 20 0 C 20 50, 80 50, 80 100" 
                          : "M 80 0 C 80 50, 20 50, 20 100" 
                        }
                        fill="none" 
                        stroke="url(#snakeGlow)" 
                        strokeWidth="6" 
                        vectorEffect="non-scaling-stroke"
                        className="neon-line"
                      />
                      <defs>
                        <linearGradient id="snakeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="50%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}

                  {/* 🎯 HOVER ZONE (Dot + Badge) */}
                  <div className={`hover-zone ${isEven ? 'zone-left' : 'zone-right'}`} style={{
                    position: 'absolute', top: '50%', left: isEven ? '20%' : '80%', transform: 'translate(-50%, -50%)',
                    zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    
                    {/* 🟢 The Sparkling Node Dot */}
                    <div className="snake-node" style={{ 
                      width: '22px', height: '22px', borderRadius: '50%', 
                      background: '#0f172a', 
                      border: `4px solid #818cf8`, 
                      boxShadow: '0 0 15px rgba(129,140,248,0.6)', 
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>

                    {/* 📅 The Date & Time Badge */}
                    <div className="date-badge" style={{
                      position: 'absolute', [isEven ? 'left' : 'right']: '35px', 
                      background: 'rgba(15, 23, 42, 0.6)', color: '#e2e8f0', 
                      padding: '8px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '1.05rem', 
                      border: `1px solid rgba(129, 140, 248, 0.3)`, 
                      backdropFilter: 'blur(10px)', whiteSpace: 'nowrap', cursor: 'pointer', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      <span>{formattedDate}, {year}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{formattedTime}</span>
                    </div>

                    {/* 🃏 The Cinematic Popup Card */}
                    <div className="popup-card" style={{ 
                      position: 'absolute', top: '50%', [isEven ? 'left' : 'right']: '40px', transform: 'translateY(-50%) scale(0.85)',
                      width: '380px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(25px)', 
                      padding: '24px', borderRadius: '24px', border: '1px solid rgba(192, 132, 252, 0.4)',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(192, 132, 252, 0.2)',
                      opacity: 0, visibility: 'hidden', pointerEvents: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      
                      {node.mediaUrl && (
                        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', background: '#000' }}>
                          {node.mediaType === 'video' ? (
                            <video src={node.mediaUrl} controls style={{ width: '100%', maxHeight: '200px', display: 'block' }} />
                          ) : (
                            <img src={node.mediaUrl} alt={node.title} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }} />
                          )}
                        </div>
                      )}

                      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 8px 0', color: '#f8fafc' }}>{node.title}</h3>
                      <p style={{ color: '#cbd5e1', lineHeight: '1.5', fontSize: '0.95rem', margin: '0 0 16px 0', maxHeight: '120px', overflowY: 'auto' }}>
                        {node.content}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={node.user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="Author" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Added by {node.user?.name?.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📥 FLOATING DOWNLOAD MEMORIES BUTTON (Kept on Right) */}
      {milestones.length > 0 && (
        <button 
          onClick={() => exporterRef.current?.generatePDF()}
          style={{
            position: 'fixed', bottom: '40px', right: '40px', zIndex: 100, // Adjusted bottom margin since arrow moved
            background: 'linear-gradient(135deg, #c084fc, #818cf8)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '50px', 
            padding: '14px 26px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', 
            boxShadow: '0 10px 25px rgba(192, 132, 252, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', alignItems: 'center', gap: '12px',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(192, 132, 252, 0.6)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(192, 132, 252, 0.4)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #c084fc, #818cf8)';
          }}
        >
          <span style={{ fontSize: '22px' }}>📥</span>
          Download Your Memories
        </button>
      )}

      {/* 🔥 FAST TRAVEL BUTTON (Moved to Left Side) */}
      {milestones.length > 0 && (
        <button 
          onClick={scrollToBottom}
          style={{
            position: 'fixed', bottom: '40px', left: '40px', zIndex: 100, // Changed right to left
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            color: 'white', border: 'none', borderRadius: '50%', width: '60px', height: '60px',
            fontSize: '24px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(129, 140, 248, 0.4)',
            transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          👇
        </button>
      )}

      <style>{`
        /* 🌌 Starry Background */
        .starry-bg {
          background-image: 
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
            radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
          background-size: 550px 550px, 350px 350px, 250px 250px;
          background-position: 0 0, 40px 60px, 130px 270px;
          animation: starDrift 150s linear infinite;
        }
        @keyframes starDrift { to { background-position: -550px -550px, -310px -290px, -120px -280px; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLine { from { opacity: 0; } to { opacity: 1; } }

        /* 🔥 PERMANENT NEON GLOW 🔥 */
        .neon-line {
          filter: drop-shadow(0 0 6px rgba(56,189,248,0.8)) drop-shadow(0 0 12px rgba(129,140,248,0.5));
          animation: breathGlow 3s infinite alternate;
        }
        @keyframes breathGlow {
          from { filter: drop-shadow(0 0 4px rgba(56,189,248,0.6)); }
          to { filter: drop-shadow(0 0 10px rgba(192,132,252,1)) drop-shadow(0 0 20px rgba(129,140,248,0.8)); }
        }

        /* ✨ HOVER MAGIC (THE SPARKLING EFFECT) ✨ */
        .hover-zone { z-index: 10; }
        .hover-zone:hover { z-index: 100 !important; }
        
        .hover-zone:hover .popup-card {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(-50%) scale(1) !important;
        }

        .hover-zone:hover .snake-node {
          transform: scale(1.5);
          background: #c084fc !important;
          border-color: #fff !important;
          box-shadow: 0 0 20px #fff, 0 0 40px #c084fc, 0 0 60px #818cf8 !important;
        }
        
        .hover-zone:hover .date-badge {
          background: rgba(192, 132, 252, 0.25) !important;
          border-color: #c084fc !important;
          color: #fff !important;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(192, 132, 252, 0.4);
        }

        .popup-card p::-webkit-scrollbar { width: 4px; }
        .popup-card p::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

        /* 📱 Mobile Responsiveness */
        @media (max-width: 768px) {
          .snake-row { height: 140px !important; }
          .hover-zone { left: 40px !important; }
          .snake-svg { display: none !important; }
          
          .snake-row::before { 
            content: ''; position: absolute; top: 0; bottom: 0; left: 40px; width: 6px; 
            background: linear-gradient(to bottom, #38bdf8, #818cf8, #c084fc); 
            transform: translateX(-50%); 
            box-shadow: 0 0 10px rgba(129,140,248,0.6);
          }
          .snake-row:last-child::before { bottom: 50%; }
          
          .popup-card {
            left: 50vw !important; right: auto !important;
            transform: translate(-50vw, -10px) scale(0.9) !important;
            width: calc(100vw - 40px) !important;
            margin-top: 50px; 
          }
          .hover-zone:hover .popup-card, .hover-zone:active .popup-card {
            transform: translate(-50vw, 0) scale(1) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default FamilyTimelinePage;