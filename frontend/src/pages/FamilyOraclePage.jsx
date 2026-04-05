import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';

function FamilyOraclePage() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea magic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [question]);

  const askTheOracle = async () => {
    if (!question.trim()) return;
    if (!user?.activeCircleId) {
      alert("Please select a family circle first!");
      return;
    }

    setLoading(true);
    setAnswer(''); 
    
    try {
      const res = await api.post('/ai/ask-oracle', {
        circleId: user.activeCircleId,
        question: question
      });
      
      setAnswer(res.data.answer);
    } catch (error) {
      console.error("Oracle Error:", error);
      setAnswer("The Oracle is currently resting. The cosmic energies are weak right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key for quick sending
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askTheOracle();
    }
  };

  // Helper to render basic markdown (bold text) sent by Gemini
  const renderFormattedText = (text) => {
    // Replace **text** with <strong>text</strong> and \n with <br/>
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fef08a;">$1</strong>')
      .replace(/\n/g, '<br />');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="starry-bg" style={{ backgroundColor: '#020617', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', paddingBottom: '100px' }}>
      
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 🔮 THE HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '50px', animation: 'fadeInDown 1s ease' }}>
          <div style={{ fontSize: '70px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite', textShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}>🔮</div>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: '0 0 10px 0', background: 'linear-gradient(135deg, #d4af37, #fefce8, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.3))', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>
            The Family Oracle
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', fontStyle: 'italic', letterSpacing: '1px' }}>
            Whisper your question. The Oracle reads the legacy trunk.
          </p>
        </div>

        {/* ✨ THE GLASSMORPHISM INPUT BOX */}
        <div style={{ 
          width: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(25px)',
          borderRadius: '24px', padding: '15px', border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 0 20px rgba(212, 175, 55, 0.03)',
          display: 'flex', flexDirection: 'column', animation: 'fadeInUp 1s ease 0.2s backwards'
        }}>
          <textarea 
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., When did Dadaji buy his first car? (Press Enter to ask)"
            disabled={loading}
            style={{
              width: '100%', minHeight: '80px', background: 'transparent', border: 'none',
              color: '#f8fafc', fontSize: '1.25rem', padding: '20px', resize: 'none', outline: 'none',
              fontFamily: 'system-ui, sans-serif', lineHeight: '1.6'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px 10px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={askTheOracle}
              disabled={loading || !question.trim()}
              className="glow-btn"
              style={{
                background: loading ? '#334155' : 'linear-gradient(135deg, #d4af37, #b48608)',
                color: loading ? '#94a3b8' : '#020617', border: 'none', borderRadius: '16px',
                padding: '12px 32px', fontSize: '1.1rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(212, 175, 55, 0.4)'
              }}
            >
              {loading ? 'Consulting Ancestors...' : 'Ask the Oracle ✨'}
            </button>
          </div>
        </div>

        {/* 🌀 THE MAGICAL LOADING ORB */}
        {loading && (
          <div style={{ marginTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div className="magical-orb"></div>
            <p style={{ color: '#d4af37', fontStyle: 'italic', marginTop: '30px', letterSpacing: '3px', fontSize: '1.1rem', animation: 'pulseText 2s infinite' }}>
              Weaving memories from the trunk...
            </p>
          </div>
        )}

        {/* 📜 THE CINEMATIC REVEAL (ANSWER) */}
        {!loading && answer && (
          <div style={{ 
            marginTop: '60px', width: '100%', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
            backdropFilter: 'blur(30px)', borderRadius: '32px', padding: '50px', border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(212, 175, 55, 0.05)',
            animation: 'revealScroll 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards', position: 'relative', overflow: 'hidden'
          }}>
            {/* Top Border Deco */}
            <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '0 auto 40px auto' }}></div>
            
            <p style={{ 
              fontSize: '1.35rem', lineHeight: '2.1', color: '#f1f5f9', 
              fontFamily: 'Georgia, serif', margin: 0,
              textAlign: 'center', // 🔥 Centered for a more "Oracle reading a scroll" feel
              fontWeight: '400',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {renderFormattedText(answer)}
            </p>
            
            {/* Bottom Border Deco */}
            <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '40px auto 0 auto' }}></div>
            
            {/* Floating particles effect inside card */}
            <div className="card-particle p1"></div>
            <div className="card-particle p2"></div>
            <div className="card-particle p3"></div>
          </div>
        )}

      </div>

      <style>{`
        /* 🌌 Starry Background */
        .starry-bg {
          background-image: 
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
            radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
          background-size: 550px 550px, 350px 350px, 250px 250px;
          background-position: 0 0, 40px 60px, 130px 270px;
          animation: starDrift 150s linear infinite;
        }

        /* 🪄 Animations */
        @keyframes starDrift { to { background-position: -550px -550px, -310px -290px, -120px -280px; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
        @keyframes pulseText { 0% { opacity: 0.4; } 50% { opacity: 1; text-shadow: 0 0 10px #d4af37; } 100% { opacity: 0.4; } }
        
        /* The Magical Reveal of the Answer */
        @keyframes revealScroll {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); filter: blur(15px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        /* The Glowing Button */
        .glow-btn:hover:not(:disabled) {
          box-shadow: 0 15px 35px -5px rgba(212, 175, 55, 0.6) !important;
          transform: translateY(-3px) scale(1.02);
        }
        .glow-btn:active:not(:disabled) { transform: translateY(1px) scale(0.98); }

        /* 🌀 The Magical Orb Animation */
        .magical-orb {
          width: 90px; height: 90px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fefce8, #d4af37, #020617);
          box-shadow: 0 0 40px #d4af37, inset 0 0 25px #fef08a;
          animation: orbSpin 2.5s linear infinite, orbPulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes orbSpin { 100% { transform: rotate(360deg); } }
        @keyframes orbPulse { 0% { box-shadow: 0 0 20px #d4af37, inset 0 0 10px #fef08a; transform: scale(0.95); } 100% { box-shadow: 0 0 60px #d4af37, 0 0 30px #fefce8, inset 0 0 40px #fef08a; transform: scale(1.05); } }

        /* ✨ Subtle particles inside the answer card */
        .card-particle { position: absolute; width: 4px; height: 4px; background: #fef08a; border-radius: 50%; opacity: 0.6; box-shadow: 0 0 10px #fef08a; }
        .p1 { top: 30px; left: 30px; animation: float 4s infinite; }
        .p2 { bottom: 30px; right: 30px; animation: float 3s infinite reverse; }
        .p3 { top: 50%; left: 10px; animation: float 5s infinite 1s; }

        /* Custom Scrollbar for Textarea */
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.4); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default FamilyOraclePage;