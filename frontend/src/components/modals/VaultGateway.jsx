import { useState, useEffect } from 'react';

function VaultGateway({ onClose }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Smooth entry animation
    setIsVisible(true);
  }, []);

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  const slides = [
    {
      emoji: "🏰",
      title: "Welcome to Memento.",
      text: "More than just an app. It's the digital estate of your family's legacy. A place where your history lives forever."
    },
    {
      emoji: "📸",
      title: "A Safe Vault for Memories.",
      text: "End-to-end encrypted. No ads, no tracking. Your stories and photos are shared only with the bloodlines you trust."
    },
    {
      emoji: "👑",
      title: "Become the Champion.",
      text: "Every story you weave and every interaction earns Family Bond Points. Lead the leaderboard and become the ultimate historian."
    }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease'
    }}>
      <div style={{
        background: '#fff', borderRadius: '32px', width: '100%', maxWidth: '480px',
        padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {/* Dynamic Background Glow based on step */}
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: step === 0 ? 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)' :
                      step === 1 ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)' :
                                   'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 60%)',
          transition: 'background 0.5s ease', zIndex: 0, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          {/* Animated Emoji/Icon Container */}
          <div key={step} style={{ animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <span style={{ fontSize: '72px', display: 'block', marginBottom: '20px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
              {slides[step].emoji}
            </span>
          </div>

          <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>
            {slides[step].title}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px', minHeight: '80px' }}>
            {slides[step].text}
          </p>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: i === step ? '24px' : '8px', height: '8px', borderRadius: '4px',
                background: i === step ? '#0f172a' : '#cbd5e1',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {step < 2 ? (
              <>
                <button onClick={handleFinish} style={{ flex: 1, background: 'transparent', color: '#64748b', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                  Skip
                </button>
                <button onClick={handleNext} style={{ flex: 2, background: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 25px rgba(15,23,42,0.3)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  Next ✨
                </button>
              </>
            ) : (
              <button onClick={handleFinish} style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 25px rgba(59,130,246,0.4)', animation: 'pulseBtn 2s infinite' }}>
                Enter the Vault 🗝️
              </button>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          60% { opacity: 1; transform: scale(1.1) translateY(-10px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes pulseBtn {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 0 0 15px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>
    </div>
  );
}

export default VaultGateway;