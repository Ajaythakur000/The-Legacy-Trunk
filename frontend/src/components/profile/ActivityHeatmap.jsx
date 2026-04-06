import { useMemo, useState, useEffect, useRef } from 'react';

function ActivityHeatmap({ activityMap, maxStreak = 0 }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { monthsData, totalPoints, activeDays, currentYear } = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const cYear = today.getFullYear();

    const data = [];
    let total = 0;
    let activeCount = 0;

    for (let i = 11; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = cYear;
      
      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      const d = new Date(targetYear, targetMonth, 1);
      const monthName = d.toLocaleString('default', { month: 'short' }); 
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const firstDayOfWeek = new Date(targetYear, targetMonth, 1).getDay(); 

      const weeks = [];
      let currentWeek = new Array(7).fill(null); 
      let currentDayOfWeek = firstDayOfWeek;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isFuture = new Date(targetYear, targetMonth, day, 23, 59, 59) > today;
        const count = (!isFuture && activityMap && activityMap[dateStr]) ? activityMap[dateStr] : 0;
        
        if (!isFuture) {
          total += count;
          if (count > 0) activeCount++;
        }

        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count >= 3 && count <= 5) level = 2;
        else if (count >= 6 && count <= 9) level = 3;
        else if (count >= 10) level = 4;

        const tooltipDate = new Date(targetYear, targetMonth, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        currentWeek[currentDayOfWeek] = { date: dateStr, tooltipDate, count, level, isFuture };

        currentDayOfWeek++;
        if (currentDayOfWeek > 6) {
          weeks.push(currentWeek);
          currentWeek = new Array(7).fill(null);
          currentDayOfWeek = 0;
        }
      }
      if (currentDayOfWeek > 0) weeks.push(currentWeek);
      data.push({ name: monthName, weeks: weeks });
    }

    return { monthsData: data, totalPoints: total, activeDays: activeCount, currentYear: cYear };
  }, [activityMap]);

  const getColor = (level, isFuture) => {
    if (isFuture) return 'transparent'; 
    switch (level) {
      case 0: return '#e2e8f0'; 
      case 1: return '#fef08a'; 
      case 2: return '#facc15'; 
      case 3: return '#eab308'; 
      case 4: return '#ca8a04'; 
      default: return '#e2e8f0';
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: '24px', padding: '32px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: '24px',
      overflowX: 'auto', border: '1px solid #e2e8f0'
    }}>
      
      <style>{`
        .heatmap-cell {
          box-sizing: border-box;
          border: 1px solid rgba(27, 31, 35, 0.04);
          transition: all 0.1s ease;
        }
        .heatmap-cell:hover {
          border: 2.5px solid #0f172a !important;
          z-index: 10;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ fontSize: '15px', color: '#64748b' }}>
          <span style={{ color: '#0f172a', fontSize: '20px', fontWeight: '800', marginRight: '6px' }}>{totalPoints}</span> 
          legacy points in the past one year
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b', alignItems: 'center', fontWeight: '500' }}>
          <span>Total active days: <strong style={{ color: '#0f172a' }}>{activeDays}</strong></span>
          <span>Max streak: <strong style={{ color: '#0f172a' }}>{maxStreak}</strong></span>
          
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#334155' }}
            >
              Current
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '110%', right: '0', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '120px' }}>
                <div style={{ padding: '10px 14px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a' }}>
                  Current <span style={{ color: '#3b82f6' }}>✓</span>
                </div>
                {/* Agar 2026 se aage nikal gaye toh purane saal dikhayega */}
                {currentYear > 2026 && (
                  <div style={{ padding: '10px 14px', color: '#64748b', cursor: 'pointer' }}>2026</div>
                )}
                {/* Fallback for now */}
                {currentYear === 2026 && (
                   <div style={{ padding: '10px 14px', color: '#cbd5e1', cursor: 'not-allowed', fontSize: '11px' }}>No past years</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ minWidth: '850px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {monthsData.map((month, mIndex) => (
            <div key={mIndex} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {month.weeks.map((week, wIndex) => (
                  <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {week.map((day, dIndex) => (
                      day ? (
                        <div 
                          key={day.date}
                          className="heatmap-cell"
                          title={`${day.count} points on ${day.tooltipDate}`}
                          style={{
                            width: '13px', height: '13px',
                            backgroundColor: getColor(day.level, day.isFuture),
                            borderRadius: '3px',
                            cursor: day.isFuture ? 'default' : 'pointer',
                          }}
                        ></div>
                      ) : (
                        <div key={`empty-${dIndex}`} style={{ width: '13px', height: '13px', backgroundColor: 'transparent' }}></div>
                      )
                    ))}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textAlign: 'center' }}>{month.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;