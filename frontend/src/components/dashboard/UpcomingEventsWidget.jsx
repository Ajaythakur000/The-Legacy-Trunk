import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUpcomingEventsApi } from '../../api/circleApi';
import { motion, AnimatePresence } from 'framer-motion';

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
      catch (err) { setError('Failed to load events'); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [circleId]);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
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

  // Compact button on Dashboard
  if (!isModalOpen) {
    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          background: '#D4B895', border: '6px solid #3E2723', borderRadius: 24, padding: '24px 32px',
          cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '12px 12px 15px 0px rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: 'rotate(-1deg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: 48, filter: 'drop-shadow(4px 4px 0px #3E2723)' }}>
            📅
          </motion.span>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', letterSpacing: 1 }}>FAMILY CALENDAR</div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: '#3E2723', marginTop: 4 }}>
              {loading ? 'CHECKING DATES...' : `${events.length} UPCOMING EVENTS`}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3E2723' }}>→</div>
      </motion.div>
    );
  }

  // Expanded Modal
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20, overflow: 'hidden' }}
        onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 30, rotate: 2 }} animate={{ scale: 1, y: 0, rotate: -1 }} exit={{ scale: 0.8, y: 30, rotate: 2 }} transition={{ type: 'spring', bounce: 0.5 }}
          style={{ background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, width: '100%', maxWidth: 500, position: 'relative', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{ padding: '24px', borderBottom: '6px solid #3E2723', background: '#C89B3C', borderTopLeftRadius: 18, borderTopRightRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3E2723' }}>
              📅 CALENDAR
            </div>
            <button onClick={() => setIsModalOpen(false)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#1E352F', color: '#FFF', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)' }}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 24, padding: '40px 0' }}>LOADING DATES...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 24, color: #FDFBF7, padding: '40px 0' }}>⚠️ {error}</div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🦗</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723' }}>NOTHING HAPPENING!</div>
                <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16 }}>Go make some plans.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {events.map((evt, index) => {
                  const isBirthday = evt.type === 'birthday';
                  const daysLeftStr = calculateDaysLeft(evt.date);
                  const isToday = daysLeftStr === 'TODAY!';
                  return (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      style={{ display: 'flex', alignItems: 'center', padding: '16px', background: isToday ? '#D4B895' : '#F5F5F5', border: 'none', borderRadius: 16, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: isToday ? 'scale(1.02)' : 'none' }}
                    >
                      <div style={{ fontSize: 40, marginRight: 16, filter: 'drop-shadow(2px 2px 0px #3E2723)' }}>
                        {isBirthday ? '🎂' : '⭐'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3E2723', marginBottom: 4 }}>{evt.title}</div>
                        <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, color: isToday ? '#FFF' : '#3E2723', background: isToday ? '#1E352F' : '#FFF', border: 'none', padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase' }}>
                          {daysLeftStr}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default UpcomingEventsWidget;