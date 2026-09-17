import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function ActivityHeatmap({ activityMap, maxStreak = 0 }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      const monthName = d.toLocaleString('default', { month: 'short' }).toUpperCase();
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

  // Comic Color Palette for pixels
  const getColor = (level, isFuture) => {
    if (isFuture) return '#F5F5F5'; // Future days have the same background as the board
    const colors = ['#F5F5F5', '#D4B895', '#A0522D', '#1E352F', '#C89B3C'];
    return colors[level];
  };

  return (
    <div style={{ background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, padding: '40px', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.45)', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#3E2723', margin: '0 0 8px' }}>
            ACTIVITY TRACKER 🕹️
          </h3>
          <p style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#3E2723', margin: 0 }}>
            Checking your consistency for the past 12 months.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Stat cards */}
          {[
            { val: totalPoints.toLocaleString(), lbl: 'TOTAL PTS', color: '#D4B895' },
            { val: activeDays, lbl: 'ACTIVE DAYS', color: '#C89B3C' },
            { val: maxStreak, lbl: 'MAX STREAK', color: '#00C853' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.color, border: 'none', borderRadius: 12, padding: '12px 20px', textAlign: 'center', minWidth: 100, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transform: i % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3E2723', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 12, color: '#3E2723', marginTop: 4 }}>{s.lbl}</div>
            </div>
          ))}

          {/* Period dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ background: '#FFF', border: 'none', padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#3E2723', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.45)', transition: 'transform 0.1s' }}>
              CURRENT 📅
            </button>
            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: '#FFF', border: 'none', borderRadius: 12, boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.45)', zIndex: 100, minWidth: 150, overflow: 'hidden' }}>
                <div style={{ padding: '16px', fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#1E352F', borderBottom: '3px solid #3E2723', background: '#F5F5F5' }}>CURRENT ✓</div>
                {currentYear === 2026 && <div style={{ padding: '16px', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: '#3E2723', cursor: 'not-allowed' }}>No past years</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 16 }}>
        {/* CHANGED: Removed dashed border and fixed width. Changed to inline-flex so background wraps correctly */}
        <div style={{ display: 'inline-flex', gap: 16, background: '#F5F5F5', padding: '24px', borderRadius: '16px', minWidth: '100%', boxSizing: 'border-box' }}>
          {monthsData.map((month, mIndex) => (
            <div key={mIndex} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {month.weeks.map((week, wIndex) => (
                  <div key={wIndex} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 16px)', gap: 4 }}>
                    {week.map((day, dIndex) =>
                      day ? (
                        <div
                          key={day.date}
                          title={`${day.count} points · ${day.tooltipDate}`}
                          style={{
                            width: 16, height: 16, boxSizing: 'border-box',
                            backgroundColor: getColor(day.level, day.isFuture),
                            borderRadius: 4,
                            cursor: day.isFuture ? 'default' : 'pointer',
                            border: day.isFuture ? '2px dashed rgba(23,23,25,0.15)' : '2px solid #3E2723',
                          }}
                        />
                      ) : (
                        // Empty slot placeholder
                        <div key={`e-${mIndex}-${wIndex}-${dIndex}`} style={{ width: 16, height: 16, boxSizing: 'border-box', border: '2px dashed rgba(23,23,25,0.15)', borderRadius: 4 }} />
                      )
                    )}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#3E2723', textAlign: 'center' }}>
                {month.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723' }}>LAZY</span>
        {['#F5F5F5', '#D4B895', '#A0522D', '#1E352F', '#C89B3C'].map((c, i) => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: 'none' }} />
        ))}
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723' }}>ACTIVE!</span>
      </div>
    </div>
  );
}

export default ActivityHeatmap;