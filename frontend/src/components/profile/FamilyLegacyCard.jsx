import React from 'react';
import { motion } from 'framer-motion';

function FamilyLegacyCard({ familyPoints }) {
  const getFamilyBadge = (points) => {
    if (points < 500) return {
      title: '🏡 The Quiet Hearth', next: 500,
      color: '#d4a850', bg: 'rgba(212,168,80,0.1)', glow: '#d4a850',
      msg: 'A peaceful start. Share more stories to build your family legacy!',
      gradient: 'linear-gradient(90deg, #78350f 0%, #d4a850 60%, #fef08a 100%)',
    };
    if (points < 2000) return {
      title: '🌟 The Vibrant Tribe', next: 2000,
      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', glow: '#f59e0b',
      msg: 'Your family is buzzing with energy and new memories!',
      gradient: 'linear-gradient(90deg, #b45309 0%, #f59e0b 60%, #fef08a 100%)',
    };
    if (points < 5000) return {
      title: '🏛️ Legacy Builders', next: 5000,
      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', glow: '#3b82f6',
      msg: "A strong foundation. Your family's bond is an inspiration.",
      gradient: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 60%, #bfdbfe 100%)',
    };
    return {
      title: '👑 Eternal Dynasty', next: 'MAX',
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', glow: '#8b5cf6',
      msg: 'The Ultimate Trendsetters. Your family name is etched in history!',
      gradient: 'linear-gradient(90deg, #4c1d95 0%, #8b5cf6 60%, #ede9fe 100%)',
    };
  };

  const badge = getFamilyBadge(familyPoints);
  const progressPercent = badge.next === 'MAX' ? 100 : Math.max(0, Math.min((familyPoints / badge.next) * 100, 100));

  return (
    <>
      <style>{`
        @keyframes lc-shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes lc-blob { 0%,100%{opacity:0.12;transform:scale(1)} 50%{opacity:0.22;transform:scale(1.1)} }
        @keyframes lc-count { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ position: 'relative', width: '100%' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: badge.glow, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'lc-blob 5s ease-in-out infinite' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Eyebrow label */}
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', marginBottom: 12 }}>
            Family Collective Status
          </div>

          {/* Points number */}
          <motion.div
            key={familyPoints}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 60, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: `0 0 60px ${badge.glow}66, 0 0 20px ${badge.glow}33` }}>
              {familyPoints.toLocaleString()}
            </span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: '2px', color: 'rgba(212,168,80,0.45)', textTransform: 'uppercase' }}>
              Bond Points
            </span>
          </motion.div>

          {/* Badge pill */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 40, margin: '10px 0 18px',
              background: badge.bg, color: badge.color,
              border: `1px solid ${badge.color}55`,
              fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5,
              boxShadow: `0 0 30px ${badge.glow}22, inset 0 1px 0 ${badge.glow}22`,
              cursor: 'default',
            }}
          >
            {badge.title}
          </motion.div>

          {/* Message */}
          <p style={{ fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: '1.75', marginBottom: 28, borderLeft: '2px solid rgba(212,168,80,0.2)', paddingLeft: 14 }}>
            "{badge.msg}"
          </p>

          {/* Progress section */}
          {badge.next !== 'MAX' ? (
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,168,80,0.12)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)' }}>Next Rank Progress</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{familyPoints.toLocaleString()} / {badge.next.toLocaleString()}</span>
              </div>

              {/* Track */}
              <div style={{ height: 10, background: 'rgba(0,0,0,0.6)', borderRadius: 40, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ height: '100%', borderRadius: 40, background: badge.gradient, position: 'relative', overflow: 'hidden', boxShadow: `0 0 16px ${badge.glow}55` }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation: 'lc-shimmer 2s ease-in-out infinite' }} />
                </motion.div>
              </div>

              {/* Points to next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: (progressPercent / 20) > i ? badge.color : 'rgba(255,255,255,0.08)', transition: 'background 0.4s', boxShadow: (progressPercent / 20) > i ? `0 0 6px ${badge.glow}` : 'none' }} />
                  ))}
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  🔒 {Math.max(0, badge.next - familyPoints).toLocaleString()} pts to elevate your family name
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '22px', background: badge.bg, borderRadius: 16, border: `1px solid ${badge.color}44`, fontFamily: "'Cinzel',serif", color: badge.color, fontSize: 15, boxShadow: `0 0 30px ${badge.glow}22` }}>
              👑 Your family has achieved Eternal Dynasty status!
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FamilyLegacyCard;