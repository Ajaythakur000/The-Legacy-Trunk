import React from 'react';

function StorySkeleton() {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
      
      {/* 👤 Header Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div className="skeleton-pulse" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0' }}></div>
        <div style={{ flex: 1 }}>
          <div className="skeleton-pulse" style={{ width: '40%', height: '16px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '8px' }}></div>
          <div className="skeleton-pulse" style={{ width: '20%', height: '12px', background: '#e2e8f0', borderRadius: '6px' }}></div>
        </div>
      </div>

      {/* 📝 Text Content Skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <div className="skeleton-pulse" style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '10px' }}></div>
        <div className="skeleton-pulse" style={{ width: '90%', height: '14px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '10px' }}></div>
        <div className="skeleton-pulse" style={{ width: '70%', height: '14px', background: '#e2e8f0', borderRadius: '6px' }}></div>
      </div>

      {/* 🖼️ Media Box Skeleton */}
      <div className="skeleton-pulse" style={{ width: '100%', height: '300px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '24px' }}></div>

      {/* 🔘 Action Buttons Skeleton */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="skeleton-pulse" style={{ width: '70px', height: '36px', background: '#e2e8f0', borderRadius: '99px' }}></div>
        <div className="skeleton-pulse" style={{ width: '70px', height: '36px', background: '#e2e8f0', borderRadius: '99px' }}></div>
        <div className="skeleton-pulse" style={{ width: '90px', height: '36px', background: '#e2e8f0', borderRadius: '99px' }}></div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse-anim {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .skeleton-pulse {
          animation: pulse-anim 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default StorySkeleton;