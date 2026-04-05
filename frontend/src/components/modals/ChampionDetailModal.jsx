import React from 'react';

function ChampionDetailModal({ onClose, championUser }) {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={onClose} style={closeModalBtnStyle}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '50px' }}>👑</span>
          <h2 style={{ margin: '10px 0 0 0', color: '#0f172a', fontWeight: '900' }}>Family Champion</h2>
          <p style={{ color: '#64748b', margin: '5px 0' }}>The driving force of our Legacy</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <img src={championUser?.avatar || "https://via.placeholder.com/150"} alt="Champion" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #f59e0b', objectFit: 'cover' }} />
          <h3 style={{ margin: '15px 0 5px 0', fontSize: '24px', color: '#1e293b' }}>{championUser?.name || "Unknown"}</h3>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Most Active Member</span>
        </div>
      </div>
      
      {/* Ensure animations run locally in this component */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// Modal Styles (Blur effect)
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.3s ease' };
const modalContentStyle = { background: '#ffffff', borderRadius: '32px', padding: '40px', width: '90%', maxWidth: '400px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'scaleUp 0.3s ease' };
const closeModalBtnStyle = { position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default ChampionDetailModal;