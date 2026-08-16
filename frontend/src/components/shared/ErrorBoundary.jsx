import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error, errorInfo) { console.error('The Vault Hit a Snag:', error, errorInfo); }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Baloo+2:wght@700&display=swap');
          @keyframes powShake {
            0%, 100% { transform: rotate(-3deg) scale(1); }
            50% { transform: rotate(3deg) scale(1.02); }
          }
        `}</style>

        <div style={{
          height: '100vh', width: '100vw',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#FF3D81',
          backgroundImage: 'radial-gradient(#171719 3px, transparent 3.5px)',
          backgroundSize: '24px 24px',
          fontFamily: "'Baloo 2', sans-serif",
          position: 'relative', overflow: 'hidden', padding: '20px',
        }}>
          
          <div style={{
            position: 'relative', zIndex: 2,
            background: '#FFFFFF',
            border: '6px solid #171719',
            borderRadius: 24,
            padding: '40px 30px',
            maxWidth: 500, width: '100%',
            textAlign: 'center',
            boxShadow: '16px 16px 0px 0px #171719',
            animation: 'powShake 0.5s ease-in-out infinite alternate',
          }}>
            
            <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 10 }}>💥</div>

            <h1 style={{
              fontFamily: "'Luckiest Guy', cursive", fontSize: 48,
              color: '#FFD23F', textShadow: '4px 4px 0px #171719',
              WebkitTextStroke: '2px #171719', margin: '0 0 10px',
            }}>
              APP CRASHED!
            </h1>

            <p style={{ fontWeight: 700, fontSize: 18, color: '#171719', marginBottom: 30 }}>
              Someone tripped over the server cable. Don't worry, your memories are perfectly safe!
            </p>

            <button
              onClick={() => window.location.href = '/home'}
              onMouseOver={e  => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px #171719'; }}
              onMouseOut={e   => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px #171719'; }}
              onMouseDown={e  => { e.currentTarget.style.transform = 'translate(4px, 4px)'; e.currentTarget.style.boxShadow = '0px 0px 0px 0px #171719'; }}
              onMouseUp={e    => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px #171719'; }}
              style={{
                background: '#3FE0FF', border: '4px solid #171719', borderRadius: 12, padding: '16px 32px',
                fontFamily: "'Luckiest Guy', cursive", fontSize: 24, color: '#171719',
                cursor: 'pointer', transition: 'all 0.1s', boxShadow: '4px 4px 0px 0px #171719',
              }}
            >
              BACK TO BASE 🚀
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default ErrorBoundary;