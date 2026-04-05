import { useState, useEffect } from 'react';
import { getUpcomingEventsApi } from '../../api/circleApi'; 

function UpcomingEventsWidget({ circleId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 🔥 THE NEW MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!circleId) return;
      setLoading(true);
      setError('');
      try {
        const data = await getUpcomingEventsApi(circleId);
        setEvents(data || []);
      } catch (err) {
        setError('Failed to load upcoming events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [circleId]);

  // 🔥 FRONTEND CALCULATOR: Date string se daysLeft nikalne ka logic
  const calculateDaysLeft = (eventDateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(eventDateString);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Agar aaj post kiya hai aur backend ne next year kar diya (364/365 days)
    if (diffDays >= 364) return 'TODAY!';
    if (diffDays === 0) return 'TODAY!';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // UI 1: Compact View (Dashboard ke liye Tab Button)
  if (!isModalOpen) {
    return (
      <div 
        onClick={() => setIsModalOpen(true)}
        style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
          color: 'white', 
          borderRadius: '16px', 
          padding: '16px 24px', 
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📅</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Family Calendar</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#bfdbfe' }}>
              {loading ? 'Checking dates...' : `View ${events.length} Upcoming Events`}
            </p>
          </div>
        </div>
        <div style={{ fontSize: '20px' }}>➡️</div>
      </div>
    );
  }

  // UI 2: The Blurred Pop-up Modal
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)', // 🔥 THE PREMIUM BLUR
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#fff',
        width: '90%',
        maxWidth: '450px',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={() => setIsModalOpen(false)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}
        >
          ✕
        </button>

        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>📅</span> Upcoming Events
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>⏳ Dusting off the family calendar...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '20px 0' }}>❌ Could not load calendar.</p>
        ) : events.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontStyle: 'italic' }}>
            No upcoming birthdays or milestones right now.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((evt, index) => {
              const isBirthday = evt.type === 'birthday';
              const daysLeftStr = calculateDaysLeft(evt.date);
              const isToday = daysLeftStr === 'TODAY!';
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '16px', 
                    background: isToday ? '#fffbeb' : '#f8fafc', // Highlight if today
                    borderRadius: '16px', 
                    border: `1px solid ${isToday ? '#fde68a' : '#e2e8f0'}`,
                    borderLeft: `4px solid ${isBirthday ? '#ec4899' : '#f59e0b'}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ fontSize: '32px', marginRight: '16px', filter: isToday ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' : 'none' }}>
                    {isBirthday ? '🎂' : '🌟'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e293b' }}>
                      {evt.title}
                    </h4>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: '800', 
                      color: isToday ? '#d97706' : '#64748b',
                      background: isToday ? '#fef3c7' : '#e2e8f0',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      {daysLeftStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default UpcomingEventsWidget;