import React from 'react';

function FamilyLegacyCard({ familyPoints }) {
  const getFamilyBadge = (points) => {
    if (points < 500) return { title: '🏡 The Quiet Hearth', next: 500, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', msg: 'A peaceful start. Share more stories to build your family legacy!', glow: '#10b981' };
    if (points < 2000) return { title: '🌟 The Vibrant Tribe', next: 2000, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', msg: 'Your family is buzzing with energy and new memories!', glow: '#f59e0b' };
    if (points < 5000) return { title: '🏛️ Legacy Builders', next: 5000, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', msg: "A strong foundation. Your family's bond is an inspiration.", glow: '#3b82f6' };
    return { title: '👑 Eternal Dynasty', next: 'MAX', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', msg: 'The Ultimate Trendsetters. Your family name is etched in history!', glow: '#8b5cf6' };
  };

  const badge = getFamilyBadge(familyPoints);
  const progressPercent = badge.next === 'MAX' ? 100 : Math.min((familyPoints / badge.next) * 100, 100);

  return (
    <div style={{ background: '#0f172a', borderRadius: '32px', padding: '40px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: `0 20px 50px ${badge.shadow || 'rgba(0,0,0,0.3)'}` }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: badge.color, opacity: 0.1, borderRadius: '50%', filter: 'blur(60px)' }}></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '10px' }}>Family Collective Status</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
              <span style={{ fontSize: '5rem', fontWeight: '900', color: '#fff', textShadow: `0 0 20px ${badge.glow}` }}>{familyPoints}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>BOND POINTS</span>
            </div>
          </div>
          
          <div style={{ background: badge.bg, color: badge.color, padding: '15px 25px', borderRadius: '20px', border: `2px solid ${badge.color}`, fontWeight: '900', fontSize: '1.4rem' }}>
            {badge.title}
          </div>
        </div>

        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', margin: '20px 0 40px', fontStyle: 'italic', maxWidth: '80%' }}>"{badge.msg}"</p>

        {badge.next !== 'MAX' ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
              <span>Next Rank Progress</span>
              <span>{familyPoints} / {badge.next}</span>
            </div>
            <div style={{ height: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: `linear-gradient(90deg, ${badge.color} 0%, #fff 100%)`, boxShadow: `0 0 15px ${badge.color}`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '15px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>
              🔒 {badge.next - familyPoints} points to elevate your family name
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: `1px solid ${badge.color}` }}>
            👑 Your family has achieved Eternal Dynasty status!
          </div>
        )}
      </div>
    </div>
  );
}

export default FamilyLegacyCard;