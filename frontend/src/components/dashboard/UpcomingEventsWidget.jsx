import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUpcomingEventsApi } from '../../api/circleApi';
import { Calendar, X, Clock } from 'lucide-react';
/* eslint-disable no-unused-vars */

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
      catch (_err) { setError('Failed to load events'); }
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
    if (diffDays >= 364) return 'Today';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Compact button on Dashboard
  if (!isModalOpen) {
    return (
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          background: '#FDFBF7',
          border: '1px solid #D4B895',
          borderRadius: 8,
          padding: '24px 32px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '4px 4px 15px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '6px 6px 20px rgba(0,0,0,0.1)';
          e.currentTarget.style.background = '#F5F0E6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '4px 4px 15px rgba(0,0,0,0.05)';
          e.currentTarget.style.background = '#FDFBF7';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ background: '#3E2723', padding: 12, borderRadius: '50%', color: '#D4B895', display: 'flex' }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#3E2723', letterSpacing: 1, marginBottom: 4 }}>
              Family Planner
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 15, color: '#6D4C41' }}>
              {loading ? 'Consulting the calendar...' : `${events.length} Upcoming Events`}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#D4B895' }}>→</div>
      </div>
    );
  }

  // Expanded Modal
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(23, 23, 25, 0.8)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: 20, overflow: 'hidden'
      }}
      onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
    >
      <div
        style={{
          background: '#FDFBF7',
          border: '1px solid #D4B895',
          borderRadius: 12,
          width: '100%', maxWidth: 500,
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 30px', borderBottom: '1px solid #D4B895', background: '#3E2723', borderTopLeftRadius: 11, borderTopRightRadius: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#D4B895' }}>
            <Calendar size={24} /> The Grand Planner
          </div>
          <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#D4B895', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#6D4C41', padding: '40px 0', fontStyle: 'italic' }}>
              Leafing through the dates...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#A0522D', padding: '40px 0' }}>
              Failed to load the planner.
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#D4B895' }}>
                <Clock size={48} />
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', marginBottom: 8 }}>The Calendar is Clear</div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 16, color: '#6D4C41', margin: 0 }}>Gather the family and make some plans.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.map((evt) => {
                const isToday = calculateDaysLeft(evt.date) === 'Today';
                const dateObj = new Date(evt.date);
                return (
                  <div key={evt._id} style={{ display: 'flex', gap: 16, background: '#FFF', padding: 20, borderRadius: 8, border: '1px solid #EADDCD', boxShadow: '2px 2px 8px rgba(0,0,0,0.03)' }}>
                    {/* Date Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isToday ? '#A0522D' : '#F5F0E6', borderRadius: 8, minWidth: 70, height: 70, color: isToday ? '#FFF' : '#3E2723' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}>
                        {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, lineHeight: 1 }}>
                        {dateObj.getDate()}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#3E2723', marginBottom: 4, fontWeight: 600 }}>
                        {evt.title}
                      </div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14, color: '#6D4C41', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Added by {evt.createdBy?.name || 'Unknown'}</span>
                        <span style={{ color: isToday ? '#A0522D' : '#3E2723', fontWeight: isToday ? 800 : 600 }}>
                          {calculateDaysLeft(evt.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default UpcomingEventsWidget;
