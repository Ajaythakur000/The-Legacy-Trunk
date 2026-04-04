import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';

function FamilyTimelinePage() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', overflowX: 'hidden' }}>
      

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* 🎇 Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeInDown 1s ease' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '0 0 10px 0', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Memory Lane
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Tracing the footsteps of our family's legacy.
          </p>
        </div>

        {/* ⏳ Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8', padding: '50px', fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>
            Unlocking the family vault... 🕰️
          </div>
        ) : milestones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px dashed #334155' }}>
            <h3 style={{ color: '#cbd5e1' }}>The Lane is Empty</h3>
            <p style={{ color: '#64748b' }}>Mark stories as "Family Milestone" to see them appear here.</p>
          </div>
        ) : (
          
          <div style={{ position: 'relative', padding: '40px 0' }} className="timeline-container">
            {/* 🐍 THE SNAKE UI (TIMELINE) */}
            
            {/* The Central Glowing Line */}
            <div style={{ 
              position: 'absolute', top: 0, bottom: 0, left: '50%', width: '4px', 
              background: 'linear-gradient(to bottom, transparent, #38bdf8, #818cf8, transparent)', 
              transform: 'translateX(-50%)', borderRadius: '4px', opacity: 0.6 
            }}></div>

            {milestones.map((node, index) => {
              const isEven = index % 2 === 0; // True means Left side, False means Right side
              const dateObj = new Date(node.milestoneDate);
              const year = dateObj.getFullYear();
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div key={node._id} style={{ 
                  display: 'flex', justifyContent: isEven ? 'flex-start' : 'flex-end', 
                  alignItems: 'center', width: '100%', marginBottom: '60px', position: 'relative' 
                }}>
                  
                  {/* The Glowing Node Dot */}
                  <div style={{ 
                    position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', 
                    width: '20px', height: '20px', borderRadius: '50%', background: '#020617', 
                    border: '4px solid #38bdf8', boxShadow: '0 0 15px #38bdf8', zIndex: 10 
                  }}></div>

                  {/* 🃏 The Glassmorphism Content Card */}
                  <div style={{ 
                    width: '45%', padding: isEven ? '0 40px 0 0' : '0 0 0 40px',
                    display: 'flex', flexDirection: 'column', alignItems: isEven ? 'flex-end' : 'flex-start',
                    textAlign: isEven ? 'right' : 'left', animation: `slideIn${isEven ? 'Left' : 'Right'} 0.6s ease-out forwards`
                  }}>
                    
                    {/* The Date Badge */}
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem', marginBottom: '16px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-block' }}>
                      {formattedDate}, {year}
                    </div>

                    <div style={{ 
                      background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', 
                      padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)', width: '100%',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }} className="timeline-card">
                      
                      {node.mediaUrl && (
                        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {node.mediaType === 'video' ? (
                            <video src={node.mediaUrl} controls style={{ width: '100%', display: 'block' }} />
                          ) : (
                            <img src={node.mediaUrl} alt={node.title} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                          )}
                        </div>
                      )}

                      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 10px 0', color: '#f8fafc' }}>{node.title}</h3>
                      <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem', margin: '0 0 16px 0' }}>{node.content}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isEven ? 'flex-end' : 'flex-start' }}>
                        <img src={node.user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="Author" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Added by {node.user?.name?.split(' ')[0]}</span>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        .timeline-card:hover { transform: scale(1.03); box-shadow: 0 25px 50px rgba(56, 189, 248, 0.15) !important; border-color: rgba(56, 189, 248, 0.4) !important; }
        
        /* Mobile Responsiveness (Line shifts to left) */
        @media (max-width: 768px) {
          .timeline-container > div:first-child { left: 30px !important; transform: none !important; }
          .timeline-container > div { justify-content: flex-end !important; }
          .timeline-container > div > div:nth-child(2) { left: 20px !important; transform: none !important; }
          .timeline-container > div > div:nth-child(3) { width: calc(100% - 60px) !important; padding: 0 !important; align-items: flex-start !important; text-align: left !important; }
          .timeline-card > div:last-child { justify-content: flex-start !important; }
        }
      `}</style>
    </div>
  );
}

export default FamilyTimelinePage;