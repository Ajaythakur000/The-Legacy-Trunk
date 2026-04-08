import React from 'react';

function FamilyLegacyCard({ familyPoints }) {
  const getFamilyBadge = (points) => {
    if (points < 500) return { title: '🏡 The Quiet Hearth', next: 500, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', msg: 'A peaceful start. Share more stories to build your family legacy!', glow: '#10b981' };
    if (points < 2000) return { title: '🌟 The Vibrant Tribe', next: 2000, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', msg: 'Your family is buzzing with energy and new memories!', glow: '#f59e0b' };
    if (points < 5000) return { title: '🏛️ Legacy Builders', next: 5000, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', msg: "A strong foundation. Your family's bond is an inspiration.", glow: '#3b82f6' };
    return { title: '👑 Eternal Dynasty', next: 'MAX', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', msg: 'The Ultimate Trendsetters. Your family name is etched in history!', glow: '#8b5cf6' };
  };

  const badge = getFamilyBadge(familyPoints);
  
  // 🔥 SECURITY/UI FIX: Math.max(0) ensures width never goes negative if points are negative
  const progressPercent = badge.next === 'MAX' ? 100 : Math.max(0, Math.min((familyPoints / badge.next) * 100, 100));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: badge.color, opacity: 0.15, borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }}></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '800' }}>Family Collective Status</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '4.5rem', fontWeight: '900', color: '#fff', textShadow: `0 0 25px ${badge.glow}` }}>{familyPoints}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px' }}>BOND POINTS</span>
            </div>
          </div>
          
          <div style={{ background: badge.bg, color: badge.color, padding: '12px 24px', borderRadius: '99px', border: `1px solid ${badge.color}`, fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
            {badge.title}
          </div>
        </div>

        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', margin: '20px 0 35px', fontStyle: 'italic', maxWidth: '90%', lineHeight: '1.6' }}>"{badge.msg}"</p>

        {badge.next !== 'MAX' ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Next Rank Progress</span>
              <span>{familyPoints} / {badge.next}</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: `linear-gradient(90deg, ${badge.color} 0%, #fff 100%)`, boxShadow: `0 0 20px ${badge.color}`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '12px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
              🔒 {Math.max(0, badge.next - familyPoints)} points to elevate your family name
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