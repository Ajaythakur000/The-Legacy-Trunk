import React from 'react';

// ── Star Canvas (same pattern as rest of the app) ────────────────────────────
class StarCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const stars = [];
    let frame = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.004,
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach(s => {
        // Red-tinted stars for error state
        const a = 0.15 + 0.35 * Math.sin(frame * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,80,80,${a})`;
        ctx.fill();
      });
      this._animId = requestAnimationFrame(draw);
    };
    draw();
    this._cleanup = () => {
      cancelAnimationFrame(this._animId);
      window.removeEventListener('resize', resize);
    };
  }
  componentWillUnmount() { this._cleanup?.(); }
  render() {
    return (
      <canvas ref={this.canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }} />
    );
  }
}

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('The Vault Hit a Snag:', error, errorInfo);
    // Plug in Sentry here if needed:
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <>
        {/* ── Fonts + Keyframes ── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,600&family=Space+Mono&display=swap');

          @keyframes ltRingSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes ltShine {
            0%       { left: -100%; }
            40%, 100% { left:  150%; }
          }
          @keyframes ltBtnPulse {
            0%,100% { box-shadow: 0 6px 20px rgba(180,40,40,0.3); }
            50%     { box-shadow: 0 6px 32px rgba(220,60,60,0.65); }
          }
          @keyframes ltCrackPulse {
            0%,100% { filter: drop-shadow(0 0 8px  rgba(200,80,80,0.4)); }
            50%     { filter: drop-shadow(0 0 22px rgba(200,80,80,0.95)); }
          }
          @keyframes ltFloat {
            0%   { opacity:0; transform:translate(0,0) scale(1); }
            20%  { opacity:.6; }
            80%  { opacity:.2; }
            100% { opacity:0; transform:translate(var(--tx,20px),var(--ty,-50px)) scale(.12); }
          }
        `}</style>

        {/* ── Full-screen wrapper ── */}
        <div style={{
          height: '100vh', width: '100vw',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#06080f',
          fontFamily: "'Cormorant Garamond', serif",
          position: 'relative', overflow: 'hidden',
          padding: '20px',
        }}>
          {/* Stars */}
          <StarCanvas />

          {/* Dust motes — red-tinted for error atmosphere */}
          {Array.from({ length: 14 }, (_, i) => {
            const colors = [
              'rgba(200,70,70,0.6)',
              'rgba(160,60,60,0.5)',
              'rgba(80,40,140,0.4)',
            ];
            return (
              <div key={i} style={{
                position: 'absolute',
                left:  `${Math.random() * 100}%`,
                top:   `${Math.random() * 100}%`,
                width:  `${3 + Math.random() * 7}px`,
                height: `${3 + Math.random() * 7}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${colors[i % 3]}, transparent 70%)`,
                animation: `ltFloat ${5 + Math.random() * 8}s ${Math.random() * 8}s ease-in-out infinite`,
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            );
          })}

          {/* ── Glass Card ── */}
          <div style={{
            position: 'relative', zIndex: 2,
            background: 'rgba(12,16,32,0.9)',
            border: '1px solid rgba(180,60,60,0.35)',
            borderRadius: 24,
            padding: 'clamp(36px, 5vw, 56px) clamp(28px, 5vw, 52px) clamp(32px, 4vw, 48px)',
            maxWidth: 520, width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(180,60,60,0.06)',
            overflow: 'hidden',
          }}>
            {/* Top shimmer line */}
            <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1,
              background:'linear-gradient(90deg,transparent,rgba(200,80,80,0.6),transparent)',
              pointerEvents:'none' }}/>
            {/* Bottom shimmer line */}
            <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:1,
              background:'linear-gradient(90deg,transparent,rgba(200,80,80,0.2),transparent)',
              pointerEvents:'none' }}/>

            {/* Corner accents — red tinted */}
            {[
              { top: 12, left: 12,  borderTop:    '1px solid rgba(200,80,80,0.5)', borderLeft:   '1px solid rgba(200,80,80,0.5)' },
              { top: 12, right: 12, borderTop:    '1px solid rgba(200,80,80,0.5)', borderRight:  '1px solid rgba(200,80,80,0.5)' },
              { bottom: 12, left: 12,  borderBottom: '1px solid rgba(200,80,80,0.5)', borderLeft: '1px solid rgba(200,80,80,0.5)' },
              { bottom: 12, right: 12, borderBottom: '1px solid rgba(200,80,80,0.5)', borderRight:'1px solid rgba(200,80,80,0.5)' },
            ].map((s, i) => (
              <div key={i} style={{ position:'absolute', width:18, height:18, ...s, pointerEvents:'none' }}/>
            ))}

            {/* ── Orbital Logo — red ring ── */}
            <div style={{ position:'relative', width:84, height:84, margin:'0 auto 20px' }}>
              <svg style={{ position:'absolute', inset:0, animation:'ltRingSpin 12s linear infinite' }}
                viewBox="0 0 84 84" fill="none">
                <circle cx="42" cy="42" r="38" stroke="rgba(200,80,80,0.2)" strokeWidth="1"/>
                <circle cx="42" cy="4"  r="2.8" fill="rgba(200,80,80,0.75)"/>
                <circle cx="42" cy="80" r="2.8" fill="rgba(200,80,80,0.75)"/>
                <circle cx="4"  cy="42" r="2.8" fill="rgba(200,80,80,0.75)"/>
                <circle cx="80" cy="42" r="2.8" fill="rgba(200,80,80,0.75)"/>
                <circle cx="12.5" cy="12.5" r="2" fill="rgba(200,80,80,0.4)"/>
                <circle cx="71.5" cy="71.5" r="2" fill="rgba(200,80,80,0.4)"/>
              </svg>
              <div style={{
                position:'absolute', inset:13,
                borderRadius:'50%',
                background:'linear-gradient(135deg,#1a0808,#0f0505)',
                border:'1px solid rgba(200,80,80,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                overflow:'hidden',
              }}>
                <img src="/web-app-manifest-192x192.png" alt="LT"
                  style={{ width:'110%', height:'110%', objectFit:'cover' }}
                  onError={e => { e.target.style.display='none'; }}
                />
                <span style={{ position:'absolute', fontFamily:"'Cinzel',serif",
                  color:'#e87a7a', fontSize:12, fontWeight:700 }}>LT</span>
              </div>
            </div>

            {/* Brand divider */}
            <div style={{ display:'flex', alignItems:'center', gap:10,
              justifyContent:'center', marginBottom:24 }}>
              <div style={{ width:36, height:1,
                background:'linear-gradient(90deg,transparent,rgba(200,80,80,0.4))' }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8,
                letterSpacing:'2.5px', color:'rgba(200,80,80,0.45)',
                textTransform:'uppercase' }}>The Legacy Trunk</span>
              <div style={{ width:36, height:1,
                background:'linear-gradient(90deg,rgba(200,80,80,0.4),transparent)' }}/>
            </div>

            {/* ── Cracked seal icon ── */}
            <div style={{ margin:'0 auto 26px', width:56, height:56 }}>
              <svg viewBox="0 0 56 56" fill="none" width="56" height="56"
                style={{ animation:'ltCrackPulse 2s ease-in-out infinite' }}>
                <circle cx="28" cy="28" r="26" stroke="rgba(200,80,80,0.22)" strokeWidth="1"/>
                <circle cx="28" cy="28" r="19" stroke="rgba(200,80,80,0.12)" strokeWidth="1"/>
                {/* crack lines */}
                <path d="M28 6 L26 19 L31 21 L24 36 L29 33 L22 50"
                  stroke="rgba(220,80,80,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M26 19 L17 25 L21 27"
                  stroke="rgba(220,80,80,0.55)" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M31 21 L39 23 L37 30"
                  stroke="rgba(220,80,80,0.45)" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <circle cx="28" cy="28" r="2.5" fill="rgba(220,80,80,0.75)"/>
              </svg>
            </div>

            {/* ── Title ── */}
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontWeight: 700,
              color: '#e87a7a',
              textShadow: '0 0 30px rgba(200,80,80,0.4)',
              letterSpacing: '1.5px',
              marginBottom: 14,
              lineHeight: 1.3,
            }}>
              The Vault Hit a Snag
            </h1>

            {/* ── Subtitle ── */}
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '1.05rem', lineHeight: 1.85,
              color: 'rgba(255,255,255,0.38)',
              marginBottom: 12,
            }}>
              A rift in the time stream. Your memories remain safe within the vault — untouched by the fracture.
            </p>

            {/* ── "Memories safe" pill ── */}
            <div style={{
              display: 'inline-block',
              background: 'rgba(60,168,80,0.08)',
              border: '1px solid rgba(60,168,80,0.22)',
              borderRadius: 20, padding: '5px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: '2px',
              color: 'rgba(110,230,120,0.65)',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}>
              ✦ All memories are safe ✦
            </div>

            {/* ── Restore Button ── */}
            <div>
              <button
                onClick={() => window.location.href = '/home'}
                onMouseOver={e  => { e.currentTarget.style.transform = 'scale(1.03) translateY(-1px)'; }}
                onMouseOut={e   => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
                onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1.03) translateY(-1px)'; }}
                style={{
                  position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #8b1a1a 0%, #c0392b 50%, #8b1a1a 100%)',
                  backgroundSize: '200%',
                  color: 'rgba(255,220,220,0.92)',
                  border: 'none', borderRadius: 10,
                  padding: '13px 32px',
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer',
                  animation: 'ltBtnPulse 3s ease-in-out infinite',
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Shimmer sweep */}
                <div style={{
                  position: 'absolute', top: '-50%', left: '-100%',
                  width: '50%', height: '200%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,180,180,0.2), transparent)',
                  transform: 'skewX(-20deg)',
                  animation: 'ltShine 3s ease-in-out infinite',
                  pointerEvents: 'none',
                }}/>
                Restore The Vault ✦
              </button>
            </div>

            {/* ── Rune footer ── */}
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9, letterSpacing: '4px',
              color: 'rgba(200,80,80,0.12)',
              userSelect: 'none', marginTop: 28,
            }}>
              ✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ErrorBoundary;