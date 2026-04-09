import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function ActivityHeatmap({ activityMap, maxStreak = 0 }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { monthsData, totalPoints, activeDays, currentYear } = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentMonth = today.getMonth();
    const cYear = today.getFullYear();
    const data = [];
    let total = 0, activeCount = 0;

    for (let i = 11; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = cYear;
      if (targetMonth < 0) { targetMonth += 12; targetYear -= 1; }

      const d = new Date(targetYear, targetMonth, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const firstDayOfWeek = new Date(targetYear, targetMonth, 1).getDay();
      const weeks = [];
      let currentWeek = new Array(7).fill(null);
      let currentDayOfWeek = firstDayOfWeek;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(targetYear, targetMonth, day);
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const isFuture = dateObj > startOfToday;
        const raw = activityMap?.[dateStr];
        const count = !isFuture ? Number(raw || 0) : 0;
        if (!isFuture) { total += count; if (count > 0) activeCount++; }

        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count >= 3 && count <= 5) level = 2;
        else if (count >= 6 && count <= 9) level = 3;
        else if (count >= 10) level = 4;

        const tooltipDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        currentWeek[currentDayOfWeek] = { date: dateStr, tooltipDate, count, level, isFuture };
        currentDayOfWeek++;
        if (currentDayOfWeek > 6) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); currentDayOfWeek = 0; }
      }
      if (currentDayOfWeek > 0) weeks.push(currentWeek);
      data.push({ name: monthName, weeks });
    }
    return { monthsData: data, totalPoints: total, activeDays: activeCount, currentYear: cYear };
  }, [activityMap]);

  const getColor = (level, isFuture) => {
    if (isFuture) return 'transparent';
    const colors = ['rgba(255,255,255,0.05)', 'rgba(212,168,80,0.3)', 'rgba(212,168,80,0.55)', 'rgba(212,168,80,0.78)', '#e8c87a'];
    return colors[level];
  };

  const getGlow = (level) => {
    if (level === 0) return 'none';
    const glows = ['none', 'none', '0 0 4px rgba(212,168,80,0.3)', '0 0 8px rgba(212,168,80,0.5)', '0 0 12px rgba(212,168,80,0.8)'];
    return glows[level];
  };

  return (
    <>
      <style>{`
        @keyframes hm-appear { from{opacity:0;transform:scaleY(0)} to{opacity:1;transform:scaleY(1)} }
        .hm-cell {
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,0.03);
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          transform-origin: center;
        }
        .hm-cell:hover {
          transform: scale(1.5) !important;
          border-color: rgba(212,168,80,0.8) !important;
          z-index: 20;
          position: relative;
        }
      `}</style>

      <div style={{
        background: 'rgba(12,16,32,0.85)',
        border: '1px solid rgba(212,168,80,0.22)',
        borderRadius: 20, padding: '36px 40px',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        overflowX: 'auto',
      }}>
        {/* Gold lines */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent)' }} />

        {/* Corner accents */}
        {[
          { top: 12, left: 12, borderWidth: '1px 0 0 1px', borderRadius: '4px 0 0 0' },
          { top: 12, right: 12, borderWidth: '1px 1px 0 0', borderRadius: '0 4px 0 0' },
          { bottom: 12, left: 12, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 4px' },
          { bottom: 12, right: 12, borderWidth: '0 1px 1px 0', borderRadius: '0 0 4px 0' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 18, height: 18, borderColor: 'rgba(212,168,80,0.5)', borderStyle: 'solid', ...s }} />
        ))}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 40px rgba(212,168,80,0.3)', margin: '0 0 4px', letterSpacing: 1 }}>
              Chronicle of Activity
            </h3>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.55)', margin: 0 }}>
              Legacy points · Past 12 months
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Stat cards */}
            {[
              { val: totalPoints.toLocaleString(), lbl: 'Legacy Points', icon: '✦' },
              { val: activeDays, lbl: 'Active Days', icon: '◈' },
              { val: maxStreak, lbl: 'Max Streak', icon: '⚡' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(212,168,80,0.12)', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 20px rgba(212,168,80,0.4)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,0.45)', marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}

            {/* Period dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ background: 'rgba(212,168,80,0.06)', border: '1px solid rgba(212,168,80,0.22)', padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '1px', color: 'rgba(212,168,80,0.6)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.12)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,168,80,0.06)'; e.currentTarget.style.borderColor = 'rgba(212,168,80,0.22)'; }}
              >
                Current
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'absolute', top: '110%', right: 0, background: 'rgba(12,16,32,0.97)', border: '1px solid rgba(212,168,80,0.22)', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.7)', zIndex: 100, minWidth: 130, overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent)' }} />
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '1px', color: '#e8c87a', background: 'rgba(212,168,80,0.06)' }}>
                    Current <span>✓</span>
                  </div>
                  {currentYear > 2026 && <div style={{ padding: '10px 16px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(212,168,80,0.5)', cursor: 'pointer' }}>2026</div>}
                  {currentYear === 2026 && <div style={{ padding: '10px 16px', fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }}>No past years</div>}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Heatmap grid */}
        <div style={{ minWidth: 860 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {monthsData.map((month, mIndex) => (
              <div key={mIndex} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {month.weeks.map((week, wIndex) => (
                    <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {week.map((day, dIndex) =>
                        day ? (
                          <div
                            key={day.date}
                            className={!day.isFuture ? 'hm-cell' : ''}
                            title={`${day.count} points · ${day.tooltipDate}`}
                            style={{
                              width: 13, height: 13,
                              backgroundColor: getColor(day.level, day.isFuture),
                              borderRadius: 3,
                              cursor: day.isFuture ? 'default' : 'pointer',
                              border: day.isFuture ? 'none' : '1px solid rgba(255,255,255,0.03)',
                              boxShadow: day.isFuture ? 'none' : getGlow(day.level),
                            }}
                          />
                        ) : (
                          <div key={`e-${mIndex}-${wIndex}-${dIndex}`} style={{ width: 13, height: 13, background: 'transparent' }} />
                        )
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1px', color: 'rgba(212,168,80,0.4)', textAlign: 'center' }}>
                  {month.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1px', color: 'rgba(212,168,80,0.35)' }}>Less</span>
          {[
            'rgba(255,255,255,0.05)',
            'rgba(212,168,80,0.3)',
            'rgba(212,168,80,0.55)',
            'rgba(212,168,80,0.78)',
            '#e8c87a',
          ].map((c, i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.04)', boxShadow: i > 1 ? `0 0 ${i * 3}px rgba(212,168,80,${i * 0.15})` : 'none' }} />
          ))}
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '1px', color: 'rgba(212,168,80,0.35)' }}>More</span>
        </div>

        {/* Rune footer */}
        <div style={{ marginTop: 20, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: 'rgba(212,168,80,0.18)', userSelect: 'none', textAlign: 'center' }}>
          ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
        </div>
      </div>
    </>
  );
}

export default ActivityHeatmap;