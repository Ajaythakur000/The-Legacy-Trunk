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
          background: '#632020',
          backgroundImage: 'none',
          backgroundSize: '24px 24px',
          fontFamily: "'Baloo 2', sans-serif",
          position: 'relative', overflow: 'hidden', padding: '20px',
        }}>
          
          <div style={{
            position: 'relative', zIndex: 2,
            background: '#FFFFFF',
            border: '6px solid #3E2723',
            borderRadius: 24,
            padding: '40px 30px',
            maxWidth: 500, width: '100%',
            textAlign: 'center',
            boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.3)',
            animation: 'powShake 0.5s ease-in-out infinite alternate',
          }}>
            
            <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 10 }}>💥</div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 48,
              color: '#D4B895', textShadow: '4px 4px 0px #3E2723',
              WebkitTextStroke: '2px #3E2723', margin: '0 0 10px',
            }}>
              APP CRASHED!
            </h1>

            <p style={{ fontWeight: 700, fontSize: 18, color: '#3E2723', marginBottom: 30 }}>
              Someone tripped over the server cable. Don't worry, your memories are perfectly safe!
            </p>

            <button
              onClick={() => window.location.href = '/home'}
              onMouseOver={e  => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px #3E2723'; }}
              onMouseOut={e   => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px #3E2723'; }}
              onMouseDown={e  => { e.currentTarget.style.transform = 'translate(4px, 4px)'; e.currentTarget.style.boxShadow = '0px 0px 0px 0px #3E2723'; }}
              onMouseUp={e    => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px #3E2723'; }}
              style={{
                background: '#8B5A2B', border: '2px solid #3E2723', borderRadius: 12, padding: '16px 32px',
                fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723',
                cursor: 'pointer', transition: 'all 0.1s', boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)',
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