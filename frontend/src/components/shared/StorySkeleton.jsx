function StorySkeleton() {
  return (
    <>
      <style>{`
        @keyframes skComicShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .sk-bone {
          position: relative;
          overflow: hidden;
          background: #E0E0E0;
          border: 1px solid #3E2723;
        }
        .sk-bone::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: skComicShimmer 1.5s infinite;
        }
      `}</style>

      {/* ── Card shell ── */}
      <div style={{
        position: 'relative',
        background: '#FFFFFF',
        border: '2px solid #3E2723',
        borderRadius: 16,
        padding: 24,
        overflow: 'hidden',
        boxShadow: '8px 8px 15px 0px rgba(0,0,0,0.3)',
        marginBottom: 24,
      }}>
        {/* ── Header row: avatar + name lines ── */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          {/* Avatar circle */}
          <div className="sk-bone" style={{ width:48, height:48, borderRadius:'50%', flexShrink:0 }}/>
          {/* Name + date */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            <div className="sk-bone" style={{ width:'40%', height:16, borderRadius:8 }}/>
            <div className="sk-bone" style={{ width:'25%', height:12, borderRadius:6 }}/>
          </div>
          {/* Badge pill */}
          <div className="sk-bone" style={{ width:80, height:24, borderRadius:12 }}/>
        </div>

        {/* ── Text lines ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {[['100%', 0], ['90%', '0.1s'], ['70%', '0.2s']].map(([w, delay], i) => (
            <div key={i} className="sk-bone" style={{ width:w, height:16, borderRadius:8, animationDelay: delay }}/>
          ))}
        </div>

        {/* ── Media box ── */}
        <div className="sk-bone" style={{ width:'100%', height:240, borderRadius:12, marginBottom:24 }}/>

        {/* ── Action pill buttons ── */}
        <div style={{ display:'flex', gap:12 }}>
          {[[80, 0], [80, '0.1s'], [100, '0.2s']].map(([w, delay], i) => (
            <div key={i} className="sk-bone" style={{ width:w, height:36, borderRadius:10, animationDelay: delay }}/>
          ))}
        </div>
      </div>
    </>
  );
}

export default StorySkeleton;