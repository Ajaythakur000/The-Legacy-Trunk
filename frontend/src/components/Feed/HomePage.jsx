// File Path: src/pages/HomePage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FamilyLedgerFeed from './FamilyLedgerFeed';
import StrangersMemoriesFeed from './StrangersMemoriesFeed';

function HomePage() {
  const [activeTab, setActiveTab] = useState('family'); 

  const headerContent = {
    family: {
      title: "Family Ledger 📖",
      subtitle: "The intimate stories and history of your kinship.",
      lineColor: "#3b82f6" 
    },
    global: {
      title: "Stranger's Memories 🌍",
      subtitle: "Discover and cherish legacy stories from around the world.",
      lineColor: "#d4af37" 
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', paddingBottom: '40px', paddingTop: '40px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Dynamic Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <motion.h1 
            key={activeTab} 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a', fontWeight: '900', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}
          >
            {headerContent[activeTab].title}
          </motion.h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '1.1rem' }}>
            {headerContent[activeTab].subtitle}
          </p>
          <motion.div 
            layout 
            style={{ width: '60px', height: '3px', background: headerContent[activeTab].lineColor, margin: '20px auto 0 auto', borderRadius: '2px' }}
          />
        </div>

        {/* The Magic Sliding Tab Switcher */}
        <div style={{ 
          display: 'flex', 
          background: '#e2e8f0', 
          borderRadius: '30px', 
          padding: '6px', 
          marginBottom: '40px',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {['family', 'global'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 2,
                fontWeight: '600',
                color: activeTab === tab ? '#0f172a' : '#64748b',
                transition: 'color 0.3s ease',
                fontSize: '1rem',
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-pill" 
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: '#ffffff',
                    borderRadius: '25px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: -1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {tab === 'family' ? 'Family Ledger' : "Stranger's Memories"}
            </button>
          ))}
        </div>

        {/* Feed Area */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'family' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'family' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'family' ? <FamilyLedgerFeed /> : <StrangersMemoriesFeed />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default HomePage;