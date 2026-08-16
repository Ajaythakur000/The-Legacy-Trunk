import React from 'react';
import { motion } from 'framer-motion';

function FamilyLegacyCard({ familyPoints }) {
  const getFamilyBadge = (points) => {
    if (points < 500) return {
      title: '🏡 NEWBIES', next: 500,
      color: '#171719', bg: '#FFD23F',
      msg: 'A quiet start. Post some stories!',
    };
    if (points < 2000) return {
      title: '🌟 THE LOUD BUNCH', next: 2000,
      color: '#FFF', bg: '#FF7B00',
      msg: 'Your family is loud and proud!',
    };
    if (points < 5000) return {
      title: '🏛️ LEGENDS', next: 5000,
      color: '#FFF', bg: '#FF3D81',
      msg: "A solid foundation. Everyone knows you.",
    };
    return {
      title: '👑 ROYALTY', next: 'MAX',
      color: '#171719', bg: '#3FE0FF',
      msg: 'The ultimate trendsetters. You made it!',
    };
  };

  const badge = getFamilyBadge(familyPoints);
  const progressPercent = badge.next === 'MAX' ? 100 : Math.max(0, Math.min((familyPoints / badge.next) * 100, 100));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Eyebrow label */}
      <div style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 24, color: '#171719', marginBottom: 16 }}>
        FAMILY RANK 🏆
      </div>

      {/* Points number */}
      <motion.div key={familyPoints} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <span style={{ fontFamily: "'Luckiest Guy',cursive", fontSize: 80, color: '#3FE0FF', lineHeight: 1, textShadow: '6px 6px 0px #171719', WebkitTextStroke: '2px #171719' }}>
          {familyPoints.toLocaleString()}
        </span>
        <span style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: 24, fontWeight: 800, color: '#171719' }}>
          PTS
        </span>
      </motion.div>

      {/* Badge pill */}
      <motion.div whileHover={{ scale: 1.05, rotate: -2 }}
        style={{
          display: 'inline-block', padding: '8px 24px', borderRadius: 12, marginBottom: 24,
          background: badge.bg, color: badge.color, border: '4px solid #171719',
          fontFamily: "'Luckiest Guy',cursive", fontSize: 20,
          boxShadow: '6px 6px 0px 0px #171719', cursor: 'default', transform: 'rotate(2deg)'
        }}
      >
        {badge.title}
      </motion.div>

      {/* Message */}
      <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: '#171719', lineHeight: '1.5', marginBottom: 32, background: '#F5F5F5', padding: 16, border: '4px dashed #171719', borderRadius: 16 }}>
        "{badge.msg}"
      </p>

      {/* Progress section */}
      {badge.next !== 'MAX' ? (
        <div style={{ background: '#FFF', border: '4px solid #171719', borderRadius: 16, padding: 24, boxShadow: '8px 8px 0px 0px #171719' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: "'Luckiest Guy',cursive", fontSize: 16, color: '#171719' }}>
            <span>NEXT RANK</span>
            <span>{familyPoints.toLocaleString()} / {badge.next.toLocaleString()}</span>
          </div>

          {/* Comic Health Bar */}
          <div style={{ height: 24, background: '#FFF', borderRadius: 12, border: '4px solid #171719', overflow: 'hidden', position: 'relative' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, type: 'spring' }}
              style={{ height: '100%', background: '#00C853', borderRight: '4px solid #171719' }}
            />
          </div>

          <div style={{ marginTop: 12, fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: '#171719', textAlign: 'right' }}>
            Need {Math.max(0, badge.next - familyPoints).toLocaleString()} more pts! 🔥
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', background: '#FFD23F', borderRadius: 16, border: '4px solid #171719', fontFamily: "'Luckiest Guy',cursive", color: '#171719', fontSize: 24, boxShadow: '8px 8px 0px 0px #171719', transform: 'rotate(-2deg)' }}>
          MAX RANK ACHIEVED! 👑
        </div>
      )}
    </div>
  );
}

export default FamilyLegacyCard;