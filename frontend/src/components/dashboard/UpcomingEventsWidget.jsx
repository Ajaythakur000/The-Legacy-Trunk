import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 🔥 Added this to fix scroll & z-index issues
import { getUpcomingEventsApi } from '../../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';

function CornerAccents({ size = 14, inset = 10, opacity = 0.35 }) {
  const base = { position: 'absolute', width: size, height: size, borderColor: `rgba(212,168,80,${opacity})`, borderStyle: 'solid' };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset, borderWidth: '1px 0 0 1px', borderRadius: '3px 0 0 0' }} />
      <div style={{ ...base, top: inset, right: inset, borderWidth: '1px 1px 0 0', borderRadius: '0 3px 0 0' }} />
      <div style={{ ...base, bottom: inset, left: inset, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 3px' }} />
      <div style={{ ...base, bottom: inset, right: inset, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' }} />
    </>
  );
}

function UpcomingEventsWidget({ circleId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!circleId) return;
      setLoading(true); setError('');
      try { const data = await getUpcomingEventsApi(circleId); setEvents(data || []); }
      catch (err) { setError('Failed to load upcoming events'); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [circleId]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const calculateDaysLeft = (eventDateString) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const eventDate = new Date(eventDateString); eventDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 364) return 'TODAY!';
    if (diffDays === 0) return 'TODAY!';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Compact button
  if (!isModalOpen) {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          background: 'rgba(12,16,32,0.88)',
          border: '1px solid rgba(212,168,80,0.22)',
          borderRadius: 18, padding: '18px 22px',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'box-shadow 0.3s',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent)' }} />
        <CornerAccents size={12} inset={8} opacity={0.35} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ fontSize: 28, filter: 'drop-shadow(0 0 8px rgba(212,168,80,0.5))' }}
          >
            📅
          </motion.span>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, color: '#e8c87a', letterSpacing: 0.5 }}>Family Calendar</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1.5px', color: 'rgba(212,168,80,0.4)', marginTop: 2 }}>
              {loading ? 'Consulting the oracle…' : `${events.length} upcoming events`}
            </div>
          </div>
        </div>

        <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ color: 'rgba(212,168,80,0.5)', fontSize: 16 }}>→</motion.div>
      </motion.div>
    );
  }

  // 🔥 FIX: Modal rendered through createPortal to ensure it stays on top of everything and allows internal scrolling
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ 
          position: 'fixed', inset: 0, 
          background: 'rgba(4,6,14,0.88)', backdropFilter: 'blur(14px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 99999, padding: 20, overflow: 'hidden' 
        }}
        onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
      >
        <style>
          {`
            .premium-scroll::-webkit-scrollbar { width: 6px; }
            .premium-scroll::-webkit-scrollbar-track { background: rgba(12, 16, 32, 0.4); border-radius: 10px; }
            .premium-scroll::-webkit-scrollbar-thumb { background: rgba(212, 168, 80, 0.3); border-radius: 10px; }
            .premium-scroll::-webkit-scrollbar-thumb:hover { background: rgba(212, 168, 80, 0.6); }
            @keyframes ltDot{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}
          `}
        </style>
        
        <motion.div
          className="premium-scroll"
          initial={{ scale: 0.88, y: 28, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 28, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{ 
            background: 'rgba(12,16,32,0.98)', border: '1px solid rgba(212,168,80,0.25)', 
            borderRadius: 22, width: '100%', maxWidth: 460, 
            position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
            maxHeight: '90vh', overflowY: 'auto'
          }}
        >
          <div style={{ padding: '38px 32px' }}>
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
            <CornerAccents size={16} inset={12} opacity={0.45} />

            <button onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(212,168,80,0.22)', background: 'rgba(255,255,255,0.03)', color: 'rgba(212,168,80,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.2s', zIndex: 10 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.7)'; e.currentTarget.style.color = '#e8c87a'; e.currentTarget.style.background = 'rgba(212,168,80,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; e.currentTarget.style.color = 'rgba(212,168,80,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
              ✕
            </button>

            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 19, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 30px rgba(212,168,80,0.3)', marginBottom: 4, textAlign: 'center' }}>
              📅 Upcoming Events
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2px', color: 'rgba(212,168,80,0.4)', marginBottom: 24, textAlign: 'center' }}>
              Family milestones & birthdays
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '30px 0' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8c87a', display: 'inline-block', animation: `ltDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            ) : error ? (
              <p style={{ textAlign: 'center', color: '#f08080', fontFamily: "'Space Mono',monospace", fontSize: 11, padding: '20px 0' }}>⚠ {error}</p>
            ) : events.length === 0 ? (
              <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 16, padding: '20px 0' }}>No upcoming events in the annals.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map((evt, index) => {
                  const isBirthday = evt.type === 'birthday';
                  const daysLeftStr = calculateDaysLeft(evt.date);
                  const isToday = daysLeftStr === 'TODAY!';
                  return (
                    <motion.div key={index}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '14px 16px',
                        background: isToday ? 'rgba(212,168,80,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isToday ? 'rgba(212,168,80,0.4)' : 'rgba(212,168,80,0.1)'}`,
                        borderLeft: `3px solid ${isBirthday ? '#ec4899' : '#e8c87a'}`,
                        borderRadius: 14,
                      }}
                    >
                      <motion.div
                        animate={isToday ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ fontSize: 28, marginRight: 14, filter: isToday ? 'drop-shadow(0 0 8px rgba(212,168,80,0.6))' : 'none' }}
                      >
                        {isBirthday ? '🎂' : '🌟'}
                      </motion.div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginBottom: 5 }}>{evt.title}</div>
                        <span style={{
                          fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase',
                          color: isToday ? '#e8c87a' : 'rgba(212,168,80,0.5)',
                          background: isToday ? 'rgba(212,168,80,0.15)' : 'rgba(212,168,80,0.06)',
                          border: `1px solid ${isToday ? 'rgba(212,168,80,0.4)' : 'rgba(212,168,80,0.15)'}`,
                          padding: '3px 10px', borderRadius: 6,
                        }}>
                          {daysLeftStr}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 22, textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,0.12)', userSelect: 'none' }}>
              ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default UpcomingEventsWidget;