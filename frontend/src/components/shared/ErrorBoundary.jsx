import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // State update karo taaki agla render fallback UI dikhaye
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Tu chahe toh yahan Sentry ya kisi error logging service ko error bhej sakta hai
    console.error("The Vault Hit a Snag:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 🎨 PREMIUM FALLBACK UI
      return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9F3E8', fontFamily: 'system-ui, sans-serif', padding: '20px', textAlign: 'center' }}>
          <img 
            src="/web-app-manifest-192x192.png" 
            alt="Memento Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '24px' }} 
          />
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: '900', marginBottom: '10px' }}>Oops! The connection frayed.</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
            We hit a little bump in the time stream. Don't worry, your memories are safe. Let's get you back.
          </p>
          <button 
            onClick={() => window.location.href = '/home'}
            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', borderRadius: '99px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Restart The Vault 🔄
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;