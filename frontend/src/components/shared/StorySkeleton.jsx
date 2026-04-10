function StorySkeleton() {
  return (
    <>
      <style>{`
        @keyframes skShimmer {
          0%   { background-position:  200% center; }
          100% { background-position: -200% center; }
        }
        .sk-bone {
          position: relative;
          overflow: hidden;
          background: rgba(212,168,80,0.07);
        }
        .sk-bone::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212,168,80,0.13) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: skShimmer 2s ease-in-out infinite;
        }
      `}</style>

      {/* ── Card shell ── */}
      <div style={{
        position: 'relative',
        background: 'rgba(12,16,32,0.85)',
        border: '1px solid rgba(212,168,80,0.14)',
        borderRadius: 20,
        padding: 28,
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        marginBottom: 20,
      }}>
        {/* Top shimmer line */}
        <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1,
          background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.35),transparent)',
          pointerEvents:'none' }}/>
        {/* Bottom shimmer line */}
        <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:1,
          background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.12),transparent)',
          pointerEvents:'none' }}/>

        {/* Corner accents */}
        {[
          { top:10,    left:10,  borderTop:    '1px solid rgba(212,168,80,0.3)', borderLeft:   '1px solid rgba(212,168,80,0.3)' },
          { top:10,    right:10, borderTop:    '1px solid rgba(212,168,80,0.3)', borderRight:  '1px solid rgba(212,168,80,0.3)' },
          { bottom:10, left:10,  borderBottom: '1px solid rgba(212,168,80,0.3)', borderLeft:   '1px solid rgba(212,168,80,0.3)' },
          { bottom:10, right:10, borderBottom: '1px solid rgba(212,168,80,0.3)', borderRight:  '1px solid rgba(212,168,80,0.3)' },
        ].map((s, i) => (
          <div key={i} style={{ position:'absolute', width:14, height:14, ...s, pointerEvents:'none' }}/>
        ))}

        {/* ── Header row: avatar + name lines + optional badge ── */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          {/* Avatar circle */}
          <div className="sk-bone" style={{
            width:44, height:44, borderRadius:'50%', flexShrink:0,
          }}/>
          {/* Name + date */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            <div className="sk-bone" style={{ width:'38%', height:13, borderRadius:6 }}/>
            <div className="sk-bone" style={{ width:'20%', height:10, borderRadius:5 }}/>
          </div>
          {/* Badge pill */}
          <div className="sk-bone" style={{ width:64, height:20, borderRadius:99 }}/>
        </div>

        {/* ── Text lines ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
          {[['100%', 0], ['88%', '0.15s'], ['65%', '0.3s']].map(([w, delay], i) => (
            <div key={i} className="sk-bone" style={{
              width:w, height:13, borderRadius:6,
              animationDelay: delay,
            }}/>
          ))}
        </div>

        {/* ── Media box ── */}
        <div className="sk-bone" style={{
          width:'100%', height:220, borderRadius:14,
          marginBottom:22,
        }}/>

        {/* ── Action pill buttons ── */}
        <div style={{ display:'flex', gap:10 }}>
          {[[66, 0], [66, '0.1s'], [84, '0.2s']].map(([w, delay], i) => (
            <div key={i} className="sk-bone" style={{
              width:w, height:32, borderRadius:99,
              animationDelay: delay,
            }}/>
          ))}
        </div>
      </div>
    </>
  );
}

export default StorySkeleton;